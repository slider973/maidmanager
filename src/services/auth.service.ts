/**
 * Authentication Service
 * Provides auth operations against Laravel Sanctum API
 */

import { api, ApiError } from '../lib/api'
import { validatePassword, validateEmail } from '../lib/utils/errorMessages'

export interface AuthUser {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthResult<T = void> {
  data?: T
  error: string | null
}

export interface SignUpResult {
  user: AuthUser | null
  needsVerification: boolean
}

interface AuthResponse {
  user: AuthUser
  token: string
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.errors) {
      const firstError = Object.values(err.errors)[0]
      if (firstError?.[0]) return translateValidationError(firstError[0])
    }
    return err.message
  }
  if (err instanceof Error && err.message === 'Failed to fetch') {
    return 'Erreur de connexion, veuillez réessayer'
  }
  return 'Une erreur est survenue'
}

function translateValidationError(message: string): string {
  const translations: Record<string, string> = {
    'The email has already been taken.': 'Cet email est déjà utilisé',
    'The email field must be a valid email address.': "Format d'email invalide",
    'The password field must be at least 8 characters.': 'Le mot de passe doit contenir au moins 8 caractères',
    'The password field confirmation does not match.': 'Les mots de passe ne correspondent pas',
    'The name field is required.': 'Le nom est requis',
  }
  return translations[message] || message
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  name?: string
): Promise<AuthResult<SignUpResult>> {
  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  const passwordError = validatePassword(password)
  if (passwordError) return { error: passwordError }

  try {
    const data = await api.post<AuthResponse>('/register', {
      name: name || email.split('@')[0],
      email,
      password,
      password_confirmation: password,
    })

    localStorage.setItem('auth_token', data.token)

    return {
      data: {
        user: data.user,
        needsVerification: false,
      },
      error: null,
    }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult<{ user: AuthUser }>> {
  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  if (!password) return { error: 'Veuillez entrer votre mot de passe' }

  try {
    const data = await api.post<AuthResponse>('/login', { email, password })

    localStorage.setItem('auth_token', data.token)

    return {
      data: { user: data.user },
      error: null,
    }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  try {
    await api.post('/logout')
  } catch {
    // Ignore errors on logout
  }

  localStorage.removeItem('auth_token')
  return { error: null }
}

/**
 * Get current authenticated user
 */
export async function getUser(): Promise<AuthResult<AuthUser | null>> {
  const token = localStorage.getItem('auth_token')
  if (!token) return { data: null, error: null }

  try {
    const user = await api.get<AuthUser>('/user')
    return { data: user, error: null }
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      localStorage.removeItem('auth_token')
      return { data: null, error: null }
    }
    return { error: handleError(err) }
  }
}

/**
 * Check if current user's email is verified
 */
export function isEmailVerified(user: AuthUser | null): boolean {
  return user?.email_verified_at !== null && user?.email_verified_at !== undefined
}

/**
 * Verify email using token
 */
export async function verifyEmail(
  tokenHash: string,
  _type: 'email' | 'signup' = 'signup'
): Promise<AuthResult<{ user: AuthUser }>> {
  try {
    const data = await api.post<{ user: AuthUser }>('/verify-email', { token: tokenHash })
    return { data, error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Request a password reset email (placeholder - needs backend route)
 */
export async function resetPasswordForEmail(email: string): Promise<AuthResult> {
  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  try {
    await api.post('/forgot-password', { email })
    return { error: null }
  } catch {
    // Always return success to prevent email enumeration
    return { error: null }
  }
}

/**
 * Update the user's password (placeholder - needs backend route)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const passwordError = validatePassword(newPassword)
  if (passwordError) return { error: passwordError }

  try {
    await api.put('/user/password', { password: newPassword, password_confirmation: newPassword })
    return { error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Resend verification email (placeholder - needs backend route)
 */
export async function resendVerificationEmail(email: string): Promise<AuthResult> {
  const emailError = validateEmail(email)
  if (emailError) return { error: emailError }

  try {
    await api.post('/email/verification-notification', { email })
    return { error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}
