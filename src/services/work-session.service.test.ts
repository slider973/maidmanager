/**
 * Work Session Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createWorkSession,
  getWorkSessions,
  updateWorkSession,
  deleteWorkSession,
  getWorkSessionsByStaffMember,
  validateWorkSession,
} from './work-session.service'
import type { WorkSessionInsert } from '../lib/types/payments.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

// ============================================================================
// Validation Tests
// ============================================================================

describe('validateWorkSession', () => {
  // Use today's date for valid data
  const today = new Date().toISOString().split('T')[0]
  const validData: WorkSessionInsert = {
    staff_member_id: 'staff-1',
    session_date: today,
    duration_minutes: 180,
    hourly_rate_cents: 1500,
    description: 'Ménage complet',
  }

  it('should return null for valid data', () => {
    const result = validateWorkSession(validData)
    expect(result.error).toBeNull()
    expect(result.warning).toBeNull()
  })

  it('should return error for missing staff_member_id', () => {
    const data = { ...validData, staff_member_id: '' }
    const result = validateWorkSession(data)
    expect(result.error).toBe("L'employé est requis")
  })

  it('should return error for negative duration', () => {
    const data = { ...validData, duration_minutes: -60 }
    const result = validateWorkSession(data)
    expect(result.error).toBe('La durée doit être positive')
  })

  it('should return error for zero duration', () => {
    const data = { ...validData, duration_minutes: 0 }
    const result = validateWorkSession(data)
    expect(result.error).toBe('La durée doit être positive')
  })

  it('should return error for negative hourly rate', () => {
    const data = { ...validData, hourly_rate_cents: -100 }
    const result = validateWorkSession(data)
    expect(result.error).toBe('Le tarif horaire ne peut pas être négatif')
  })

  it('should return warning for zero hourly rate (volunteer work)', () => {
    const data = { ...validData, hourly_rate_cents: 0 }
    const result = validateWorkSession(data)
    expect(result.error).toBeNull()
    expect(result.warning).toBe('Tarif à 0€ - Travail bénévole ?')
  })

  it('should return error for missing description', () => {
    const data = { ...validData, description: '' }
    const result = validateWorkSession(data)
    expect(result.error).toBe('La description est requise')
  })

  it('should return error for missing session_date', () => {
    const data = { ...validData, session_date: '' }
    const result = validateWorkSession(data)
    expect(result.error).toBe('La date est requise')
  })

  it('should return error for future date', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const data = { ...validData, session_date: tomorrow.toISOString().split('T')[0] }
    const result = validateWorkSession(data)
    expect(result.error).toBe('La date ne peut pas être dans le futur')
  })
})

// ============================================================================
// CRUD Tests
// ============================================================================

describe('getWorkSessions', () => {
  const mockSessions = [
    {
      id: 'session-1',
      user_id: 'test-user-id',
      staff_member_id: 'staff-1',
      schedule_entry_id: null,
      session_date: '2026-02-07',
      duration_minutes: 180,
      hourly_rate_cents: 1500,
      amount_cents: 4500,
      description: 'Ménage complet',
      notes: null,
      created_at: '2026-02-07T10:00:00Z',
      updated_at: '2026-02-07T10:00:00Z',
      staff_member: {
        id: 'staff-1',
        first_name: 'Marie',
        last_name: 'Dupont',
        position: 'housekeeper',
      },
    },
  ]

  it('should return all work sessions for the user', async () => {
    vi.mocked(api.get).mockResolvedValue(mockSessions)

    const result = await getWorkSessions()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data![0].amount_cents).toBe(4500)
    expect(api.get).toHaveBeenCalledWith('/work-sessions')
  })

  it('should return empty array when no sessions', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getWorkSessions()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should handle database errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Database error', 500))

    const result = await getWorkSessions()

    expect(result.error).toBe('Database error')
    expect(result.data).toEqual([])
  })
})

describe('getWorkSessionsByStaffMember', () => {
  it('should filter by staff member ID', async () => {
    const mockSessions = [
      {
        id: 'session-1',
        staff_member_id: 'staff-1',
        session_date: '2026-02-07',
        duration_minutes: 180,
        hourly_rate_cents: 1500,
        amount_cents: 4500,
        description: 'Ménage',
        staff_member: { id: 'staff-1', first_name: 'Marie', last_name: 'Dupont', position: 'housekeeper' },
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockSessions)

    const result = await getWorkSessionsByStaffMember('staff-1')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
    expect(result.data![0].staff_member_id).toBe('staff-1')
    expect(api.get).toHaveBeenCalledWith('/work-sessions?staff_member_id=staff-1')
  })
})

describe('createWorkSession', () => {
  // Use today's date for valid data
  const today = new Date().toISOString().split('T')[0]
  const validData: WorkSessionInsert = {
    staff_member_id: 'staff-1',
    session_date: today,
    duration_minutes: 180,
    hourly_rate_cents: 1500,
    description: 'Ménage complet',
  }

  it('should create a work session with valid data', async () => {
    const mockCreated = {
      id: 'new-session',
      ...validData,
      user_id: 'test-user-id',
      amount_cents: 4500,
      created_at: '2026-02-07T10:00:00Z',
      updated_at: '2026-02-07T10:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockCreated)

    const result = await createWorkSession(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockCreated)
    expect(api.post).toHaveBeenCalledWith('/work-sessions', validData)
  })

  it('should return validation error for invalid data', async () => {
    const invalidData = { ...validData, duration_minutes: -10 }
    const result = await createWorkSession(invalidData)

    expect(result.error).toBe('La durée doit être positive')
    expect(result.data).toBeUndefined()
  })

  it('should handle database errors', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Database error', 500))

    const result = await createWorkSession(validData)

    expect(result.error).toBe('Database error')
  })
})

describe('updateWorkSession', () => {
  it('should update a work session', async () => {
    const mockUpdated = {
      id: 'session-1',
      user_id: 'test-user-id',
      staff_member_id: 'staff-1',
      session_date: '2026-02-07',
      duration_minutes: 240,
      hourly_rate_cents: 1500,
      amount_cents: 6000,
      description: 'Ménage complet + vitres',
      created_at: '2026-02-07T10:00:00Z',
      updated_at: '2026-02-07T11:00:00Z',
    }

    vi.mocked(api.put).mockResolvedValue(mockUpdated)

    const result = await updateWorkSession('session-1', {
      duration_minutes: 240,
      description: 'Ménage complet + vitres',
    })

    expect(result.error).toBeNull()
    expect(result.data?.duration_minutes).toBe(240)
    expect(result.data?.amount_cents).toBe(6000)
  })

  it('should return validation error for invalid update', async () => {
    const result = await updateWorkSession('session-1', { duration_minutes: -10 })
    expect(result.error).toBe('La durée doit être positive')
  })
})

describe('deleteWorkSession', () => {
  it('should delete a work session', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    const result = await deleteWorkSession('session-1')

    expect(result.error).toBeNull()
    expect(api.delete).toHaveBeenCalledWith('/work-sessions/session-1')
  })

  it('should handle database errors', async () => {
    vi.mocked(api.delete).mockRejectedValue(new ApiError('Database error', 500))

    const result = await deleteWorkSession('session-1')

    expect(result.error).toBe('Database error')
  })
})
