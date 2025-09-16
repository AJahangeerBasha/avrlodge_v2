import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RootLayout } from '../layouts/RootLayout'
import { HomeLayout } from '../layouts/HomeLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { ManagerLayout } from '../layouts/ManagerLayout'
import { RouteLoader } from '../components/ui/page-loader'
import { AuthProvider } from '../contexts/AuthContext'

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('../pages/Home').then(module => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('../pages/auth/Login').then(module => ({ default: module.LoginPage })))
const SignupPage = lazy(() => import('../pages/auth/Signup').then(module => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPasswordPage })))
const UnauthorizedPage = lazy(() => import('../pages/auth/Unauthorized').then(module => ({ default: module.UnauthorizedPage })))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })))
const AdminCalendar = lazy(() => import('../pages/admin/AdminCalendar').then(module => ({ default: module.AdminCalendar })))
const AdminReservation = lazy(() => import('../pages/admin/AdminReservation').then(module => ({ default: module.AdminReservation })))
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings').then(module => ({ default: module.AdminBookings })))
const AdminRoomTypes = lazy(() => import('../pages/admin/AdminRoomTypes').then(module => ({ default: module.AdminRoomTypes })))
const AdminRooms = lazy(() => import('../pages/admin/AdminRooms').then(module => ({ default: module.AdminRooms })))
const AdminSpecialCharges = lazy(() => import('../pages/admin/AdminSpecialCharges').then(module => ({ default: module.AdminSpecialCharges })))
const AdminAgents = lazy(() => import('../pages/admin/AdminAgents').then(module => ({ default: module.AdminAgents })))

// Manager pages  
const ManagerDashboard = lazy(() => import('../pages/manager/ManagerDashboard').then(module => ({ default: module.ManagerDashboard })))
const ManagerCalendar = lazy(() => import('../pages/manager/ManagerCalendar').then(module => ({ default: module.ManagerCalendar })))
const ManagerReservation = lazy(() => import('../pages/manager/ManagerReservation').then(module => ({ default: module.ManagerReservation })))
const ManagerBookings = lazy(() => import('../pages/manager/ManagerBookings').then(module => ({ default: module.ManagerBookings })))

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public routes with home layout */}
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* Auth routes - no layout */}
          <Route path="auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/signup" element={<SignupPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin routes - protected with AdminLayout */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="reservation" element={<AdminReservation />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="room-types" element={<AdminRoomTypes />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="special-charges" element={<AdminSpecialCharges />} />
            <Route path="agents" element={<AdminAgents />} />
          </Route>

          {/* Manager routes - protected with ManagerLayout */}
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="calendar" element={<ManagerCalendar />} />
            <Route path="reservation" element={<ManagerReservation />} />
            <Route path="bookings" element={<ManagerBookings />} />
          </Route>

          {/* Error pages */}
          <Route path="unauthorized" element={<UnauthorizedPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}