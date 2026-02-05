# Data Model: Complete Authentication System

**Feature**: 001-complete-auth
**Date**: 2026-02-05

## Overview

This document describes the data model for the complete authentication system. Most auth data is managed by Supabase's `auth` schema; we define only the custom extensions needed for our feature requirements.

## Entity Relationship Diagram

```
┌─────────────────────────────────────────┐
│           auth.users (Supabase)          │
│  ─────────────────────────────────────── │
│  id: uuid [PK]                           │
│  email: string [unique]                  │
│  encrypted_password: string              │
│  email_confirmed_at: timestamp | null    │
│  created_at: timestamp                   │
│  updated_at: timestamp                   │
│  last_sign_in_at: timestamp | null       │
│  raw_user_meta_data: jsonb               │
└─────────────────────────────────────────┘
                    │
                    │ 1:1
                    ▼
┌─────────────────────────────────────────┐
│            public.profiles               │
│  ─────────────────────────────────────── │
│  id: uuid [PK, FK → auth.users.id]       │
│  display_name: string | null             │
│  avatar_url: string | null               │
│  created_at: timestamp                   │
│  updated_at: timestamp                   │
└─────────────────────────────────────────┘
                    │
                    │ 1:N
                    ▼
┌─────────────────────────────────────────┐
│          public.user_sessions            │
│  ─────────────────────────────────────── │
│  id: uuid [PK]                           │
│  user_id: uuid [FK → auth.users.id]      │
│  device_info: string                     │
│  browser: string | null                  │
│  os: string | null                       │
│  ip_address: inet                        │
│  last_active_at: timestamp               │
│  created_at: timestamp                   │
│  is_current: boolean                     │
└─────────────────────────────────────────┘
```

## Entities

### 1. auth.users (Supabase Managed)

**Description**: Core user authentication data managed by Supabase Auth. We do not modify this table directly.

**Key Fields for Our Feature**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | Primary key, used to link to other tables |
| `email` | string | User's email address (unique) |
| `email_confirmed_at` | timestamp | When email was verified; null if unverified |
| `last_sign_in_at` | timestamp | Most recent successful login |
| `created_at` | timestamp | Account creation time |

**Verification Status Logic**:
- User is verified if `email_confirmed_at IS NOT NULL`
- Check in code: `user.email_confirmed_at !== null`

### 2. public.profiles

**Description**: Application-specific user profile data. Created automatically on user signup via database trigger.

**Schema**:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. public.user_sessions (P3 - Session Management)

**Description**: Tracks active user sessions for the session management feature (User Story 5). This is a custom table since Supabase Auth doesn't expose session details to clients.

**Schema**:

```sql
CREATE TABLE public.user_sessions (
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

-- Indexes
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_active ON public.user_sessions(last_active_at);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.user_sessions FOR UPDATE
  USING (auth.uid() = user_id);
```

**Field Details**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | uuid | PK, auto-generated | Unique session identifier |
| `user_id` | uuid | FK, NOT NULL | References auth.users |
| `device_info` | text | NOT NULL | User agent or device description |
| `browser` | text | nullable | Parsed browser name (e.g., "Chrome 120") |
| `os` | text | nullable | Parsed OS (e.g., "macOS 14", "Windows 11") |
| `ip_address` | inet | nullable | Client IP address |
| `last_active_at` | timestamptz | NOT NULL, default NOW() | Last activity timestamp |
| `created_at` | timestamptz | NOT NULL, default NOW() | Session creation time |
| `is_current` | boolean | default FALSE | Marks the current session in UI |

## Data Flow

### User Registration

1. User submits signup form
2. Supabase creates `auth.users` record
3. Trigger creates `public.profiles` record
4. Supabase sends verification email
5. User clicks link → `email_confirmed_at` set

### User Login

1. User submits credentials
2. Supabase validates and returns session
3. Client creates `user_sessions` record with device info
4. `onAuthStateChange` fires `SIGNED_IN` event

### Session Tracking

1. On login: Insert new `user_sessions` record
2. On activity: Update `last_active_at` (debounced)
3. On logout: Delete session record OR mark inactive
4. On "sign out all": Delete all user's session records

### Password Reset

1. User requests reset → Supabase sends email
2. User clicks link → `PASSWORD_RECOVERY` event fires
3. User enters new password → `updateUser()` called
4. Optional: Invalidate all other sessions

## Validation Rules

### Email
- Required
- Valid email format
- Unique across all users

### Password
- Minimum 8 characters (enforced by Supabase + client)
- Supabase provides weak password detection

### Display Name (profiles)
- Optional
- Maximum 100 characters

### Device Info (user_sessions)
- Required
- Maximum 500 characters (user agent strings can be long)

## TypeScript Types

```typescript
// Generated from Supabase schema
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      user_sessions: {
        Row: {
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
        Insert: {
          id?: string
          user_id: string
          device_info: string
          browser?: string | null
          os?: string | null
          ip_address?: string | null
          last_active_at?: string
          created_at?: string
          is_current?: boolean
        }
        Update: {
          last_active_at?: string
          is_current?: boolean
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']
```

## Migration Strategy

### Order of Migrations

1. `001_create_profiles_table.sql` - Profiles table + trigger
2. `002_create_user_sessions_table.sql` - Session tracking (can be deferred to P3)

### Rollback Plan

Both tables can be dropped safely as they only contain user-specific data:

```sql
-- Rollback 002
DROP TABLE IF EXISTS public.user_sessions;

-- Rollback 001
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles;
```
