/**
 * Client Room Service
 * Manages client-specific rooms with their instructions
 * Each client can have their own rooms (e.g., "Salle de bain 1", "Salle de bain 2")
 */

import { api, ApiError } from '../lib/api'

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

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Get all rooms for a client
 */
export async function getRoomsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomWithType[]>> {
  try {
    const data = await api.get<ClientRoomWithType[]>(`/client-rooms?client_id=${clientId}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get client rooms:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get only active rooms for a client (for staff portal)
 */
export async function getActiveRoomsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomWithType[]>> {
  try {
    const data = await api.get<ClientRoomWithType[]>(`/client-rooms?client_id=${clientId}&is_active=true`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get active client rooms:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single room by ID
 */
export async function getRoom(id: string): Promise<ServiceResult<ClientRoomWithType | null>> {
  try {
    const data = await api.get<ClientRoomWithType>(`/client-rooms/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get room:', err)
    return { error: handleError(err) }
  }
}

/**
 * Create a new room for a client
 */
export async function createRoom(data: ClientRoomInsert): Promise<ServiceResult<ClientRoom>> {
  if (!data.custom_name.trim()) {
    return { error: 'Le nom de la piece est requis' }
  }

  try {
    const result = await api.post<ClientRoom>('/client-rooms', {
      client_id: data.client_id,
      room_type_id: data.room_type_id || null,
      custom_name: data.custom_name.trim(),
      instructions: data.instructions?.trim() || null,
      sort_order: data.sort_order || 0,
      is_active: true,
    })
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to create room:', err)
    return { error: handleError(err) }
  }
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

  try {
    const result = await api.put<ClientRoom>(`/client-rooms/${id}`, updateData)
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to update room:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a room
 */
export async function deleteRoom(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/client-rooms/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete room:', err)
    return { error: handleError(err) }
  }
}

/**
 * Quick add multiple rooms from room types
 * Useful for initializing a client's rooms from the standard room types
 */
export async function addRoomsFromTypes(
  clientId: string,
  roomTypeIds: string[]
): Promise<ServiceResult<ClientRoom[]>> {
  try {
    const result = await api.post<ClientRoom[]>('/client-rooms/from-types', {
      client_id: clientId,
      room_type_ids: roomTypeIds,
    })
    return { data: result || [], error: null }
  } catch (err) {
    console.error('Failed to create rooms from types:', err)
    return { data: [], error: handleError(err) }
  }
}
