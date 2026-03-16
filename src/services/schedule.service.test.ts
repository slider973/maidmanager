/**
 * Schedule Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
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
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockEntries, error: null }),
        }),
      }),
    } as any)

    const result = await getScheduleEntries()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(mockEntries)
    expect(supabase.from).toHaveBeenCalledWith('schedule_entries')
  })

  it('should return empty array when no entries', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any)

    const result = await getScheduleEntries()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should filter by staffMemberId when provided', async () => {
    const filteredEntries = [mockEntries[0]]

    const mockOrder = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: filteredEntries, error: null }),
    })
    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    })
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const result = await getScheduleEntries({ filters: { staffMemberId: 'staff-1' } })

    expect(result.error).toBeNull()
    expect(result.data).toEqual(filteredEntries)
  })

  it('should filter by status when provided', async () => {
    const completedEntry: ScheduleEntryWithStaff = {
      ...mockEntries[0],
      status: 'completed',
    }

    const mockOrder = vi.fn().mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [completedEntry], error: null }),
    })
    const mockEq = vi.fn().mockReturnValue({
      order: mockOrder,
    })
    const mockSelect = vi.fn().mockReturnValue({
      eq: mockEq,
    })

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
    } as any)

    const result = await getScheduleEntries({ filters: { status: 'completed' } })

    expect(result.error).toBeNull()
    expect(result.data?.[0]?.status).toBe('completed')
  })

  it('should handle Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    } as any)

    const result = await getScheduleEntries()

    expect(result.error).toBe('Échec du chargement des interventions')
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

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockEntry, error: null }),
        }),
      }),
    } as any)

    const result = await createScheduleEntry(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockEntry)
    expect(supabase.from).toHaveBeenCalledWith('schedule_entries')
  })

  it('should return validation error when staff_member_id is missing', async () => {
    const invalidData = { ...validData, staff_member_id: '' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('Veuillez sélectionner un membre du personnel')
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

    expect(result.error).toBe("L'heure de début est requise")
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when description is missing', async () => {
    const invalidData = { ...validData, description: '' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('La description est requise')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when description is too long', async () => {
    const invalidData = { ...validData, description: 'a'.repeat(501) }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe('Description trop longue (max 500 caractères)')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when end_time is before start_time', async () => {
    const invalidData = { ...validData, start_time: '14:00', end_time: '10:00' }

    const result = await createScheduleEntry(invalidData)

    expect(result.error).toBe("L'heure de fin doit être après l'heure de début")
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

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockEntry, error: null }),
        }),
      }),
    } as any)

    const result = await createScheduleEntry(dataWithEndTime)

    expect(result.error).toBeNull()
    expect(result.data?.end_time).toBe('12:00')
  })

  it('should handle Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    } as any)

    const result = await createScheduleEntry(validData)

    expect(result.error).toBe("Échec de la création de l'intervention")
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
    expect(validateScheduleEntry(data)).toBe('Veuillez sélectionner un membre du personnel')
  })

  it('should return error for empty scheduled_date', () => {
    const data = { ...validData, scheduled_date: '' }
    expect(validateScheduleEntry(data)).toBe('La date est requise')
  })

  it('should return error for empty start_time', () => {
    const data = { ...validData, start_time: '' }
    expect(validateScheduleEntry(data)).toBe("L'heure de début est requise")
  })

  it('should return error for empty description', () => {
    const data = { ...validData, description: '' }
    expect(validateScheduleEntry(data)).toBe('La description est requise')
  })

  it('should return error for description over 500 characters', () => {
    const data = { ...validData, description: 'a'.repeat(501) }
    expect(validateScheduleEntry(data)).toBe('Description trop longue (max 500 caractères)')
  })

  it('should return error when end_time is before start_time', () => {
    const data = { ...validData, start_time: '14:00', end_time: '10:00' }
    expect(validateScheduleEntry(data)).toBe("L'heure de fin doit être après l'heure de début")
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
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockEntry, error: null }),
          }),
        }),
      }),
    } as any)

    const result = await updateScheduleEntry('entry-1', { description: 'Updated description' })

    expect(result.error).toBeNull()
    expect(result.data?.description).toBe('Updated description')
  })

  it('should return validation error when description is empty', async () => {
    const result = await updateScheduleEntry('entry-1', { description: '' })

    expect(result.error).toBe('La description est requise')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when description is too long', async () => {
    const result = await updateScheduleEntry('entry-1', { description: 'a'.repeat(501) })

    expect(result.error).toBe('Description trop longue (max 500 caractères)')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when end_time is before start_time', async () => {
    const result = await updateScheduleEntry('entry-1', { start_time: '14:00', end_time: '10:00' })

    expect(result.error).toBe("L'heure de fin doit être après l'heure de début")
    expect(result.data).toBeUndefined()
  })

  it('should handle Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      }),
    } as any)

    const result = await updateScheduleEntry('entry-1', { description: 'Test' })

    expect(result.error).toBe("Échec de la modification de l'intervention")
  })
})

describe('deleteScheduleEntry', () => {
  it('should delete a schedule entry', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)

    const result = await deleteScheduleEntry('entry-1')

    expect(result.error).toBeNull()
  })

  it('should handle Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      }),
    } as any)

    const result = await deleteScheduleEntry('entry-1')

    expect(result.error).toBe("Échec de la suppression de l'intervention")
  })
})

describe('updateScheduleStatus', () => {
  it('should update status to completed', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)

    const result = await updateScheduleStatus('entry-1', 'completed')

    expect(result.error).toBeNull()
  })

  it('should update status to cancelled', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    } as any)

    const result = await updateScheduleStatus('entry-1', 'cancelled')

    expect(result.error).toBeNull()
  })

  it('should handle Supabase error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: { message: 'Database error' },
        }),
      }),
    } as any)

    const result = await updateScheduleStatus('entry-1', 'completed')

    expect(result.error).toBe("Échec de la modification de l'intervention")
  })
})
