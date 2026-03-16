-- Migration: Create staff_invitations table for invitation links
-- Feature: Staff invitation links

-- Create staff_invitations table
CREATE TABLE IF NOT EXISTS staff_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Ensure only one active invitation per staff member
  CONSTRAINT unique_active_invitation UNIQUE (staff_member_id, used_at)
);

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_staff_invitations_token ON staff_invitations(token);

-- Create index for staff member lookup
CREATE INDEX IF NOT EXISTS idx_staff_invitations_staff_member ON staff_invitations(staff_member_id);

-- Enable RLS
ALTER TABLE staff_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Managers can create and view invitations for their staff
CREATE POLICY "Managers can manage invitations for their staff"
  ON staff_invitations
  FOR ALL
  USING (
    staff_member_id IN (
      SELECT id FROM staff_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can validate a token (for signup)
CREATE POLICY "Anyone can validate invitation tokens"
  ON staff_invitations
  FOR SELECT
  USING (true);

-- Function to validate and use an invitation token
CREATE OR REPLACE FUNCTION use_invitation_token(
  p_token VARCHAR(64),
  p_user_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  staff_member_id UUID,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invitation RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO v_invitation
  FROM staff_invitations
  WHERE token = p_token
  FOR UPDATE;

  -- Check if invitation exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Invitation invalide ou expirée'::TEXT;
    RETURN;
  END IF;

  -- Check if already used
  IF v_invitation.used_at IS NOT NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Cette invitation a déjà été utilisée'::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF v_invitation.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, 'Cette invitation a expiré'::TEXT;
    RETURN;
  END IF;

  -- Mark invitation as used
  UPDATE staff_invitations
  SET used_at = NOW(), used_by = p_user_id
  WHERE id = v_invitation.id;

  -- Link the profile to the staff member
  UPDATE profiles
  SET staff_account_id = v_invitation.staff_member_id
  WHERE id = p_user_id;

  RETURN QUERY SELECT true, v_invitation.staff_member_id, 'Compte lié avec succès'::TEXT;
END;
$$;
