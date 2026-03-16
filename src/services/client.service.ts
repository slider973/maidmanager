/**
 * Client Service
 * Provides CRUD operations for clients (billing feature)
 */

import { supabase } from '../lib/supabase'
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

  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Failed to create client:', error)
    return { error: 'Échec de la création du client' }
  }

  return { data: client, error: null }
}

/**
 * Get all clients for the current user
 */
export async function getClients(
  options?: ClientListOptions
): Promise<ServiceResult<Client[]>> {
  let query = supabase.from('clients').select('*')

  // Apply search filter if specified
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  // Apply ordering
  const orderBy = options?.orderBy ?? 'name'
  const orderDirection = options?.orderDirection ?? 'asc'
  const ascending = orderDirection === 'asc'

  const { data, error } = await query.order(orderBy, { ascending })

  if (error) {
    console.error('Failed to get clients:', error)
    return { data: [], error: 'Échec du chargement des clients' }
  }

  return { data: data || [], error: null }
}

/**
 * Get a single client by ID
 */
export async function getClient(id: string): Promise<ServiceResult<Client>> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to get client:', error)
    return { error: 'Client non trouvé' }
  }

  return { data, error: null }
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

  const { data: client, error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update client:', error)
    return { error: 'Échec de la mise à jour du client' }
  }

  return { data: client, error: null }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<ServiceResult> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete client:', error)
    return { error: 'Échec de la suppression du client' }
  }

  return { error: null }
}
