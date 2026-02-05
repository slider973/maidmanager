# Research: Complete Authentication System

**Feature**: 001-complete-auth
**Date**: 2026-02-05

## Overview

This document consolidates research findings for implementing a complete authentication system in MaidManager using Supabase Auth with SolidJS.

## Technology Decisions

### 1. Authentication Provider: Supabase Auth

**Decision**: Use Supabase Auth (already integrated in codebase)

**Rationale**:
- Already configured in `src/lib/supabase.ts` and `src/lib/auth.tsx`
- Provides all required features out-of-box: signup, login, password reset, email verification
- Handles session management, token refresh, and secure storage automatically
- Built-in rate limiting and security features
- No additional backend code required for core auth functionality

**Alternatives Considered**:
- Custom JWT implementation: Rejected - unnecessary complexity, security risks
- Auth0/Firebase: Rejected - already invested in Supabase ecosystem
- Clerk: Rejected - adds dependency, Supabase Auth is sufficient

### 2. Email Verification Flow

**Decision**: Use Supabase's built-in email confirmation with token hash

**Rationale**:
- Supabase automatically sends confirmation emails on signup when enabled
- Token hash approach is secure and PKCE-compatible
- Simple verification via `supabase.auth.verifyOtp({ token_hash, type: 'email' })`

**Implementation Pattern**:
```typescript
// On signup - Supabase sends email automatically
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/verify`
  }
})

// On verification page (/auth/verify)
const { error } = await supabase.auth.verifyOtp({
  token_hash: searchParams.get('token_hash'),
  type: 'email'
})
```

### 3. Password Reset Flow

**Decision**: Use `resetPasswordForEmail` + `updateUser` pattern

**Rationale**:
- Supabase handles email sending and token generation
- Link expiry is configurable in dashboard (default 1 hour matches our spec)
- PASSWORD_RECOVERY event enables seamless UI flow

**Implementation Pattern**:
```typescript
// Request reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/reset-password`
})

// Handle reset (on PASSWORD_RECOVERY event)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') {
    // Show password reset form
  }
})

// Update password
await supabase.auth.updateUser({ password: newPassword })
```

### 4. Session Management

**Decision**: Rely on Supabase's built-in session handling + custom session table for visibility

**Rationale**:
- Supabase manages JWT tokens and refresh automatically
- `onAuthStateChange` provides reactive session state
- For US5 (session visibility), need custom `user_sessions` table since Supabase doesn't expose session list

**Session Events**:
- `INITIAL_SESSION`: App load with existing session
- `SIGNED_IN`: User logged in
- `SIGNED_OUT`: User logged out
- `TOKEN_REFRESHED`: JWT refreshed (automatic)
- `PASSWORD_RECOVERY`: Reset flow initiated

### 5. Sign Out Scopes

**Decision**: Implement three logout options per Supabase API

**Options Available**:
- `signOut()` - Current session only (default)
- `signOut({ scope: 'global' })` - All sessions everywhere
- `signOut({ scope: 'others' })` - All except current (for "sign out other devices")

### 6. Rate Limiting

**Decision**: Rely on Supabase built-in rate limits + configure via dashboard

**Default Limits** (configurable):
- Email OTP/Magic Link: 60 seconds between requests
- Signup confirmation: 60 seconds between requests
- Password reset: 60 seconds between requests
- Token refresh: 1800 requests/hour per IP
- Verification: 360 requests/hour per IP

**Note**: Our spec requires 5 attempts per 15 minutes per email. This is handled by Supabase's built-in limits which are more restrictive.

## Data Model Decisions

### User Data

**Decision**: Use Supabase `auth.users` table (managed) + custom `profiles` table for app data

**Rationale**:
- `auth.users` managed by Supabase - contains email, password hash, verification status
- `profiles` table for app-specific user data (already common pattern)
- RLS policies protect user data

### Session Tracking (US5)

**Decision**: Create custom `user_sessions` table for session visibility feature

**Rationale**:
- Supabase Auth doesn't expose active sessions list to clients
- Need custom table to track device info, IP, last active time
- Populate via Edge Function on auth events or client-side on login

## UI/UX Decisions

### Form Validation

**Decision**: Inline validation with debounce + French error messages

**Patterns**:
- Email: HTML5 `type="email"` + format regex
- Password: Minimum 8 characters, show strength indicator
- Confirm password: Match validation

### Loading States

**Decision**: Loading button component with spinner + disabled state

**Pattern**:
```tsx
<LoadingButton loading={isSubmitting}>
  {isSubmitting ? 'Chargement...' : 'Se connecter'}
</LoadingButton>
```

### Toast Notifications

**Decision**: Custom Toast component for success/error feedback

**Patterns**:
- Success: Green background, check icon
- Error: Red background, alert icon
- Auto-dismiss after 5 seconds
- Accessible: role="alert", aria-live="polite"

## Security Considerations

### Password Requirements

- Minimum 8 characters (enforced client + server via Supabase)
- Supabase provides weak password detection
- Consider showing strength indicator

### Email Enumeration Prevention

- Same response for existing/non-existing email on reset
- Generic error messages: "If an account exists, you'll receive an email"

### Session Security

- HTTP-only cookies managed by Supabase
- Automatic token refresh
- CSRF protection via SameSite cookies

## Integration Points

### Existing Code

- `src/lib/supabase.ts`: Supabase client (keep as-is)
- `src/lib/auth.tsx`: AuthProvider (extend with new methods)
- `src/pages/Login.tsx`: Refactor to use form components
- `src/components/ProtectedRoute.tsx`: May need email verification check

### New Routes Required

| Route | Purpose |
|-------|---------|
| `/forgot-password` | Password reset request form |
| `/auth/reset-password` | New password entry (from email link) |
| `/auth/verify` | Email verification landing |
| `/settings` | User settings including session management |

### Supabase Dashboard Configuration

- Enable email confirmations
- Configure email templates (French)
- Set site URL and redirect URLs
- Configure rate limits if needed

## References

- [Supabase Auth JS Client](https://supabase.com/docs/reference/javascript/auth-signup)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Rate Limits](https://supabase.com/docs/guides/platform/going-into-prod#auth-rate-limits)
- [SolidJS Auth Patterns](https://docs.solidjs.com/guides/how-to-guides/auth)
