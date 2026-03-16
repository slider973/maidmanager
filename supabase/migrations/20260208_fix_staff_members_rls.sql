-- Migration: Fix staff_members RLS for staff portal access
-- Feature: 009-staff-portal
-- Date: 2026-02-08
--
-- Problem: Staff members can't read their own record because:
-- - Current policy: auth.uid() = user_id
-- - But user_id = manager's ID, not the staff's auth.uid()
-- - Staff's profile has staff_account_id pointing to their staff_members.id
--
-- Solution: Allow staff to read their record if their profile.staff_account_id matches

-- Add policy for staff to read their own record via profile link
CREATE POLICY "staff_members_select_by_profile_link" ON staff_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.staff_account_id = staff_members.id
    )
  );

-- Also allow staff to see their assigned tasks, schedules, etc.
-- by allowing them to read staff_members where they are the linked staff
