/**
 * Work Session Service
 * Provides CRUD operations for work sessions (prestations)
 */

import { supabase } from '../lib/supabase'
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
  // Parse dates as YYYY-MM-DD strings to avoid timezone issues
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
  let query = supabase
    .from('work_sessions')
    .select(`
      *,
      staff_member:staff_members(
        id,
        first_name,
        last_name,
        position
      )
    `)

  // Apply filters
  if (filters?.staffMemberId) {
    query = query.eq('staff_member_id', filters.staffMemberId)
  }
  if (filters?.startDate) {
    query = query.gte('session_date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('session_date', filters.endDate)
  }

  const { data, error } = await query.order('session_date', { ascending: false })

  if (error) {
    console.error('Failed to get work sessions:', error)
    return { data: [], error: 'Échec du chargement des prestations' }
  }

  return { data: data || [], error: null }
}

/**
 * Get work sessions for a specific staff member
 */
export async function getWorkSessionsByStaffMember(
  staffMemberId: string
): Promise<ServiceResult<WorkSessionWithStaff[]>> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select(`
      *,
      staff_member:staff_members(
        id,
        first_name,
        last_name,
        position
      )
    `)
    .eq('staff_member_id', staffMemberId)
    .order('session_date', { ascending: false })

  if (error) {
    console.error('Failed to get work sessions for staff member:', error)
    return { data: [], error: 'Échec du chargement des prestations' }
  }

  return { data: data || [], error: null }
}

/**
 * Get a single work session by ID
 */
export async function getWorkSession(
  id: string
): Promise<ServiceResult<WorkSessionWithStaff>> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select(`
      *,
      staff_member:staff_members(
        id,
        first_name,
        last_name,
        position
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to get work session:', error)
    return { error: 'Prestation non trouvée' }
  }

  return { data, error: null }
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

  // Get current user ID for RLS
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifié' }
  }

  const { data: session, error } = await supabase
    .from('work_sessions')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) {
    console.error('Failed to create work session:', error)
    return { error: 'Échec de la création de la prestation' }
  }

  return { data: session, error: null }
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

  const { data: session, error } = await supabase
    .from('work_sessions')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update work session:', error)
    return { error: 'Échec de la mise à jour de la prestation' }
  }

  return { data: session, error: null }
}

/**
 * Delete a work session
 */
export async function deleteWorkSession(id: string): Promise<ServiceResult> {
  const { error } = await supabase.from('work_sessions').delete().eq('id', id)

  if (error) {
    console.error('Failed to delete work session:', error)
    return { error: 'Échec de la suppression de la prestation' }
  }

  return { error: null }
}

/**
 * Calculate total work amount for a staff member
 * @returns Total amount in cents
 */
export async function getTotalWorkForStaffMember(
  staffMemberId: string
): Promise<ServiceResult<number>> {
  const { data, error } = await supabase
    .from('work_sessions')
    .select('amount_cents')
    .eq('staff_member_id', staffMemberId)

  if (error) {
    console.error('Failed to get total work for staff member:', error)
    return { data: 0, error: 'Échec du calcul du total' }
  }

  const total = (data || []).reduce((sum, session) => sum + session.amount_cents, 0)
  return { data: total, error: null }
}
