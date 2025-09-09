import { RealDataDashboard } from '@/components/dashboard/RealDataDashboard'

interface DashboardPageProps {
  role?: 'admin' | 'manager'
}

export default function DashboardPage({ role = 'admin' }: DashboardPageProps) {
  return <RealDataDashboard role={role} />
}