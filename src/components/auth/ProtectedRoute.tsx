import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, hasPermission } from '../../lib/types/auth';
import LoadingSpinner from '../ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = '/auth/login',
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requiredRole && userRole) {
    if (!hasPermission(userRole, requiredRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (requiredRoles && requiredRoles.length > 0 && userRole) {
    const hasRequiredRole = requiredRoles.some(role => 
      hasPermission(userRole, role) || userRole === role
    );
    
    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};