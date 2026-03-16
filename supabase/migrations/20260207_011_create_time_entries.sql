-- Migration: Create time_entries table
-- Feature: 009-staff-portal
-- Purpose: Track staff clock-in/clock-out times

CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  clock_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  clock_out_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  work_session_id UUID REFERENCES work_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE time_entries IS 'Staff clock-in/clock-out time entries';
COMMENT ON COLUMN time_entries.user_id IS 'Owner (manager) of this time entry';
COMMENT ON COLUMN time_entries.staff_member_id IS 'Staff member who clocked in';
COMMENT ON COLUMN time_entries.client_id IS 'Client location where work is performed';
COMMENT ON COLUMN time_entries.clock_in_at IS 'Time when staff clocked in';
COMMENT ON COLUMN time_entries.clock_out_at IS 'Time when staff clocked out (NULL if still open)';
COMMENT ON COLUMN time_entries.duration_minutes IS 'Calculated duration in minutes (set on clock-out)';
COMMENT ON COLUMN time_entries.work_session_id IS 'Link to work_session created on clock-out';
COMMENT ON COLUMN time_entries.status IS 'Entry status: open (in progress), closed (completed), cancelled';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_staff_date ON time_entries(staff_member_id, clock_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_client_id ON time_entries(client_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_status_open ON time_entries(status) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS idx_time_entries_work_session ON time_entries(work_session_id) WHERE work_session_id IS NOT NULL;

-- RLS
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view their own time entries
CREATE POLICY time_entries_staff_select ON time_entries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.staff_account_id = time_entries.staff_member_id
    )
  );

-- Policy: Manager can view all time entries they own
CREATE POLICY time_entries_manager_select ON time_entries
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Staff can insert time entries for themselves
CREATE POLICY time_entries_staff_insert ON time_entries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON sm.id = p.staff_account_id
      WHERE p.id = auth.uid()
      AND p.staff_account_id = time_entries.staff_member_id
      AND sm.user_id = time_entries.user_id
    )
  );

-- Policy: Manager can insert time entries for their staff
CREATE POLICY time_entries_manager_insert ON time_entries
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Staff can update their own open time entries
CREATE POLICY time_entries_staff_update ON time_entries
  FOR UPDATE
  USING (
    status = 'open'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.staff_account_id = time_entries.staff_member_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.staff_account_id = time_entries.staff_member_id
    )
  );

-- Policy: Manager has full update access
CREATE POLICY time_entries_manager_update ON time_entries
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Manager can delete time entries
CREATE POLICY time_entries_manager_delete ON time_entries
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_time_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entries_updated_at
  BEFORE UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_time_entries_updated_at();
