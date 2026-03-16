/**
 * Staff Balance Service
 * Calculates balances (work sessions - payments) for staff members
 */

import { api, ApiError } from '../lib/api'
import type { StaffBalance, GlobalBalance } from '../lib/types/payments.types'

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
 * Get balance for a single staff member
 * Balance = total work sessions - total payments
 */
export async function getStaffBalance(
  staffMemberId: string
): Promise<ServiceResult<{ total_work_cents: number; total_paid_cents: number; balance_cents: number }>> {
  try {
    const data = await api.get<{ total_work_cents: number; total_paid_cents: number; balance_cents: number }>(
      `/staff-balances/${staffMemberId}`
    )
    return { data, error: null }
  } catch (err) {
    console.error('Error calculating staff balance:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get balances for all active staff members
 */
export async function getStaffBalances(): Promise<ServiceResult<StaffBalance[]>> {
  try {
    const data = await api.get<StaffBalance[]>('/staff-balances')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting staff balances:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get global balance (total across all staff)
 */
export async function getGlobalBalance(): Promise<ServiceResult<GlobalBalance>> {
  try {
    const data = await api.get<GlobalBalance>('/staff-balances/global')
    return { data, error: null }
  } catch (err) {
    console.error('Error calculating global balance:', err)
    return { error: handleError(err) }
  }
}
