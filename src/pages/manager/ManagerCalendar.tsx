import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';

export const ManagerCalendar: React.FC = () => {
  return (
    <div className="space-y-6 bg-white min-h-screen">
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h2 className="text-3xl font-serif font-bold text-black">Calendar Overview</h2>
          <p className="text-gray-600 mt-2">
            View and manage daily operations and guest schedules.
          </p>
        </div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white transition-all duration-300">
            <Plus className="h-4 w-4" />
            <span>Quick Booking</span>
          </Button>
        </motion.div>
      </motion.div>

      {/* Today's Overview */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="bg-black text-white shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300">Check-ins Today</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Check-outs Today</p>
                <p className="text-2xl font-bold">6</p>
              </div>
              <Clock className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Occupied Rooms</p>
                <p className="text-2xl font-bold">24/30</p>
              </div>
              <div className="h-8 w-8 bg-purple-300 rounded"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Maintenance Due</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <div className="h-8 w-8 bg-orange-300 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium">January 2025</span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">Week</Button>
              <Button size="sm">Month</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-4 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-medium p-2 text-gray-600">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6;
              const isCurrentMonth = day > 0 && day <= 31;
              const isToday = day === 15; // Mock today as 15th
              const occupancy = Math.random();
              
              return (
                <div
                  key={i}
                  className={`
                    min-h-[100px] p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md
                    ${isCurrentMonth 
                      ? 'bg-white border-gray-200' 
                      : 'bg-gray-50 border-gray-100 text-gray-400'
                    }
                    ${isToday ? 'ring-2 ring-green-500 bg-green-50' : ''}
                  `}
                >
                  <div className={`font-medium text-sm mb-2 ${isToday ? 'text-green-700' : ''}`}>
                    {isCurrentMonth ? day : ''}
                  </div>
                  
                  {isCurrentMonth && (
                    <div className="space-y-1">
                      {occupancy > 0.7 && (
                        <div className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                          High occupancy
                        </div>
                      )}
                      {occupancy > 0.4 && occupancy <= 0.7 && (
                        <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                          Medium occupancy
                        </div>
                      )}
                      {Math.random() > 0.8 && (
                        <div className="bg-blue-100 text-blue-700 text-xs px-1 py-0.5 rounded">
                          Event
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Group Check-in</p>
                  <p className="text-sm text-gray-600">15 guests arriving - Conference booking</p>
                  <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Prepare</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Room Maintenance</p>
                  <p className="text-sm text-gray-600">Scheduled deep cleaning - Rooms 301-305</p>
                  <p className="text-xs text-gray-500">Thursday, 10:00 AM</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Schedule</Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="font-medium">VIP Arrival</p>
                  <p className="text-sm text-gray-600">Special arrangements required - Presidential Suite</p>
                  <p className="text-xs text-gray-500">Friday, 4:00 PM</p>
                </div>
              </div>
              <Button size="sm" variant="outline">Review</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};