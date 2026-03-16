-- Migration: Add staff_account_id to profiles
-- Feature: 009-staff-portal
-- Purpose: Link auth profiles to staff_members for staff portal access

-- Add staff_account_id column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS staff_account_id UUID REFERENCES staff_members(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_staff_account_id ON profiles(staff_account_id)
WHERE staff_account_id IS NOT NULL;

-- Add unique constraint (one profile per staff member)
ALTER TABLE profiles
ADD CONSTRAINT profiles_staff_account_id_unique UNIQUE (staff_account_id);

COMMENT ON COLUMN profiles.staff_account_id IS 'Link to staff_members table for staff portal access. NULL = manager account, NOT NULL = staff account';
