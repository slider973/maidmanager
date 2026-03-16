-- Migration: Fix clients RLS for staff portal access
-- Feature: 009-staff-portal
-- Date: 2026-02-08
--
-- Problem: Staff members can't see clients because RLS policy only allows manager (user_id = auth.uid())
-- Solution: Allow staff to see clients belonging to their manager via profile link

-- Add policy for staff to see clients of their manager
CREATE POLICY "clients_select_by_staff_link" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON p.staff_account_id = sm.id
      WHERE p.id = auth.uid()
      AND sm.user_id = clients.user_id
    )
  );
