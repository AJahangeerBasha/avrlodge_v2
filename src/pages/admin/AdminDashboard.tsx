import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export const AdminDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Resort management analytics and real-time metrics"
    />
  )
}