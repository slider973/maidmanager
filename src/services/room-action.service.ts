/**
 * Room Action Service
 * Feature: 009-staff-portal (US3)
 * Manages room actions (actions per room during a time entry)
 */

import { api, ApiError } from '../lib/api'
import type {
  RoomAction,
  RoomActionWithRelations,
  RoomActionInsert,
} from '../lib/types/portal.types'

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Create a new room action
 */
export async function createRoomAction(
  action: RoomActionInsert
): Promise<{ data?: RoomAction; error: string | null }> {
  // Validate required fields
  if (!action.time_entry_id?.trim()) {
    return { error: 'Le pointage est requis' }
  }

  if (!action.room_type_id?.trim()) {
    return { error: 'La piece est requise' }
  }

  if (!action.action_type_id?.trim()) {
    return { error: "Le type d'action est requis" }
  }

  try {
    const data = await api.post<RoomAction>('/room-actions', {
      time_entry_id: action.time_entry_id,
      room_type_id: action.room_type_id,
      action_type_id: action.action_type_id,
      client_room_id: action.client_room_id || null,
      notes: action.notes || null,
    })
    return { data, error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Get all actions for a specific time entry with relations
 */
export async function getActionsForEntry(
  timeEntryId: string
): Promise<{ data: RoomActionWithRelations[]; error: string | null }> {
  try {
    const data = await api.get<RoomActionWithRelations[]>(`/room-actions?time_entry_id=${timeEntryId}`)
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get all actions performed today by a staff member
 */
export async function getTodayActions(
  staffMemberId: string
): Promise<{ data: RoomActionWithRelations[]; error: string | null }> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const data = await api.get<RoomActionWithRelations[]>(
      `/room-actions?staff_member_id=${staffMemberId}&date=${today}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Delete a room action
 */
export async function deleteRoomAction(
  actionId: string
): Promise<{ error: string | null }> {
  try {
    await api.delete(`/room-actions/${actionId}`)
    return { error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Get action count summary for a time entry (grouped by action type)
 */
export async function getActionSummary(
  timeEntryId: string
): Promise<{
  data: { action_type: string; count: number }[]
  error: string | null
}> {
  try {
    const data = await api.get<{ action_type: string; count: number }[]>(
      `/room-actions/summary?time_entry_id=${timeEntryId}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}
