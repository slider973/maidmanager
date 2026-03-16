-- Migration: Create client_rooms table
-- Feature: Client-specific rooms with instructions
-- Purpose: Allow each client to have their own rooms (e.g., "Salle de bain 1", "Salle de bain 2")
--          with specific instructions for each

-- Create client_rooms table
CREATE TABLE IF NOT EXISTS client_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  room_type_id UUID REFERENCES room_types(id) ON DELETE SET NULL,
  custom_name TEXT NOT NULL,
  instructions TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE client_rooms IS 'Specific rooms for each client with their instructions';
COMMENT ON COLUMN client_rooms.room_type_id IS 'Optional link to room_type for categorization and icon';
COMMENT ON COLUMN client_rooms.custom_name IS 'Custom name like "Salle de bain - Haut" or "Chambre des enfants"';
COMMENT ON COLUMN client_rooms.instructions IS 'Manager instructions for this specific room';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_rooms_client_id ON client_rooms(client_id);
CREATE INDEX IF NOT EXISTS idx_client_rooms_active ON client_rooms(client_id, is_active) WHERE is_active = true;

-- RLS
ALTER TABLE client_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Manager can do everything on their clients' rooms
CREATE POLICY client_rooms_manager_all ON client_rooms
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_rooms.client_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_rooms.client_id
      AND c.user_id = auth.uid()
    )
  );

-- Policy: Staff can read rooms for clients of their manager
CREATE POLICY client_rooms_staff_select ON client_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      JOIN staff_members sm ON sm.user_id = c.user_id
      JOIN profiles p ON p.staff_account_id = sm.id
      WHERE c.id = client_rooms.client_id
      AND p.id = auth.uid()
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_client_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER client_rooms_updated_at
  BEFORE UPDATE ON client_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_client_rooms_updated_at();

-- Migrate existing data from client_room_instructions to client_rooms
-- This creates a room for each existing instruction
INSERT INTO client_rooms (client_id, room_type_id, custom_name, instructions, created_at, updated_at)
SELECT
  cri.client_id,
  cri.room_type_id,
  rt.name_fr,
  cri.instructions,
  cri.created_at,
  cri.updated_at
FROM client_room_instructions cri
JOIN room_types rt ON rt.id = cri.room_type_id
ON CONFLICT DO NOTHING;
