import { createContext, useContext, createSignal, onMount, onCleanup } from 'solid-js'
import type { ParentComponent, Accessor } from 'solid-js'
import type { Session, User, AuthChangeEvent } from '@supabase/supabase-js'
import { supabase } from './supabase'
import * as authService from '../services/auth.service'

type AuthContextType = {
  user: Accessor<User | null>
  session: Accessor<Session | null>
  loading: Accessor<boolean>
  authEvent: Accessor<AuthChangeEvent | null>
  isEmailVerified: () => boolean
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

  onMount(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthEvent(event)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    onCleanup(() => subscription.unsubscribe())
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
