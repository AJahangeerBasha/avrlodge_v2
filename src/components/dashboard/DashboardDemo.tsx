import React from 'react'
import { RealDataDashboard } from './RealDataDashboard'

/**
 * Demo component showing the Hotel Analytics Dashboard with real data
 * 
 * This component demonstrates the complete hotel analytics dashboard that:
 * - Connects directly to your Supabase database
 * - Fetches real reservation, room, and payment data
 * - Transforms database records into comprehensive analytics
 * - Provides real-time insights and visualizations
 * 
 * REAL DATA INTEGRATION:
 * 
 * 1. DATABASE QUERIES:
 * - Reservations with guests, payments, rooms, and special charges
 * - Rooms with types, pricing, and availability status
 * - Payment records with different methods (cash, QR codes)
 * 
 * 2. REAL METRICS CALCULATED:
 * - Actual occupancy rates from checked-in reservations
 * - Real revenue from confirmed bookings and payments
 * - Live room availability and guest counts
 * - Authentic refund and discount data
 * - Current payment method distributions
 * 
 * 3. DYNAMIC FILTERING:
 * - Filter by actual date ranges from your database
 * - Real-time data updates when filters change
 * - Accurate historical and forecasted metrics
 * 
 * 4. LIVE CALCULATIONS:
 * 
 * Occupancy Formulas (using real data):
 * - Present Potential: (Active Bookings / Total Rooms) × 100
 * - Present Confirmed: (Checked-In Reservations / Total Rooms) × 100
 * - Revenue: Sum of actual room tariffs + special charges
 * - Net Revenue: Total Revenue - (Actual Refunds + Discounts + Operating Costs)
 * 
 * 5. ERROR HANDLING:
 * - Graceful fallback if database is unavailable
 * - Real-time error reporting and recovery
 * - Data validation and integrity checks
 * 
 * USAGE IN ADMIN PANEL:
 * Navigate to `/admin/dashboard` to access the live dashboard
 * 
 * The dashboard will automatically:
 * - Load your current hotel data
 * - Calculate real metrics and KPIs
 * - Display interactive charts and visualizations
 * - Update in real-time as you change filters
 */

export function DashboardDemo() {
  return (
    <div className="min-h-screen">
      {/* Demo Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Real Data Hotel Analytics Dashboard</h1>
          <p className="text-gray-300 text-lg mb-4">
            Live insights from your Supabase database with real hotel operations data
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-green-800 px-3 py-1 rounded-full">🔴 Live Database Connection</span>
            <span className="bg-blue-800 px-3 py-1 rounded-full">📊 Real Reservations & Payments</span>
            <span className="bg-purple-800 px-3 py-1 rounded-full">🎨 Dynamic Calculations</span>
            <span className="bg-indigo-800 px-3 py-1 rounded-full">📱 Responsive Design</span>
            <span className="bg-yellow-800 px-3 py-1 rounded-full">⚡ TypeScript Integration</span>
          </div>
          
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Real Data Sources:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <strong>Reservations Table:</strong>
                <ul className="list-disc list-inside mt-1 text-gray-300">
                  <li>Guest details & booking status</li>
                  <li>Check-in/out dates</li>
                  <li>Room assignments</li>
                  <li>Pricing & discounts</li>
                </ul>
              </div>
              <div>
                <strong>Payments Table:</strong>
                <ul className="list-disc list-inside mt-1 text-gray-300">
                  <li>Cash payments</li>
                  <li>QR code transactions</li>
                  <li>Payment methods tracking</li>
                  <li>Revenue calculations</li>
                </ul>
              </div>
              <div>
                <strong>Rooms & Types:</strong>
                <ul className="list-disc list-inside mt-1 text-gray-300">
                  <li>Room availability status</li>
                  <li>Pricing per room type</li>
                  <li>Occupancy calculations</li>
                  <li>Guest capacity data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Real Data Dashboard Component */}
      <RealDataDashboard role="admin" />
      
      {/* Demo Footer */}
      <div className="bg-gray-100 dark:bg-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Real Data Dashboard Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Live</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Database Connection</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">Real</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hotel Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">Dynamic</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Calculations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">Interactive</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Charts & Filters</div>
            </div>
          </div>
          
          <div className="mt-8 text-gray-600 dark:text-gray-400 text-sm">
            <p>Powered by Supabase, Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, and Recharts</p>
            <p className="mt-2">All data is fetched live from your hotel management database with real-time updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardDemo