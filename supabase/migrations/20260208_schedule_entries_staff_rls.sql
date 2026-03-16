-- Migration: Add RLS policy for staff to view their own schedule_entries
-- Feature: 010-client-schedule-calendar
-- Purpose: Allow staff members to see their own interventions in the calendar

-- Policy: Staff can view schedule_entries where they are assigned
CREATE POLICY "schedule_entries_staff_select_own" ON schedule_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON p.staff_account_id = sm.id
      WHERE p.id = auth.uid()
      AND sm.id = schedule_entries.staff_member_id
    )
  );
