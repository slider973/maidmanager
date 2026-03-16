-- Migration: Create room_actions table
-- Feature: 009-staff-portal
-- Purpose: Track actions performed on rooms during time entries

CREATE TABLE IF NOT EXISTS room_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_entry_id UUID NOT NULL REFERENCES time_entries(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
  action_type_id UUID NOT NULL REFERENCES action_types(id) ON DELETE RESTRICT,
  performed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE room_actions IS 'Actions performed on rooms during a time entry';
COMMENT ON COLUMN room_actions.time_entry_id IS 'Parent time entry this action belongs to';
COMMENT ON COLUMN room_actions.room_type_id IS 'Type of room where action was performed';
COMMENT ON COLUMN room_actions.action_type_id IS 'Type of action performed';
COMMENT ON COLUMN room_actions.performed_at IS 'When the action was performed';
COMMENT ON COLUMN room_actions.notes IS 'Optional notes about the action';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_actions_time_entry ON room_actions(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_room_actions_room_type ON room_actions(room_type_id);
CREATE INDEX IF NOT EXISTS idx_room_actions_action_type ON room_actions(action_type_id);
CREATE INDEX IF NOT EXISTS idx_room_actions_performed_at ON room_actions(performed_at DESC);

-- RLS
ALTER TABLE room_actions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view room actions for time entries they can view
-- This inherits from time_entries RLS via the join
CREATE POLICY room_actions_select ON room_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM time_entries te
      WHERE te.id = room_actions.time_entry_id
      AND (
        te.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.staff_account_id = te.staff_member_id
        )
      )
    )
  );

-- Policy: Staff can insert room actions for their own open time entries
CREATE POLICY room_actions_staff_insert ON room_actions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM time_entries te
      JOIN profiles p ON p.staff_account_id = te.staff_member_id
      WHERE te.id = room_actions.time_entry_id
      AND te.status = 'open'
      AND p.id = auth.uid()
    )
  );

-- Policy: Manager can insert room actions for their time entries
CREATE POLICY room_actions_manager_insert ON room_actions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM time_entries te
      WHERE te.id = room_actions.time_entry_id
      AND te.user_id = auth.uid()
    )
  );

-- Policy: Staff can update room actions for their own open time entries
CREATE POLICY room_actions_staff_update ON room_actions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM time_entries te
      JOIN profiles p ON p.staff_account_id = te.staff_member_id
      WHERE te.id = room_actions.time_entry_id
      AND te.status = 'open'
      AND p.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM time_entries te
      JOIN profiles p ON p.staff_account_id = te.staff_member_id
      WHERE te.id = room_actions.time_entry_id
      AND te.status = 'open'
      AND p.id = auth.uid()
    )
  );

-- Policy: Manager can update room actions for their time entries
CREATE POLICY room_actions_manager_update ON room_actions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM time_entries te
      WHERE te.id = room_actions.time_entry_id
      AND te.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM time_entries te
      WHERE te.id = room_actions.time_entry_id
      AND te.user_id = auth.uid()
    )
  );

-- Policy: Staff can delete room actions for their own open time entries
CREATE POLICY room_actions_staff_delete ON room_actions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM time_entries te
      JOIN profiles p ON p.staff_account_id = te.staff_member_id
      WHERE te.id = room_actions.time_entry_id
      AND te.status = 'open'
      AND p.id = auth.uid()
    )
  );

-- Policy: Manager can delete room actions for their time entries
CREATE POLICY room_actions_manager_delete ON room_actions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM time_entries te
      WHERE te.id = room_actions.time_entry_id
      AND te.user_id = auth.uid()
    )
  );
