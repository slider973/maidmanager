/**
 * Referential Service Tests
 * Feature: 009-staff-portal (US3)
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  getRoomTypes,
  getActionTypes,
  getActionTypesForPosition,
} from './referential.service'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('getRoomTypes', () => {
  it('should return all active room types ordered by sort_order', async () => {
    const mockRoomTypes = [
      { id: 'rt-1', name: 'bathroom', name_fr: 'Salle de bain', sort_order: 1, is_active: true },
      { id: 'rt-2', name: 'kitchen', name_fr: 'Cuisine', sort_order: 2, is_active: true },
      { id: 'rt-3', name: 'bedroom', name_fr: 'Chambre', sort_order: 3, is_active: true },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockRoomTypes, error: null }),
        }),
      }),
    } as any)

    const result = await getRoomTypes()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(3)
    expect(result.data?.[0].name_fr).toBe('Salle de bain')
  })

  it('should return empty array when no room types exist', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any)

    const result = await getRoomTypes()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(0)
  })

  it('should handle database errors', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        }),
      }),
    } as any)

    const result = await getRoomTypes()

    expect(result.error).toBeDefined()
    expect(result.data).toEqual([])
  })
})

describe('getActionTypes', () => {
  it('should return all active action types ordered by sort_order', async () => {
    const mockActionTypes = [
      { id: 'at-1', name: 'cleaning', name_fr: 'Nettoyage', sort_order: 1, is_active: true },
      { id: 'at-2', name: 'organizing', name_fr: 'Rangement', sort_order: 2, is_active: true },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockActionTypes, error: null }),
        }),
      }),
    } as any)

    const result = await getActionTypes()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data?.[0].name_fr).toBe('Nettoyage')
  })

  it('should return empty array when no action types exist', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
    } as any)

    const result = await getActionTypes()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(0)
  })
})

describe('getActionTypesForPosition', () => {
  it('should return action types matching the position filter', async () => {
    const mockActionTypes = [
      {
        id: 'at-1',
        name: 'cleaning',
        name_fr: 'Nettoyage',
        position_filter: ['housekeeper', 'cleaner'],
        sort_order: 1,
        is_active: true,
      },
      {
        id: 'at-2',
        name: 'cooking',
        name_fr: 'Cuisine',
        position_filter: null, // Available to all positions
        sort_order: 2,
        is_active: true,
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockActionTypes, error: null }),
        }),
      }),
    } as any)

    const result = await getActionTypesForPosition('housekeeper')

    expect(result.error).toBeNull()
    // Should include both: one matches position, other has null filter (available to all)
    expect(result.data).toHaveLength(2)
  })

  it('should filter out action types not matching the position', async () => {
    const mockActionTypes = [
      {
        id: 'at-1',
        name: 'cleaning',
        name_fr: 'Nettoyage',
        position_filter: ['housekeeper'],
        sort_order: 1,
        is_active: true,
      },
      {
        id: 'at-2',
        name: 'gardening',
        name_fr: 'Jardinage',
        position_filter: ['gardener'],
        sort_order: 2,
        is_active: true,
      },
      {
        id: 'at-3',
        name: 'organizing',
        name_fr: 'Rangement',
        position_filter: null, // Available to all
        sort_order: 3,
        is_active: true,
      },
    ]

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: mockActionTypes, error: null }),
        }),
      }),
    } as any)

    const result = await getActionTypesForPosition('housekeeper')

    expect(result.error).toBeNull()
    // Should include cleaning (matches) and organizing (null filter), not gardening
    expect(result.data).toHaveLength(2)
    expect(result.data?.map((a) => a.name)).toContain('cleaning')
    expect(result.data?.map((a) => a.name)).toContain('organizing')
    expect(result.data?.map((a) => a.name)).not.toContain('gardening')
  })
})
