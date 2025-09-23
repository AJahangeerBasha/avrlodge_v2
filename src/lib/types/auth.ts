export type UserRole = 'guest' | 'agent' | 'manager' | 'admin';

export interface UserClaims {
  role: UserRole;
  admin?: boolean;
  manager?: boolean;
  agent?: boolean;
  guest?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  emailVerified?: boolean;
}

export interface AuthUser extends UserProfile {
  claims: UserClaims;
}

export const ROLES = {
  GUEST: 'guest' as const,
  AGENT: 'agent' as const,
  MANAGER: 'manager' as const,
  ADMIN: 'admin' as const,
} as const;

export const ROLE_HIERARCHY = {
  [ROLES.GUEST]: 1,
  [ROLES.AGENT]: 2,
  [ROLES.MANAGER]: 3,
  [ROLES.ADMIN]: 4,
} as const;

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};