/**
 * Authentication Service
 * Provides auth operations with French error translation and session helpers
 */

import { supabase } from '../lib/supabase'
import { translateError, validatePassword, validateEmail } from '../lib/utils/errorMessages'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthResult<T = void> {
  data?: T
  error: string | null
}

export interface SignUpResult {
  user: User | null
  session: Session | null
  needsVerification: boolean
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult<SignUpResult>> {
  // Client-side validation
  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError }
  }

  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/verify`,
    },
  })

  if (error) {
    return { error: translateError(error) }
  }

  return {
    data: {
      user: data.user,
      session: data.session,
      needsVerification: data.session === null,
    },
    error: null,
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ user: User; session: Session }>> {
  // Client-side validation
  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError }
  }

  if (!password) {
    return { error: 'Veuillez entrer votre mot de passe' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: translateError(error) }
  }

  return {
    data: { user: data.user, session: data.session },
    error: null,
  }
}

/**
 * Sign out the current user
 */
export async function signOut(scope: 'local' | 'global' | 'others' = 'local'): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut({ scope })

  if (error) {
    return { error: translateError(error) }
  }

  return { error: null }
}

/**
 * Request a password reset email
 */
export async function resetPasswordForEmail(email: string): Promise<AuthResult> {
  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  // Always return success to prevent email enumeration
  if (error) {
    console.error('Password reset error:', error)
  }

  return { error: null }
}

/**
 * Update the user's password
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const passwordError = validatePassword(newPassword)
  if (passwordError) {
    return { error: passwordError }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: translateError(error) }
  }

  return { error: null }
}

/**
 * Verify email using OTP token hash
 */
export async function verifyEmail(
  tokenHash: string,
  type: 'email' | 'signup' = 'signup'
): Promise<AuthResult<{ user: User; session: Session }>> {
  const { data, error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  })

  if (error) {
    return { error: translateError(error) }
  }

  return {
    data: { user: data.user!, session: data.session! },
    error: null,
  }
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  const emailError = validateEmail(email)
  if (emailError) {
    return { error: emailError }
  }

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/verify`,
    },
  })

  if (error) {
    return { error: translateError(error) }
  }

  return { error: null }
}

/**
 * Get current session
 */
export async function getSession(): Promise<AuthResult<Session | null>> {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    return { error: translateError(error) }
  }

  return { data: data.session, error: null }
}

/**
 * Get current user (validates with server)
 */
export async function getUser(): Promise<AuthResult<User | null>> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return { error: translateError(error) }
  }

  return { data: data.user, error: null }
}

/**
 * Check if current user's email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
