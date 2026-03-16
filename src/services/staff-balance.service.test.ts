/**
 * Staff Balance Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getStaffBalance,
  getStaffBalances,
  getGlobalBalance,
} from './staff-balance.service'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStaffBalance', () => {
  it('should calculate balance correctly (work - payments)', async () => {
    // Mock work sessions sum
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'work_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ amount_cents: 4500 }, { amount_cents: 3000 }],
              error: null,
            }),
          }),
        } as any
      }
      if (table === 'staff_payments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ amount_cents: 2000 }],
              error: null,
            }),
          }),
        } as any
      }
      return {} as any
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    // Total work: 4500 + 3000 = 7500
    // Total paid: 2000
    // Balance: 7500 - 2000 = 5500
    expect(result.data?.balance_cents).toBe(5500)
    expect(result.data?.total_work_cents).toBe(7500)
    expect(result.data?.total_paid_cents).toBe(2000)
  })

  it('should return zero balance when no work sessions or payments', async () => {
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    expect(result.data?.balance_cents).toBe(0)
    expect(result.data?.total_work_cents).toBe(0)
    expect(result.data?.total_paid_cents).toBe(0)
  })

  it('should return negative balance when payments exceed work', async () => {
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'work_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ amount_cents: 2000 }],
              error: null,
            }),
          }),
        } as any
      }
      if (table === 'staff_payments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ amount_cents: 5000 }],
              error: null,
            }),
          }),
        } as any
      }
      return {} as any
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    // Balance: 2000 - 5000 = -3000 (advance)
    expect(result.data?.balance_cents).toBe(-3000)
  })
})

describe('getStaffBalances', () => {
  it('should return balances for all staff members', async () => {
    const mockStaffMembers = [
      { id: 'staff-1', first_name: 'Marie', last_name: 'Dupont', position: 'housekeeper' },
      { id: 'staff-2', first_name: 'Jean', last_name: 'Martin', position: 'gardener' },
    ]

    // This is a simplified test - actual implementation will need to join tables
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'staff_members') {
        return {
          select: vi.fn().mockResolvedValue({
            data: mockStaffMembers,
            error: null,
          }),
        } as any
      }
      if (table === 'work_sessions') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ amount_cents: 5000 }],
              error: null,
            }),
          }),
        } as any
      }
      if (table === 'staff_payments') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        } as any
      }
      return {} as any
    })

    const result = await getStaffBalances()

    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
    expect(result.data?.length).toBe(2)
  })
})

describe('getGlobalBalance', () => {
  it('should calculate total balance across all staff', async () => {
    // Mock aggregated data
    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'work_sessions') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ amount_cents: 10000 }, { amount_cents: 5000 }],
            error: null,
          }),
        } as any
      }
      if (table === 'staff_payments') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [{ amount_cents: 3000 }],
            error: null,
          }),
        } as any
      }
      if (table === 'staff_members') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [{ id: 'staff-1' }, { id: 'staff-2' }],
              count: 2,
              error: null,
            }),
          }),
        } as any
      }
      return {} as any
    })

    const result = await getGlobalBalance()

    expect(result.error).toBeNull()
    // Total work: 15000
    // Total paid: 3000
    // Balance: 12000
    expect(result.data?.total_work_cents).toBe(15000)
    expect(result.data?.total_paid_cents).toBe(3000)
    expect(result.data?.total_balance_cents).toBe(12000)
  })
})
