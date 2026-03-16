/**
 * Client Room Service
 * Manages client-specific rooms with their instructions
 * Each client can have their own rooms (e.g., "Salle de bain 1", "Salle de bain 2")
 */

import { supabase } from '../lib/supabase'

export interface ClientRoom {
  id: string
  client_id: string
  room_type_id: string | null
  custom_name: string
  instructions: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClientRoomWithType extends ClientRoom {
  room_type: {
    id: string
    name: string
    name_fr: string
    icon: string | null
  } | null
}

export interface ClientRoomInsert {
  client_id: string
  room_type_id?: string | null
  custom_name: string
  instructions?: string | null
  sort_order?: number
}

export interface ClientRoomUpdate {
  custom_name?: string
  instructions?: string | null
  room_type_id?: string | null
  sort_order?: number
  is_active?: boolean
}

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

// Type-safe wrapper for the new table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const clientRoomsTable = () => (supabase as any).from('client_rooms')

/**
 * Get all rooms for a client
 */
export async function getRoomsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomWithType[]>> {
  const { data, error } = await clientRoomsTable()
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon)
    `)
    .eq('client_id', clientId)
    .order('sort_order', { ascending: true })
    .order('custom_name', { ascending: true })

  if (error) {
    console.error('Failed to get client rooms:', error)
    return { data: [], error: 'Erreur lors du chargement des pieces' }
  }

  return { data: (data || []) as ClientRoomWithType[], error: null }
}

/**
 * Get only active rooms for a client (for staff portal)
 */
export async function getActiveRoomsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomWithType[]>> {
  const { data, error } = await clientRoomsTable()
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon)
    `)
    .eq('client_id', clientId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('custom_name', { ascending: true })

  if (error) {
    console.error('Failed to get active client rooms:', error)
    return { data: [], error: 'Erreur lors du chargement des pieces' }
  }

  return { data: (data || []) as ClientRoomWithType[], error: null }
}

/**
 * Get a single room by ID
 */
export async function getRoom(id: string): Promise<ServiceResult<ClientRoomWithType | null>> {
  const { data, error } = await clientRoomsTable()
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Failed to get room:', error)
    return { error: 'Erreur lors du chargement de la piece' }
  }

  return { data: data as ClientRoomWithType | null, error: null }
}

/**
 * Create a new room for a client
 */
export async function createRoom(data: ClientRoomInsert): Promise<ServiceResult<ClientRoom>> {
  if (!data.custom_name.trim()) {
    return { error: 'Le nom de la piece est requis' }
  }

  const { data: result, error } = await clientRoomsTable()
    .insert({
      client_id: data.client_id,
      room_type_id: data.room_type_id || null,
      custom_name: data.custom_name.trim(),
      instructions: data.instructions?.trim() || null,
      sort_order: data.sort_order || 0,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create room:', error)
    return { error: 'Erreur lors de la creation' }
  }

  return { data: result as ClientRoom, error: null }
}

/**
 * Update a room
 */
export async function updateRoom(
  id: string,
  data: ClientRoomUpdate
): Promise<ServiceResult<ClientRoom>> {
  const updateData: Record<string, unknown> = {}

  if (data.custom_name !== undefined) {
    if (!data.custom_name.trim()) {
      return { error: 'Le nom de la piece est requis' }
    }
    updateData.custom_name = data.custom_name.trim()
  }
  if (data.instructions !== undefined) {
    updateData.instructions = data.instructions?.trim() || null
  }
  if (data.room_type_id !== undefined) {
    updateData.room_type_id = data.room_type_id
  }
  if (data.sort_order !== undefined) {
    updateData.sort_order = data.sort_order
  }
  if (data.is_active !== undefined) {
    updateData.is_active = data.is_active
  }

  const { data: result, error } = await clientRoomsTable()
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update room:', error)
    return { error: 'Erreur lors de la mise a jour' }
  }

  return { data: result as ClientRoom, error: null }
}

/**
 * Delete a room
 */
export async function deleteRoom(id: string): Promise<ServiceResult> {
  const { error } = await clientRoomsTable()
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete room:', error)
    return { error: 'Erreur lors de la suppression' }
  }

  return { error: null }
}

/**
 * Quick add multiple rooms from room types
 * Useful for initializing a client's rooms from the standard room types
 */
export async function addRoomsFromTypes(
  clientId: string,
  roomTypeIds: string[]
): Promise<ServiceResult<ClientRoom[]>> {
  // First, get the room types to get their names
  const { data: roomTypes, error: fetchError } = await supabase
    .from('room_types')
    .select('id, name_fr')
    .in('id', roomTypeIds)

  if (fetchError) {
    console.error('Failed to fetch room types:', fetchError)
    return { data: [], error: 'Erreur lors du chargement des types' }
  }

  if (!roomTypes || roomTypes.length === 0) {
    return { data: [], error: null }
  }

  // Create rooms for each type
  const roomsToInsert = roomTypes.map((rt, index) => ({
    client_id: clientId,
    room_type_id: rt.id,
    custom_name: rt.name_fr,
    sort_order: index,
    is_active: true,
  }))

  const { data: result, error } = await clientRoomsTable()
    .insert(roomsToInsert)
    .select()

  if (error) {
    console.error('Failed to create rooms:', error)
    return { data: [], error: 'Erreur lors de la creation des pieces' }
  }

  return { data: (result || []) as ClientRoom[], error: null }
}
