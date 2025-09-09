import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const AdminCalendar: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Calendar Management</h2>
          <p className="text-gray-600 mt-2">
            Manage bookings, availability, and scheduling across all properties.
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </Button>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">December 2025</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">Month</Button>
              <Button variant="outline" size="sm">Week</Button>
              <Button variant="outline" size="sm">Day</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid Placeholder */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2 text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6; // Start from previous month days
              const isCurrentMonth = day > 0 && day <= 31;
              const hasBooking = Math.random() > 0.7; // Random bookings for demo
              
              return (
                <div
                  key={i}
                  className={`
                    min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                    ${isCurrentMonth 
                      ? 'bg-white hover:bg-gray-50 border-gray-200' 
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                    }
                    ${hasBooking && isCurrentMonth ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                >
                  <div className="font-medium text-sm">
                    {isCurrentMonth ? day : ''}
                  </div>
                  {hasBooking && isCurrentMonth && (
                    <div className="mt-1">
                      <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Booking
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Today's Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div>
                <p className="font-medium">Check-in: Room 101</p>
                <p className="text-sm text-gray-600">John Doe - 2:00 PM</p>
              </div>
              <Button size="sm" variant="outline">View</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div>
                <p className="font-medium">Check-out: Room 205</p>
                <p className="text-sm text-gray-600">Jane Smith - 11:00 AM</p>
              </div>
              <Button size="sm" variant="outline">Process</Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-medium">Maintenance: Room 303</p>
                <p className="text-sm text-gray-600">AC Repair - 3:00 PM</p>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};