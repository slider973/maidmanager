/**
 * Schedule Service
 * Provides CRUD operations for schedule entries
 */

import { api, ApiError } from '../lib/api'
import type {
  ScheduleEntry,
  ScheduleEntryInsert,
  ScheduleEntryUpdate,
  ScheduleEntryWithStaff,
  ScheduleFilters,
  ScheduleStatus,
} from '../lib/types/database'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

export interface GetScheduleEntriesParams {
  filters?: ScheduleFilters
}

/**
 * Validation messages in French
 */
const validationMessages = {
  staffMemberRequired: 'Veuillez selectionner un membre du personnel',
  dateRequired: 'La date est requise',
  startTimeRequired: "L'heure de debut est requise",
  descriptionTooLong: 'Description trop longue (max 500 caracteres)',
  endTimeBeforeStart: "L'heure de fin doit etre apres l'heure de debut",
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Validate schedule entry data for creation
 * @returns Error message or null if valid
 */
export function validateScheduleEntry(data: ScheduleEntryInsert): string | null {
  // Required: staff_member_id
  if (!data.staff_member_id || data.staff_member_id.trim() === '') {
    return validationMessages.staffMemberRequired
  }

  // Required: scheduled_date
  if (!data.scheduled_date || data.scheduled_date.trim() === '') {
    return validationMessages.dateRequired
  }

  // Required: start_time
  if (!data.start_time || data.start_time.trim() === '') {
    return validationMessages.startTimeRequired
  }

  // Description max length (if provided)
  if (data.description && data.description.length > 500) {
    return validationMessages.descriptionTooLong
  }

  // end_time must be after start_time if provided
  if (data.end_time && data.end_time.trim() !== '') {
    const start = data.start_time.replace(':', '')
    const end = data.end_time.replace(':', '')
    if (parseInt(end, 10) <= parseInt(start, 10)) {
      return validationMessages.endTimeBeforeStart
    }
  }

  return null
}

/**
 * Get all schedule entries for the current user
 */
export async function getScheduleEntries(
  params?: GetScheduleEntriesParams
): Promise<ServiceResult<ScheduleEntryWithStaff[]>> {
  try {
    const urlParams = new URLSearchParams()

    if (params?.filters) {
      const { staffMemberId, clientId, status, dateFrom, dateTo } = params.filters
      if (staffMemberId) urlParams.set('staff_member_id', staffMemberId)
      if (clientId) urlParams.set('client_id', clientId)
      if (status) urlParams.set('status', status)
      if (dateFrom) urlParams.set('date_from', dateFrom)
      if (dateTo) urlParams.set('date_to', dateTo)
    }

    const query = urlParams.toString()
    const data = await api.get<ScheduleEntryWithStaff[]>(`/schedule-entries${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get schedule entries:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single schedule entry by ID
 */
export async function getScheduleEntry(
  id: string
): Promise<ServiceResult<ScheduleEntryWithStaff>> {
  try {
    const data = await api.get<ScheduleEntryWithStaff>(`/schedule-entries/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get schedule entry:', err)
    return { error: handleError(err) }
  }
}

/**
 * Create a new schedule entry
 */
export async function createScheduleEntry(
  data: ScheduleEntryInsert
): Promise<ServiceResult<ScheduleEntry>> {
  // Validate input
  const validationError = validateScheduleEntry(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const entry = await api.post<ScheduleEntry>('/schedule-entries', data)
    return { data: entry, error: null }
  } catch (err) {
    console.error('Failed to create schedule entry:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update a schedule entry
 */
export async function updateScheduleEntry(
  id: string,
  data: ScheduleEntryUpdate
): Promise<ServiceResult<ScheduleEntry>> {
  // Validate description max length if provided
  if (data.description !== undefined && data.description.length > 500) {
    return { error: validationMessages.descriptionTooLong }
  }

  // Validate end_time vs start_time if both are provided in update
  if (data.start_time && data.end_time) {
    const start = data.start_time.replace(':', '')
    const end = data.end_time.replace(':', '')
    if (parseInt(end, 10) <= parseInt(start, 10)) {
      return { error: validationMessages.endTimeBeforeStart }
    }
  }

  try {
    const entry = await api.put<ScheduleEntry>(`/schedule-entries/${id}`, data)
    return { data: entry, error: null }
  } catch (err) {
    console.error('Failed to update schedule entry:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a schedule entry
 */
export async function deleteScheduleEntry(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/schedule-entries/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete schedule entry:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update schedule entry status
 * Convenience method for quick status changes
 */
export async function updateScheduleStatus(
  id: string,
  status: ScheduleStatus
): Promise<ServiceResult> {
  try {
    await api.put(`/schedule-entries/${id}`, { status })
    return { error: null }
  } catch (err) {
    console.error('Failed to update schedule status:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get unbilled completed interventions for a specific client
 * Used for invoice creation
 */
export async function getUnbilledInterventions(
  clientId: string
): Promise<ServiceResult<ScheduleEntryWithStaff[]>> {
  try {
    const data = await api.get<ScheduleEntryWithStaff[]>(
      `/schedule-entries?client_id=${clientId}&status=completed&unbilled=true`
    )
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get unbilled interventions:', err)
    return { data: [], error: handleError(err) }
  }
}
