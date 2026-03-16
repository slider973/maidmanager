/**
 * Work Session Service
 * Provides CRUD operations for work sessions (prestations)
 */

import { api, ApiError } from '../lib/api'
import type {
  WorkSession,
  WorkSessionWithStaff,
  WorkSessionInsert,
  WorkSessionUpdate,
  WorkSessionFilters,
} from '../lib/types/payments.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

export interface ValidationResult {
  error: string | null
  warning: string | null
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Validate work session data
 * @returns Object with error and warning fields
 */
export function validateWorkSession(data: WorkSessionInsert): ValidationResult {
  const result: ValidationResult = { error: null, warning: null }

  // Required fields
  if (!data.staff_member_id) {
    result.error = "L'employé est requis"
    return result
  }

  if (!data.session_date) {
    result.error = 'La date est requise'
    return result
  }

  if (!data.description || data.description.trim() === '') {
    result.error = 'La description est requise'
    return result
  }

  // Duration validation
  if (data.duration_minutes <= 0) {
    result.error = 'La durée doit être positive'
    return result
  }

  // Hourly rate validation
  if (data.hourly_rate_cents < 0) {
    result.error = 'Le tarif horaire ne peut pas être négatif'
    return result
  }

  // Warning for zero rate (volunteer work)
  if (data.hourly_rate_cents === 0) {
    result.warning = 'Tarif à 0€ - Travail bénévole ?'
  }

  // Date validation: cannot be in the future
  const sessionDateStr = data.session_date
  const todayStr = new Date().toISOString().split('T')[0]
  if (sessionDateStr > todayStr) {
    result.error = 'La date ne peut pas être dans le futur'
    return result
  }

  return result
}

/**
 * Validate work session update data
 */
export function validateWorkSessionUpdate(data: WorkSessionUpdate): ValidationResult {
  const result: ValidationResult = { error: null, warning: null }

  if (data.duration_minutes !== undefined && data.duration_minutes <= 0) {
    result.error = 'La durée doit être positive'
    return result
  }

  if (data.hourly_rate_cents !== undefined && data.hourly_rate_cents < 0) {
    result.error = 'Le tarif horaire ne peut pas être négatif'
    return result
  }

  if (data.hourly_rate_cents === 0) {
    result.warning = 'Tarif à 0€ - Travail bénévole ?'
  }

  if (data.description !== undefined && data.description.trim() === '') {
    result.error = 'La description est requise'
    return result
  }

  if (data.session_date !== undefined) {
    const sessionDateStr = data.session_date
    const todayStr = new Date().toISOString().split('T')[0]
    if (sessionDateStr > todayStr) {
      result.error = 'La date ne peut pas être dans le futur'
      return result
    }
  }

  return result
}

/**
 * Get all work sessions for the current user
 */
export async function getWorkSessions(
  filters?: WorkSessionFilters
): Promise<ServiceResult<WorkSessionWithStaff[]>> {
  try {
    const params = new URLSearchParams()
    if (filters?.staffMemberId) params.set('staff_member_id', filters.staffMemberId)
    if (filters?.startDate) params.set('start_date', filters.startDate)
    if (filters?.endDate) params.set('end_date', filters.endDate)

    const query = params.toString()
    const data = await api.get<WorkSessionWithStaff[]>(`/work-sessions${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get work sessions:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get work sessions for a specific staff member
 */
export async function getWorkSessionsByStaffMember(
  staffMemberId: string
): Promise<ServiceResult<WorkSessionWithStaff[]>> {
  try {
    const data = await api.get<WorkSessionWithStaff[]>(`/work-sessions?staff_member_id=${staffMemberId}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get work sessions for staff member:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single work session by ID
 */
export async function getWorkSession(
  id: string
): Promise<ServiceResult<WorkSessionWithStaff>> {
  try {
    const data = await api.get<WorkSessionWithStaff>(`/work-sessions/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get work session:', err)
    return { error: handleError(err) }
  }
}

/**
 * Create a new work session
 */
export async function createWorkSession(
  data: WorkSessionInsert
): Promise<ServiceResult<WorkSession>> {
  // Validate input
  const validation = validateWorkSession(data)
  if (validation.error) {
    return { error: validation.error }
  }

  try {
    const session = await api.post<WorkSession>('/work-sessions', data)
    return { data: session, error: null }
  } catch (err) {
    console.error('Failed to create work session:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update an existing work session
 */
export async function updateWorkSession(
  id: string,
  data: WorkSessionUpdate
): Promise<ServiceResult<WorkSession>> {
  // Validate update data
  const validation = validateWorkSessionUpdate(data)
  if (validation.error) {
    return { error: validation.error }
  }

  try {
    const session = await api.put<WorkSession>(`/work-sessions/${id}`, data)
    return { data: session, error: null }
  } catch (err) {
    console.error('Failed to update work session:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a work session
 */
export async function deleteWorkSession(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/work-sessions/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete work session:', err)
    return { error: handleError(err) }
  }
}

/**
 * Calculate total work amount for a staff member
 * @returns Total amount in cents
 */
export async function getTotalWorkForStaffMember(
  staffMemberId: string
): Promise<ServiceResult<number>> {
  try {
    const result = await api.get<{ total_cents: number }>(`/work-sessions/total?staff_member_id=${staffMemberId}`)
    return { data: result.total_cents, error: null }
  } catch (err) {
    console.error('Failed to get total work for staff member:', err)
    return { data: 0, error: handleError(err) }
  }
}
