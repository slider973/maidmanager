/**
 * Room Action Service
 * Feature: 009-staff-portal (US3)
 * Manages room actions (actions per room during a time entry)
 */

import { supabase } from '../lib/supabase'
import type {
  RoomAction,
  RoomActionWithRelations,
  RoomActionInsert,
} from '../lib/types/portal.types'

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

  const { data, error } = await supabase
    .from('room_actions')
    .insert({
      time_entry_id: action.time_entry_id,
      room_type_id: action.room_type_id,
      action_type_id: action.action_type_id,
      client_room_id: action.client_room_id || null,
      notes: action.notes || null,
    })
    .select()
    .single()

  if (error) {
    return { error: `Erreur lors de l'enregistrement: ${error.message}` }
  }

  return { data: data as RoomAction, error: null }
}

/**
 * Get all actions for a specific time entry with relations
 */
export async function getActionsForEntry(
  timeEntryId: string
): Promise<{ data: RoomActionWithRelations[]; error: string | null }> {
  const { data, error } = await supabase
    .from('room_actions')
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon),
      action_type:action_types(id, name, name_fr),
      client_room:client_rooms(id, custom_name, instructions)
    `)
    .eq('time_entry_id', timeEntryId)
    .order('performed_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as unknown as RoomActionWithRelations[], error: null }
}

/**
 * Get all actions performed today by a staff member
 * Note: This requires joining through time_entries to filter by staff_member_id
 */
export async function getTodayActions(
  staffMemberId: string
): Promise<{ data: RoomActionWithRelations[]; error: string | null }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const { data, error } = await supabase
    .from('room_actions')
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon),
      action_type:action_types(id, name, name_fr),
      client_room:client_rooms(id, custom_name, instructions),
      time_entry:time_entries!inner(staff_member_id)
    `)
    .gte('performed_at', today.toISOString())
    .lt('performed_at', tomorrow.toISOString())
    .order('performed_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  // Filter by staff member (since we can't easily do this in the query)
  const filtered = (data || []).filter(
    (action: any) => action.time_entry?.staff_member_id === staffMemberId
  )

  return { data: filtered as unknown as RoomActionWithRelations[], error: null }
}

/**
 * Delete a room action
 */
export async function deleteRoomAction(
  actionId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('room_actions')
    .delete()
    .eq('id', actionId)

  if (error) {
    return { error: `Erreur lors de la suppression: ${error.message}` }
  }

  return { error: null }
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
  const { data, error } = await supabase
    .from('room_actions')
    .select(`
      action_type:action_types(name_fr)
    `)
    .eq('time_entry_id', timeEntryId)

  if (error) {
    return { data: [], error: error.message }
  }

  // Group by action type and count
  const summary: Record<string, number> = {}
  for (const action of data || []) {
    const typeName = (action.action_type as any)?.name_fr || 'Autre'
    summary[typeName] = (summary[typeName] || 0) + 1
  }

  const result = Object.entries(summary).map(([action_type, count]) => ({
    action_type,
    count,
  }))

  return { data: result, error: null }
}
