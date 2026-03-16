/**
 * Room Type Service
 * Manages room types (pieces) for the application
 * System defaults have user_id = NULL, custom types have user_id = current user
 */

import { api, ApiError } from '../lib/api'

export interface RoomType {
  id: string
  user_id: string | null
  name: string
  name_fr: string
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface RoomTypeInsert {
  name?: string
  name_fr: string
  icon?: string | null
  sort_order?: number
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
 * Get all room types (system defaults + user custom)
 */
export async function getAllRoomTypes(): Promise<ServiceResult<RoomType[]>> {
  try {
    const data = await api.get<RoomType[]>('/room-types')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get room types:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get only active room types
 */
export async function getActiveRoomTypes(): Promise<ServiceResult<RoomType[]>> {
  try {
    const data = await api.get<RoomType[]>('/room-types?is_active=true')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get active room types:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Create a new custom room type
 */
export async function createRoomType(data: RoomTypeInsert): Promise<ServiceResult<RoomType>> {
  if (!data.name_fr.trim()) {
    return { error: 'Le nom est requis' }
  }

  try {
    const result = await api.post<RoomType>('/room-types', {
      name_fr: data.name_fr.trim(),
      name: data.name,
      icon: data.icon || 'home',
      sort_order: data.sort_order || 50,
    })
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to create room type:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update a room type (only custom types can be fully updated, system defaults only is_active)
 */
export async function updateRoomType(
  id: string,
  data: Partial<RoomTypeInsert> & { is_active?: boolean }
): Promise<ServiceResult<RoomType>> {
  try {
    const updateData: Record<string, unknown> = {}
    if (data.name_fr) updateData.name_fr = data.name_fr.trim()
    if (data.icon !== undefined) updateData.icon = data.icon
    if (data.sort_order !== undefined) updateData.sort_order = data.sort_order
    if (data.is_active !== undefined) updateData.is_active = data.is_active

    const result = await api.put<RoomType>(`/room-types/${id}`, updateData)
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to update room type:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a custom room type (system defaults cannot be deleted)
 */
export async function deleteRoomType(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/room-types/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete room type:', err)
    return { error: handleError(err) }
  }
}

/**
 * Toggle active status of a room type
 */
export async function toggleRoomTypeActive(id: string, isActive: boolean): Promise<ServiceResult<RoomType>> {
  return updateRoomType(id, { is_active: isActive })
}
