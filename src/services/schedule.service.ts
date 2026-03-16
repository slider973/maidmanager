/**
 * Schedule Service
 * Provides CRUD operations for schedule entries
 */

import { supabase } from '../lib/supabase'
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
    let query = supabase
      .from('schedule_entries')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          position
        ),
        client:clients (
          id,
          name
        )
      `)

    // Apply filters if provided
    if (params?.filters) {
      const { staffMemberId, clientId, status, dateFrom, dateTo } = params.filters

      if (staffMemberId) {
        query = query.eq('staff_member_id', staffMemberId)
      }
      if (clientId) {
        query = query.eq('client_id', clientId)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (dateFrom) {
        query = query.gte('scheduled_date', dateFrom)
      }
      if (dateTo) {
        query = query.lte('scheduled_date', dateTo)
      }
    }

    // Order by date and time
    const { data, error } = await query
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      throw error
    }

    return { data: (data as ScheduleEntryWithStaff[]) || [], error: null }
  } catch (err) {
    console.error('Failed to get schedule entries:', err)
    return { data: [], error: 'Échec du chargement des interventions' }
  }
}

/**
 * Get a single schedule entry by ID
 */
export async function getScheduleEntry(
  id: string
): Promise<ServiceResult<ScheduleEntryWithStaff>> {
  try {
    const { data, error } = await supabase
      .from('schedule_entries')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          position
        ),
        client:clients (
          id,
          name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { data: data as ScheduleEntryWithStaff, error: null }
  } catch (err) {
    console.error('Failed to get schedule entry:', err)
    return { error: 'Intervention non trouvée' }
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
    const { data: entry, error } = await supabase
      .from('schedule_entries')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: entry, error: null }
  } catch (err) {
    console.error('Failed to create schedule entry:', err)
    return { error: "Échec de la création de l'intervention" }
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
    const { data: entry, error } = await supabase
      .from('schedule_entries')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: entry, error: null }
  } catch (err) {
    console.error('Failed to update schedule entry:', err)
    return { error: "Échec de la modification de l'intervention" }
  }
}

/**
 * Delete a schedule entry
 */
export async function deleteScheduleEntry(id: string): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to delete schedule entry:', err)
    return { error: "Échec de la suppression de l'intervention" }
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
    const { error } = await supabase
      .from('schedule_entries')
      .update({ status })
      .eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to update schedule status:', err)
    return { error: "Échec de la modification de l'intervention" }
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
    const { data, error } = await supabase
      .from('schedule_entries')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          position
        ),
        client:clients (
          id,
          name
        )
      `)
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .is('invoice_line_id', null) // Not yet invoiced
      .order('scheduled_date', { ascending: true })

    if (error) {
      throw error
    }

    return { data: (data as ScheduleEntryWithStaff[]) || [], error: null }
  } catch (err) {
    console.error('Failed to get unbilled interventions:', err)
    return { data: [], error: 'Échec du chargement des interventions non facturées' }
  }
}
