import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Settings,
  BarChart3,
  UserPlus,
  Calendar,
  BedDouble,
  TrendingUp,
  Clock,
  CheckCircle,
  Home,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/lib/types/auth';

interface SharedDashboardProps {
  role: 'admin' | 'manager'
}

export const SharedDashboard: React.FC<SharedDashboardProps> = ({ role }) => {
  const { currentUser, userRole } = useAuth();

  // Define stats based on role
  const getStatsForRole = () => {
    if (role === 'admin') {
      return [
        { icon: Users, label: 'Total Users', value: '156', color: 'text-black' },
        { icon: Home, label: 'Room Types', value: '8', color: 'text-black' },
        { icon: BedDouble, label: 'Total Rooms', value: '45', color: 'text-black' },
        { icon: DollarSign, label: 'Revenue', value: '₹2.4L', color: 'text-black' }
      ]
    } else {
      return [
        { icon: Calendar, label: "Today's Bookings", value: '12', color: 'text-black' },
        { icon: Users, label: 'Active Guests', value: '28', color: 'text-black' },
        { icon: BedDouble, label: 'Occupied Rooms', value: '18', color: 'text-black' },
        { icon: CheckCircle, label: 'Check-outs', value: '5', color: 'text-black' }
      ]
    }
  }

  // Get quick actions based on role
  const getQuickActionsForRole = () => {
    const basePath = role === 'admin' ? '/admin' : '/manager'

    if (role === 'admin') {
      return [
        { label: 'New Reservation', href: `${basePath}/reservation`, icon: UserPlus, variant: 'default' as const },
        { label: 'View Calendar', href: `${basePath}/calendar`, icon: Calendar, variant: 'outline' as const },
        { label: 'Manage Rooms', href: `${basePath}/rooms`, icon: Settings, variant: 'outline' as const },
        { label: 'Analytics', href: `${basePath}/analytics`, icon: BarChart3, variant: 'outline' as const }
      ]
    } else {
      return [
        { label: 'New Reservation', href: `${basePath}/reservation`, icon: UserPlus, variant: 'default' as const },
        { label: 'View Calendar', href: `${basePath}/calendar`, icon: Calendar, variant: 'outline' as const },
        { label: 'Check Bookings', href: `${basePath}/bookings`, icon: Users, variant: 'outline' as const },
        { label: 'Today\'s Tasks', href: `${basePath}/tasks`, icon: Clock, variant: 'outline' as const }
      ]
    }
  }

  const stats = getStatsForRole()
  const quickActions = getQuickActionsForRole()

  return (
    <div className="container-responsive bg-white min-h-screen gap-responsive p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-responsive-3xl font-serif font-bold text-black">
          {role === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
        </h2>
        <p className="text-responsive-base text-gray-600">
          Welcome back, {currentUser?.displayName || currentUser?.email}!
          {userRole === ROLES.ADMIN && role === 'manager' && (
            <span className="ml-2 text-sm bg-black text-white px-2 py-1 rounded-full">
              Admin Access
            </span>
          )}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid-responsive-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="card-responsive hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-black">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    variant={action.variant}
                    className="w-full h-auto flex flex-col items-center p-4 space-y-2"
                    onClick={() => window.location.href = action.href}
                  >
                    <action.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity (if admin) */}
      {role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="card-responsive">
            <CardHeader>
              <CardTitle className="text-black">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserPlus className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">New reservation created</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Room settings updated</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Overview (if manager) */}
      {role === 'manager' && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Check-ins</span>
                    <span className="text-lg font-bold text-blue-600">8</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Check-outs</span>
                    <span className="text-lg font-bold text-green-600">5</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium">Maintenance</span>
                    <span className="text-lg font-bold text-orange-600">2</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-responsive">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Occupancy Rate</span>
                    <span className="text-lg font-bold text-black">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Revenue Today</span>
                    <span className="text-lg font-bold text-black">₹45,200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Guest Satisfaction</span>
                    <span className="text-lg font-bold text-black">4.8/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
};