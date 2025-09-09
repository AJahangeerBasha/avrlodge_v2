import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, hasPermission } from '../../lib/types/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL specified roles
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  requiredRole,
  requiredRoles,
  fallback = null,
  requireAll = false,
}) => {
  const { userRole } = useAuth();

  if (!userRole) {
    return <>{fallback}</>;
  }

  // Check single required role
  if (requiredRole) {
    if (!hasPermission(userRole, requiredRole)) {
      return <>{fallback}</>;
    }
  }

  // Check multiple required roles
  if (requiredRoles && requiredRoles.length > 0) {
    if (requireAll) {
      // User must have ALL specified roles (or higher)
      const hasAllRoles = requiredRoles.every(role => hasPermission(userRole, role));
      if (!hasAllRoles) {
        return <>{fallback}</>;
      }
    } else {
      // User must have at least ONE of the specified roles
      const hasAnyRole = requiredRoles.some(role => 
        hasPermission(userRole, role) || userRole === role
      );
      if (!hasAnyRole) {
        return <>{fallback}</>;
      }
    }
  }

  return <>{children}</>;
};