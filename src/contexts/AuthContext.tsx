import * as React from 'react';
const { createContext, useContext, useEffect, useState } = React;
import { User } from 'firebase/auth';
import { onAuthStateChange, signOutUser, signInUser, createUser, signInWithGoogle, resetPassword, createUserDocument, updateUserProfile } from '@/lib/auth';
import { UserRole, UserClaims, ROLES } from '@/lib/types/auth';
import { getUserRoleAndClaims, initializeUserRole, subscribeToUserRole } from '@/lib/roles';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  userClaims: UserClaims | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userClaims, setUserClaims] = useState<UserClaims | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string): Promise<void> => {
    await signInUser(email, password);
  };

  const signup = async (email: string, password: string, displayName?: string): Promise<void> => {
    const userCredential = await createUser(email, password);
    if (displayName && userCredential.user) {
      await updateUserProfile(userCredential.user, { displayName });
      await createUserDocument(userCredential.user, { displayName });
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    await signInWithGoogle();
  };

  const logout = async (): Promise<void> => {
    await signOutUser();
    setCurrentUser(null);
    setUserRole(null);
    setUserClaims(null);
  };

  const refreshUserRole = async (): Promise<void> => {
    if (currentUser) {
      try {
        const { role, claims } = await getUserRoleAndClaims(currentUser);
        setUserRole(role);
        setUserClaims(claims);
      } catch (error) {
        console.error('Error refreshing user role:', error);
        setUserRole(ROLES.GUEST);
        setUserClaims({ role: ROLES.GUEST, guest: true });
      }
    }
  };

  useEffect(() => {
    let roleUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChange(async (user) => {
      setCurrentUser(user);

      // Clean up previous role subscription
      if (roleUnsubscribe) {
        roleUnsubscribe();
        roleUnsubscribe = null;
      }

      if (user) {
        try {
          // Initialize user role if needed
          await initializeUserRole(user);

          // Get initial user role and claims
          const { role, claims } = await getUserRoleAndClaims(user);
          setUserRole(role);
          setUserClaims(claims);

          // Subscribe to real-time role updates
          roleUnsubscribe = subscribeToUserRole(user.uid, (newRole) => {
            setUserRole(newRole);
            setUserClaims({
              role: newRole,
              admin: newRole === ROLES.ADMIN,
              manager: newRole === ROLES.MANAGER || newRole === ROLES.ADMIN,
              guest: true,
            });
          });
        } catch (error) {
          console.error('Error setting up user role:', error);
          setUserRole(ROLES.GUEST);
          setUserClaims({ role: ROLES.GUEST, guest: true });
        }
      } else {
        setUserRole(null);
        setUserClaims(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (roleUnsubscribe) {
        roleUnsubscribe();
      }
    };
  }, []);

  const value: AuthContextType = {
    currentUser,
    userRole,
    userClaims,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};