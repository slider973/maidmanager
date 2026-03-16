-- Migration: Create action_types table
-- Feature: 009-staff-portal
-- Purpose: Reference table for action types filtered by staff position

CREATE TABLE IF NOT EXISTS action_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  position_filter TEXT[],
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
COMMENT ON TABLE action_types IS 'Reference table for action types. user_id NULL = system default, NOT NULL = custom user-defined';
COMMENT ON COLUMN action_types.user_id IS 'NULL for system defaults, set for custom user-defined action types';
COMMENT ON COLUMN action_types.name IS 'Technical name (slug) for the action type';
COMMENT ON COLUMN action_types.name_fr IS 'French display label';
COMMENT ON COLUMN action_types.position_filter IS 'Array of staff positions that can use this action. NULL = all positions';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_action_types_user_id ON action_types(user_id);
CREATE INDEX IF NOT EXISTS idx_action_types_active ON action_types(is_active, sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_action_types_position ON action_types USING GIN(position_filter);

-- RLS
ALTER TABLE action_types ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read system defaults (user_id IS NULL) and their own custom types
CREATE POLICY action_types_select ON action_types
  FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

-- Policy: Users can insert their own custom action types
CREATE POLICY action_types_insert ON action_types
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own custom action types only
CREATE POLICY action_types_update ON action_types
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own custom action types only
CREATE POLICY action_types_delete ON action_types
  FOR DELETE
  USING (user_id = auth.uid());

-- Seed data (system defaults with user_id = NULL)
INSERT INTO action_types (user_id, name, name_fr, position_filter, sort_order) VALUES
  (NULL, 'cleaning', 'Nettoyage', ARRAY['housekeeper'], 1),
  (NULL, 'dusting', 'Depoussierage', ARRAY['housekeeper'], 2),
  (NULL, 'vacuuming', 'Aspirateur', ARRAY['housekeeper'], 3),
  (NULL, 'mopping', 'Serpilliere', ARRAY['housekeeper'], 4),
  (NULL, 'ironing', 'Repassage', ARRAY['housekeeper'], 5),
  (NULL, 'laundry', 'Lessive', ARRAY['housekeeper'], 6),
  (NULL, 'dishes', 'Vaisselle', ARRAY['housekeeper', 'cook'], 7),
  (NULL, 'cooking', 'Cuisine', ARRAY['cook'], 10),
  (NULL, 'meal_prep', 'Preparation repas', ARRAY['cook'], 11),
  (NULL, 'mowing', 'Tonte', ARRAY['gardener'], 20),
  (NULL, 'pruning', 'Taille', ARRAY['gardener'], 21),
  (NULL, 'watering', 'Arrosage', ARRAY['gardener'], 22),
  (NULL, 'weeding', 'Desherbage', ARRAY['gardener'], 23),
  (NULL, 'planting', 'Plantation', ARRAY['gardener'], 24),
  (NULL, 'childcare', 'Garde enfant', ARRAY['nanny'], 30),
  (NULL, 'homework_help', 'Aide devoirs', ARRAY['nanny'], 31),
  (NULL, 'driving', 'Transport', ARRAY['driver'], 40),
  (NULL, 'security_check', 'Ronde', ARRAY['guard'], 50),
  (NULL, 'other', 'Autre', NULL, 99)
ON CONFLICT DO NOTHING;
