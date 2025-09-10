import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Plus, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react';

export const AdminBookings: React.FC = () => {
  const bookings = [
    { 
      id: 'BK-001', 
      guest: { name: 'John Smith', email: 'john@example.com', phone: '+1 234-567-8900' },
      room: { number: '101', type: 'Deluxe Suite' },
      dates: { checkin: '2025-01-15', checkout: '2025-01-18', nights: 3 },
      status: 'active',
      amount: '$450',
      source: 'Website'
    },
    { 
      id: 'BK-002', 
      guest: { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 234-567-8901' },
      room: { number: '205', type: 'Standard Room' },
      dates: { checkin: '2025-01-16', checkout: '2025-01-20', nights: 4 },
      status: 'checkedin',
      amount: '$320',
      source: 'Phone'
    },
    { 
      id: 'BK-003', 
      guest: { name: 'Mike Davis', email: 'mike@example.com', phone: '+1 234-567-8902' },
      room: { number: '303', type: 'Family Suite' },
      dates: { checkin: '2025-01-18', checkout: '2025-01-22', nights: 4 },
      status: 'confirmed',
      amount: '$600',
      source: 'Booking.com'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-gray-100 text-black';
      case 'checkedin': return 'bg-black text-white';
      case 'active': return 'bg-gray-700 text-white';
      case 'completed': return 'bg-gray-200 text-gray-800';
      case 'cancelled': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 bg-white min-h-screen">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-serif font-bold text-black">Booking Management</h2>
          <p className="text-gray-600 mt-2">
            Comprehensive view and management of all guest bookings.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white transition-all duration-300">
            <Plus className="h-4 w-4" />
            <span>New Booking</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by guest name, booking ID, or room number..."
                    className="pl-10 border-gray-300 focus:border-black focus:ring-black bg-white"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                  <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">23</p>
            <p className="text-sm text-gray-600">Today's Check-ins</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">18</p>
            <p className="text-sm text-gray-600">Today's Check-outs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">56</p>
            <p className="text-sm text-gray-600">Active Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">12</p>
            <p className="text-sm text-gray-600">Pending Confirmations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">89%</p>
            <p className="text-sm text-gray-600">Occupancy Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{booking.guest.name}</h3>
                      <p className="text-sm text-gray-500">Booking ID: {booking.id}</p>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Room {booking.room.number} - {booking.room.type}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{booking.dates.checkin} to {booking.dates.checkout}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{booking.dates.nights} nights</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-4 w-4" />
                      <span>{booking.guest.email}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{booking.guest.phone}</span>
                    </div>
                    <div className="px-2 py-1 bg-gray-100 rounded text-xs">
                      Source: {booking.source}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{booking.amount}</p>
                    <p className="text-sm text-gray-500">Total Amount</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                    <Button size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Showing 1-3 of 156 bookings</p>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};