/**
 * Time Entry Service Tests
 * Feature: 009-staff-portal (US2)
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  clockIn,
  clockOut,
  getCurrentEntry,
  getMissingEntries,
  calculateDuration,
} from './time-entry.service'
import type { ClockInRequest } from '../lib/types/portal.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('clockIn', () => {
  const validRequest: ClockInRequest = {
    client_id: 'client-123',
    notes: 'Test clock in',
  }

  it('should create a new time entry on clock in', async () => {
    const mockEntry = {
      id: 'entry-1',
      user_id: 'user-123',
      staff_member_id: 'staff-456',
      client_id: 'client-123',
      clock_in_at: '2026-02-07T08:00:00Z',
      clock_out_at: null,
      duration_minutes: null,
      work_session_id: null,
      status: 'open',
      notes: 'Test clock in',
      created_at: '2026-02-07T08:00:00Z',
      updated_at: '2026-02-07T08:00:00Z',
    }

    let callCount = 0
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      callCount++
      if (callCount === 1) {
        // First call: check for existing open entry
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        } as any
      } else if (callCount === 2) {
        // Second call: get staff member user_id
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-123' },
                error: null,
              }),
            }),
          }),
        } as any
      }
      // Third call: insert new entry
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEntry, error: null }),
          }),
        }),
      } as any
    })

    const result = await clockIn('staff-456', validRequest)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockEntry)
    expect(result.data?.status).toBe('open')
    expect(result.data?.clock_out_at).toBeNull()
  })

  it('should return error when client_id is missing', async () => {
    const invalidRequest = { client_id: '' }

    const result = await clockIn('staff-456', invalidRequest)

    expect(result.error).toBe('Le client est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return error when staff already has open entry', async () => {
    // Mock check for existing open entry
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: { id: 'existing-entry', status: 'open' },
              error: null,
            }),
          }),
        }),
      }),
    } as any)

    const result = await clockIn('staff-456', validRequest)

    expect(result.error).toContain('deja pointe')
    expect(result.data).toBeUndefined()
  })
})

describe('clockOut', () => {
  it('should close the open time entry', async () => {
    const mockUpdatedEntry = {
      id: 'entry-1',
      user_id: 'user-123',
      staff_member_id: 'staff-456',
      client_id: 'client-123',
      clock_in_at: '2026-02-07T08:00:00Z',
      clock_out_at: '2026-02-07T12:00:00Z',
      duration_minutes: 240,
      work_session_id: null,
      status: 'closed',
      notes: null,
      created_at: '2026-02-07T08:00:00Z',
      updated_at: '2026-02-07T12:00:00Z',
    }

    let callCount = 0
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      callCount++
      if (callCount === 1) {
        // First call: get current open entry
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'entry-1',
                    clock_in_at: '2026-02-07T08:00:00Z',
                    staff_member_id: 'staff-456',
                    client_id: 'client-123',
                    user_id: 'user-123',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        } as any
      } else if (callCount === 2) {
        // Second call: update entry
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: mockUpdatedEntry,
                  error: null,
                }),
              }),
            }),
          }),
        } as any
      } else if (callCount === 3) {
        // Third call: get staff hourly_rate_cents for work_session
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { hourly_rate_cents: 2500 },
                error: null,
              }),
            }),
          }),
        } as any
      } else if (callCount === 4) {
        // Fourth call: insert work_session
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'ws-1' },
                error: null,
              }),
            }),
          }),
        } as any
      }
      // Fifth call: update time_entry with work_session_id
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      } as any
    })

    const result = await clockOut('staff-456')

    expect(result.error).toBeNull()
    expect(result.data?.status).toBe('closed')
    expect(result.data?.clock_out_at).toBeDefined()
    expect(result.data?.duration_minutes).toBe(240)
  })

  it('should return error when no open entry exists', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
    } as any)

    const result = await clockOut('staff-456')

    expect(result.error).toContain('pas de pointage')
    expect(result.data).toBeUndefined()
  })
})

describe('getCurrentEntry', () => {
  it('should return the current open entry', async () => {
    const mockEntry = {
      id: 'entry-1',
      staff_member_id: 'staff-456',
      client_id: 'client-123',
      clock_in_at: '2026-02-07T08:00:00Z',
      status: 'open',
      client: { id: 'client-123', name: 'Famille Dupont' },
    }

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: mockEntry, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await getCurrentEntry('staff-456')

    expect(result.data).toEqual(mockEntry)
    expect(result.error).toBeNull()
  })

  it('should return null when no open entry', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await getCurrentEntry('staff-456')

    expect(result.data).toBeNull()
    expect(result.error).toBeNull()
  })
})

describe('getMissingEntries', () => {
  it('should return entries without clock_out', async () => {
    const mockEntries = [
      {
        id: 'entry-1',
        clock_in_at: '2026-02-06T08:00:00Z',
        clock_out_at: null,
        status: 'open',
        client: { name: 'Famille Dupont' },
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockEntries, error: null }),
            }),
          }),
        }),
      }),
    } as any)

    const result = await getMissingEntries('staff-456')

    expect(result.data).toHaveLength(1)
    expect(result.data?.[0].clock_out_at).toBeNull()
  })

  it('should return empty array when no missing entries', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }),
    } as any)

    const result = await getMissingEntries('staff-456')

    expect(result.data).toHaveLength(0)
  })
})

describe('calculateDuration', () => {
  it('should calculate duration in minutes', () => {
    const clockIn = '2026-02-07T08:00:00Z'
    const clockOut = '2026-02-07T12:00:00Z'

    const duration = calculateDuration(clockIn, clockOut)

    expect(duration).toBe(240) // 4 hours = 240 minutes
  })

  it('should handle partial hours', () => {
    const clockIn = '2026-02-07T08:00:00Z'
    const clockOut = '2026-02-07T08:45:00Z'

    const duration = calculateDuration(clockIn, clockOut)

    expect(duration).toBe(45)
  })

  it('should return 0 for invalid dates', () => {
    const duration = calculateDuration('invalid', 'also-invalid')

    expect(duration).toBe(0)
  })
})
