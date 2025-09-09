import { 
  createReservationSpecialCharge,
  createReservationSpecialChargesBatch,
  getReservationSpecialChargesByReservationId,
  deleteReservationSpecialChargesByReservationId,
  getReservationSpecialChargeSummary,
  calculateSpecialCharge,
  addBulkSpecialChargesToReservation,
  updateReservationTotalWithSpecialCharges
} from '../reservationSpecialCharges'
import { getSpecialChargeById, getAllSpecialCharges } from '../specialCharges'
import { getReservationById, updateReservation } from '../reservations'
import { CreateReservationSpecialChargeData, BulkSpecialChargeData, SpecialChargeCalculation } from '../types/reservationSpecialCharges'

// Calculate total special charges for a reservation
export const calculateReservationSpecialChargesTotal = async (
  reservationId: string
): Promise<{ total: number; count: number; details: any[] }> => {
  try {
    const summary = await getReservationSpecialChargeSummary(reservationId)
    
    if (!summary) {
      return { total: 0, count: 0, details: [] }
    }
    
    return {
      total: summary.totalAmount,
      count: summary.totalCharges,
      details: summary.charges.map(charge => ({
        id: charge.id,
        chargeName: charge.specialCharge?.chargeName || 'Unknown',
        quantity: charge.quantity,
        rate: charge.customRate || charge.specialCharge?.defaultRate || 0,
        totalAmount: charge.totalAmount,
        description: charge.customDescription || charge.specialCharge?.description
      }))
    }
  } catch (error) {
    console.error('Error calculating reservation special charges total:', error)
    throw error
  }
}

// Apply standard special charges to reservation based on guest count and stay duration
export const applyStandardSpecialCharges = async (
  reservationId: string,
  guestCount: number,
  stayDurationDays: number,
  userId: string,
  includeChargeIds?: string[]
): Promise<{ applied: SpecialChargeCalculation[]; total: number }> => {
  try {
    // Get all available special charges
    const allCharges = await getAllSpecialCharges({ isActive: true })
    
    // Filter charges to include (if specified)
    const chargesToApply = includeChargeIds 
      ? allCharges.filter(charge => includeChargeIds.includes(charge.id))
      : allCharges
    
    const appliedCharges: CreateReservationSpecialChargeData[] = []
    const calculations: SpecialChargeCalculation[] = []
    
    for (const charge of chargesToApply) {
      let quantity = 1
      
      // Calculate quantity based on rate type
      switch (charge.rateType) {
        case 'per_person':
          quantity = guestCount
          break
        case 'per_day':
          quantity = stayDurationDays
          break
        case 'fixed':
        default:
          quantity = 1
          break
      }
      
      // Calculate the charge
      const calculation = await calculateSpecialCharge(
        charge.id,
        quantity
      )
      
      if (calculation) {
        calculations.push(calculation)
        appliedCharges.push({
          reservationId,
          specialChargeId: charge.id,
          quantity,
          totalAmount: calculation.totalAmount
        })
      }
    }
    
    // Create all charges in batch
    if (appliedCharges.length > 0) {
      await createReservationSpecialChargesBatch(appliedCharges, userId)
    }
    
    const total = calculations.reduce((sum, calc) => sum + calc.totalAmount, 0)
    
    return {
      applied: calculations,
      total
    }
  } catch (error) {
    console.error('Error applying standard special charges:', error)
    throw error
  }
}

// Remove specific special charges from reservation
export const removeSpecialChargesFromReservation = async (
  reservationId: string,
  specialChargeIds: string[],
  userId: string
): Promise<{ removedCount: number; removedAmount: number }> => {
  try {
    const currentCharges = await getReservationSpecialChargesByReservationId(reservationId)
    const chargesToRemove = currentCharges.filter(charge => 
      specialChargeIds.includes(charge.specialChargeId) && !charge.deletedAt
    )
    
    if (chargesToRemove.length === 0) {
      return { removedCount: 0, removedAmount: 0 }
    }
    
    const removedAmount = chargesToRemove.reduce((sum, charge) => sum + charge.totalAmount, 0)
    
    // Soft delete the charges
    const { deleteReservationSpecialCharge } = await import('../reservationSpecialCharges')
    
    await Promise.all(
      chargesToRemove.map(charge => 
        deleteReservationSpecialCharge(charge.id, userId)
      )
    )
    
    return {
      removedCount: chargesToRemove.length,
      removedAmount
    }
  } catch (error) {
    console.error('Error removing special charges from reservation:', error)
    throw error
  }
}

// Replace all special charges for a reservation
export const replaceReservationSpecialCharges = async (
  reservationId: string,
  newCharges: BulkSpecialChargeData['charges'],
  userId: string
): Promise<{ oldTotal: number; newTotal: number; summary: SpecialChargeCalculation[] }> => {
  try {
    // Get current charges total
    const currentSummary = await getReservationSpecialChargeSummary(reservationId)
    const oldTotal = currentSummary?.totalAmount || 0
    
    // Remove all existing charges
    await deleteReservationSpecialChargesByReservationId(reservationId, userId)
    
    // Add new charges
    const result = await addBulkSpecialChargesToReservation({
      reservationId,
      charges: newCharges
    }, userId)
    
    return {
      oldTotal,
      newTotal: result.totalAmount,
      summary: result.summary
    }
  } catch (error) {
    console.error('Error replacing reservation special charges:', error)
    throw error
  }
}

// Get special charges recommendation for reservation
export const getSpecialChargesRecommendation = async (
  reservationId: string,
  guestCount: number,
  stayDurationDays: number,
  roomTypes?: string[]
): Promise<{
  recommended: SpecialChargeCalculation[]
  optional: SpecialChargeCalculation[]
  totalRecommended: number
  totalOptional: number
}> => {
  try {
    const allCharges = await getAllSpecialCharges({ isActive: true })
    
    const recommended: SpecialChargeCalculation[] = []
    const optional: SpecialChargeCalculation[] = []
    
    for (const charge of allCharges) {
      let quantity = 1
      let isRecommended = false
      
      // Determine quantity and recommendation based on charge type and context
      switch (charge.rateType) {
        case 'per_person':
          quantity = guestCount
          // Recommend per-person charges for groups > 2
          isRecommended = guestCount > 2
          break
        case 'per_day':
          quantity = stayDurationDays
          // Recommend per-day charges for stays > 1 day
          isRecommended = stayDurationDays > 1
          break
        case 'fixed':
          quantity = 1
          // Fixed charges are optional by default
          isRecommended = false
          break
      }
      
      // Calculate the charge
      const calculation = await calculateSpecialCharge(charge.id, quantity)
      
      if (calculation) {
        if (isRecommended) {
          recommended.push(calculation)
        } else {
          optional.push(calculation)
        }
      }
    }
    
    const totalRecommended = recommended.reduce((sum, calc) => sum + calc.totalAmount, 0)
    const totalOptional = optional.reduce((sum, calc) => sum + calc.totalAmount, 0)
    
    return {
      recommended,
      optional,
      totalRecommended,
      totalOptional
    }
  } catch (error) {
    console.error('Error getting special charges recommendation:', error)
    throw error
  }
}

// Update reservation with special charges and recalculate total
export const updateReservationWithSpecialCharges = async (
  reservationId: string,
  specialCharges: BulkSpecialChargeData['charges'],
  userId: string,
  updateReservationTotal: boolean = true
): Promise<{
  chargeIds: string[]
  specialChargesTotal: number
  newReservationTotal?: number
  summary: SpecialChargeCalculation[]
}> => {
  try {
    // Add special charges
    const result = await addBulkSpecialChargesToReservation({
      reservationId,
      charges: specialCharges
    }, userId)
    
    let newReservationTotal: number | undefined
    
    // Update reservation total if requested
    if (updateReservationTotal) {
      const updateResult = await updateReservationTotalWithSpecialCharges(reservationId, userId)
      newReservationTotal = updateResult.newTotal
    }
    
    return {
      chargeIds: result.chargeIds,
      specialChargesTotal: result.totalAmount,
      newReservationTotal,
      summary: result.summary
    }
  } catch (error) {
    console.error('Error updating reservation with special charges:', error)
    throw error
  }
}

// Validate special charges against reservation constraints
export const validateSpecialChargesAgainstReservation = async (
  reservationId: string,
  specialCharges: BulkSpecialChargeData['charges']
): Promise<{
  isValid: boolean
  errors: string[]
  warnings: string[]
  totalAmount: number
}> => {
  try {
    const reservation = await getReservationById(reservationId)
    if (!reservation) {
      return {
        isValid: false,
        errors: ['Reservation not found'],
        warnings: [],
        totalAmount: 0
      }
    }
    
    const errors: string[] = []
    const warnings: string[] = []
    let totalAmount = 0
    
    // Calculate stay duration
    const checkIn = new Date(reservation.checkInDate)
    const checkOut = new Date(reservation.checkOutDate)
    const stayDurationDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    // Validate each special charge
    for (const charge of specialCharges) {
      const masterCharge = await getSpecialChargeById(charge.specialChargeId)
      
      if (!masterCharge) {
        errors.push(`Special charge ${charge.specialChargeId} not found`)
        continue
      }
      
      const quantity = charge.quantity || 1
      const rate = charge.customRate || masterCharge.defaultRate
      const amount = rate * quantity
      totalAmount += amount
      
      // Validate quantity against charge type
      if (masterCharge.rateType === 'per_day' && quantity > stayDurationDays) {
        warnings.push(
          `Quantity ${quantity} for ${masterCharge.chargeName} exceeds stay duration (${stayDurationDays} days)`
        )
      }
      
      if (masterCharge.rateType === 'per_person' && quantity > reservation.guestCount * 2) {
        warnings.push(
          `Quantity ${quantity} for ${masterCharge.chargeName} seems high for ${reservation.guestCount} guests`
        )
      }
      
      // Validate custom rates
      if (charge.customRate && Math.abs(charge.customRate - masterCharge.defaultRate) / masterCharge.defaultRate > 0.5) {
        warnings.push(
          `Custom rate ₹${charge.customRate} for ${masterCharge.chargeName} differs significantly from default ₹${masterCharge.defaultRate}`
        )
      }
    }
    
    // Check if total special charges exceed reservation total (warning)
    if (totalAmount > reservation.totalPrice) {
      warnings.push(
        `Special charges total (₹${totalAmount}) exceeds original reservation total (₹${reservation.totalPrice})`
      )
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      totalAmount
    }
  } catch (error) {
    console.error('Error validating special charges against reservation:', error)
    return {
      isValid: false,
      errors: ['Validation failed due to system error'],
      warnings: [],
      totalAmount: 0
    }
  }
}

// Clone special charges from one reservation to another
export const cloneSpecialCharges = async (
  fromReservationId: string,
  toReservationId: string,
  userId: string,
  includeCustomRates: boolean = true
): Promise<{ clonedCount: number; totalAmount: number }> => {
  try {
    const sourceCharges = await getReservationSpecialChargesByReservationId(fromReservationId)
    const activeCharges = sourceCharges.filter(charge => !charge.deletedAt)
    
    if (activeCharges.length === 0) {
      return { clonedCount: 0, totalAmount: 0 }
    }
    
    const cloneData: CreateReservationSpecialChargeData[] = activeCharges.map(charge => ({
      reservationId: toReservationId,
      specialChargeId: charge.specialChargeId,
      customRate: includeCustomRates ? charge.customRate : undefined,
      customDescription: charge.customDescription,
      quantity: charge.quantity,
      totalAmount: charge.totalAmount
    }))
    
    await createReservationSpecialChargesBatch(cloneData, userId)
    
    const totalAmount = cloneData.reduce((sum, charge) => sum + charge.totalAmount, 0)
    
    return {
      clonedCount: cloneData.length,
      totalAmount
    }
  } catch (error) {
    console.error('Error cloning special charges:', error)
    throw error
  }
}

// Get popular special charges (most frequently used)
export const getPopularSpecialCharges = async (
  limit: number = 10
): Promise<Array<{
  specialChargeId: string
  chargeName: string
  usageCount: number
  totalRevenue: number
  averageQuantity: number
}>> => {
  try {
    const { getSpecialChargesUsageStats } = await import('../reservationSpecialCharges')
    const allCharges = await getAllSpecialCharges({ isActive: true })
    
    const popularCharges = await Promise.all(
      allCharges.map(async (charge) => {
        const stats = await getSpecialChargesUsageStats(charge.id)
        return {
          specialChargeId: charge.id,
          chargeName: charge.chargeName,
          usageCount: stats.totalUsage,
          totalRevenue: stats.totalAmount,
          averageQuantity: stats.averageQuantity
        }
      })
    )
    
    // Sort by usage count and limit results
    return popularCharges
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting popular special charges:', error)
    throw error
  }
}