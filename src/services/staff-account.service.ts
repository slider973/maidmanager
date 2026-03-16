/**
 * Staff Account Service
 * Feature: 009-staff-portal
 * Manages staff account creation and linking via invitation links
 */

import { api, ApiError } from '../lib/api'

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

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Create an invitation link for a staff member
 */
export async function createInvitationLink(staffMemberId: string): Promise<CreateInvitationResult> {
  try {
    const result = await api.post<{ token: string }>(`/staff-members/${staffMemberId}/invitation`)

    const token = result.token
    const baseUrl = window.location.origin
    const invitationLink = `${baseUrl}/signup?invite=${token}`

    return {
      success: true,
      message: 'Lien d\'invitation cree avec succes',
      invitationLink,
      token,
    }
  } catch (err) {
    console.error('Failed to create invitation:', err)
    return {
      success: false,
      message: handleError(err),
    }
  }
}

/**
 * Validate an invitation token (for signup page)
 */
export async function validateInvitationToken(token: string): Promise<ValidateInvitationResult> {
  try {
    const result = await api.get<{
      valid: boolean
      staff_member_id?: string
      staff_name?: string
      message: string
    }>(`/staff-members/invitation/validate?token=${encodeURIComponent(token)}`)

    return {
      valid: result.valid,
      staffMemberId: result.staff_member_id,
      staffName: result.staff_name,
      message: result.message,
    }
  } catch (err) {
    console.error('Failed to validate invitation:', err)
    return {
      valid: false,
      message: handleError(err),
    }
  }
}

/**
 * Use an invitation token after signup
 */
export async function useInvitationToken(token: string, userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await api.post<{ success: boolean; message: string }>('/staff-members/invitation/use', {
      token,
      user_id: userId,
    })

    if (!result.success) {
      return {
        success: false,
        message: result.message || 'Erreur inconnue',
      }
    }

    return {
      success: true,
      message: 'Compte lie avec succes',
    }
  } catch (err) {
    console.error('Failed to use invitation:', err)
    return {
      success: false,
      message: handleError(err),
    }
  }
}

/**
 * Link a user profile to a staff member
 */
export async function linkAccount(
  profileId: string,
  staffMemberId: string
): Promise<{ error: string | null }> {
  try {
    await api.post('/staff-members/link-account', {
      profile_id: profileId,
      staff_member_id: staffMemberId,
    })
    return { error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Check if a staff member has a linked account
 */
export async function isStaffLinked(staffMemberId: string): Promise<boolean> {
  try {
    const result = await api.get<{ linked: boolean }>(`/staff-members/${staffMemberId}/linked`)
    return result.linked
  } catch {
    return false
  }
}

/**
 * Get the staff member ID for a user
 */
export async function getStaffMemberForUser(userId: string): Promise<string | null> {
  try {
    const result = await api.get<{ staff_member_id: string | null }>(`/staff-members/for-user/${userId}`)
    return result.staff_member_id
  } catch {
    return null
  }
}
