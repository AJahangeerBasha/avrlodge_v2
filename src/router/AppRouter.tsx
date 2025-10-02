import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { RootLayout } from '../layouts/RootLayout'
import { HomeLayout } from '../layouts/HomeLayout'
import { UnifiedDashboardLayout } from '../layouts/UnifiedDashboardLayout'
import { RouteLoader } from '../components/ui/page-loader'
import { AuthProvider } from '../contexts/AuthContext'

// Lazy load pages for better code splitting
const HomePage = lazy(() => import('../pages/Home').then(module => ({ default: module.HomePage })))
const LoginPage = lazy(() => import('../pages/auth/Login').then(module => ({ default: module.LoginPage })))
const PhoneLoginPage = lazy(() => import('../pages/auth/PhoneLogin').then(module => ({ default: module.PhoneLoginPage })))
const SignupPage = lazy(() => import('../pages/auth/Signup').then(module => ({ default: module.SignupPage })))
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPassword').then(module => ({ default: module.ForgotPasswordPage })))
const UnauthorizedPage = lazy(() => import('../pages/auth/Unauthorized').then(module => ({ default: module.UnauthorizedPage })))

// Admin pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminCalendar = lazy(() => import('../pages/admin/AdminCalendar'))
const AdminReservation = lazy(() => import('../pages/admin/AdminReservation'))
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings'))
const AdminRoomTypes = lazy(() => import('../pages/admin/AdminRoomTypes'))
const AdminRooms = lazy(() => import('../pages/admin/AdminRooms'))
const AdminSpecialCharges = lazy(() => import('../pages/admin/AdminSpecialCharges'))
const AdminAgents = lazy(() => import('../pages/admin/AdminAgents'))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'))

// Manager pages
const ManagerDashboard = lazy(() => import('../pages/manager/ManagerDashboard'))
const ManagerCalendar = lazy(() => import('../pages/manager/ManagerCalendar'))
const ManagerReservation = lazy(() => import('../pages/manager/ManagerReservation'))
const ManagerBookings = lazy(() => import('../pages/manager/ManagerBookings'))

// Agent pages
const AgentDashboard = lazy(() => import('../pages/agent/AgentDashboard'))
const AgentCalendar = lazy(() => import('../pages/agent/AgentCalendar'))
const AgentReservation = lazy(() => import('../pages/agent/AgentReservation'))
const AgentBookings = lazy(() => import('../pages/agent/AgentBookings'))

// Public/Shared pages
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'))
const DataDeletionPolicy = lazy(() => import('../pages/DataDeletionPolicy'))
const TermsOfService = lazy(() => import('../pages/TermsOfService'))

function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          {/* Public routes with home layout */}
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="data-deletion-policy" element={<DataDeletionPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
          </Route>

          {/* Auth routes - no layout */}
          <Route path="auth" element={<Navigate to="/auth/login" replace />} />
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/phone-login" element={<PhoneLoginPage />} />
          <Route path="auth/signup" element={<SignupPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Admin routes - protected with UnifiedDashboardLayout */}
          <Route path="admin" element={<UnifiedDashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="reservation" element={<AdminReservation />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="room-types" element={<AdminRoomTypes />} />
            <Route path="rooms" element={<AdminRooms />} />
            <Route path="special-charges" element={<AdminSpecialCharges />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>

          {/* Manager routes - protected with UnifiedDashboardLayout */}
          <Route path="manager" element={<UnifiedDashboardLayout role="manager" />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="calendar" element={<ManagerCalendar />} />
            <Route path="reservation" element={<ManagerReservation />} />
            <Route path="bookings" element={<ManagerBookings />} />
          </Route>

          {/* Agent routes - protected with UnifiedDashboardLayout */}
          <Route path="agent" element={<UnifiedDashboardLayout role="agent" />}>
            <Route index element={<AgentDashboard />} />
            <Route path="calendar" element={<AgentCalendar />} />
            <Route path="reservation" element={<AgentReservation />} />
            <Route path="bookings" element={<AgentBookings />} />
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
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}