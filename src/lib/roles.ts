import { User } from 'firebase/auth';
import { UserRole, UserClaims, ROLES } from './types/auth';
import { createUserDocument } from './auth';
import { getDocument, updateDocument, subscribeToDocument } from './firestore';

// Set user role (Admin only - verify permissions in UI)
export const setUserRole = async (uid: string, role: UserRole, currentUserRole: UserRole): Promise<void> => {
  // Check if current user has permission to set roles
  if (currentUserRole !== ROLES.ADMIN) {
    throw new Error('Only admin users can set roles');
  }

  try {
    // Update the user document in Firestore
    await updateDocument('users', uid, {
      role,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Role ${role} set for user ${uid} in Firestore`);
  } catch (error) {
    console.error('Error setting user role:', error);
    throw error;
  }
};

// Get user role from Firestore
export const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const userDoc = await getDocument('users', uid);
    return userDoc?.role || ROLES.GUEST;
  } catch (error) {
    console.error('Error getting user role:', error);
    return ROLES.GUEST;
  }
};

// Get user role and create claims object
export const getUserRoleAndClaims = async (user: User): Promise<{ role: UserRole; claims: UserClaims }> => {
  try {
    // Get role from Firestore
    const role = await getUserRole(user.uid);
    
    // Create claims based on role
    const claims: UserClaims = {
      role,
      admin: role === ROLES.ADMIN,
      manager: role === ROLES.MANAGER || role === ROLES.ADMIN,
      guest: true, // All users are guests by default
    };
    
    return { role, claims };
  } catch (error) {
    console.error('Error getting user role and claims:', error);
    return {
      role: ROLES.GUEST,
      claims: {
        role: ROLES.GUEST,
        guest: true,
      },
    };
  }
};

// Subscribe to user role changes in real-time
export const subscribeToUserRole = (
  uid: string, 
  callback: (role: UserRole) => void
): (() => void) => {
  return subscribeToDocument('users', uid, (userData) => {
    const role = userData?.role || ROLES.GUEST;
    callback(role);
  });
};

// Initialize user with default role
export const initializeUserRole = async (user: User): Promise<void> => {
  try {
    // Check if user document already exists
    const existingUser = await getDocument('users', user.uid);
    
    if (!existingUser) {
      // Create user document with default guest role
      await createUserDocument(user, { role: ROLES.GUEST });
    }
  } catch (error) {
    console.error('Error initializing user role:', error);
  }
};

// Role-based access control helpers
export const canAccessAdminPanel = (role: UserRole): boolean => {
  return role === ROLES.ADMIN;
};

export const canManageBookings = (role: UserRole): boolean => {
  return role === ROLES.MANAGER || role === ROLES.ADMIN;
};

export const canViewDashboard = (role: UserRole): boolean => {
  return role === ROLES.MANAGER || role === ROLES.ADMIN;
};

export const canEditProfile = (role: UserRole, targetUserId: string, currentUserId: string): boolean => {
  // Users can edit their own profile, managers and admins can edit others
  return targetUserId === currentUserId || role === ROLES.MANAGER || role === ROLES.ADMIN;
};