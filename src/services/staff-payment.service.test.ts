/**
 * Staff Payment Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getStaffPayments,
  getStaffPaymentsByStaffMember,
  createStaffPayment,
  updateStaffPayment,
  deleteStaffPayment,
} from './staff-payment.service'
import type { StaffPaymentInsert, StaffPaymentUpdate } from '../lib/types/payments.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('getStaffPayments', () => {
  it('should return all payments with staff member details', async () => {
    const mockPayments = [
      {
        id: 'payment-1',
        user_id: 'user-1',
        staff_member_id: 'staff-1',
        amount_cents: 5000,
        payment_date: '2026-02-07',
        payment_method: 'Espèces',
        notes: null,
        created_at: '2026-02-07T10:00:00Z',
        updated_at: '2026-02-07T10:00:00Z',
        staff_member: { id: 'staff-1', first_name: 'Marie', last_name: 'Dupont', position: 'housekeeper' },
      },
    ]

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockPayments,
            error: null,
          }),
        }),
      } as any
    })

    const result = await getStaffPayments()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0].amount_cents).toBe(5000)
    expect(result.data?.[0].staff_member?.first_name).toBe('Marie')
  })

  it('should return empty array when no payments', async () => {
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any
    })

    const result = await getStaffPayments()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should handle database errors', async () => {
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      } as any
    })

    const result = await getStaffPayments()

    expect(result.error).toBe('Échec du chargement des paiements')
    expect(result.data).toEqual([])
  })
})

describe('getStaffPaymentsByStaffMember', () => {
  it('should return payments filtered by staff member', async () => {
    const mockPayments = [
      {
        id: 'payment-1',
        staff_member_id: 'staff-1',
        amount_cents: 3000,
        payment_date: '2026-02-05',
        payment_method: 'Virement',
        notes: 'Acompte',
      },
      {
        id: 'payment-2',
        staff_member_id: 'staff-1',
        amount_cents: 4000,
        payment_date: '2026-02-07',
        payment_method: 'Espèces',
        notes: null,
      },
    ]

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockPayments,
              error: null,
            }),
          }),
        }),
      } as any
    })

    const result = await getStaffPaymentsByStaffMember('staff-1')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0].staff_member_id).toBe('staff-1')
  })
})

describe('createStaffPayment', () => {
  it('should create a new payment successfully', async () => {
    const paymentData: StaffPaymentInsert = {
      staff_member_id: 'staff-1',
      amount_cents: 5000,
      payment_date: '2026-02-07',
      payment_method: 'Espèces',
      notes: 'Payment for work done',
    }

    const mockCreated = {
      id: 'payment-new',
      user_id: 'user-1',
      ...paymentData,
      created_at: '2026-02-07T12:00:00Z',
      updated_at: '2026-02-07T12:00:00Z',
    }

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockCreated,
              error: null,
            }),
          }),
        }),
      } as any
    })

    const result = await createStaffPayment(paymentData)

    expect(result.error).toBeNull()
    expect(result.data?.amount_cents).toBe(5000)
    expect(result.data?.payment_method).toBe('Espèces')
  })

  it('should validate amount is positive', async () => {
    const paymentData: StaffPaymentInsert = {
      staff_member_id: 'staff-1',
      amount_cents: 0,
      payment_date: '2026-02-07',
    }

    const result = await createStaffPayment(paymentData)

    expect(result.error).toBe('Le montant doit être supérieur à 0')
    expect(result.data).toBeUndefined()
  })

  it('should validate amount is not negative', async () => {
    const paymentData: StaffPaymentInsert = {
      staff_member_id: 'staff-1',
      amount_cents: -1000,
      payment_date: '2026-02-07',
    }

    const result = await createStaffPayment(paymentData)

    expect(result.error).toBe('Le montant doit être supérieur à 0')
  })

  it('should validate date is not in the future', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const paymentData: StaffPaymentInsert = {
      staff_member_id: 'staff-1',
      amount_cents: 5000,
      payment_date: tomorrowStr,
    }

    const result = await createStaffPayment(paymentData)

    expect(result.error).toBe('La date ne peut pas être dans le futur')
  })

  it('should handle database errors', async () => {
    const paymentData: StaffPaymentInsert = {
      staff_member_id: 'staff-1',
      amount_cents: 5000,
      payment_date: '2026-02-07',
    }

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      } as any
    })

    const result = await createStaffPayment(paymentData)

    expect(result.error).toBe('Échec de la création du paiement')
  })
})

describe('updateStaffPayment', () => {
  it('should update an existing payment', async () => {
    const updateData: StaffPaymentUpdate = {
      amount_cents: 6000,
      notes: 'Updated notes',
    }

    const mockUpdated = {
      id: 'payment-1',
      user_id: 'user-1',
      staff_member_id: 'staff-1',
      amount_cents: 6000,
      payment_date: '2026-02-07',
      payment_method: 'Espèces',
      notes: 'Updated notes',
      created_at: '2026-02-07T10:00:00Z',
      updated_at: '2026-02-07T14:00:00Z',
    }

    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockUpdated,
                error: null,
              }),
            }),
          }),
        }),
      } as any
    })

    const result = await updateStaffPayment('payment-1', updateData)

    expect(result.error).toBeNull()
    expect(result.data?.amount_cents).toBe(6000)
    expect(result.data?.notes).toBe('Updated notes')
  })

  it('should validate amount is positive when updating', async () => {
    const updateData: StaffPaymentUpdate = {
      amount_cents: 0,
    }

    const result = await updateStaffPayment('payment-1', updateData)

    expect(result.error).toBe('Le montant doit être supérieur à 0')
  })

  it('should validate date is not in the future when updating', async () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const updateData: StaffPaymentUpdate = {
      payment_date: tomorrowStr,
    }

    const result = await updateStaffPayment('payment-1', updateData)

    expect(result.error).toBe('La date ne peut pas être dans le futur')
  })
})

describe('deleteStaffPayment', () => {
  it('should delete a payment successfully', async () => {
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      } as any
    })

    const result = await deleteStaffPayment('payment-1')

    expect(result.error).toBeNull()
  })

  it('should handle database errors', async () => {
    vi.mocked(supabase.from).mockImplementation((_table: string) => {
      return {
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      } as any
    })

    const result = await deleteStaffPayment('payment-1')

    expect(result.error).toBe('Échec de la suppression du paiement')
  })
})
