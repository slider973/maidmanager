/**
 * Referential Service
 * Feature: 009-staff-portal (US3)
 * Manages room types and action types (referential data)
 */

import { api, ApiError } from '../lib/api'
import type { RoomType, ActionType } from '../lib/types/portal.types'

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Get all active room types
 */
export async function getRoomTypes(): Promise<{
  data: RoomType[]
  error: string | null
}> {
  try {
    const data = await api.get<RoomType[]>('/room-types?is_active=true')
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get all active action types
 */
export async function getActionTypes(): Promise<{
  data: ActionType[]
  error: string | null
}> {
  try {
    const data = await api.get<ActionType[]>('/action-types?is_active=true')
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get action types filtered by staff position
 * Returns actions where:
 * - position_filter is null (available to all positions)
 * - position_filter array contains the given position
 */
export async function getActionTypesForPosition(
  position: string
): Promise<{ data: ActionType[]; error: string | null }> {
  try {
    const data = await api.get<ActionType[]>('/action-types?is_active=true')

    // Filter client-side: include if position_filter is null OR contains the position
    const filtered = (data || []).filter((actionType: ActionType) => {
      if (actionType.position_filter === null) {
        return true // Available to all positions
      }
      return actionType.position_filter.includes(position)
    })

    return { data: filtered, error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}
