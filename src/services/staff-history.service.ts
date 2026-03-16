/**
 * Staff History Service
 * Combines work sessions and payments into a unified timeline
 */

import { supabase } from '../lib/supabase'
import type { HistoryEntry, HistoryEntryType } from '../lib/types/payments.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

/**
 * Get combined history (work sessions + payments) for a staff member
 * Sorted by date descending (most recent first)
 */
export async function getStaffHistory(
  staffMemberId: string
): Promise<ServiceResult<HistoryEntry[]>> {
  try {
    // Fetch work sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('work_sessions')
      .select('id, session_date, amount_cents, description, notes, created_at')
      .eq('staff_member_id', staffMemberId)

    if (sessionsError) {
      console.error('Failed to get work sessions for history:', sessionsError)
      return { error: 'Échec du chargement de l\'historique' }
    }

    // Fetch payments
    const { data: payments, error: paymentsError } = await supabase
      .from('staff_payments')
      .select('id, payment_date, amount_cents, payment_method, notes, created_at')
      .eq('staff_member_id', staffMemberId)

    if (paymentsError) {
      console.error('Failed to get payments for history:', paymentsError)
      return { error: 'Échec du chargement de l\'historique' }
    }

    // Convert to unified history entries
    const workEntries: HistoryEntry[] = (sessions || []).map((s) => ({
      id: s.id,
      type: 'work_session' as HistoryEntryType,
      date: s.session_date,
      amount_cents: s.amount_cents,
      description: s.description,
      details: s.notes,
      created_at: s.created_at,
    }))

    const paymentEntries: HistoryEntry[] = (payments || []).map((p) => ({
      id: p.id,
      type: 'payment' as HistoryEntryType,
      date: p.payment_date,
      amount_cents: -p.amount_cents, // Negative for payments (reduces balance)
      description: p.payment_method ? `Paiement (${p.payment_method})` : 'Paiement',
      details: p.notes,
      created_at: p.created_at,
    }))

    // Combine and sort by date (most recent first), then by created_at for same date
    const combined = [...workEntries, ...paymentEntries].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date)
      if (dateCompare !== 0) return dateCompare
      return b.created_at.localeCompare(a.created_at)
    })

    return { data: combined, error: null }
  } catch (err) {
    console.error('Error getting staff history:', err)
    return { error: 'Erreur lors du chargement de l\'historique' }
  }
}
