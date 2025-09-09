import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Calendar, Users, BedDouble, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../lib/types/auth';

export const ManagerDashboard: React.FC = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Manager Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Welcome back, {currentUser?.displayName || currentUser?.email}!
          {userRole === ROLES.ADMIN && (
            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Admin Access
            </span>
          )}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BedDouble className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Rooms</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Guests</p>
                <p className="text-2xl font-bold text-gray-900">34</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-gray-900">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              className="flex items-center space-x-2 h-auto p-4"
              onClick={() => window.location.href = '/manager/bookings'}
            >
              <Calendar className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Manage Bookings</div>
                <div className="text-sm opacity-80">View and manage reservations</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4"
              onClick={() => window.location.href = '/manager/guests'}
            >
              <Users className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Guest Management</div>
                <div className="text-sm opacity-80">Manage guest information</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="flex items-center space-x-2 h-auto p-4"
              onClick={() => window.location.href = '/manager/rooms'}
            >
              <BedDouble className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Room Status</div>
                <div className="text-sm opacity-80">Check room availability</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Check-in: Room 101</p>
                <p className="text-xs text-gray-500">John Smith - 10:00 AM</p>
              </div>
              <Button size="sm" variant="outline">
                Complete
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Check-out: Room 205</p>
                <p className="text-xs text-gray-500">Sarah Johnson - 11:00 AM</p>
              </div>
              <Button size="sm" variant="outline">
                Process
              </Button>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Room Maintenance: Room 303</p>
                <p className="text-xs text-gray-500">Scheduled cleaning - 2:00 PM</p>
              </div>
              <Button size="sm" variant="outline">
                Schedule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New booking confirmed - Room 102</p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Guest checked out - Room 201</p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Room cleaning completed - Room 105</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};