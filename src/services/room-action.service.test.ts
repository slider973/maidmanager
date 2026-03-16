/**
 * Room Action Service Tests
 * Feature: 009-staff-portal (US3)
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createRoomAction,
  getActionsForEntry,
  getTodayActions,
} from './room-action.service'
import type { RoomActionInsert } from '../lib/types/portal.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('createRoomAction', () => {
  const validAction: RoomActionInsert = {
    time_entry_id: 'entry-123',
    room_type_id: 'room-456',
    action_type_id: 'action-789',
    notes: 'Test note',
  }

  it('should create a new room action', async () => {
    const mockAction = {
      id: 'ra-1',
      ...validAction,
      performed_at: '2026-02-07T10:00:00Z',
      created_at: '2026-02-07T10:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockAction)

    const result = await createRoomAction(validAction)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockAction)
    expect(result.data?.time_entry_id).toBe('entry-123')
    expect(api.post).toHaveBeenCalledWith('/room-actions', {
      time_entry_id: 'entry-123',
      room_type_id: 'room-456',
      action_type_id: 'action-789',
      client_room_id: null,
      notes: 'Test note',
    })
  })

  it('should return error when time_entry_id is missing', async () => {
    const invalidAction = {
      time_entry_id: '',
      room_type_id: 'room-456',
      action_type_id: 'action-789',
    }

    const result = await createRoomAction(invalidAction)

    expect(result.error).toContain('pointage')
    expect(result.data).toBeUndefined()
  })

  it('should return error when room_type_id is missing', async () => {
    const invalidAction = {
      time_entry_id: 'entry-123',
      room_type_id: '',
      action_type_id: 'action-789',
    }

    const result = await createRoomAction(invalidAction)

    expect(result.error).toContain('piece')
    expect(result.data).toBeUndefined()
  })

  it('should return error when action_type_id is missing', async () => {
    const invalidAction = {
      time_entry_id: 'entry-123',
      room_type_id: 'room-456',
      action_type_id: '',
    }

    const result = await createRoomAction(invalidAction)

    expect(result.error).toContain('action')
    expect(result.data).toBeUndefined()
  })

  it('should handle database errors', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Insert failed', 500))

    const result = await createRoomAction(validAction)

    expect(result.error).toBeDefined()
    expect(result.data).toBeUndefined()
  })
})

describe('getActionsForEntry', () => {
  it('should return all actions for a time entry with relations', async () => {
    const mockActions = [
      {
        id: 'ra-1',
        time_entry_id: 'entry-123',
        room_type_id: 'room-1',
        action_type_id: 'action-1',
        performed_at: '2026-02-07T10:00:00Z',
        notes: null,
        room_type: { id: 'room-1', name: 'bathroom', name_fr: 'Salle de bain' },
        action_type: { id: 'action-1', name: 'cleaning', name_fr: 'Nettoyage' },
      },
      {
        id: 'ra-2',
        time_entry_id: 'entry-123',
        room_type_id: 'room-2',
        action_type_id: 'action-1',
        performed_at: '2026-02-07T10:30:00Z',
        notes: 'Bien nettoye',
        room_type: { id: 'room-2', name: 'kitchen', name_fr: 'Cuisine' },
        action_type: { id: 'action-1', name: 'cleaning', name_fr: 'Nettoyage' },
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockActions)

    const result = await getActionsForEntry('entry-123')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0].room_type?.name_fr).toBe('Salle de bain')
    expect(api.get).toHaveBeenCalledWith('/room-actions?time_entry_id=entry-123')
  })

  it('should return empty array when no actions exist', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getActionsForEntry('entry-123')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(0)
  })
})

describe('getTodayActions', () => {
  it('should return all actions for today for a staff member', async () => {
    const mockActions = [
      {
        id: 'ra-1',
        time_entry_id: 'entry-1',
        room_type_id: 'room-1',
        action_type_id: 'action-1',
        performed_at: '2026-02-07T09:00:00Z',
        room_type: { id: 'room-1', name: 'bathroom', name_fr: 'Salle de bain' },
        action_type: { id: 'action-1', name: 'cleaning', name_fr: 'Nettoyage' },
        time_entry: { staff_member_id: 'staff-456' },
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockActions)

    const result = await getTodayActions('staff-456')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(1)
  })

  it('should return empty array when no actions today', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getTodayActions('staff-456')

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(0)
  })
})
