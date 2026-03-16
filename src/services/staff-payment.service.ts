/**
 * Staff Payment Service
 * CRUD operations for staff payments
 */

import { api, ApiError } from '../lib/api'
import type {
  StaffPayment,
  StaffPaymentWithStaff,
  StaffPaymentInsert,
  StaffPaymentUpdate,
} from '../lib/types/payments.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Validate payment data
 */
function validatePayment(
  data: StaffPaymentInsert | StaffPaymentUpdate
): ServiceResult {
  // Validate amount is positive (if provided)
  if (data.amount_cents !== undefined && data.amount_cents <= 0) {
    return { error: 'Le montant doit être supérieur à 0' }
  }

  // Validate date is not in the future (if provided)
  if (data.payment_date) {
    const paymentDateStr = data.payment_date
    const todayStr = new Date().toISOString().split('T')[0]
    if (paymentDateStr > todayStr) {
      return { error: 'La date ne peut pas être dans le futur' }
    }
  }

  return { error: null }
}

/**
 * Get all payments with staff member details
 */
export async function getStaffPayments(): Promise<ServiceResult<StaffPaymentWithStaff[]>> {
  try {
    const data = await api.get<StaffPaymentWithStaff[]>('/staff-payments')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting payments:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get payments for a specific staff member
 */
export async function getStaffPaymentsByStaffMember(
  staffMemberId: string
): Promise<ServiceResult<StaffPayment[]>> {
  try {
    const data = await api.get<StaffPayment[]>(`/staff-payments?staff_member_id=${staffMemberId}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting payments for staff member:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Create a new staff payment
 */
export async function createStaffPayment(
  data: StaffPaymentInsert
): Promise<ServiceResult<StaffPayment>> {
  // Validate
  const validation = validatePayment(data)
  if (validation.error) {
    return { error: validation.error }
  }

  try {
    const created = await api.post<StaffPayment>('/staff-payments', data)
    return { data: created, error: null }
  } catch (err) {
    console.error('Error creating payment:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update an existing staff payment
 */
export async function updateStaffPayment(
  id: string,
  data: StaffPaymentUpdate
): Promise<ServiceResult<StaffPayment>> {
  // Validate
  const validation = validatePayment(data)
  if (validation.error) {
    return { error: validation.error }
  }

  try {
    const updated = await api.put<StaffPayment>(`/staff-payments/${id}`, data)
    return { data: updated, error: null }
  } catch (err) {
    console.error('Error updating payment:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a staff payment
 */
export async function deleteStaffPayment(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/staff-payments/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Error deleting payment:', err)
    return { error: handleError(err) }
  }
}
