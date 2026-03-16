/**
 * Staff Balance Service
 * Calculates balances (work sessions - payments) for staff members
 */

import { supabase } from '../lib/supabase'
import type { StaffBalance, GlobalBalance } from '../lib/types/payments.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

/**
 * Get balance for a single staff member
 * Balance = total work sessions - total payments
 */
export async function getStaffBalance(
  staffMemberId: string
): Promise<ServiceResult<{ total_work_cents: number; total_paid_cents: number; balance_cents: number }>> {
  try {
    // Get total work amount
    const { data: workData, error: workError } = await supabase
      .from('work_sessions')
      .select('amount_cents')
      .eq('staff_member_id', staffMemberId)

    if (workError) {
      console.error('Failed to get work sessions for balance:', workError)
      return { error: 'Échec du calcul du solde' }
    }

    // Get total payments
    const { data: paymentData, error: paymentError } = await supabase
      .from('staff_payments')
      .select('amount_cents')
      .eq('staff_member_id', staffMemberId)

    if (paymentError) {
      console.error('Failed to get payments for balance:', paymentError)
      return { error: 'Échec du calcul du solde' }
    }

    const totalWork = (workData || []).reduce((sum, row) => sum + row.amount_cents, 0)
    const totalPaid = (paymentData || []).reduce((sum, row) => sum + row.amount_cents, 0)
    const balance = totalWork - totalPaid

    return {
      data: {
        total_work_cents: totalWork,
        total_paid_cents: totalPaid,
        balance_cents: balance,
      },
      error: null,
    }
  } catch (err) {
    console.error('Error calculating staff balance:', err)
    return { error: 'Erreur lors du calcul du solde' }
  }
}

/**
 * Get balances for all active staff members
 */
export async function getStaffBalances(): Promise<ServiceResult<StaffBalance[]>> {
  try {
    // Get all active staff members
    const { data: staffMembers, error: staffError } = await supabase
      .from('staff_members')
      .select('id, first_name, last_name, position')

    if (staffError) {
      console.error('Failed to get staff members for balances:', staffError)
      return { data: [], error: 'Échec du chargement des soldes' }
    }

    // Calculate balance for each staff member
    const balances: StaffBalance[] = []

    for (const staff of staffMembers || []) {
      const balanceResult = await getStaffBalance(staff.id)

      if (!balanceResult.error && balanceResult.data) {
        balances.push({
          staff_member_id: staff.id,
          first_name: staff.first_name,
          last_name: staff.last_name,
          position: staff.position,
          total_work_cents: balanceResult.data.total_work_cents,
          total_paid_cents: balanceResult.data.total_paid_cents,
          balance_cents: balanceResult.data.balance_cents,
        })
      }
    }

    return { data: balances, error: null }
  } catch (err) {
    console.error('Error getting staff balances:', err)
    return { data: [], error: 'Erreur lors du chargement des soldes' }
  }
}

/**
 * Get global balance (total across all staff)
 */
export async function getGlobalBalance(): Promise<ServiceResult<GlobalBalance>> {
  try {
    // Get total work amount across all staff
    const { data: workData, error: workError } = await supabase
      .from('work_sessions')
      .select('amount_cents')

    if (workError) {
      console.error('Failed to get work sessions for global balance:', workError)
      return { error: 'Échec du calcul du solde global' }
    }

    // Get total payments across all staff
    const { data: paymentData, error: paymentError } = await supabase
      .from('staff_payments')
      .select('amount_cents')

    if (paymentError) {
      console.error('Failed to get payments for global balance:', paymentError)
      return { error: 'Échec du calcul du solde global' }
    }

    // Get staff count
    const { data: staffData, error: staffError } = await supabase
      .from('staff_members')
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (staffError) {
      console.error('Failed to get staff count:', staffError)
      return { error: 'Échec du calcul du solde global' }
    }

    const totalWork = (workData || []).reduce((sum, row) => sum + row.amount_cents, 0)
    const totalPaid = (paymentData || []).reduce((sum, row) => sum + row.amount_cents, 0)

    return {
      data: {
        total_work_cents: totalWork,
        total_paid_cents: totalPaid,
        total_balance_cents: totalWork - totalPaid,
        staff_count: staffData?.length || 0,
      },
      error: null,
    }
  } catch (err) {
    console.error('Error calculating global balance:', err)
    return { error: 'Erreur lors du calcul du solde global' }
  }
}
