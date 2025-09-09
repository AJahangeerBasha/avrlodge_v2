import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService, type SignInCredentials, type SignUpData, type AnonymousGuestData } from '@/services/auth.service'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/lib/types'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isAnonymous: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: true,
    isAnonymous: false
  })
  
  const navigate = useNavigate()

  const signIn = async (credentials: SignInCredentials) => {
    const { user } = await AuthService.signIn(credentials)
    if (user) {
      const profile = await AuthService.getUserProfile(user.id)
      setAuthState(prev => ({ ...prev, user, profile, isAnonymous: false }))
      
      // Redirect based on role
      if (profile?.role) {
        const redirectPath = AuthService.getRoleRedirectPath(profile.role)
        navigate(redirectPath)
        console.log('Navigate to:', redirectPath)
      }
    }
  }

  const signUp = async (userData: SignUpData) => {
    await AuthService.signUp(userData)
    // Note: User will need to verify email before being signed in
  }

  const signOut = async () => {
    await AuthService.signOut()
    AuthService.clearAnonymousUser()
    setAuthState({
      user: null,
      profile: null,
      isLoading: false,
      isAnonymous: false
    })
    navigate('/auth')
    console.log('Navigate to auth')
  }

  const createAnonymousSession = async (guestData: AnonymousGuestData) => {
    const { user } = await AuthService.createAnonymousSession(guestData)
    setAuthState(prev => ({
      ...prev,
      user: user as any,
      profile: user as any,
      isAnonymous: true,
      isLoading: false
    }))
    navigate('/dashboard')
    console.log('Navigate to dashboard')
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authState.user?.id || authState.isAnonymous) {
      throw new Error('Cannot update profile for anonymous user')
    }

    const updatedProfile = await AuthService.updateUserProfile(authState.user.id, updates)
    setAuthState(prev => ({
      ...prev,
      profile: updatedProfile
    }))
  }

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email)
  }

  // Initialize auth state
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Check for anonymous user first
        const anonymousUser = AuthService.getAnonymousUser()
        if (anonymousUser) {
          if (mounted) {
            setAuthState({
              user: anonymousUser,
              profile: anonymousUser,
              isLoading: false,
              isAnonymous: true
            })
          }
          return
        }

        // Check for authenticated user
        const user = await AuthService.getCurrentUser()
        if (user && mounted) {
          const profile = await AuthService.getUserProfile(user.id)
          setAuthState({
            user,
            profile,
            isLoading: false,
            isAnonymous: false
          })
        } else if (mounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id)
          setAuthState({
            user: session.user,
            profile,
            isLoading: false,
            isAnonymous: false
          })
        } else if (event === 'SIGNED_OUT') {
          // Check if there's an anonymous user
          const anonymousUser = AuthService.getAnonymousUser()
          if (anonymousUser) {
            setAuthState({
              user: anonymousUser,
              profile: anonymousUser,
              isLoading: false,
              isAnonymous: true
            })
          } else {
            setAuthState({
              user: null,
              profile: null,
              isLoading: false,
              isAnonymous: false
            })
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user: authState.user,
    profile: authState.profile,
    isLoading: authState.isLoading,
    isAnonymous: authState.isAnonymous,
    isAuthenticated: !!(authState.user && !authState.isAnonymous),
    signIn,
    signUp,
    signOut,
    createAnonymousSession,
    updateProfile,
    resetPassword
  }
}