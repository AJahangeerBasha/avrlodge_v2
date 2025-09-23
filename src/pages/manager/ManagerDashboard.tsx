import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const ManagerDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Manager Dashboard"
      subtitle="Resort operations overview and daily metrics"
    />
  )
}

export { ManagerDashboard };
export default ManagerDashboard;