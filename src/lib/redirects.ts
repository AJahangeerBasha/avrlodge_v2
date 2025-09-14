import { NavigateFunction } from 'react-router-dom';
import { UserRole, ROLES } from './types/auth';

/**
 * Redirects authenticated users to their appropriate dashboard based on role
 * @param userRole - The user's role
 * @param navigate - React Router navigate function
 * @param replace - Whether to replace the current history entry
 */
export const redirectByRole = (
  userRole: UserRole, 
  navigate: NavigateFunction, 
  replace: boolean = true
): void => {
  switch (userRole) {
    case ROLES.ADMIN:
      navigate('/admin', { replace });
      break;
    case ROLES.MANAGER:
      navigate('/manager', { replace });
      break;
    case ROLES.GUEST:
    default:
      navigate('/', { replace });
      break;
  }
};

/**
 * Gets the default dashboard route for a user role
 * @param userRole - The user's role
 * @returns The default dashboard route path
 */
export const getDashboardRoute = (userRole: UserRole): string => {
  switch (userRole) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.MANAGER:
      return '/manager';
    case ROLES.GUEST:
    default:
      return '/';
  }
};