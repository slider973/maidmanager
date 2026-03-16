import { createContext, useContext, createSignal, onMount } from 'solid-js'
import type { ParentComponent, Accessor } from 'solid-js'
import * as authService from '../services/auth.service'
import type { AuthUser } from '../services/auth.service'
import { api } from './api'

interface UserProfile {
  staff_account_id: string | null
  staff_member_id: string | null
}

type AuthContextType = {
  user: Accessor<AuthUser | null>
  session: Accessor<{ access_token: string } | null>
  loading: Accessor<boolean>
  isStaff: Accessor<boolean>
  staffMemberId: Accessor<string | null>
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
  const [isStaff, setIsStaff] = createSignal(false)
  const [staffMemberId, setStaffMemberId] = createSignal<string | null>(null)

  const session = () => {
    const token = localStorage.getItem('auth_token')
    return token ? { access_token: token } : null
  }

  const fetchUserProfile = async () => {
    try {
      const profile = await api.get<UserProfile>('/user/profile')
      if (profile.staff_account_id) {
        setIsStaff(true)
      }
      if (profile.staff_member_id) {
        setStaffMemberId(profile.staff_member_id)
      }
    } catch {
      // Profile endpoint may not exist or user has no profile — keep defaults
    }
  }

  onMount(async () => {
    const result = await authService.getUser()
    if (result.data) {
      setUser(result.data)
      await fetchUserProfile()
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
      await fetchUserProfile()
    }
    return { error: result.error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const result = await authService.signUp(email, password, name)
    if (result.data?.user) {
      setUser(result.data.user)
      await fetchUserProfile()
    }
    return {
      error: result.error,
      needsVerification: result.data?.needsVerification
    }
  }

  const signOut = async () => {
    const result = await authService.signOut()
    setUser(null)
    setIsStaff(false)
    setStaffMemberId(null)
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
      isStaff,
      staffMemberId,
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
