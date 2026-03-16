-- Migration: Create work_sessions table
-- Feature: 008-staff-payments
-- Date: 2026-02-07

-- Create work_sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE RESTRICT,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  hourly_rate_cents INTEGER NOT NULL CHECK (hourly_rate_cents >= 0),
  amount_cents INTEGER NOT NULL GENERATED ALWAYS AS (
    ROUND(duration_minutes * hourly_rate_cents / 60.0)
  ) STORED,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_sessions_staff_member ON work_sessions(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_work_sessions_user_date ON work_sessions(user_id, session_date DESC);

-- Enable Row Level Security
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own work sessions
CREATE POLICY work_sessions_select_own ON work_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY work_sessions_insert_own ON work_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY work_sessions_update_own ON work_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY work_sessions_delete_own ON work_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Trigger for updated_at (reuse existing function if available)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
  END IF;
END $$;

CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE work_sessions IS 'Prestations de travail effectuées par le personnel';
COMMENT ON COLUMN work_sessions.duration_minutes IS 'Durée de la prestation en minutes';
COMMENT ON COLUMN work_sessions.hourly_rate_cents IS 'Tarif horaire appliqué en centimes';
COMMENT ON COLUMN work_sessions.amount_cents IS 'Montant calculé automatiquement (duration × rate / 60)';
