-- =====================================================
-- MIGRATIONS A APPLIQUER - 2026-02-08
-- Copie ce SQL dans ton interface Supabase SQL Editor
-- =====================================================

-- 1. Fix RLS clients pour que staff puisse voir les clients du manager
CREATE POLICY "clients_select_by_staff_link" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON p.staff_account_id = sm.id
      WHERE p.id = auth.uid()
      AND sm.user_id = clients.user_id
    )
  );

-- 2. Table pour les instructions par piece et par client
CREATE TABLE client_room_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  room_type_id UUID NOT NULL REFERENCES room_types(id) ON DELETE CASCADE,
  instructions TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id, room_type_id)
);

CREATE INDEX idx_client_room_instructions_client ON client_room_instructions(client_id);
CREATE INDEX idx_client_room_instructions_room ON client_room_instructions(room_type_id);

ALTER TABLE client_room_instructions ENABLE ROW LEVEL SECURITY;

-- Manager peut gerer les instructions de ses clients
CREATE POLICY "client_room_instructions_select_own" ON client_room_instructions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_room_instructions.client_id AND c.user_id = auth.uid())
  );

CREATE POLICY "client_room_instructions_insert_own" ON client_room_instructions
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_room_instructions.client_id AND c.user_id = auth.uid())
  );

CREATE POLICY "client_room_instructions_update_own" ON client_room_instructions
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_room_instructions.client_id AND c.user_id = auth.uid())
  );

CREATE POLICY "client_room_instructions_delete_own" ON client_room_instructions
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients c WHERE c.id = client_room_instructions.client_id AND c.user_id = auth.uid())
  );

-- Staff peut lire les instructions des clients de son manager
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

CREATE TRIGGER client_room_instructions_updated_at
  BEFORE UPDATE ON client_room_instructions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
