import React from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

const AgentDashboard: React.FC = () => {
  return (
    <DashboardLayout
      title="Agent Dashboard"
      subtitle="Booking operations overview and client management metrics"
    />
  )
}

export { AgentDashboard };
export default AgentDashboard;