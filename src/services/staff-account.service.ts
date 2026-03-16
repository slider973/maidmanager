/**
 * Staff Account Service
 * Feature: 009-staff-portal
 * Manages staff account creation and linking via invitation links
 */

import { supabase } from '../lib/supabase'

export interface CreateInvitationResult {
  success: boolean
  message: string
  invitationLink?: string
  token?: string
}

export interface ValidateInvitationResult {
  valid: boolean
  staffMemberId?: string
  staffName?: string
  message: string
}

// Type for staff_invitations table (not yet in generated types)
// Keeping for documentation purposes
/* interface StaffInvitation {
  id: string
  staff_member_id: string
  token: string
  created_at: string
  expires_at: string
  used_at: string | null
  used_by: string | null
} */

/**
 * Generate a secure random token
 */
function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Create an invitation link for a staff member
 */
export async function createInvitationLink(staffMemberId: string): Promise<CreateInvitationResult> {
  // Check if staff member exists
  const { data: staffMember, error: staffError } = await supabase
    .from('staff_members')
    .select('id, first_name, last_name')
    .eq('id', staffMemberId)
    .single()

  if (staffError || !staffMember) {
    return {
      success: false,
      message: 'Membre du personnel introuvable',
    }
  }

  // Check if staff already has a linked account
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, staff_account_id')
    .eq('staff_account_id', staffMemberId)
    .maybeSingle()

  if (existingProfile) {
    return {
      success: false,
      message: 'Un compte existe deja pour cet employe',
    }
  }

  // Generate unique token
  const token = generateToken()

  // Set expiration to 7 days from now
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  // Delete any existing unused invitations for this staff member
  // Using type assertion since staff_invitations isn't in generated types yet
  await (supabase as any)
    .from('staff_invitations')
    .delete()
    .eq('staff_member_id', staffMemberId)
    .is('used_at', null)

  // Create new invitation
  const { error: insertError } = await (supabase as any)
    .from('staff_invitations')
    .insert({
      staff_member_id: staffMemberId,
      token,
      expires_at: expiresAt.toISOString(),
    })

  if (insertError) {
    console.error('Failed to create invitation:', insertError)
    return {
      success: false,
      message: 'Erreur lors de la creation de l\'invitation',
    }
  }

  // Build invitation link
  const baseUrl = window.location.origin
  const invitationLink = `${baseUrl}/signup?invite=${token}`

  return {
    success: true,
    message: 'Lien d\'invitation cree avec succes',
    invitationLink,
    token,
  }
}

/**
 * Validate an invitation token (for signup page)
 */
export async function validateInvitationToken(token: string): Promise<ValidateInvitationResult> {
  // Using type assertion since staff_invitations isn't in generated types yet
  const { data: invitation, error } = await (supabase as any)
    .from('staff_invitations')
    .select(`
      id,
      staff_member_id,
      expires_at,
      used_at,
      staff_members (
        first_name,
        last_name
      )
    `)
    .eq('token', token)
    .single()

  if (error || !invitation) {
    return {
      valid: false,
      message: 'Invitation invalide ou introuvable',
    }
  }

  if (invitation.used_at) {
    return {
      valid: false,
      message: 'Cette invitation a deja ete utilisee',
    }
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return {
      valid: false,
      message: 'Cette invitation a expire',
    }
  }

  const staffMember = invitation.staff_members as { first_name: string; last_name: string } | null
  const staffName = staffMember
    ? `${staffMember.first_name} ${staffMember.last_name}`
    : 'Employe'

  return {
    valid: true,
    staffMemberId: invitation.staff_member_id,
    staffName,
    message: 'Invitation valide',
  }
}

/**
 * Use an invitation token after signup
 */
export async function useInvitationToken(token: string, userId: string): Promise<{ success: boolean; message: string }> {
  // Call the database function
  // Using type assertion since the function isn't in generated types yet
  const { data, error } = await (supabase as any)
    .rpc('use_invitation_token', {
      p_token: token,
      p_user_id: userId,
    })

  if (error) {
    console.error('Failed to use invitation:', error)
    return {
      success: false,
      message: 'Erreur lors de l\'activation de l\'invitation',
    }
  }

  const result = data?.[0] as { success: boolean; message: string } | undefined
  if (!result?.success) {
    return {
      success: false,
      message: result?.message || 'Erreur inconnue',
    }
  }

  return {
    success: true,
    message: 'Compte lie avec succes',
  }
}

/**
 * Link a user profile to a staff member
 */
export async function linkAccount(
  profileId: string,
  staffMemberId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({ staff_account_id: staffMemberId })
    .eq('id', profileId)

  return { error: error?.message ?? null }
}

/**
 * Check if a staff member has a linked account
 */
export async function isStaffLinked(staffMemberId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('id, staff_account_id')
    .eq('staff_account_id', staffMemberId)
    .maybeSingle()

  return data !== null
}

/**
 * Get the staff member ID for a user
 */
export async function getStaffMemberForUser(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('staff_account_id')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.staff_account_id
}
