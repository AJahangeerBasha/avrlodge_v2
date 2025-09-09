// Guest Management Utilities
// High-level utilities for managing guests and reservation guest relationships

import {
  createGuest,
  createBulkGuests,
  getGuestsByReservationId,
  getPrimaryGuestByReservationId,
  getReservationGuestSummary,
  searchGuests,
  findGuestMatches,
  setPrimaryGuest,
  deleteGuest,
  getGuestById
} from '../guests'
import { 
  Guest,
  CreateGuestData,
  BulkGuestData,
  GuestProfile,
  GuestAnalytics,
  GuestDashboardMetrics,
  GuestSearchResult,
  GuestMatchResult,
  GuestImportData,
  GuestImportResult,
  GuestResult,
  ContactInfo,
  LocationInfo,
  INDIAN_STATES
} from '../types/guests'
import {
  validateGuestWithSuggestions,
  validateBulkGuests,
  formatPhoneNumber,
  normalizePhoneNumber,
  arePhoneNumbersSame,
  getStateFromPincode,
  validateGuestCompleteness
} from './guestValidation'

// Create a guest with comprehensive validation and duplicate checking
export const createGuestSafely = async (
  data: CreateGuestData,
  userId: string,
  checkDuplicates: boolean = true
): Promise<{
  guestId: string
  warnings?: string[]
  suggestions?: string[]
  duplicateInfo?: GuestMatchResult
}> => {
  try {
    const warnings: string[] = []
    const suggestions: string[] = []
    
    // Comprehensive validation with suggestions
    const validation = validateGuestWithSuggestions(data)
    if (!validation.isValid) {
      throw new Error(`Guest validation failed: ${validation.errors.join(', ')}`)
    }
    
    // Add validation warnings and suggestions
    warnings.push(...validation.warnings)
    
    if (validation.suggestions) {
      if (validation.suggestions.formattedPhone) {
        suggestions.push(`Formatted phone: ${validation.suggestions.formattedPhone}`)
      }
      if (validation.suggestions.detectedState) {
        suggestions.push(`Detected state: ${validation.suggestions.detectedState}`)
        // Auto-apply detected state if not provided
        if (!data.state) {
          data.state = validation.suggestions.detectedState
        }
      }
    }
    
    let duplicateInfo: GuestMatchResult | undefined
    
    // Check for duplicates if requested
    if (checkDuplicates) {
      duplicateInfo = await findGuestMatches(data)
      
      if (duplicateInfo.hasExactMatch) {
        const exactMatch = duplicateInfo.exactMatches[0]
        throw new Error(`Guest already exists: ${exactMatch.name} (${exactMatch.phone})`)
      }
      
      if (duplicateInfo.hasPotentialDuplicate) {
        warnings.push('Potential duplicate guest found - please review before creating')
      }
    }
    
    // Create the guest
    const guestId = await createGuest(data, userId)
    
    return {
      guestId,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
      duplicateInfo
    }
  } catch (error) {
    console.error('Error creating guest safely:', error)
    throw error
  }
}

// Create multiple guests for a reservation with smart primary guest selection
export const createReservationGuests = async (
  data: BulkGuestData,
  userId: string,
  options: {
    checkDuplicates?: boolean
    autoSetPrimary?: boolean
    skipValidation?: boolean
  } = {}
): Promise<{
  totalCreated: number
  primaryGuestId?: string
  guestIds: string[]
  warnings: string[]
  errors: string[]
  duplicatesFound: number
}> => {
  try {
    const warnings: string[] = []
    const errors: string[] = []
    let duplicatesFound = 0
    
    // Validate bulk data unless skipped
    if (!options.skipValidation) {
      const validation = validateBulkGuests(data.guests)
      if (!validation.isValid) {
        throw new Error(`Bulk validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }
    
    // Check for duplicates if requested
    if (options.checkDuplicates) {
      for (const guest of data.guests) {
        const matches = await findGuestMatches({
          reservationId: data.reservationId,
          ...guest
        })
        
        if (matches.hasExactMatch) {
          duplicatesFound++
          warnings.push(`Duplicate found for ${guest.name} (${guest.phone})`)
        }
      }
    }
    
    // Create guests in bulk
    const result = await createBulkGuests(data, userId)
    
    // Handle errors
    if (result.errors) {
      result.errors.forEach(error => {
        errors.push(`${error.guest.name}: ${error.error}`)
      })
    }
    
    // Auto-set primary guest if requested and not already set
    let primaryGuestId = result.primaryGuestId
    
    if (options.autoSetPrimary && result.createdGuests.length > 0) {
      // Find the best candidate for primary guest
      const bestPrimary = result.createdGuests.find(guest => 
        guest.isPrimaryGuest
      ) || result.createdGuests[0] // Default to first guest
      
      primaryGuestId = bestPrimary.guestId
    }
    
    return {
      totalCreated: result.totalGuests,
      primaryGuestId,
      guestIds: result.createdGuests.map(g => g.guestId),
      warnings,
      errors,
      duplicatesFound
    }
  } catch (error) {
    console.error('Error creating reservation guests:', error)
    throw error
  }
}

// Get comprehensive guest profile with history and analytics
export const getGuestProfile = async (
  guestId: string
): Promise<GuestProfile | null> => {
  try {
    const guest = await getGuestById(guestId)
    if (!guest) {
      return null
    }
    
    // Prepare contact info
    const contactInfo: ContactInfo = {
      phone: guest.phone,
      whatsapp: guest.whatsapp,
      telegram: guest.telegram,
      hasWhatsApp: !!guest.whatsapp,
      hasTelegram: !!guest.telegram,
      preferredContact: guest.whatsapp ? 'whatsapp' : 
                      guest.telegram ? 'telegram' : 'phone'
    }
    
    // Prepare location info
    const locationInfo: LocationInfo = {
      pincode: guest.pincode,
      state: guest.state,
      district: guest.district,
      isComplete: !!(guest.pincode && guest.state && guest.district),
      missingFields: [
        !guest.pincode ? 'pincode' : '',
        !guest.state ? 'state' : '',
        !guest.district ? 'district' : ''
      ].filter(field => field !== '')
    }
    
    // Find reservation history (would need to search reservations collection)
    // For now, we'll create a placeholder
    const reservationHistory: GuestProfile['reservationHistory'] = []
    
    // Calculate visit statistics
    const totalVisits = reservationHistory?.length || 1 // At least current reservation
    const isReturningGuest = totalVisits > 1
    const lastVisit = reservationHistory?.length ? 
      reservationHistory[0].checkInDate : undefined
    
    return {
      guest,
      contactInfo,
      locationInfo,
      reservationHistory,
      lastVisit,
      totalVisits,
      isReturningGuest
    }
  } catch (error) {
    console.error('Error getting guest profile:', error)
    throw error
  }
}

// Smart guest search with ranking and suggestions
export const performSmartGuestSearch = async (
  searchQuery: string,
  options: {
    includeInactive?: boolean
    maxResults?: number
    searchType?: 'name' | 'phone' | 'location' | 'general'
  } = {}
): Promise<GuestSearchResult & {
  rankedResults: Array<{
    guest: Guest
    matchScore: number
    matchReasons: string[]
  }>
}> => {
  try {
    const {
      includeInactive = false,
      maxResults = 50,
      searchType = 'general'
    } = options
    
    // Perform the basic search
    const searchResult = await searchGuests(searchQuery, searchType, maxResults * 2)
    
    // Rank results based on relevance
    const rankedResults = searchResult.guests.map(guest => {
      const matchReasons: string[] = []
      let matchScore = 0
      
      const query = searchQuery.toLowerCase()
      
      // Name matching
      if (guest.name.toLowerCase().includes(query)) {
        matchScore += guest.name.toLowerCase() === query ? 100 : 50
        matchReasons.push('Name match')
      }
      
      // Phone matching
      const normalizedPhone = normalizePhoneNumber(guest.phone)
      const normalizedQuery = normalizePhoneNumber(searchQuery)
      if (normalizedPhone.includes(normalizedQuery)) {
        matchScore += normalizedPhone === normalizedQuery ? 100 : 40
        matchReasons.push('Phone match')
      }
      
      // Location matching
      if (guest.state?.toLowerCase().includes(query)) {
        matchScore += 20
        matchReasons.push('State match')
      }
      
      if (guest.district?.toLowerCase().includes(query)) {
        matchScore += 30
        matchReasons.push('District match')
      }
      
      if (guest.pincode?.includes(query)) {
        matchScore += 25
        matchReasons.push('Pincode match')
      }
      
      // Primary guest boost
      if (guest.isPrimaryGuest) {
        matchScore += 10
        matchReasons.push('Primary guest')
      }
      
      // Recent activity boost (created recently)
      const daysSinceCreated = Math.floor(
        (new Date().getTime() - new Date(guest.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceCreated < 30) {
        matchScore += 5
        matchReasons.push('Recent guest')
      }
      
      return {
        guest,
        matchScore,
        matchReasons
      }
    })
    
    // Sort by match score and take top results
    rankedResults.sort((a, b) => b.matchScore - a.matchScore)
    const topResults = rankedResults.slice(0, maxResults)
    
    return {
      ...searchResult,
      guests: topResults.map(r => r.guest),
      totalMatches: topResults.length,
      rankedResults: topResults
    }
  } catch (error) {
    console.error('Error performing smart guest search:', error)
    throw error
  }
}

// Import guests from external data with duplicate handling
export const importGuestsFromData = async (
  guestsData: GuestImportData[],
  userId: string,
  options: {
    skipDuplicates?: boolean
    updateExisting?: boolean
    createMissingReservations?: boolean
  } = {}
): Promise<GuestImportResult> => {
  try {
    const successful: GuestResult[] = []
    const failed: GuestImportResult['failed'] = []
    const duplicatesFound: GuestImportResult['duplicatesFound'] = []
    
    for (const [index, guestData] of guestsData.entries()) {
      try {
        // Validate guest data
        const validation = validateGuestWithSuggestions({
          reservationId: guestData.reservationId,
          name: guestData.name,
          phone: guestData.phone,
          whatsapp: guestData.whatsapp,
          telegram: guestData.telegram,
          pincode: guestData.pincode,
          state: guestData.state,
          district: guestData.district,
          isPrimaryGuest: guestData.isPrimaryGuest
        })
        
        if (!validation.isValid) {
          failed.push({
            data: guestData,
            error: validation.errors.join(', '),
            lineNumber: index + 1
          })
          continue
        }
        
        // Check for duplicates
        const matches = await findGuestMatches({
          reservationId: guestData.reservationId,
          name: guestData.name,
          phone: guestData.phone,
          whatsapp: guestData.whatsapp,
          telegram: guestData.telegram,
          pincode: guestData.pincode,
          state: guestData.state,
          district: guestData.district
        })
        
        if (matches.hasExactMatch) {
          const existingGuest = matches.exactMatches[0]
          
          if (options.skipDuplicates) {
            duplicatesFound.push({
              data: guestData,
              existingGuest,
              action: 'skipped'
            })
            continue
          } else if (options.updateExisting) {
            // Update existing guest with new data
            // Implementation would go here
            duplicatesFound.push({
              data: guestData,
              existingGuest,
              action: 'updated'
            })
            continue
          } else {
            duplicatesFound.push({
              data: guestData,
              existingGuest,
              action: 'created_duplicate'
            })
            // Continue to create duplicate
          }
        }
        
        // Create the guest
        const guestId = await createGuest({
          reservationId: guestData.reservationId,
          name: guestData.name,
          phone: guestData.phone,
          whatsapp: guestData.whatsapp,
          telegram: guestData.telegram,
          pincode: guestData.pincode,
          state: guestData.state,
          district: guestData.district,
          isPrimaryGuest: guestData.isPrimaryGuest
        }, userId)
        
        successful.push({
          guestId,
          name: guestData.name,
          phone: guestData.phone,
          isPrimaryGuest: guestData.isPrimaryGuest || false,
          createdAt: new Date().toISOString()
        })
        
      } catch (error) {
        failed.push({
          data: guestData,
          error: error instanceof Error ? error.message : 'Unknown error',
          lineNumber: index + 1
        })
      }
    }
    
    return {
      successful,
      failed,
      duplicatesFound,
      totalProcessed: guestsData.length,
      totalSuccessful: successful.length,
      totalFailed: failed.length
    }
  } catch (error) {
    console.error('Error importing guests from data:', error)
    throw error
  }
}

// Calculate guest analytics for dashboard
export const calculateGuestAnalytics = async (
  dateRange?: { start: string; end: string }
): Promise<GuestAnalytics> => {
  try {
    // Get all guests (in production, this would use aggregation)
    const { getGuests } = await import('../guests')
    const allGuests = await getGuests({ 
      isActive: true,
      dateRange 
    }, 5000)
    
    // Filter by date range if provided
    let filteredGuests = allGuests
    if (dateRange) {
      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      
      filteredGuests = allGuests.filter(guest => {
        const guestDate = new Date(guest.createdAt)
        return guestDate >= startDate && guestDate <= endDate
      })
    }
    
    // Basic statistics
    const totalGuests = filteredGuests.length
    
    // New guests this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const newGuestsThisMonth = filteredGuests.filter(guest =>
      new Date(guest.createdAt) >= thisMonth
    ).length
    
    // Returning guests (guests with multiple reservations)
    const guestReservationCounts = new Map<string, number>()
    filteredGuests.forEach(guest => {
      const key = normalizePhoneNumber(guest.phone)
      guestReservationCounts.set(key, (guestReservationCounts.get(key) || 0) + 1)
    })
    
    const returningGuests = Array.from(guestReservationCounts.values())
      .filter(count => count > 1).length
    
    // Guests by state
    const stateCounts = filteredGuests.reduce((acc, guest) => {
      if (guest.state) {
        acc[guest.state] = (acc[guest.state] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const guestsByState = Object.entries(stateCounts)
      .map(([state, count]) => ({
        state,
        count,
        percentage: Math.round((count / totalGuests) * 100)
      }))
      .sort((a, b) => b.count - a.count)
    
    // Guests by district
    const districtCounts = filteredGuests.reduce((acc, guest) => {
      if (guest.district && guest.state) {
        const key = `${guest.district}, ${guest.state}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const guestsByDistrict = Object.entries(districtCounts)
      .map(([location, count]) => {
        const [district, state] = location.split(', ')
        return { district, state, count }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // Top 20 districts
    
    // Contact method distribution
    const contactMethodDistribution = {
      hasPhone: filteredGuests.length, // All guests have phone
      hasWhatsApp: filteredGuests.filter(g => g.whatsapp).length,
      hasTelegram: filteredGuests.filter(g => g.telegram).length,
      hasMultipleContacts: filteredGuests.filter(g => g.whatsapp && g.telegram).length
    }
    
    // Top states
    const topStates = guestsByState.slice(0, 5).map(item => item.state)
    
    // Guest growth trend (last 12 months)
    const guestGrowthTrend: GuestAnalytics['guestGrowthTrend'] = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonthDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      
      const monthGuests = allGuests.filter(guest => {
        const guestDate = new Date(guest.createdAt)
        return guestDate >= monthDate && guestDate < nextMonthDate
      })
      
      const monthGuestPhones = new Set(monthGuests.map(g => normalizePhoneNumber(g.phone)))
      const existingGuestPhones = new Set(
        allGuests.filter(guest => new Date(guest.createdAt) < monthDate)
                 .map(g => normalizePhoneNumber(g.phone))
      )
      
      const newGuestsInMonth = monthGuests.filter(guest =>
        !existingGuestPhones.has(normalizePhoneNumber(guest.phone))
      ).length
      
      const returningGuestsInMonth = monthGuests.filter(guest =>
        existingGuestPhones.has(normalizePhoneNumber(guest.phone))
      ).length
      
      guestGrowthTrend.push({
        month: monthDate.toISOString().slice(0, 7), // YYYY-MM format
        newGuests: newGuestsInMonth,
        returningGuests: returningGuestsInMonth
      })
    }
    
    return {
      totalGuests,
      newGuestsThisMonth,
      returningGuests,
      guestsByState,
      guestsByDistrict,
      contactMethodDistribution,
      topStates,
      guestGrowthTrend
    }
  } catch (error) {
    console.error('Error calculating guest analytics:', error)
    throw error
  }
}

// Get guest dashboard metrics
export const getGuestDashboardMetrics = async (): Promise<GuestDashboardMetrics> => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    const { getGuests } = await import('../guests')
    
    // Get recent guests for analysis
    const recentGuests = await getGuests({ 
      isActive: true,
      dateRange: {
        start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
        end: now.toISOString()
      }
    }, 2000)
    
    // Today's new guests
    const newGuestsToday = recentGuests.filter(guest => 
      new Date(guest.createdAt) >= today
    ).length
    
    // This month's new guests
    const newGuestsThisMonth = recentGuests.filter(guest => 
      new Date(guest.createdAt) >= thisMonth
    ).length
    
    // Returning guests this month (based on phone numbers)
    const thisMonthGuests = recentGuests.filter(guest => 
      new Date(guest.createdAt) >= thisMonth
    )
    
    const phoneNumbers = new Set(thisMonthGuests.map(g => normalizePhoneNumber(g.phone)))
    const olderGuests = recentGuests.filter(guest => 
      new Date(guest.createdAt) < thisMonth
    )
    const olderPhoneNumbers = new Set(olderGuests.map(g => normalizePhoneNumber(g.phone)))
    
    const returningGuestsThisMonth = Array.from(phoneNumbers)
      .filter(phone => olderPhoneNumbers.has(phone)).length
    
    // Top states
    const stateCounts = recentGuests.reduce((acc, guest) => {
      if (guest.state) {
        acc[guest.state] = (acc[guest.state] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    const topStates = Object.entries(stateCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([state, count]) => ({ state, count }))
    
    // Contact method statistics
    const contactMethodStats = {
      phoneOnly: recentGuests.filter(g => !g.whatsapp && !g.telegram).length,
      withWhatsApp: recentGuests.filter(g => g.whatsapp).length,
      withTelegram: recentGuests.filter(g => g.telegram).length,
      withBoth: recentGuests.filter(g => g.whatsapp && g.telegram).length
    }
    
    // Recent guests (last 10)
    const recentGuestsList = recentGuests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
    
    // Guest growth rate (compared to last month)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    
    const lastMonthGuests = recentGuests.filter(guest => {
      const guestDate = new Date(guest.createdAt)
      return guestDate >= lastMonth && guestDate <= lastMonthEnd
    }).length
    
    const guestGrowthRate = lastMonthGuests > 0 
      ? Math.round(((newGuestsThisMonth - lastMonthGuests) / lastMonthGuests) * 100)
      : newGuestsThisMonth > 0 ? 100 : 0
    
    return {
      totalGuests: recentGuests.length,
      newGuestsToday,
      newGuestsThisMonth,
      returningGuestsThisMonth,
      topStates,
      contactMethodStats,
      recentGuests: recentGuestsList,
      guestGrowthRate
    }
  } catch (error) {
    console.error('Error getting guest dashboard metrics:', error)
    throw error
  }
}

// Merge duplicate guests
export const mergeDuplicateGuests = async (
  primaryGuestId: string,
  duplicateGuestIds: string[],
  userId: string
): Promise<{
  mergedGuest: Guest
  mergedReservations: string[]
  deletedGuests: string[]
}> => {
  try {
    const primaryGuest = await getGuestById(primaryGuestId)
    if (!primaryGuest) {
      throw new Error('Primary guest not found')
    }
    
    const duplicateGuests: Guest[] = []
    const mergedReservations: string[] = []
    
    // Get all duplicate guests
    for (const guestId of duplicateGuestIds) {
      const guest = await getGuestById(guestId)
      if (guest) {
        duplicateGuests.push(guest)
        if (guest.reservationId) {
          mergedReservations.push(guest.reservationId)
        }
      }
    }
    
    // Merge contact information (keep the most complete)
    let mergedData = { ...primaryGuest }
    
    for (const duplicate of duplicateGuests) {
      if (!mergedData.whatsapp && duplicate.whatsapp) {
        mergedData.whatsapp = duplicate.whatsapp
      }
      if (!mergedData.telegram && duplicate.telegram) {
        mergedData.telegram = duplicate.telegram
      }
      if (!mergedData.pincode && duplicate.pincode) {
        mergedData.pincode = duplicate.pincode
      }
      if (!mergedData.state && duplicate.state) {
        mergedData.state = duplicate.state
      }
      if (!mergedData.district && duplicate.district) {
        mergedData.district = duplicate.district
      }
    }
    
    // Update primary guest with merged data
    const { updateGuest } = await import('../guests')
    await updateGuest(primaryGuestId, {
      whatsapp: mergedData.whatsapp,
      telegram: mergedData.telegram,
      pincode: mergedData.pincode,
      state: mergedData.state,
      district: mergedData.district
    }, userId)
    
    // Soft delete duplicate guests
    for (const guestId of duplicateGuestIds) {
      await deleteGuest(guestId, userId)
    }
    
    // Get updated primary guest
    const updatedPrimaryGuest = await getGuestById(primaryGuestId)
    
    return {
      mergedGuest: updatedPrimaryGuest!,
      mergedReservations,
      deletedGuests: duplicateGuestIds
    }
  } catch (error) {
    console.error('Error merging duplicate guests:', error)
    throw error
  }
}

// Suggest primary guest for a reservation
export const suggestPrimaryGuest = async (
  reservationId: string
): Promise<{
  suggestedPrimary: Guest | null
  alternatives: Guest[]
  reason: string
  confidence: 'high' | 'medium' | 'low'
}> => {
  try {
    const guests = await getGuestsByReservationId(reservationId)
    
    if (guests.length === 0) {
      return {
        suggestedPrimary: null,
        alternatives: [],
        reason: 'No guests found for reservation',
        confidence: 'low'
      }
    }
    
    if (guests.length === 1) {
      return {
        suggestedPrimary: guests[0],
        alternatives: [],
        reason: 'Only one guest in reservation',
        confidence: 'high'
      }
    }
    
    // Scoring system for primary guest selection
    const scoredGuests = guests.map(guest => {
      let score = 0
      const reasons: string[] = []
      
      // Complete contact information
      if (guest.whatsapp) {
        score += 20
        reasons.push('Has WhatsApp')
      }
      
      if (guest.telegram) {
        score += 10
        reasons.push('Has Telegram')
      }
      
      // Location information
      if (guest.state && guest.district && guest.pincode) {
        score += 30
        reasons.push('Complete location info')
      } else if (guest.state && guest.district) {
        score += 20
        reasons.push('Has state and district')
      }
      
      // Name quality (longer names often indicate more formal records)
      const nameWords = guest.name.trim().split(/\s+/)
      if (nameWords.length >= 2) {
        score += 10
        reasons.push('Full name')
      }
      
      // Already marked as primary
      if (guest.isPrimaryGuest) {
        score += 50
        reasons.push('Already marked as primary')
      }
      
      return { guest, score, reasons }
    })
    
    // Sort by score
    scoredGuests.sort((a, b) => b.score - a.score)
    
    const best = scoredGuests[0]
    const confidence = best.score >= 60 ? 'high' : 
                     best.score >= 30 ? 'medium' : 'low'
    
    const reason = best.reasons.length > 0 ? 
      best.reasons.join(', ') : 
      'Selected as most complete profile'
    
    return {
      suggestedPrimary: best.guest,
      alternatives: scoredGuests.slice(1, 4).map(s => s.guest),
      reason,
      confidence
    }
  } catch (error) {
    console.error('Error suggesting primary guest:', error)
    throw error
  }
}