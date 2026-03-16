/**
 * Task Service
 * Provides CRUD operations for tasks/missions
 */

import { supabase } from '../lib/supabase'
import type {
  Task,
  TaskInsert,
  TaskUpdate,
  TaskWithStaff,
  TaskStatus,
  ServiceResult,
  GetTasksParams,
} from '../lib/types/task.types'

/**
 * Validation messages in French
 */
const validationMessages = {
  staffMemberRequired: 'Veuillez sélectionner un membre du personnel',
  titleRequired: 'Le titre est requis',
  titleTooLong: 'Titre trop long (max 200 caractères)',
  dueDateRequired: "La date d'échéance est requise",
  descriptionTooLong: 'Description trop longue (max 1000 caractères)',
}

/**
 * Validate task data for creation
 * @returns Error message or null if valid
 */
export function validateTask(data: TaskInsert): string | null {
  // Required: staff_member_id
  if (!data.staff_member_id || data.staff_member_id.trim() === '') {
    return validationMessages.staffMemberRequired
  }

  // Required: title
  if (!data.title || data.title.trim() === '') {
    return validationMessages.titleRequired
  }

  // Title max length
  if (data.title.length > 200) {
    return validationMessages.titleTooLong
  }

  // Required: due_date
  if (!data.due_date || data.due_date.trim() === '') {
    return validationMessages.dueDateRequired
  }

  // Description max length (if provided)
  if (data.description && data.description.length > 1000) {
    return validationMessages.descriptionTooLong
  }

  return null
}

/**
 * Get all tasks for the current user
 */
export async function getTasks(
  params?: GetTasksParams
): Promise<ServiceResult<TaskWithStaff[]>> {
  try {
    let query = supabase
      .from('tasks')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          position
        )
      `)

    // Apply filters if provided
    if (params?.filters) {
      const { staffMemberId, status, priority } = params.filters

      if (staffMemberId) {
        query = query.eq('staff_member_id', staffMemberId)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (priority) {
        query = query.eq('priority', priority)
      }
    }

    // Order by due_date ascending (nearest first)
    const { data, error } = await query.order('due_date', { ascending: true })

    if (error) {
      throw error
    }

    return { data: (data as TaskWithStaff[]) || [], error: null }
  } catch (err) {
    console.error('Failed to get tasks:', err)
    return { data: [], error: 'Échec du chargement des missions' }
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(
  id: string
): Promise<ServiceResult<TaskWithStaff>> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        staff_member:staff_members (
          id,
          first_name,
          last_name,
          position
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { data: data as TaskWithStaff, error: null }
  } catch (err) {
    console.error('Failed to get task:', err)
    return { error: 'Mission non trouvée' }
  }
}

/**
 * Create a new task
 */
export async function createTask(
  data: TaskInsert
): Promise<ServiceResult<Task>> {
  // Validate input
  const validationError = validateTask(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: task, error: null }
  } catch (err) {
    console.error('Failed to create task:', err)
    return { error: 'Échec de la création de la mission' }
  }
}

/**
 * Update a task
 */
export async function updateTask(
  id: string,
  data: TaskUpdate
): Promise<ServiceResult<Task>> {
  // Validate update data if relevant fields are present
  if (data.title !== undefined) {
    if (data.title.trim() === '') {
      return { error: validationMessages.titleRequired }
    }
    if (data.title.length > 200) {
      return { error: validationMessages.titleTooLong }
    }
  }

  if (data.description !== undefined && data.description !== null && data.description.length > 1000) {
    return { error: validationMessages.descriptionTooLong }
  }

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data: task, error: null }
  } catch (err) {
    console.error('Failed to update task:', err)
    return { error: 'Échec de la modification de la mission' }
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to delete task:', err)
    return { error: 'Échec de la suppression de la mission' }
  }
}

/**
 * Update task status
 * Convenience method for quick status changes
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<ServiceResult> {
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id)

    if (error) {
      throw error
    }

    return { error: null }
  } catch (err) {
    console.error('Failed to update task status:', err)
    return { error: 'Échec de la modification de la mission' }
  }
}
