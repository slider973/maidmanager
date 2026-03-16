-- Migration: Add hourly_rate_cents to staff_members
-- Feature: 008-staff-payments
-- Date: 2026-02-07

-- Add hourly rate column (in cents for precision)
ALTER TABLE staff_members
ADD COLUMN IF NOT EXISTS hourly_rate_cents INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN staff_members.hourly_rate_cents IS 'Tarif horaire par défaut en centimes (ex: 1500 = 15.00€)';
