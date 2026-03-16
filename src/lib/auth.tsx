import { createContext, useContext, createSignal, onMount } from 'solid-js'
import type { ParentComponent, Accessor } from 'solid-js'
import * as authService from '../services/auth.service'
import type { AuthUser } from '../services/auth.service'

type AuthContextType = {
  user: Accessor<AuthUser | null>
  loading: Accessor<boolean>
  isEmailVerified: () => boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null; needsVerification?: boolean }>
  signOut: () => Promise<{ error: string | null }>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  resendVerification: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType>()

export const AuthProvider: ParentComponent = (props) => {
  const [user, setUser] = createSignal<AuthUser | null>(null)
  const [loading, setLoading] = createSignal(true)

  onMount(async () => {
    const result = await authService.getUser()
    if (result.data) {
      setUser(result.data)
    }
    setLoading(false)
  })

  const isEmailVerified = () => {
    return authService.isEmailVerified(user())
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (result.data) {
      setUser(result.data.user)
    }
    return { error: result.error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp(email, password, name)
    if (result.data?.user) {
      setUser(result.data.user)
    }
    return {
      error: result.error,
      needsVerification: result.data?.needsVerification
    }
  }

  const signOut = async () => {
    const result = await authService.signOut()
    setUser(null)
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
      loading,
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
