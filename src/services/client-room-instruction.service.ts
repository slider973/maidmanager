/**
 * Client Room Instruction Service
 * Feature: 009-staff-portal
 * Manages instructions per room type for each client
 *
 * Note: Uses type assertions for client_room_instructions table
 * since TypeScript types are generated before migration is applied.
 * Run `npm run gen:types` after applying the migration to fix types.
 */

import { supabase } from '../lib/supabase'
import type {
  ClientRoomInstruction,
  ClientRoomInstructionWithRoom,
  ClientRoomInstructionInsert,
  ClientRoomInstructionUpdate,
} from '../lib/types/billing.types'

// Type-safe wrapper for accessing the new table
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const instructionsTable = () => (supabase as any).from('client_room_instructions')

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

/**
 * Get all instructions for a client
 */
export async function getInstructionsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomInstructionWithRoom[]>> {
  const { data, error } = await instructionsTable()
    .select(`
      *,
      room_type:room_types(id, name, name_fr, icon)
    `)
    .eq('client_id', clientId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to get instructions:', error)
    return { data: [], error: 'Erreur lors du chargement des instructions' }
  }

  return { data: (data || []) as ClientRoomInstructionWithRoom[], error: null }
}

/**
 * Get instruction for a specific client and room type
 */
export async function getInstructionForRoom(
  clientId: string,
  roomTypeId: string
): Promise<ServiceResult<ClientRoomInstruction | null>> {
  const { data, error } = await instructionsTable()
    .select('*')
    .eq('client_id', clientId)
    .eq('room_type_id', roomTypeId)
    .maybeSingle()

  if (error) {
    console.error('Failed to get instruction:', error)
    return { error: 'Erreur lors du chargement de l\'instruction' }
  }

  return { data: data as ClientRoomInstruction | null, error: null }
}

/**
 * Create or update instruction (upsert)
 */
export async function upsertInstruction(
  data: ClientRoomInstructionInsert
): Promise<ServiceResult<ClientRoomInstruction>> {
  if (!data.instructions.trim()) {
    return { error: 'Les instructions sont requises' }
  }

  const { data: result, error } = await instructionsTable()
    .upsert(
      {
        client_id: data.client_id,
        room_type_id: data.room_type_id,
        instructions: data.instructions.trim(),
      },
      {
        onConflict: 'client_id,room_type_id',
      }
    )
    .select()
    .single()

  if (error) {
    console.error('Failed to save instruction:', error)
    return { error: 'Erreur lors de l\'enregistrement' }
  }

  return { data: result as ClientRoomInstruction, error: null }
}

/**
 * Update an existing instruction
 */
export async function updateInstruction(
  id: string,
  data: ClientRoomInstructionUpdate
): Promise<ServiceResult<ClientRoomInstruction>> {
  if (!data.instructions.trim()) {
    return { error: 'Les instructions sont requises' }
  }

  const { data: result, error } = await instructionsTable()
    .update({ instructions: data.instructions.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update instruction:', error)
    return { error: 'Erreur lors de la mise à jour' }
  }

  return { data: result as ClientRoomInstruction, error: null }
}

/**
 * Delete an instruction
 */
export async function deleteInstruction(id: string): Promise<ServiceResult> {
  const { error } = await instructionsTable()
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete instruction:', error)
    return { error: 'Erreur lors de la suppression' }
  }

  return { error: null }
}

/**
 * Get all room types (for selection)
 */
export async function getRoomTypes(): Promise<ServiceResult<{ id: string; name_fr: string; icon: string | null }[]>> {
  const { data, error } = await supabase
    .from('room_types')
    .select('id, name_fr, icon')
    .order('name_fr')

  if (error) {
    console.error('Failed to get room types:', error)
    return { data: [], error: 'Erreur lors du chargement des types de pièces' }
  }

  return { data: data || [], error: null }
}
