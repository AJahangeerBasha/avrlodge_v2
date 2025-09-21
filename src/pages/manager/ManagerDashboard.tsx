import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

export const ManagerDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Resort operations overview and daily metrics"
    />
  )
}