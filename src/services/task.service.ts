/**
 * Task Service
 * Provides CRUD operations for tasks/missions
 */

import { api, ApiError } from '../lib/api'
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

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
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
    const urlParams = new URLSearchParams()

    if (params?.filters) {
      const { staffMemberId, status, priority } = params.filters
      if (staffMemberId) urlParams.set('staff_member_id', staffMemberId)
      if (status) urlParams.set('status', status)
      if (priority) urlParams.set('priority', priority)
    }

    const query = urlParams.toString()
    const data = await api.get<TaskWithStaff[]>(`/tasks${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get tasks:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single task by ID
 */
export async function getTask(
  id: string
): Promise<ServiceResult<TaskWithStaff>> {
  try {
    const data = await api.get<TaskWithStaff>(`/tasks/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get task:', err)
    return { error: handleError(err) }
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
    const task = await api.post<Task>('/tasks', data)
    return { data: task, error: null }
  } catch (err) {
    console.error('Failed to create task:', err)
    return { error: handleError(err) }
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
    const task = await api.put<Task>(`/tasks/${id}`, data)
    return { data: task, error: null }
  } catch (err) {
    console.error('Failed to update task:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/tasks/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete task:', err)
    return { error: handleError(err) }
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
    await api.put(`/tasks/${id}`, { status })
    return { error: null }
  } catch (err) {
    console.error('Failed to update task status:', err)
    return { error: handleError(err) }
  }
}
