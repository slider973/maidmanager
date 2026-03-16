/**
 * Schedule Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createScheduleEntry,
  getScheduleEntries,
  updateScheduleEntry,
  deleteScheduleEntry,
  updateScheduleStatus,
  validateScheduleEntry,
} from './schedule.service'
import type { ScheduleEntryInsert, ScheduleEntryWithStaff } from '../lib/types/database'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('getScheduleEntries', () => {
  const mockEntries: ScheduleEntryWithStaff[] = [
    {
      id: 'entry-1',
      user_id: 'test-user-id',
      staff_member_id: 'staff-1',
      client_id: null,
      scheduled_date: '2026-02-10',
      start_time: '09:00:00',
      end_time: '12:00:00',
      description: 'Ménage salon',
      status: 'scheduled',
      notes: null,
      amount: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-1',
        first_name: 'Marie',
        last_name: 'Dupont',
        position: 'housekeeper',
      },
      client: null,
    },
    {
      id: 'entry-2',
      user_id: 'test-user-id',
      staff_member_id: 'staff-2',
      client_id: null,
      scheduled_date: '2026-02-11',
      start_time: '14:00:00',
      end_time: null,
      description: 'Jardinage',
      status: 'scheduled',
      notes: 'Tailler les haies',
      amount: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
      staff_member: {
        id: 'staff-2',
        first_name: 'Jean',
        last_name: 'Martin',
        position: 'gardener',
      },
      client: null,
    },
  ]

  it('should return all schedule entries for the user', async () => {
    vi.mocked(api.get).mockResolvedValue(mockEntries)

    const result = await getScheduleEntries()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(mockEntries)
    expect(api.get).toHaveBeenCalledWith('/schedule-entries')
  })

  it('should return empty array when no entries', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getScheduleEntries()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should filter by staffMemberId when provided', async () => {
    const filteredEntries = [mockEntries[0]]

    vi.mocked(api.get).mockResolvedValue(filteredEntries)

    const result = await getScheduleEntries({ filters: { staffMemberId: 'staff-1' } })

    expect(result.error).toBeNull()
    expect(result.data).toEqual(filteredEntries)
    expect(api.get).toHaveBeenCalledWith('/schedule-entries?staff_member_id=staff-1')
  })

  it('should filter by status when provided', async () => {
    const completedEntry: ScheduleEntryWithStaff = {
      ...mockEntries[0],
      status: 'completed',
    }

    vi.mocked(api.get).mockResolvedValue([completedEntry])

    const result = await getScheduleEntries({ filters: { status: 'completed' } })

    expect(result.error).toBeNull()
    expect(result.data?.[0]?.status).toBe('completed')
    expect(api.get).toHaveBeenCalledWith('/schedule-entries?status=completed')
  })

  it('should handle API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Database error', 500))

    const result = await getScheduleEntries()

    expect(result.error).toBe('Database error')
    expect(result.data).toEqual([])
  })
})

describe('createScheduleEntry', () => {
  const validData: ScheduleEntryInsert = {
    staff_member_id: 'staff-1',
    scheduled_date: '2026-02-10',
    start_time: '09:00',
    description: 'Ménage salon',
  }

  it('should create a schedule entry with valid data', async () => {
    const mockEntry = {
      id: 'entry-1',
      user_id: 'test-user-id',
      ...validData,
      end_time: null,
      status: 'scheduled',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockEntry)

    const result = await createScheduleEntry(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockEntry)
    expect(api.post).toHaveBeenCalledWith('/schedule-entries', validData)
  })

  it('should return validation error when staff_member_id is missing', async () => {
    const invalidData = { ...validData, staff_member_id: '' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('Veuillez selectionner un membre du personnel')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when scheduled_date is missing', async () => {
    const invalidData = { ...validData, scheduled_date: '' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('La date est requise')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when start_time is missing', async () => {
    const invalidData = { ...validData, start_time: '' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe("L'heure de debut est requise")
    expect(result.data).toBeUndefined()
  })

  it('should allow empty description (description not required)', async () => {
    const dataWithEmptyDesc = { ...validData, description: '' }
    const mockEntry = {
      id: 'entry-1',
      user_id: 'test-user-id',
      ...dataWithEmptyDesc,
      end_time: null,
      status: 'scheduled',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockEntry)

    const result = await createScheduleEntry(dataWithEmptyDesc)

    expect(result.error).toBeNull()
  })

  it('should return validation error when description is too long', async () => {
    const invalidData = { ...validData, description: 'a'.repeat(501) }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('Description trop longue (max 500 caracteres)')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when end_time is before start_time', async () => {
    const invalidData = { ...validData, start_time: '14:00', end_time: '10:00' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe("L'heure de fin doit etre apres l'heure de debut")
    expect(result.data).toBeUndefined()
  })

  it('should allow valid end_time after start_time', async () => {
    const dataWithEndTime = { ...validData, start_time: '09:00', end_time: '12:00' }
    const mockEntry = {
      id: 'entry-1',
      user_id: 'test-user-id',
      ...dataWithEndTime,
      status: 'scheduled',
      notes: null,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockEntry)

    const result = await createScheduleEntry(dataWithEndTime)

    expect(result.error).toBeNull()
    expect(result.data?.end_time).toBe('12:00')
  })

  it('should handle API error', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Database error', 500))

    const result = await createScheduleEntry(validData)

    expect(result.error).toBe('Database error')
    expect(result.data).toBeUndefined()
  })
})

describe('validateScheduleEntry', () => {
  const validData: ScheduleEntryInsert = {
    staff_member_id: 'staff-1',
    scheduled_date: '2026-02-10',
    start_time: '09:00',
    description: 'Ménage salon',
  }

  it('should return null for valid data', () => {
    expect(validateScheduleEntry(validData)).toBeNull()
  })

  it('should return error for empty staff_member_id', () => {
    const data = { ...validData, staff_member_id: '' }
    expect(validateScheduleEntry(data)).toBe('Veuillez selectionner un membre du personnel')
  })

  it('should return error for empty scheduled_date', () => {
    const data = { ...validData, scheduled_date: '' }
    expect(validateScheduleEntry(data)).toBe('La date est requise')
  })

  it('should return error for empty start_time', () => {
    const data = { ...validData, start_time: '' }
    expect(validateScheduleEntry(data)).toBe("L'heure de debut est requise")
  })

  it('should pass with empty description (description not required)', () => {
    const data = { ...validData, description: '' }
    expect(validateScheduleEntry(data)).toBeNull()
  })

  it('should return error for description over 500 characters', () => {
    const data = { ...validData, description: 'a'.repeat(501) }
    expect(validateScheduleEntry(data)).toBe('Description trop longue (max 500 caracteres)')
  })

  it('should return error when end_time is before start_time', () => {
    const data = { ...validData, start_time: '14:00', end_time: '10:00' }
    expect(validateScheduleEntry(data)).toBe("L'heure de fin doit etre apres l'heure de debut")
  })

  it('should pass when end_time is after start_time', () => {
    const data = { ...validData, start_time: '09:00', end_time: '12:00' }
    expect(validateScheduleEntry(data)).toBeNull()
  })

  it('should pass with null end_time', () => {
    const data = { ...validData, end_time: null }
    expect(validateScheduleEntry(data)).toBeNull()
  })

  it('should pass with undefined end_time', () => {
    const data = { ...validData }
    delete (data as any).end_time
    expect(validateScheduleEntry(data)).toBeNull()
  })
})

describe('updateScheduleEntry', () => {
  const mockEntry = {
    id: 'entry-1',
    user_id: 'test-user-id',
    staff_member_id: 'staff-1',
    scheduled_date: '2026-02-10',
    start_time: '09:00:00',
    end_time: '12:00:00',
    description: 'Updated description',
    status: 'scheduled',
    notes: null,
    created_at: '2026-02-06T00:00:00Z',
    updated_at: '2026-02-06T00:00:00Z',
  }

  it('should update a schedule entry', async () => {
    vi.mocked(api.put).mockResolvedValue(mockEntry)

    const result = await updateScheduleEntry('entry-1', { description: 'Updated description' })

    expect(result.error).toBeNull()
    expect(result.data?.description).toBe('Updated description')
    expect(api.put).toHaveBeenCalledWith('/schedule-entries/entry-1', { description: 'Updated description' })
  })

  it('should allow empty description in update (only validates length)', async () => {
    vi.mocked(api.put).mockResolvedValue({
      ...mockEntry,
      description: '',
    })

    const result = await updateScheduleEntry('entry-1', { description: '' })

    expect(result.error).toBeNull()
    expect(api.put).toHaveBeenCalledWith('/schedule-entries/entry-1', { description: '' })
  })

  it('should return validation error when description is too long', async () => {
    const result = await updateScheduleEntry('entry-1', { description: 'a'.repeat(501) })

    expect(result.error).toBe('Description trop longue (max 500 caracteres)')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when end_time is before start_time', async () => {
    const result = await updateScheduleEntry('entry-1', { start_time: '14:00', end_time: '10:00' })

    expect(result.error).toBe("L'heure de fin doit etre apres l'heure de debut")
    expect(result.data).toBeUndefined()
  })

  it('should handle API error', async () => {
    vi.mocked(api.put).mockRejectedValue(new ApiError('Database error', 500))

    const result = await updateScheduleEntry('entry-1', { description: 'Test' })

    expect(result.error).toBe('Database error')
  })
})

describe('deleteScheduleEntry', () => {
  it('should delete a schedule entry', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    const result = await deleteScheduleEntry('entry-1')

    expect(result.error).toBeNull()
    expect(api.delete).toHaveBeenCalledWith('/schedule-entries/entry-1')
  })

  it('should handle API error', async () => {
    vi.mocked(api.delete).mockRejectedValue(new ApiError('Database error', 500))

    const result = await deleteScheduleEntry('entry-1')

    expect(result.error).toBe('Database error')
  })
})

describe('updateScheduleStatus', () => {
  it('should update status to completed', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)

    const result = await updateScheduleStatus('entry-1', 'completed')

    expect(result.error).toBeNull()
    expect(api.put).toHaveBeenCalledWith('/schedule-entries/entry-1', { status: 'completed' })
  })

  it('should update status to cancelled', async () => {
    vi.mocked(api.put).mockResolvedValue(undefined)

    const result = await updateScheduleStatus('entry-1', 'cancelled')

    expect(result.error).toBeNull()
  })

  it('should handle API error', async () => {
    vi.mocked(api.put).mockRejectedValue(new ApiError('Database error', 500))

    const result = await updateScheduleStatus('entry-1', 'completed')

    expect(result.error).toBe('Database error')
  })
})
