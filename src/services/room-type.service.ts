/**
 * Room Type Service
 * Manages room types (pieces) for the application
 * System defaults have user_id = NULL, custom types have user_id = current user
 */

import { supabase } from '../lib/supabase'

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

/**
 * Get all room types (system defaults + user custom)
 */
export async function getAllRoomTypes(): Promise<ServiceResult<RoomType[]>> {
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to get room types:', error)
    return { data: [], error: 'Erreur lors du chargement des types de pieces' }
  }

  return { data: (data || []) as RoomType[], error: null }
}

/**
 * Get only active room types
 */
export async function getActiveRoomTypes(): Promise<ServiceResult<RoomType[]>> {
  const { data, error } = await supabase
    .from('room_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to get active room types:', error)
    return { data: [], error: 'Erreur lors du chargement des types de pieces' }
  }

  return { data: (data || []) as RoomType[], error: null }
}

/**
 * Create a new custom room type
 */
export async function createRoomType(data: RoomTypeInsert): Promise<ServiceResult<RoomType>> {
  if (!data.name_fr.trim()) {
    return { error: 'Le nom est requis' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Non authentifie' }
  }

  // Generate slug from French name
  const slug = data.name || data.name_fr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  const { data: result, error } = await supabase
    .from('room_types')
    .insert({
      user_id: user.id,
      name: slug,
      name_fr: data.name_fr.trim(),
      icon: data.icon || 'home',
      sort_order: data.sort_order || 50,
      is_active: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create room type:', error)
    return { error: 'Erreur lors de la creation' }
  }

  return { data: result as RoomType, error: null }
}

/**
 * Update a room type (only custom types can be fully updated, system defaults only is_active)
 */
export async function updateRoomType(
  id: string,
  data: Partial<RoomTypeInsert> & { is_active?: boolean }
): Promise<ServiceResult<RoomType>> {
  const { data: result, error } = await supabase
    .from('room_types')
    .update({
      ...(data.name_fr && { name_fr: data.name_fr.trim() }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
      ...(data.is_active !== undefined && { is_active: data.is_active }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update room type:', error)
    if (error.code === '42501') {
      return { error: 'Vous ne pouvez pas modifier les types par defaut' }
    }
    return { error: 'Erreur lors de la mise a jour' }
  }

  return { data: result as RoomType, error: null }
}

/**
 * Delete a custom room type (system defaults cannot be deleted)
 */
export async function deleteRoomType(id: string): Promise<ServiceResult> {
  const { error } = await supabase
    .from('room_types')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete room type:', error)
    if (error.code === '42501') {
      return { error: 'Vous ne pouvez pas supprimer les types par defaut' }
    }
    return { error: 'Erreur lors de la suppression' }
  }

  return { error: null }
}

/**
 * Toggle active status of a room type
 */
export async function toggleRoomTypeActive(id: string, isActive: boolean): Promise<ServiceResult<RoomType>> {
  return updateRoomType(id, { is_active: isActive })
}
