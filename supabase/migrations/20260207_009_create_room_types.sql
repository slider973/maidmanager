-- Migration: Create room_types table
-- Feature: 009-staff-portal
-- Purpose: Reference table for room types (pieces) used in room_actions

CREATE TABLE IF NOT EXISTS room_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE room_types IS 'Reference table for room types. user_id NULL = system default, NOT NULL = custom user-defined';
COMMENT ON COLUMN room_types.user_id IS 'NULL for system defaults, set for custom user-defined room types';
COMMENT ON COLUMN room_types.name IS 'Technical name (slug) for the room type';
COMMENT ON COLUMN room_types.name_fr IS 'French display label';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_types_user_id ON room_types(user_id);
CREATE INDEX IF NOT EXISTS idx_room_types_active ON room_types(is_active, sort_order) WHERE is_active = true;

-- RLS
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read system defaults (user_id IS NULL) and their own custom types
CREATE POLICY room_types_select ON room_types
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Policy: Users can insert their own custom room types
CREATE POLICY room_types_insert ON room_types
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own custom room types only
CREATE POLICY room_types_update ON room_types
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own custom room types only
CREATE POLICY room_types_delete ON room_types
  FOR DELETE
  USING (user_id = auth.uid());

-- Seed data (system defaults with user_id = NULL)
INSERT INTO room_types (user_id, name, name_fr, icon, sort_order) VALUES
  (NULL, 'bathroom', 'Salle de bain', 'bath', 1),
  (NULL, 'kitchen', 'Cuisine', 'utensils', 2),
  (NULL, 'bedroom', 'Chambre', 'bed', 3),
  (NULL, 'living_room', 'Salon', 'sofa', 4),
  (NULL, 'dining_room', 'Salle a manger', 'chair', 5),
  (NULL, 'office', 'Bureau', 'briefcase', 6),
  (NULL, 'laundry', 'Buanderie', 'washing-machine', 7),
  (NULL, 'garage', 'Garage', 'car', 8),
  (NULL, 'garden', 'Jardin', 'tree', 9),
  (NULL, 'terrace', 'Terrasse', 'sun', 10),
  (NULL, 'other', 'Autre', 'more-horizontal', 99)
ON CONFLICT DO NOTHING;
