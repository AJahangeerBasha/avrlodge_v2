import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    total_bookings: number
    total_revenue: number
    total_payments_received: number
    occupancy_rate: number
    conversion_rate: number
    avg_guests_per_booking: number
  }
  status_breakdown: Array<{
    status: string
    count: number
    revenue: number
    payments_received: number
  }>
  room_type_performance: Array<{
    room_type: string
    bookings: number
    revenue: number
  }>
  monthly_trends: Array<{
    month: string
    bookings: number
    revenue: number
    avg_booking_value: number
  }>
  recent_bookings: Array<{
    id: string
    name: string
    email: string
    status: string
    total_price: number
    payment_received: number
    checkin: string
    checkout: string
    created_at: string
    guests: number
    payment_percentage: number
  }>
  period: {
    start: string
    end: string
    days: number
  }
}

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/dashboard?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {['7', '30', '90', '365'].map((days) => (
            <Button
              key={days}
              variant={period === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(days)}
            >
              {days} days
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.total_bookings}</div>
            <p className="text-xs text-muted-foreground">
              Last {period} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.overview.total_payments_received)} received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.occupancy_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Current occupancy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.conversion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Bookings to confirmed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Booking Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.status_breakdown.map((status) => (
                <div key={status.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status.status)}>
                      {status.status}
                    </Badge>
                    <span className="text-sm">{status.count} bookings</span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(status.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Room Type Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.room_type_performance.map((room) => (
                <div key={room.room_type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{room.room_type}</span>
                  <div className="text-right">
                    <div className="text-sm">{room.bookings} bookings</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(room.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recent_bookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{booking.name}</h4>
                    <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{formatDate(booking.checkin)} - {formatDate(booking.checkout)}</span>
                    <span>{booking.guests} guests</span>
                    <span>{booking.payment_percentage}% paid</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{formatCurrency(booking.total_price)}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(booking.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Period Info */}
      <Card>
        <CardContent className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Data from {formatDate(analytics.period.start)} to {formatDate(analytics.period.end)} 
            ({analytics.period.days} days)
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 