/**
 * Client Service
 * Provides CRUD operations for clients (billing feature)
 */

import { api, ApiError } from '../lib/api'
import { validateOptionalEmail } from '../lib/utils/errorMessages'
import type { Client, ClientInsert, ClientUpdate } from '../lib/types/billing.types'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

export interface ClientListOptions {
  search?: string
  orderBy?: 'name' | 'created_at' | 'updated_at'
  orderDirection?: 'asc' | 'desc'
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Validate client data
 * @returns Error message or null if valid
 */
export function validateClient(data: ClientInsert | ClientUpdate): string | null {
  // Name is required for create, optional for update
  if ('name' in data && data.name !== undefined) {
    const trimmedName = data.name.trim()
    if (!trimmedName) {
      return 'Le nom du client est requis'
    }
    if (trimmedName.length > 200) {
      return 'Le nom ne peut pas dépasser 200 caractères'
    }
  }

  // Email validation (optional field)
  if (data.email !== undefined && data.email !== null && data.email !== '') {
    const emailError = validateOptionalEmail(data.email)
    if (emailError) return emailError
  }

  // Address validation (optional)
  if (data.address !== undefined && data.address !== null && data.address.length > 500) {
    return "L'adresse ne peut pas dépasser 500 caractères"
  }

  // Phone validation (optional)
  if (data.phone !== undefined && data.phone !== null && data.phone.length > 20) {
    return 'Le téléphone ne peut pas dépasser 20 caractères'
  }

  return null
}

/**
 * Create a new client
 */
export async function createClient(data: ClientInsert): Promise<ServiceResult<Client>> {
  // Validate input
  const validationError = validateClient(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const client = await api.post<Client>('/clients', data)
    return { data: client, error: null }
  } catch (err) {
    console.error('Failed to create client:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get all clients for the current user
 */
export async function getClients(
  options?: ClientListOptions
): Promise<ServiceResult<Client[]>> {
  try {
    const params = new URLSearchParams()
    if (options?.search) {
      params.set('search', options.search)
    }
    if (options?.orderBy) {
      params.set('order_by', options.orderBy)
    }
    if (options?.orderDirection) {
      params.set('order_direction', options.orderDirection)
    }

    const query = params.toString()
    const data = await api.get<Client[]>(`/clients${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get clients:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single client by ID
 */
export async function getClient(id: string): Promise<ServiceResult<Client>> {
  try {
    const data = await api.get<Client>(`/clients/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get client:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update a client
 */
export async function updateClient(
  id: string,
  data: ClientUpdate
): Promise<ServiceResult<Client>> {
  // Validate update data
  const validationError = validateClient(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const client = await api.put<Client>(`/clients/${id}`, data)
    return { data: client, error: null }
  } catch (err) {
    console.error('Failed to update client:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/clients/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete client:', err)
    return { error: handleError(err) }
  }
}
