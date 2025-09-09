import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

export function RootLayout() {
  return (
    <div className="font-sans antialiased bg-background text-foreground">
      <Outlet />
      <Toaster />
    </div>
  )
}