-- Migration: Create client_room_instructions table
-- Feature: 009-staff-portal (instructions per room)
-- Date: 2026-02-08
--
-- Purpose: Allow managers to add specific instructions for each room type per client
-- Staff can then see these instructions when performing actions

-- Create client_room_instructions table
CREATE TABLE client_room_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- One instruction set per client/room combination
  UNIQUE(client_id, room_type_id)
);

-- Indexes
CREATE INDEX idx_client_room_instructions_client ON client_room_instructions(client_id);
CREATE INDEX idx_client_room_instructions_room ON client_room_instructions(room_type_id);

-- Enable RLS
ALTER TABLE client_room_instructions ENABLE ROW LEVEL SECURITY;

-- RLS: Manager can CRUD their own client's instructions
CREATE POLICY "client_room_instructions_select_own" ON client_room_instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_room_instructions.client_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "client_room_instructions_insert_own" ON client_room_instructions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_room_instructions.client_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "client_room_instructions_update_own" ON client_room_instructions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_room_instructions.client_id
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "client_room_instructions_delete_own" ON client_room_instructions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_room_instructions.client_id
      AND c.user_id = auth.uid()
    )
  );

-- RLS: Staff can read instructions for their manager's clients
CREATE POLICY "client_room_instructions_select_by_staff" ON client_room_instructions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON p.staff_account_id = sm.id
      JOIN clients c ON c.user_id = sm.user_id
      WHERE p.id = auth.uid()
      AND c.id = client_room_instructions.client_id
    )
  );

-- Trigger for updated_at
CREATE TRIGGER client_room_instructions_updated_at
  BEFORE UPDATE ON client_room_instructions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE client_room_instructions IS 'Instructions specifiques par piece pour chaque client';
COMMENT ON COLUMN client_room_instructions.instructions IS 'Instructions detaillees pour le personnel';
