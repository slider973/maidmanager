/**
 * Client Room Instruction Service
 * Feature: 009-staff-portal
 * Manages instructions per room type for each client
 */

import { api, ApiError } from '../lib/api'
import type {
  ClientRoomInstruction,
  ClientRoomInstructionWithRoom,
  ClientRoomInstructionInsert,
  ClientRoomInstructionUpdate,
} from '../lib/types/billing.types'

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
 * Get all instructions for a client
 */
export async function getInstructionsForClient(
  clientId: string
): Promise<ServiceResult<ClientRoomInstructionWithRoom[]>> {
  try {
    const data = await api.get<ClientRoomInstructionWithRoom[]>(`/client-room-instructions?client_id=${clientId}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get instructions:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get instruction for a specific client and room type
 */
export async function getInstructionForRoom(
  clientId: string,
  roomTypeId: string
): Promise<ServiceResult<ClientRoomInstruction | null>> {
  try {
    const data = await api.get<ClientRoomInstruction | null>(
      `/client-room-instructions?client_id=${clientId}&room_type_id=${roomTypeId}&single=true`
    )
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get instruction:', err)
    return { error: handleError(err) }
  }
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

  try {
    const result = await api.post<ClientRoomInstruction>('/client-room-instructions', {
      client_id: data.client_id,
      room_type_id: data.room_type_id,
      instructions: data.instructions.trim(),
    })
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to save instruction:', err)
    return { error: handleError(err) }
  }
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

  try {
    const result = await api.put<ClientRoomInstruction>(`/client-room-instructions/${id}`, {
      instructions: data.instructions.trim(),
    })
    return { data: result, error: null }
  } catch (err) {
    console.error('Failed to update instruction:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete an instruction
 */
export async function deleteInstruction(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/client-room-instructions/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete instruction:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get all room types (for selection)
 */
export async function getRoomTypes(): Promise<ServiceResult<{ id: string; name_fr: string; icon: string | null }[]>> {
  try {
    const data = await api.get<{ id: string; name_fr: string; icon: string | null }[]>('/room-types?fields=id,name_fr,icon')
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get room types:', err)
    return { data: [], error: handleError(err) }
  }
}
