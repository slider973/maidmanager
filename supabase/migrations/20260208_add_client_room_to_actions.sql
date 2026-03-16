-- Migration: Add client_room_id to room_actions
-- Purpose: Allow tracking actions against specific client rooms (e.g., "Salle de bain 1")

-- Add client_room_id column (nullable for backwards compatibility)
ALTER TABLE room_actions
ADD COLUMN IF NOT EXISTS client_room_id UUID REFERENCES client_rooms(id) ON DELETE SET NULL;

-- Add index for querying by client room
CREATE INDEX IF NOT EXISTS idx_room_actions_client_room ON room_actions(client_room_id);

-- Comment
COMMENT ON COLUMN room_actions.client_room_id IS 'Optional link to specific client room for detailed tracking';
