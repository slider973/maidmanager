/**
 * Staff Balance Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../lib/api'
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
    vi.mocked(api.get).mockResolvedValue({
      total_work_cents: 7500,
      total_paid_cents: 2000,
      balance_cents: 5500,
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    // Total work: 4500 + 3000 = 7500
    // Total paid: 2000
    // Balance: 7500 - 2000 = 5500
    expect(result.data?.balance_cents).toBe(5500)
    expect(result.data?.total_work_cents).toBe(7500)
    expect(result.data?.total_paid_cents).toBe(2000)
    expect(api.get).toHaveBeenCalledWith('/staff-balances/staff-1')
  })

  it('should return zero balance when no work sessions or payments', async () => {
    vi.mocked(api.get).mockResolvedValue({
      total_work_cents: 0,
      total_paid_cents: 0,
      balance_cents: 0,
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    expect(result.data?.balance_cents).toBe(0)
    expect(result.data?.total_work_cents).toBe(0)
    expect(result.data?.total_paid_cents).toBe(0)
  })

  it('should return negative balance when payments exceed work', async () => {
    vi.mocked(api.get).mockResolvedValue({
      total_work_cents: 2000,
      total_paid_cents: 5000,
      balance_cents: -3000,
    })

    const result = await getStaffBalance('staff-1')

    expect(result.error).toBeNull()
    // Balance: 2000 - 5000 = -3000 (advance)
    expect(result.data?.balance_cents).toBe(-3000)
  })
})

describe('getStaffBalances', () => {
  it('should return balances for all staff members', async () => {
    const mockBalances = [
      {
        staff_member_id: 'staff-1',
        first_name: 'Marie',
        last_name: 'Dupont',
        position: 'housekeeper',
        total_work_cents: 5000,
        total_paid_cents: 0,
        balance_cents: 5000,
      },
      {
        staff_member_id: 'staff-2',
        first_name: 'Jean',
        last_name: 'Martin',
        position: 'gardener',
        total_work_cents: 5000,
        total_paid_cents: 0,
        balance_cents: 5000,
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockBalances)

    const result = await getStaffBalances()

    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
    expect(result.data?.length).toBe(2)
    expect(api.get).toHaveBeenCalledWith('/staff-balances')
  })
})

describe('getGlobalBalance', () => {
  it('should calculate total balance across all staff', async () => {
    vi.mocked(api.get).mockResolvedValue({
      total_work_cents: 15000,
      total_paid_cents: 3000,
      total_balance_cents: 12000,
    })

    const result = await getGlobalBalance()

    expect(result.error).toBeNull()
    // Total work: 15000
    // Total paid: 3000
    // Balance: 12000
    expect(result.data?.total_work_cents).toBe(15000)
    expect(result.data?.total_paid_cents).toBe(3000)
    expect(result.data?.total_balance_cents).toBe(12000)
    expect(api.get).toHaveBeenCalledWith('/staff-balances/global')
  })
})
