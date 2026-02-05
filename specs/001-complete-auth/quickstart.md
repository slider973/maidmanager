# Quickstart: Complete Authentication System

**Feature**: 001-complete-auth
**Date**: 2026-02-05

## Prerequisites

Before starting, ensure you have:

1. **Supabase Project** configured with:
   - Email authentication enabled
   - Site URL set to `http://localhost:5173` (dev) and production URL
   - Redirect URLs configured

2. **Environment Variables** in `.env.local`:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Dependencies** installed:
   ```bash
   npm install
   ```

## Quick Test: Existing Auth

The basic auth (login/signup) already works. Test it:

```bash
npm run dev
# Open http://localhost:5173/login
```

## New Features Setup

### 1. Configure Email Templates (Supabase Dashboard)

Go to **Authentication → Email Templates** in your Supabase dashboard.

**Confirm Signup Template**:
```html
<h2>Confirmez votre inscription</h2>
<p>Cliquez sur le lien ci-dessous pour confirmer votre compte :</p>
<p><a href="{{ .SiteURL }}/auth/verify?token_hash={{ .TokenHash }}&type=signup">Confirmer mon compte</a></p>
```

**Reset Password Template**:
```html
<h2>Réinitialisation du mot de passe</h2>
<p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
<p><a href="{{ .SiteURL }}/auth/reset-password?token_hash={{ .TokenHash }}&type=recovery">Réinitialiser mon mot de passe</a></p>
<p>Ce lien expire dans 1 heure.</p>
```

### 2. Add Redirect URLs

In Supabase dashboard → **Authentication → URL Configuration**:

Add these redirect URLs:
- `http://localhost:5173/auth/verify`
- `http://localhost:5173/auth/reset-password`
- `https://your-production-domain.com/auth/verify`
- `https://your-production-domain.com/auth/reset-password`

### 3. Database Migrations

Run these SQL commands in Supabase SQL Editor:

**Create profiles table** (if not exists):
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Create user_sessions table** (P3 feature):
```sql
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  ip_address INET,
  last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_current BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sessions_delete_own" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Generate TypeScript Types

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/database.ts
```

Or manually create `src/lib/types/database.ts` with the types from `data-model.md`.

## Testing Each Feature

### Test 1: Registration with Email Verification

1. Go to `/login`
2. Switch to "Créer un compte"
3. Enter email and password (8+ chars)
4. Submit → Should show "Vérifiez votre email"
5. Check email inbox
6. Click verification link → Should redirect to home

**Expected**: Account created, verification email received, verified after clicking link.

### Test 2: Login

1. Go to `/login`
2. Enter registered email and password
3. Submit → Should redirect to home/dashboard

**Expected**: Logged in, session persisted.

### Test 3: Login with Unverified Email

1. Register new account
2. Don't click verification link
3. Try to log in

**Expected**: Error message "Veuillez confirmer votre email"

### Test 4: Password Reset

1. Go to `/login`
2. Click "Mot de passe oublié?"
3. Enter email and submit
4. Check email → Click reset link
5. Enter new password
6. Submit → Should be logged in

**Expected**: Password changed, can log in with new password.

### Test 5: Logout

1. Log in
2. Click logout button
3. Try to access protected page

**Expected**: Redirected to login, cannot access protected content.

### Test 6: Session Persistence

1. Log in
2. Close browser completely
3. Reopen browser and navigate to app

**Expected**: Still logged in (within 7 days).

### Test 7: Session Management (P3)

1. Log in on browser A
2. Log in on browser B (different browser or incognito)
3. Go to Settings → Active Sessions
4. Verify both sessions appear
5. Click "Déconnecter" on one session
6. Verify that session is terminated

**Expected**: All sessions visible, can terminate individual sessions.

## Common Issues

### "Email not confirmed" error
- Check Supabase dashboard → Authentication → Users
- Verify `email_confirmed_at` is set
- Resend confirmation email if needed

### Verification link doesn't work
- Check redirect URLs in Supabase dashboard
- Verify email template uses correct URL format
- Links expire after 24 hours (default)

### Password reset link expired
- Default expiry is 1 hour
- Request a new reset link

### Session not persisting
- Check browser cookies are enabled
- Verify Supabase client is initialized correctly
- Check for errors in console

## Development Tips

### Watch auth state changes
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event)
  console.log('Session:', session)
})
```

### Check current user
```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
console.log('Email verified:', user?.email_confirmed_at !== null)
```

### Clear session for testing
```typescript
await supabase.auth.signOut()
localStorage.clear()
```

## Validation Checklist

- [ ] Registration creates account and sends verification email
- [ ] Verification link confirms email
- [ ] Login works with verified account
- [ ] Login fails with unverified account (shows message)
- [ ] Login fails with wrong credentials
- [ ] Password reset sends email
- [ ] Password reset link updates password
- [ ] Logout terminates session
- [ ] Protected routes redirect to login
- [ ] Session persists across browser restart
- [ ] Error messages display in French
- [ ] (P3) Active sessions are visible
- [ ] (P3) Can terminate individual sessions
