-- Migration: 20260206_create_schedule_entries
-- Description: Create schedule_entries table for planning feature

CREATE TABLE schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedule_entries_user_id ON schedule_entries(user_id);
CREATE INDEX idx_schedule_entries_scheduled_date ON schedule_entries(scheduled_date);
CREATE INDEX idx_schedule_entries_staff_member_id ON schedule_entries(staff_member_id);
CREATE INDEX idx_schedule_entries_status ON schedule_entries(status);
CREATE INDEX idx_schedule_entries_user_date ON schedule_entries(user_id, scheduled_date);

-- RLS
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_entries_select_own" ON schedule_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "schedule_entries_insert_own" ON schedule_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedule_entries_update_own" ON schedule_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "schedule_entries_delete_own" ON schedule_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger (function already exists from staff_members)
CREATE TRIGGER schedule_entries_updated_at
  BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
