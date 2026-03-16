-- Migration: Create staff_members table
-- Feature: 002-add-staff
-- Date: 2026-02-06

-- Create staff_members table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('housekeeper', 'gardener', 'cook', 'driver', 'nanny', 'guard', 'other')),
  position_custom TEXT,
  phone TEXT,
  email TEXT,
  start_date DATE,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_members_position ON staff_members(position);
CREATE INDEX IF NOT EXISTS idx_staff_members_is_active ON staff_members(is_active);

-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "staff_members_select_own" ON staff_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "staff_members_insert_own" ON staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "staff_members_update_own" ON staff_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "staff_members_delete_own" ON staff_members
  FOR DELETE USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS staff_members_updated_at ON staff_members;
CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
