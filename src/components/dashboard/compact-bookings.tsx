import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Clock, Eye } from 'lucide-react'

interface Booking {
  id: string
  guest_name: string
  guest_email: string
  checkin_date: string
  checkout_date: string
  guest_count: number
  status: string
  total_amount?: number
  created_at: string
}

interface CompactBookingsProps {
  bookings: Booking[]
  loading?: boolean
  title?: string
  emptyMessage?: string
  maxItems?: number
}

export default function CompactBookings({ 
  bookings = [], 
  loading = false, 
  title = "Recent Bookings",
  emptyMessage = "No bookings found",
  maxItems = 5
}: CompactBookingsProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{emptyMessage}</p>
              <p className="text-sm">Your bookings will appear here</p>
            </div>
          ) : (
            bookings.slice(0, maxItems).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">{booking.guest_name}</h4>
                    <Badge className={`text-xs ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(booking.checkin_date)} - {formatDate(booking.checkout_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {booking.guest_count} guest{booking.guest_count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        
        {bookings.length > maxItems && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Bookings
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 