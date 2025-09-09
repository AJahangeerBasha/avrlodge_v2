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

// Manager pages  
const ManagerDashboard = lazy(() => import('../pages/manager/ManagerDashboard').then(module => ({ default: module.ManagerDashboard })))

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
            {/* Add more admin routes here later */}
          </Route>
          
          {/* Manager routes - protected with ManagerLayout */}
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            {/* Add more manager routes here later */}
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
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}