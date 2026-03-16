/**
 * Staff History Service
 * Combines work sessions and payments into a unified timeline
 */

import { api, ApiError } from '../lib/api'
import type { HistoryEntry } from '../lib/types/payments.types'

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
 * Get combined history (work sessions + payments) for a staff member
 * Sorted by date descending (most recent first)
 */
export async function getStaffHistory(
  staffMemberId: string
): Promise<ServiceResult<HistoryEntry[]>> {
  try {
    const data = await api.get<HistoryEntry[]>(`/staff-history/${staffMemberId}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Error getting staff history:', err)
    return { error: handleError(err) }
  }
}
