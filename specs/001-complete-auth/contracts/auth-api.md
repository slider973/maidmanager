# API Contracts: Authentication System

**Feature**: 001-complete-auth
**Date**: 2026-02-05

## Overview

This document defines the API contracts for the authentication system. Since we're using Supabase Auth, most operations use the `@supabase/supabase-js` client library rather than direct REST calls. This document serves as a reference for the expected inputs, outputs, and error handling.

## Authentication Methods

### 1. Sign Up

**Purpose**: Register a new user account

**Client Method**: `supabase.auth.signUp()`

**Request**:
```typescript
interface SignUpRequest {
  email: string        // Valid email format
  password: string     // Minimum 8 characters
  options?: {
    emailRedirectTo?: string  // URL for email verification redirect
    data?: {
      display_name?: string   // Optional user metadata
    }
  }
}
```

**Response**:
```typescript
interface SignUpResponse {
  data: {
    user: User | null
    session: Session | null  // null if email confirmation required
  }
  error: AuthError | null
}

interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  user_metadata: Record<string, any>
}
```

**Error Codes**:
| Code | Message (EN) | Message (FR) | Cause |
|------|--------------|--------------|-------|
| `user_already_exists` | User already registered | Cet email est déjà utilisé | Email in use |
| `weak_password` | Password is too weak | Le mot de passe est trop faible | <8 chars |
| `invalid_email` | Invalid email format | Format d'email invalide | Bad email |

**Example**:
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    emailRedirectTo: `${window.location.origin}/auth/verify`
  }
})

if (error) {
  // Handle error - show French message
} else if (!data.session) {
  // Email confirmation required
  showMessage('Vérifiez votre boîte mail pour confirmer votre compte')
}
```

---

### 2. Sign In

**Purpose**: Authenticate existing user

**Client Method**: `supabase.auth.signInWithPassword()`

**Request**:
```typescript
interface SignInRequest {
  email: string
  password: string
}
```

**Response**:
```typescript
interface SignInResponse {
  data: {
    user: User
    session: Session
    weakPassword?: {
      reasons: string[]
    }
  }
  error: AuthError | null
}

interface Session {
  access_token: string
  refresh_token: string
  expires_at: number      // Unix timestamp
  expires_in: number      // Seconds
  user: User
}
```

**Error Codes**:
| Code | Message (EN) | Message (FR) | Cause |
|------|--------------|--------------|-------|
| `invalid_credentials` | Invalid login credentials | Email ou mot de passe incorrect | Wrong email/password |
| `email_not_confirmed` | Email not confirmed | Veuillez confirmer votre email | Unverified account |

**Example**:
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
})

if (error) {
  if (error.message.includes('Email not confirmed')) {
    showError('Veuillez confirmer votre email avant de vous connecter')
  } else {
    showError('Email ou mot de passe incorrect')
  }
}
```

---

### 3. Sign Out

**Purpose**: End user session

**Client Method**: `supabase.auth.signOut()`

**Request**:
```typescript
interface SignOutRequest {
  scope?: 'global' | 'local' | 'others'
  // local (default): current session only
  // global: all sessions
  // others: all except current
}
```

**Response**:
```typescript
interface SignOutResponse {
  error: AuthError | null
}
```

**Example**:
```typescript
// Sign out current session
await supabase.auth.signOut()

// Sign out all devices (for security)
await supabase.auth.signOut({ scope: 'global' })

// Sign out other devices only
await supabase.auth.signOut({ scope: 'others' })
```

---

### 4. Password Reset Request

**Purpose**: Send password reset email

**Client Method**: `supabase.auth.resetPasswordForEmail()`

**Request**:
```typescript
interface ResetPasswordRequest {
  email: string
  options?: {
    redirectTo?: string  // Where to redirect after clicking link
  }
}
```

**Response**:
```typescript
interface ResetPasswordResponse {
  data: {}
  error: AuthError | null
}
```

**Security Note**: Always return success even if email doesn't exist (prevents enumeration).

**Example**:
```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`
})

// Always show success message
showMessage('Si un compte existe avec cet email, vous recevrez un lien de réinitialisation')
```

---

### 5. Update Password

**Purpose**: Set new password (after reset or change)

**Client Method**: `supabase.auth.updateUser()`

**Request**:
```typescript
interface UpdatePasswordRequest {
  password: string  // New password, min 8 characters
}
```

**Response**:
```typescript
interface UpdateUserResponse {
  data: {
    user: User
  }
  error: AuthError | null
}
```

**Example**:
```typescript
const { data, error } = await supabase.auth.updateUser({
  password: newPassword
})

if (error) {
  showError('Erreur lors de la mise à jour du mot de passe')
} else {
  showSuccess('Mot de passe mis à jour avec succès')
}
```

---

### 6. Verify OTP / Email

**Purpose**: Verify email or OTP token

**Client Method**: `supabase.auth.verifyOtp()`

**Request**:
```typescript
interface VerifyOtpRequest {
  token_hash: string  // From email link
  type: 'email' | 'recovery' | 'signup'
}
```

**Response**:
```typescript
interface VerifyOtpResponse {
  data: {
    user: User
    session: Session
  }
  error: AuthError | null
}
```

**Example**:
```typescript
// On /auth/verify page
const params = new URLSearchParams(window.location.search)
const tokenHash = params.get('token_hash')
const type = params.get('type') as 'email' | 'signup'

const { error } = await supabase.auth.verifyOtp({
  token_hash: tokenHash,
  type: type
})

if (error) {
  showError('Le lien a expiré ou est invalide')
} else {
  navigate('/') // Redirect to home
}
```

---

### 7. Resend Verification Email

**Purpose**: Resend email verification for unverified users

**Client Method**: `supabase.auth.resend()`

**Request**:
```typescript
interface ResendRequest {
  type: 'signup'
  email: string
  options?: {
    emailRedirectTo?: string
  }
}
```

**Response**:
```typescript
interface ResendResponse {
  data: {
    messageId: string | null
  }
  error: AuthError | null
}
```

**Example**:
```typescript
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: userEmail,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/verify`
  }
})

if (!error) {
  showSuccess('Email de vérification renvoyé')
}
```

---

### 8. Get Session

**Purpose**: Retrieve current session from storage

**Client Method**: `supabase.auth.getSession()`

**Response**:
```typescript
interface GetSessionResponse {
  data: {
    session: Session | null
  }
  error: AuthError | null
}
```

---

### 9. Get User

**Purpose**: Get current authenticated user (validates with server)

**Client Method**: `supabase.auth.getUser()`

**Response**:
```typescript
interface GetUserResponse {
  data: {
    user: User | null
  }
  error: AuthError | null
}
```

**Note**: Use `getUser()` for security-sensitive operations as it validates the JWT with the server.

---

## Auth State Change Events

**Purpose**: React to authentication state changes

**Client Method**: `supabase.auth.onAuthStateChange()`

**Events**:
```typescript
type AuthChangeEvent =
  | 'INITIAL_SESSION'    // First check on app load
  | 'SIGNED_IN'          // User logged in
  | 'SIGNED_OUT'         // User logged out
  | 'TOKEN_REFRESHED'    // JWT refreshed
  | 'USER_UPDATED'       // User data changed
  | 'PASSWORD_RECOVERY'  // Reset flow initiated
```

**Example**:
```typescript
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    switch (event) {
      case 'SIGNED_IN':
        // User logged in - update UI, create session record
        break
      case 'SIGNED_OUT':
        // User logged out - clear state, redirect
        break
      case 'PASSWORD_RECOVERY':
        // Show password reset form
        navigate('/auth/reset-password')
        break
    }
  }
)

// Cleanup
onCleanup(() => subscription.unsubscribe())
```

---

## Custom API: Session Management (P3)

### List User Sessions

**Purpose**: Get all active sessions for current user

**Method**: Supabase client query

**Request**:
```typescript
const { data, error } = await supabase
  .from('user_sessions')
  .select('*')
  .order('last_active_at', { ascending: false })
```

**Response**:
```typescript
interface UserSession {
  id: string
  user_id: string
  device_info: string
  browser: string | null
  os: string | null
  ip_address: string | null
  last_active_at: string
  created_at: string
  is_current: boolean
}
```

### Create Session Record

**Purpose**: Track new login session

**Request**:
```typescript
const { error } = await supabase
  .from('user_sessions')
  .insert({
    user_id: user.id,
    device_info: navigator.userAgent,
    browser: parseBrowser(navigator.userAgent),
    os: parseOS(navigator.userAgent),
    is_current: true
  })
```

### Delete Session

**Purpose**: End a specific session

**Request**:
```typescript
const { error } = await supabase
  .from('user_sessions')
  .delete()
  .eq('id', sessionId)
```

### Delete All Other Sessions

**Purpose**: Sign out from all other devices

**Request**:
```typescript
const { error } = await supabase
  .from('user_sessions')
  .delete()
  .neq('id', currentSessionId)
  .eq('user_id', user.id)

// Also revoke Supabase sessions
await supabase.auth.signOut({ scope: 'others' })
```

---

## Error Handling

### Error Response Structure

```typescript
interface AuthError {
  message: string
  status: number
  code?: string
}
```

### French Error Messages Map

```typescript
const errorMessages: Record<string, string> = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'User already registered': 'Cet email est déjà utilisé',
  'Email not confirmed': 'Veuillez confirmer votre email',
  'Password should be at least 8 characters': 'Le mot de passe doit contenir au moins 8 caractères',
  'Token has expired': 'Le lien a expiré, veuillez en demander un nouveau',
  'Invalid token': 'Lien invalide',
  'Rate limit exceeded': 'Trop de tentatives, veuillez réessayer plus tard'
}

function translateError(error: AuthError): string {
  return errorMessages[error.message] || 'Une erreur est survenue'
}
```

---

## Rate Limits

| Operation | Limit | Window |
|-----------|-------|--------|
| Sign up | 3 per hour | Per email |
| Sign in | 5 per 15 min | Per email |
| Password reset | 3 per hour | Per email |
| Email verification | 3 per hour | Per email |
| Token refresh | 1800 per hour | Per IP |

These are Supabase defaults and can be configured in the dashboard.
