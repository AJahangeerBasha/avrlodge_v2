import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Settings, BarChart3, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="container-responsive bg-white min-h-screen gap-responsive">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-responsive-3xl font-serif font-bold text-black">Admin Dashboard</h2>
        <p className="text-responsive-base text-gray-600">
          Welcome back, {currentUser?.displayName || currentUser?.email}!
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        className="grid-responsive-4"
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
          <Card className="card-responsive hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-black" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-black">156</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-responsive hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserPlus className="h-8 w-8 text-gray-700" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Managers</p>
                  <p className="text-2xl font-bold text-black">12</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-responsive hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-gray-800" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Bookings</p>
                  <p className="text-2xl font-bold text-black">247</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="card-responsive hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-black" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-black">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-black font-serif">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  className="flex items-center space-x-2 h-auto p-4 bg-black hover:bg-gray-800 text-white transition-all duration-300"
                  onClick={() => window.location.href = '/admin/users'}
                >
                  <Users className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">User Management</div>
                    <div className="text-sm opacity-80">Manage user roles and permissions</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4 border-gray-300 hover:bg-gray-50 text-black transition-all duration-300"
                  onClick={() => window.location.href = '/manager'}
                >
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Manager Panel</div>
                    <div className="text-sm opacity-80">Access manager dashboard</div>
                  </div>
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  variant="outline"
                  className="flex items-center space-x-2 h-auto p-4 border-gray-300 hover:bg-gray-50 text-black transition-all duration-300"
                  onClick={() => window.location.href = '/admin/settings'}
                >
                  <Settings className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">System Settings</div>
                    <div className="text-sm opacity-80">Configure system preferences</div>
                  </div>
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-black font-serif">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <motion.div 
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <div className="h-2 w-2 bg-black rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <div className="h-2 w-2 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">Manager role assigned</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </motion.div>
              <motion.div 
                className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.9 }}
              >
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-black">System backup completed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};