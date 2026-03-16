/**
 * Staff Account Service Tests
 * Feature: 009-staff-portal
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  createInvitationLink,
  linkAccount,
  isStaffLinked,
  getStaffMemberForUser,
} from './staff-account.service'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('createInvitationLink', () => {
  it('should create invitation link for valid staff member', async () => {
    let callCount = 0
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      callCount++
      if (callCount === 1) {
        // First call: get staff member
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'staff-123', first_name: 'Marie', last_name: 'Dupont' },
                error: null,
              }),
            }),
          }),
        } as any
      } else if (callCount === 2) {
        // Second call: check existing profile
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        } as any
      } else if (callCount === 3) {
        // Third call: delete old invitations
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        } as any
      } else {
        // Fourth call: insert new invitation
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        } as any
      }
    })

    const result = await createInvitationLink('staff-123')

    expect(result.success).toBe(true)
    expect(result.invitationLink).toContain('/signup?invite=')
    expect(result.token).toBeDefined()
  })

  it('should return error when staff member not found', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    } as any)

    const result = await createInvitationLink('invalid-staff')

    expect(result.success).toBe(false)
    expect(result.message).toContain('introuvable')
  })

  it('should return error when staff already has account', async () => {
    const mockFrom = vi.fn()
    mockFrom.mockImplementation((table: string) => {
      if (table === 'staff_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'staff-123' },
                error: null,
              }),
            }),
          }),
        }
      }
      // profiles table - existing account found
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'existing-profile', staff_account_id: 'staff-123' },
              error: null,
            }),
          }),
        }),
      }
    })
    vi.mocked(supabase.from).mockImplementation(mockFrom)

    const result = await createInvitationLink('staff-123')

    expect(result.success).toBe(false)
    expect(result.message).toContain('existe deja')
  })
})

describe('linkAccount', () => {
  it('should link profile to staff member', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    } as any)

    const result = await linkAccount('profile-123', 'staff-456')

    expect(result.error).toBeNull()
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('should return error when profile update fails', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      }),
    } as any)

    const result = await linkAccount('profile-123', 'staff-456')

    expect(result.error).toBe('Update failed')
  })
})

describe('isStaffLinked', () => {
  it('should return true when staff has linked account', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'profile-123', staff_account_id: 'staff-456' },
            error: null,
          }),
        }),
      }),
    } as any)

    const result = await isStaffLinked('staff-456')

    expect(result).toBe(true)
  })

  it('should return false when staff has no linked account', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    } as any)

    const result = await isStaffLinked('staff-456')

    expect(result).toBe(false)
  })
})

describe('getStaffMemberForUser', () => {
  it('should return staff member ID for linked user', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { staff_account_id: 'staff-789' },
            error: null,
          }),
        }),
      }),
    } as any)

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBe('staff-789')
  })

  it('should return null for user without staff link', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { staff_account_id: null },
            error: null,
          }),
        }),
      }),
    } as any)

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBeNull()
  })

  it('should return null when profile not found', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Not found' },
          }),
        }),
      }),
    } as any)

    const result = await getStaffMemberForUser('user-123')

    expect(result).toBeNull()
  })
})
