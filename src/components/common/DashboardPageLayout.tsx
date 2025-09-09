import { RealDataDashboard } from '@/components/dashboard/RealDataDashboard'

interface DashboardPageLayoutProps {
  role: 'admin' | 'manager'
}

export default function DashboardPageLayout({ role }: DashboardPageLayoutProps) {
  return <RealDataDashboard role={role} />
}