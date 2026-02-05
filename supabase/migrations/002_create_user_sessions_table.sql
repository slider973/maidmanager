-- Migration: Create user_sessions table (P3 - Session Management)
-- Feature: 001-complete-auth
-- Run this in your Supabase SQL Editor when implementing Phase 7

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_active ON public.user_sessions(last_active_at);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "sessions_select_own" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sessions_delete_own" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sessions_update_own" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);
