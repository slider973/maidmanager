import { createContext, useContext, createSignal, onMount, onCleanup } from 'solid-js'
import type { ParentComponent, Accessor } from 'solid-js'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from './supabase'
import * as authService from '../services/auth.service'
import * as sessionService from '../services/session.service'

type AuthContextType = {
  user: Accessor<User | null>
  session: Accessor<Session | null>
  loading: Accessor<boolean>
  authEvent: Accessor<AuthChangeEvent | null>
  isEmailVerified: () => boolean
  isStaff: Accessor<boolean>
  staffMemberId: Accessor<string | null>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsVerification?: boolean }>
  signOut: (scope?: 'local' | 'global' | 'others') => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  resendVerification: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType>()

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<User | null>(null)
  const [session, setSession] = createSignal<Session | null>(null)
  const [loading, setLoading] = createSignal(true)
  const [authEvent, setAuthEvent] = createSignal<AuthChangeEvent | null>(null)
  const [staffMemberId, setStaffMemberId] = createSignal<string | null>(null)

  // Derived signal: user is staff if they have a linked staff account
  const isStaff = () => staffMemberId() !== null

  // Load profile to check for staff account link
  const loadStaffAccountId = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('staff_account_id')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Failed to load profile:', error)
        setStaffMemberId(null)
        return
      }

      setStaffMemberId(data?.staff_account_id ?? null)
    } catch (err) {
      console.error('Failed to load staff account:', err)
      setStaffMemberId(null)
    }
  }

  onMount(async () => {
    try {
      // Get initial session immediately
      const { data: { session: initialSession }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Failed to get session:', error)
      }

      setSession(initialSession)
      setUser(initialSession?.user ?? null)

      // Load staff account info if user is logged in
      if (initialSession?.user) {
        await loadStaffAccountId(initialSession.user.id)
      }
    } catch (err) {
      console.error('Auth initialization error:', err)
    } finally {
      // Always set loading to false, even on error
      setLoading(false)
    }

    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip INITIAL_SESSION since we already handled it above
      if (event === 'INITIAL_SESSION') return

      setAuthEvent(event)
      setSession(session)
      setUser(session?.user ?? null)

      // Handle sign in/out events
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await sessionService.createSession(session.user.id)
          // Load staff account info on sign in
          await loadStaffAccountId(session.user.id)
        } catch (err) {
          console.error('Failed to create session record:', err)
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear staff account info on sign out
        setStaffMemberId(null)
      }
    })

    onCleanup(() => {
      subscription.unsubscribe()
    })
  })

  const isEmailVerified = () => {
    return authService.isEmailVerified(user())
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    return { error: result.error }
  }

  const signUp = async (email: string, password: string) => {
    const result = await authService.signUp(email, password)
    return {
      error: result.error,
      needsVerification: result.data?.needsVerification
    }
  }

  const signOut = async (scope: 'local' | 'global' | 'others' = 'local') => {
    const result = await authService.signOut(scope)
    return { error: result.error }
  }

  const resetPassword = async (email: string) => {
    const result = await authService.resetPasswordForEmail(email)
    return { error: result.error }
  }

  const updatePassword = async (newPassword: string) => {
    const result = await authService.updatePassword(newPassword)
    return { error: result.error }
  }

  const resendVerification = async (email: string) => {
    const result = await authService.resendVerificationEmail(email)
    return { error: result.error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      authEvent,
      isEmailVerified,
      isStaff,
      staffMemberId,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      resendVerification
    }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
