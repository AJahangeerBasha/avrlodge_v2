import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Search, Filter, Plus, Eye, Edit, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export const ManagerReservation: React.FC = () => {
  const reservations = [
    { 
      id: 'RSV-001', 
      guest: 'John Smith', 
      room: '101', 
      checkin: '2025-01-15', 
      checkout: '2025-01-18', 
      status: 'confirmed', 
      amount: '$450',
      priority: 'normal',
      notes: 'Early check-in requested'
    },
    { 
      id: 'RSV-002', 
      guest: 'Sarah Johnson', 
      room: '205', 
      checkin: '2025-01-16', 
      checkout: '2025-01-20', 
      status: 'pending', 
      amount: '$680',
      priority: 'high',
      notes: 'Corporate booking - group discount applied'
    },
    { 
      id: 'RSV-003', 
      guest: 'Mike Davis', 
      room: '303', 
      checkin: '2025-01-18', 
      checkout: '2025-01-22', 
      status: 'checkedin', 
      amount: '$720',
      priority: 'normal',
      notes: 'Anniversary celebration - complimentary upgrade'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checkedin': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservation Management</h2>
          <p className="text-gray-600 mt-2">
            Handle daily reservations and guest requests efficiently.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Walk-in Booking</span>
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">8</p>
            <p className="text-sm text-gray-600">Today's Check-ins</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">6</p>
            <p className="text-sm text-gray-600">Today's Check-outs</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-lg font-semibold text-gray-900">3</p>
            <p className="text-sm text-gray-600">Pending Confirmations</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">VIP</span>
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">2</p>
            <p className="text-sm text-gray-600">VIP Arrivals</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reservations by guest name or room..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Today's Arrivals
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getPriorityIcon(reservation.priority)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{reservation.guest}</h3>
                        <p className="text-sm text-gray-500">{reservation.id}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Room</p>
                      <p className="text-sm text-gray-600">#{reservation.room}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Check-in</p>
                      <p className="text-sm text-gray-600">{reservation.checkin}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Check-out</p>
                      <p className="text-sm text-gray-600">{reservation.checkout}</p>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                      <p className="text-sm font-medium text-blue-800 mb-1">Notes:</p>
                      <p className="text-sm text-blue-700">{reservation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">{reservation.amount}</p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Action Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-sm">Bulk Check-in</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Clock className="h-6 w-6" />
              <span className="text-sm">Late Check-out</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-sm">Special Requests</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Plus className="h-6 w-6" />
              <span className="text-sm">Room Upgrade</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};