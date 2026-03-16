/**
 * Staff Payment Service
 * CRUD operations for staff payments
 */

import { supabase } from '../lib/supabase'
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
    const { data, error } = await supabase
      .from('staff_payments')
      .select(`
        *,
        staff_member:staff_members(id, first_name, last_name, position)
      `)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Failed to get payments:', error)
      return { data: [], error: 'Échec du chargement des paiements' }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting payments:', err)
    return { data: [], error: 'Erreur lors du chargement des paiements' }
  }
}

/**
 * Get payments for a specific staff member
 */
export async function getStaffPaymentsByStaffMember(
  staffMemberId: string
): Promise<ServiceResult<StaffPayment[]>> {
  try {
    const { data, error } = await supabase
      .from('staff_payments')
      .select('*')
      .eq('staff_member_id', staffMemberId)
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Failed to get payments for staff member:', error)
      return { data: [], error: 'Échec du chargement des paiements' }
    }

    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting payments for staff member:', err)
    return { data: [], error: 'Erreur lors du chargement des paiements' }
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

  // Get current user ID for RLS
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  try {
    const { data: created, error } = await supabase
      .from('staff_payments')
      .insert({ ...data, user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Failed to create payment:', error)
      return { error: 'Échec de la création du paiement' }
    }

    return { data: created, error: null }
  } catch (err) {
    console.error('Error creating payment:', err)
    return { error: 'Erreur lors de la création du paiement' }
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
    const { data: updated, error } = await supabase
      .from('staff_payments')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update payment:', error)
      return { error: 'Échec de la mise à jour du paiement' }
    }

    return { data: updated, error: null }
  } catch (err) {
    console.error('Error updating payment:', err)
    return { error: 'Erreur lors de la mise à jour du paiement' }
  }
}

/**
 * Delete a staff payment
 */
export async function deleteStaffPayment(id: string): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('staff_payments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete payment:', error)
      return { error: 'Échec de la suppression du paiement' }
    }

    return { error: null }
  } catch (err) {
    console.error('Error deleting payment:', err)
    return { error: 'Erreur lors de la suppression du paiement' }
  }
}
