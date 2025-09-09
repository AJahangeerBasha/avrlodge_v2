import { FilterType } from './DashboardFilters'
import { DateRange } from 'react-day-picker'

// Define the complete data structure for our dashboard
export interface DashboardData {
  roomStats: {
    totalRooms: number
    bookedRooms: {
      reservation: number
      confirmation: number
    }
    availableRooms: number
    checkInDue: number
    checkOutDue: number
    totalGuestsInHouse: number
    occupancy: {
      present: {
        potential: number // (Booked Rooms / Total Rooms) × 100
        confirmed: number // (Checked-In Rooms / Total Rooms) × 100
      }
      future: {
        potential: number // (Reserved Rooms / Total Rooms) × 100
        confirmed: number // (Booked Rooms / Total Rooms) × 100
      }
      past: {
        confirmed: number // (Rooms Sold / Total Rooms) × 100
      }
      custom: {
        confirmed: number // (Rooms Sold / Total Rooms) × 100
      }
    }
  }
  revenue: {
    rooms: {
      total: number
      advancePayment: number
    }
    additionalServices: number
    rent: number
    refunds: number
    discounts: number
    salary: number
    expenses: number
    bills: number
  }
  paymentSources: {
    cash: number
    jubairQR: number
    bashaQR: number
  }
  refundsAdjustments: {
    refunds: {
      cancellations: number
      earlyCheckouts: number
      total: number
    }
    adjustments: {
      totalDiscount: number
      percentageDiscounts: number
      fixedDiscounts: number
    }
    reasons: {
      cancellations: { count: number; amount: number }
      earlyCheckouts: { count: number; amount: number }
      discounts: { count: number; amount: number }
    }
  }
  financeDetails: {
    expected: {
      totalRevenue: number
      checkedInGuestsRevenue: number
    }
    actual: {
      totalRevenue: number
      checkedInGuestsRevenue: number
    }
    netRevenue: number
    roomsData: {
      totalRooms: number
      standardTariff: number
      checkedInGuests: number
      standardRate: number
    }
  }
  charts: {
    occupancyTrend: Array<{
      name: string
      occupancy: number
      date?: string
    }>
    revenueTrend: Array<{
      name: string
      revenue: number
      rooms: number
      date?: string
    }>
    paymentMethods: Array<{
      name: string
      value: number
      color: string
    }>
    occupancyBreakdown: Array<{
      name: string
      value: number
      color: string
    }>
    refundsData: Array<{
      name: string
      value: number
      date?: string
    }>
  }
}

// Sample data generator function
export function generateSampleData(filter: FilterType, customDateRange?: DateRange): DashboardData {
  // Base values that we'll modify based on the filter
  const baseRooms = 50
  const baseTariff = 3500
  
  // Generate different data based on the selected filter
  const getMultiplier = () => {
    switch (filter) {
      case 'today': return { rooms: 0.8, revenue: 0.9 }
      case 'yesterday': return { rooms: 0.75, revenue: 0.85 }
      case 'current_week': return { rooms: 0.85, revenue: 0.92 }
      case 'next_week': return { rooms: 0.9, revenue: 0.95 }
      case 'last_week': return { rooms: 0.82, revenue: 0.88 }
      case 'current_month': return { rooms: 0.87, revenue: 0.91 }
      case 'next_month': return { rooms: 0.92, revenue: 0.96 }
      case 'last_month': return { rooms: 0.84, revenue: 0.89 }
      case 'custom': return { rooms: 0.86, revenue: 0.90 }
      default: return { rooms: 0.8, revenue: 0.9 }
    }
  }
  
  const multiplier = getMultiplier()
  
  // Calculate room statistics
  const bookedRooms = Math.round(baseRooms * multiplier.rooms)
  const confirmedRooms = Math.round(bookedRooms * 0.85)
  const availableRooms = baseRooms - bookedRooms
  const checkedInGuests = Math.round(confirmedRooms * 2.1) // Average 2.1 guests per room
  
  // Calculate occupancy percentages
  const presentPotential = (bookedRooms / baseRooms) * 100
  const presentConfirmed = (confirmedRooms / baseRooms) * 100
  const futurePotential = ((bookedRooms + 5) / baseRooms) * 100
  const futureConfirmed = (bookedRooms / baseRooms) * 100
  const pastConfirmed = ((bookedRooms - 3) / baseRooms) * 100
  
  // Revenue calculations
  const roomsRevenue = Math.round(confirmedRooms * baseTariff * multiplier.revenue)
  const advancePayment = Math.round(roomsRevenue * 0.3)
  const additionalServices = Math.round(roomsRevenue * 0.15)
  const rent = Math.round(roomsRevenue * 0.05)
  
  // Deductions
  const refunds = Math.round(roomsRevenue * 0.03)
  const discounts = Math.round(roomsRevenue * 0.05)
  const salary = Math.round(roomsRevenue * 0.12)
  const expenses = Math.round(roomsRevenue * 0.08)
  const bills = Math.round(roomsRevenue * 0.04)
  
  // Payment sources (distribute total revenue across methods)
  const totalPayments = roomsRevenue + additionalServices
  const cashPayments = Math.round(totalPayments * 0.4)
  const jubairQR = Math.round(totalPayments * 0.35)
  const bashaQR = Math.round(totalPayments * 0.25)
  
  // Refunds and adjustments breakdown
  const cancellationRefunds = Math.round(refunds * 0.6)
  const earlyCheckoutRefunds = refunds - cancellationRefunds
  const percentageDiscounts = Math.round(discounts * 0.7)
  const fixedDiscounts = discounts - percentageDiscounts
  
  // Finance details
  const expectedTotalRevenue = baseRooms * baseTariff
  const expectedGuestRevenue = checkedInGuests * (baseTariff / 2.1)
  const actualTotalRevenue = roomsRevenue + additionalServices + rent
  const actualGuestRevenue = Math.round(roomsRevenue * 0.95) // After discounts
  const netRevenue = actualTotalRevenue - refunds - discounts - salary - expenses - bills
  
  // Generate trend data (last 7 days/periods)
  const generateTrendData = (baseValue: number, variance: number = 0.2) => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date()
      day.setDate(day.getDate() - (6 - i))
      const randomVariance = 1 + (Math.random() - 0.5) * variance
      return {
        name: day.toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round(baseValue * randomVariance),
        date: day.toISOString()
      }
    })
  }
  
  return {
    roomStats: {
      totalRooms: baseRooms,
      bookedRooms: {
        reservation: bookedRooms,
        confirmation: confirmedRooms
      },
      availableRooms,
      checkInDue: Math.round(bookedRooms * 0.2),
      checkOutDue: Math.round(confirmedRooms * 0.15),
      totalGuestsInHouse: checkedInGuests,
      occupancy: {
        present: {
          potential: presentPotential,
          confirmed: presentConfirmed
        },
        future: {
          potential: futurePotential,
          confirmed: futureConfirmed
        },
        past: {
          confirmed: pastConfirmed
        },
        custom: {
          confirmed: (presentConfirmed + pastConfirmed) / 2
        }
      }
    },
    revenue: {
      rooms: {
        total: roomsRevenue,
        advancePayment
      },
      additionalServices,
      rent,
      refunds,
      discounts,
      salary,
      expenses,
      bills
    },
    paymentSources: {
      cash: cashPayments,
      jubairQR,
      bashaQR
    },
    refundsAdjustments: {
      refunds: {
        cancellations: cancellationRefunds,
        earlyCheckouts: earlyCheckoutRefunds,
        total: refunds
      },
      adjustments: {
        totalDiscount: discounts,
        percentageDiscounts,
        fixedDiscounts
      },
      reasons: {
        cancellations: { count: 3, amount: cancellationRefunds },
        earlyCheckouts: { count: 2, amount: earlyCheckoutRefunds },
        discounts: { count: 8, amount: discounts }
      }
    },
    financeDetails: {
      expected: {
        totalRevenue: expectedTotalRevenue,
        checkedInGuestsRevenue: expectedGuestRevenue
      },
      actual: {
        totalRevenue: actualTotalRevenue,
        checkedInGuestsRevenue: actualGuestRevenue
      },
      netRevenue,
      roomsData: {
        totalRooms: baseRooms,
        standardTariff: baseTariff,
        checkedInGuests,
        standardRate: Math.round(baseTariff / 2.1)
      }
    },
    charts: {
      occupancyTrend: generateTrendData(presentConfirmed, 0.3).map(item => ({
        name: item.name,
        occupancy: Math.min(100, Math.max(0, item.value)),
        date: item.date
      })),
      revenueTrend: generateTrendData(roomsRevenue / 1000, 0.4).map(item => ({
        name: item.name,
        revenue: item.value * 1000,
        rooms: Math.round(item.value / (baseTariff / 1000)),
        date: item.date
      })),
      paymentMethods: [
        { name: 'Cash', value: cashPayments, color: '#10B981' },
        { name: 'Jubair QR', value: jubairQR, color: '#3B82F6' },
        { name: 'Basha QR', value: bashaQR, color: '#8B5CF6' }
      ],
      occupancyBreakdown: [
        { name: 'Occupied', value: confirmedRooms, color: '#EF4444' },
        { name: 'Reserved', value: bookedRooms - confirmedRooms, color: '#F59E0B' },
        { name: 'Available', value: availableRooms, color: '#10B981' }
      ],
      refundsData: generateTrendData(refunds + discounts, 0.5).map(item => ({
        name: item.name,
        value: item.value,
        date: item.date
      }))
    }
  }
}

// Example usage and data validation
export function validateDashboardData(data: DashboardData): boolean {
  try {
    // Basic validation checks
    const hasValidRoomStats = data.roomStats.totalRooms > 0
    const hasValidRevenue = data.revenue.rooms.total >= 0
    const hasValidCharts = data.charts.occupancyTrend.length > 0
    
    return hasValidRoomStats && hasValidRevenue && hasValidCharts
  } catch (error) {
    console.error('Dashboard data validation failed:', error)
    return false
  }
}

// Types already exported above with the interface declaration