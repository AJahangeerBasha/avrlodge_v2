import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RootLayout } from '../layouts/RootLayout'
import { HomeLayout } from '../layouts/HomeLayout'
import { RouteLoader } from '../components/ui/page-loader'

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('../pages/Home').then(module => ({ default: module.HomePage })))

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public routes with home layout */}
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}