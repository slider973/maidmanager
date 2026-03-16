/**
 * Task Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
  validateTask,
} from './task.service'
import type { TaskInsert, TaskWithStaff } from '../lib/types/task.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('validateTask', () => {
  const validData: TaskInsert = {
    staff_member_id: 'staff-1',
    title: 'Nettoyer les vitres',
    due_date: '2026-02-10',
  }

  it('should return null for valid data', () => {
    expect(validateTask(validData)).toBeNull()
  })

  it('should return error for empty staff_member_id', () => {
    const data = { ...validData, staff_member_id: '' }
    expect(validateTask(data)).toBe('Veuillez sélectionner un membre du personnel')
  })

  it('should return error for empty title', () => {
    const data = { ...validData, title: '' }
    expect(validateTask(data)).toBe('Le titre est requis')
  })

  it('should return error for whitespace-only title', () => {
    const data = { ...validData, title: '   ' }
    expect(validateTask(data)).toBe('Le titre est requis')
  })

  it('should return error for title over 200 characters', () => {
    const data = { ...validData, title: 'a'.repeat(201) }
    expect(validateTask(data)).toBe('Titre trop long (max 200 caractères)')
  })

  it('should return error for empty due_date', () => {
    const data = { ...validData, due_date: '' }
    expect(validateTask(data)).toBe("La date d'échéance est requise")
  })

  it('should return error for description over 1000 characters', () => {
    const data = { ...validData, description: 'a'.repeat(1001) }
    expect(validateTask(data)).toBe('Description trop longue (max 1000 caractères)')
  })

  it('should pass with valid description under 1000 characters', () => {
    const data = { ...validData, description: 'a'.repeat(1000) }
    expect(validateTask(data)).toBeNull()
  })

  it('should pass with null description', () => {
    const data = { ...validData, description: null }
    expect(validateTask(data)).toBeNull()
  })

  it('should pass with undefined description', () => {
    const data = { ...validData }
    delete (data as any).description
    expect(validateTask(data)).toBeNull()
  })
})

describe('getTasks', () => {
  const mockTasks: TaskWithStaff[] = [
    {
      id: 'task-1',
      user_id: 'test-user-id',
      staff_member_id: 'staff-1',
      title: 'Nettoyer les vitres',
      description: null,
      due_date: '2026-02-10',
      priority: 'normal',
      status: 'pending',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-1',
        first_name: 'Marie',
        last_name: 'Dupont',
        position: 'housekeeper',
      },
    },
    {
      id: 'task-2',
      user_id: 'test-user-id',
      staff_member_id: 'staff-2',
      title: 'Tailler les haies',
      description: 'Avant le weekend',
      due_date: '2026-02-11',
      priority: 'high',
      status: 'pending',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-2',
        first_name: 'Jean',
        last_name: 'Martin',
        position: 'gardener',
      },
    },
  ]

  it('should return all tasks for the user', async () => {
    vi.mocked(api.get).mockResolvedValue(mockTasks)

    const result = await getTasks()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(mockTasks)
    expect(api.get).toHaveBeenCalledWith('/tasks')
  })

  it('should return empty array when no tasks', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getTasks()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should filter by staffMemberId when provided', async () => {
    const filteredTasks = [mockTasks[0]]

    vi.mocked(api.get).mockResolvedValue(filteredTasks)

    const result = await getTasks({ filters: { staffMemberId: 'staff-1' } })

    expect(result.error).toBeNull()
    expect(result.data).toEqual(filteredTasks)
    expect(api.get).toHaveBeenCalledWith('/tasks?staff_member_id=staff-1')
  })

  it('should filter by status when provided', async () => {
    const completedTask: TaskWithStaff = {
      ...mockTasks[0],
      status: 'completed',
    }

    vi.mocked(api.get).mockResolvedValue([completedTask])

    const result = await getTasks({ filters: { status: 'completed' } })

    expect(result.error).toBeNull()
    expect(result.data?.[0]?.status).toBe('completed')
    expect(api.get).toHaveBeenCalledWith('/tasks?status=completed')
  })

  it('should filter by priority when provided', async () => {
    const urgentTask: TaskWithStaff = {
      ...mockTasks[0],
      priority: 'urgent',
    }

    vi.mocked(api.get).mockResolvedValue([urgentTask])

    const result = await getTasks({ filters: { priority: 'urgent' } })

    expect(result.error).toBeNull()
    expect(result.data?.[0]?.priority).toBe('urgent')
    expect(api.get).toHaveBeenCalledWith('/tasks?priority=urgent')
  })

  it('should handle API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Database error', 500))

    const result = await getTasks()

    expect(result.error).toBe('Database error')
    expect(result.data).toEqual([])
  })
})

describe('createTask', () => {
  const validData: TaskInsert = {
    staff_member_id: 'staff-1',
    title: 'Nettoyer les vitres',
    due_date: '2026-02-10',
  }

  it('should create a task with valid data', async () => {
    const mockTask = {
      id: 'task-1',
      user_id: 'test-user-id',
      ...validData,
      description: null,
      priority: 'normal',
      status: 'pending',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockTask)

    const result = await createTask(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockTask)
    expect(api.post).toHaveBeenCalledWith('/tasks', validData)
  })

  it('should return validation error when staff_member_id is missing', async () => {
    const invalidData = { ...validData, staff_member_id: '' }

    const result = await createTask(invalidData)

    expect(result.error).toBe('Veuillez sélectionner un membre du personnel')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when title is missing', async () => {
    const invalidData = { ...validData, title: '' }

    const result = await createTask(invalidData)

    expect(result.error).toBe('Le titre est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when due_date is missing', async () => {
    const invalidData = { ...validData, due_date: '' }

    const result = await createTask(invalidData)

    expect(result.error).toBe("La date d'échéance est requise")
    expect(result.data).toBeUndefined()
  })

  it('should handle API error', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Database error', 500))

    const result = await createTask(validData)

    expect(result.error).toBe('Database error')
    expect(result.data).toBeUndefined()
  })
})

describe('updateTask', () => {
  const mockTask = {
    id: 'task-1',
    user_id: 'test-user-id',
    staff_member_id: 'staff-1',
    title: 'Updated title',
    description: null,
    due_date: '2026-02-10',
    priority: 'normal',
    status: 'pending',
    notes: null,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
  }

  it('should update a task', async () => {
    vi.mocked(api.put).mockResolvedValue(mockTask)

    const result = await updateTask('task-1', { title: 'Updated title' })

    expect(result.error).toBeNull()
    expect(result.data?.title).toBe('Updated title')
    expect(api.put).toHaveBeenCalledWith('/tasks/task-1', { title: 'Updated title' })
  })

  it('should return validation error when title is empty', async () => {
    const result = await updateTask('task-1', { title: '' })

    expect(result.error).toBe('Le titre est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when title is too long', async () => {
    const result = await updateTask('task-1', { title: 'a'.repeat(201) })

    expect(result.error).toBe('Titre trop long (max 200 caractères)')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when description is too long', async () => {
    const result = await updateTask('task-1', { description: 'a'.repeat(1001) })

    expect(result.error).toBe('Description trop longue (max 1000 caractères)')
    expect(result.data).toBeUndefined()
  })

  it('should handle API error', async () => {
    vi.mocked(api.put).mockRejectedValue(new ApiError('Database error', 500))

    const result = await updateTask('task-1', { title: 'Test' })

    expect(result.error).toBe('Database error')
  })
})

describe('deleteTask', () => {
  it('should delete a task', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    const result = await deleteTask('task-1')

    expect(result.error).toBeNull()
    expect(api.delete).toHaveBeenCalledWith('/tasks/task-1')
  })

  it('should handle API error', async () => {
    vi.mocked(api.delete).mockRejectedValue(new ApiError('Database error', 500))

    const result = await deleteTask('task-1')

    expect(result.error).toBe('Database error')
  })
})

describe('updateTaskStatus', () => {
  it('should update status to in_progress', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)

    const result = await updateTaskStatus('task-1', 'in_progress')

    expect(result.error).toBeNull()
    expect(api.put).toHaveBeenCalledWith('/tasks/task-1', { status: 'in_progress' })
  })

  it('should update status to completed', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)

    const result = await updateTaskStatus('task-1', 'completed')

    expect(result.error).toBeNull()
  })

  it('should update status back to pending', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)

    const result = await updateTaskStatus('task-1', 'pending')

    expect(result.error).toBeNull()
  })

  it('should handle API error', async () => {
    vi.mocked(api.put).mockRejectedValue(new ApiError('Database error', 500))

    const result = await updateTaskStatus('task-1', 'completed')

    expect(result.error).toBe('Database error')
  })
})
