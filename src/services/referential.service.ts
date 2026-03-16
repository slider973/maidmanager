/**
 * Referential Service
 * Feature: 009-staff-portal (US3)
 * Manages room types and action types (referential data)
 */

import { supabase } from '../lib/supabase'
import type { RoomType, ActionType } from '../lib/types/portal.types'

/**
 * Get all active room types
 */
export async function getRoomTypes(): Promise<{
  data: RoomType[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as RoomType[], error: null }
}

/**
 * Get all active action types
 */
export async function getActionTypes(): Promise<{
  data: ActionType[]
  error: string | null
}> {
  const { data, error } = await supabase
    .from('action_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as ActionType[], error: null }
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
  // Fetch all active action types first
  const { data, error } = await supabase
    .from('action_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  // Filter client-side: include if position_filter is null OR contains the position
  const filtered = (data || []).filter((actionType: ActionType) => {
    if (actionType.position_filter === null) {
      return true // Available to all positions
    }
    return actionType.position_filter.includes(position)
  })

  return { data: filtered as ActionType[], error: null }
}
