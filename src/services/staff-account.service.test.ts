/**
 * Staff Account Service Tests
 * Feature: 009-staff-portal
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createInvitationLink,
  linkAccount,
  isStaffLinked,
  getStaffMemberForUser,
} from './staff-account.service'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
  // Mock window.location.origin for invitation link tests
  Object.defineProperty(window, 'location', {
    value: { origin: 'http://localhost:5173' },
    writable: true,
  })
})

describe('createInvitationLink', () => {
  it('should create invitation link for valid staff member', async () => {
    vi.mocked(api.post).mockResolvedValue({ token: 'abc123token' })

    const result = await createInvitationLink('staff-123')

    expect(result.success).toBe(true)
    expect(result.invitationLink).toContain('/signup?invite=')
    expect(result.token).toBeDefined()
    expect(api.post).toHaveBeenCalledWith('/staff-members/staff-123/invitation')
  })

  it('should return error when staff member not found', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Membre introuvable', 404))

    const result = await createInvitationLink('invalid-staff')

    expect(result.success).toBe(false)
    expect(result.message).toContain('introuvable')
  })

  it('should return error when staff already has account', async () => {
    vi.mocked(api.post).mockRejectedValue(
      new ApiError('Un compte existe deja pour ce membre', 409)
    )

    const result = await createInvitationLink('staff-123')

    expect(result.success).toBe(false)
    expect(result.message).toContain('existe deja')
  })
})

describe('linkAccount', () => {
  it('should link profile to staff member', async () => {
    vi.mocked(api.post).mockResolvedValue({})

    const result = await linkAccount('profile-123', 'staff-456')

    expect(result.error).toBeNull()
    expect(api.post).toHaveBeenCalledWith('/staff-members/link-account', {
      profile_id: 'profile-123',
      staff_member_id: 'staff-456',
    })
  })

  it('should return error when profile update fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Update failed', 500))

    const result = await linkAccount('profile-123', 'staff-456')

    expect(result.error).toBe('Update failed')
  })
})

describe('isStaffLinked', () => {
  it('should return true when staff has linked account', async () => {
    vi.mocked(api.get).mockResolvedValue({ linked: true })

    const result = await isStaffLinked('staff-456')

    expect(result).toBe(true)
    expect(api.get).toHaveBeenCalledWith('/staff-members/staff-456/linked')
  })

  it('should return false when staff has no linked account', async () => {
    vi.mocked(api.get).mockResolvedValue({ linked: false })

    const result = await isStaffLinked('staff-456')

    expect(result).toBe(false)
  })
})

describe('getStaffMemberForUser', () => {
  it('should return staff member ID for linked user', async () => {
    vi.mocked(api.get).mockResolvedValue({ staff_member_id: 'staff-789' })

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBe('staff-789')
    expect(api.get).toHaveBeenCalledWith('/staff-members/for-user/user-123')
  })

  it('should return null for user without staff link', async () => {
    vi.mocked(api.get).mockResolvedValue({ staff_member_id: null })

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBeNull()
  })

  it('should return null when profile not found', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Not found', 404))

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBeNull()
  })
})
