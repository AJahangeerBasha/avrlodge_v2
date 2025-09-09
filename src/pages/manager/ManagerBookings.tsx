import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Calendar, MapPin, Phone, Mail, Clock, Users, Star } from 'lucide-react';

export const ManagerBookings: React.FC = () => {
  const bookings = [
    { 
      id: 'BK-001', 
      guest: { 
        name: 'John Smith', 
        email: 'john@example.com', 
        phone: '+1 234-567-8900',
        vip: false,
        preferences: ['Non-smoking', 'High floor', 'City view']
      },
      room: { number: '101', type: 'Deluxe Suite', floor: '1st' },
      dates: { 
        checkin: '2025-01-15', 
        checkout: '2025-01-18', 
        nights: 3,
        checkinTime: '3:00 PM',
        checkoutTime: '11:00 AM'
      },
      status: 'active',
      amount: '$450',
      source: 'Website',
      specialRequests: ['Early check-in', 'Airport pickup'],
      paymentStatus: 'paid'
    },
    { 
      id: 'BK-002', 
      guest: { 
        name: 'Sarah Johnson', 
        email: 'sarah@example.com', 
        phone: '+1 234-567-8901',
        vip: true,
        preferences: ['Quiet room', 'Extra pillows', 'Late checkout']
      },
      room: { number: '205', type: 'Standard Room', floor: '2nd' },
      dates: { 
        checkin: '2025-01-16', 
        checkout: '2025-01-20', 
        nights: 4,
        checkinTime: '2:00 PM',
        checkoutTime: '12:00 PM'
      },
      status: 'checkedin',
      amount: '$320',
      source: 'Phone',
      specialRequests: ['Room service', 'Extra towels'],
      paymentStatus: 'partial'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checkedin': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Guest Bookings</h2>
          <p className="text-gray-600 mt-2">
            Detailed view of all guest bookings with preferences and special requests.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>New Booking</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">45</p>
            <p className="text-xs text-gray-600">Total Guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-600">VIP Guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-green-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-600">Check-ins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-orange-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">8</p>
            <p className="text-xs text-gray-600">Check-outs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-lg font-bold text-gray-900">28</p>
            <p className="text-xs text-gray-600">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="h-6 w-6 bg-red-500 rounded mx-auto mb-2"></div>
            <p className="text-lg font-bold text-gray-900">7</p>
            <p className="text-xs text-gray-600">Requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by guest name, room number, or booking ID..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                All Bookings
              </Button>
              <Button variant="outline" size="sm">VIP Only</Button>
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">This Week</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Bookings List */}
      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    {booking.guest.vip && (
                      <div className="bg-yellow-100 text-yellow-800 p-2 rounded-full">
                        <Star className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{booking.guest.name}</h3>
                      <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge className={getPaymentColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{booking.amount}</p>
                      <p className="text-sm text-gray-500">{booking.dates.nights} nights</p>
                    </div>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Guest Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{booking.guest.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{booking.guest.phone}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Preferences:</p>
                        <div className="flex flex-wrap gap-1">
                          {booking.guest.preferences.map((pref, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {pref}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Room</p>
                        <p className="font-medium">{booking.room.number} - {booking.room.type}</p>
                        <p className="text-xs text-gray-500">{booking.room.floor} Floor</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Source</p>
                        <p className="font-medium">{booking.source}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Check-in</p>
                        <p className="font-medium">{booking.dates.checkin}</p>
                        <p className="text-xs text-gray-500">{booking.dates.checkinTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Check-out</p>
                        <p className="font-medium">{booking.dates.checkout}</p>
                        <p className="text-xs text-gray-500">{booking.dates.checkoutTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                {booking.specialRequests.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Special Requests</h4>
                    <div className="flex flex-wrap gap-2">
                      {booking.specialRequests.map((request, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full border border-blue-200">
                          {request}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button size="sm" variant="outline">View Full Profile</Button>
                  <Button size="sm" variant="outline">Message Guest</Button>
                  <Button size="sm" variant="outline">Room Service</Button>
                  <Button size="sm" variant="outline">Add Notes</Button>
                  <Button size="sm">Manage Booking</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};