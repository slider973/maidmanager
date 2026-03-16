/**
 * Client Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createClient,
  getClients,
  getClient,
  updateClient,
  deleteClient,
  validateClient,
} from './client.service'
import type { ClientInsert } from '../lib/types/billing.types'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('createClient', () => {
  const validData: ClientInsert = {
    name: 'Société ABC',
    address: '123 Rue de Paris, 75001 Paris',
    email: 'contact@abc.fr',
    phone: '0123456789',
  }

  it('should create a client with valid data', async () => {
    const mockClient = {
      id: 'client-1',
      user_id: 'test-user-id',
      ...validData,
      notes: null,
      created_at: '2026-02-07T00:00:00Z',
      updated_at: '2026-02-07T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockClient)

    const result = await createClient(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockClient)
    expect(api.post).toHaveBeenCalledWith('/clients', validData)
  })

  it('should return validation error when name is missing', async () => {
    const invalidData = { ...validData, name: '' }

    const result = await createClient(invalidData)

    expect(result.error).toBe('Le nom du client est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when name is too long', async () => {
    const invalidData = { ...validData, name: 'a'.repeat(201) }

    const result = await createClient(invalidData)

    expect(result.error).toBe('Le nom ne peut pas dépasser 200 caractères')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error for invalid email format', async () => {
    const invalidData = { ...validData, email: 'invalid-email' }

    const result = await createClient(invalidData)

    expect(result.error).toBe("Format d'email invalide")
    expect(result.data).toBeUndefined()
  })

  it('should allow valid email', async () => {
    const dataWithEmail = { ...validData, email: 'contact@example.com' }
    const mockClient = {
      id: 'client-1',
      user_id: 'test-user-id',
      ...dataWithEmail,
      notes: null,
      created_at: '2026-02-07T00:00:00Z',
      updated_at: '2026-02-07T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockClient)

    const result = await createClient(dataWithEmail)

    expect(result.error).toBeNull()
    expect(result.data?.email).toBe('contact@example.com')
  })

  it('should handle API error', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Database error', 500))

    const result = await createClient(validData)

    expect(result.error).toBe('Database error')
    expect(result.data).toBeUndefined()
  })
})

describe('getClients', () => {
  it('should return all clients for the user', async () => {
    const mockClients = [
      {
        id: 'client-1',
        user_id: 'test-user-id',
        name: 'Société ABC',
        address: '123 Rue de Paris',
        email: 'contact@abc.fr',
        phone: '0123456789',
        notes: null,
        created_at: '2026-02-07T00:00:00Z',
        updated_at: '2026-02-07T00:00:00Z',
      },
      {
        id: 'client-2',
        user_id: 'test-user-id',
        name: 'Entreprise XYZ',
        address: '456 Avenue des Champs',
        email: 'info@xyz.fr',
        phone: '0987654321',
        notes: 'Client VIP',
        created_at: '2026-02-07T00:00:00Z',
        updated_at: '2026-02-07T00:00:00Z',
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockClients)

    const result = await getClients()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(mockClients)
  })

  it('should return empty array when no clients', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getClients()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should filter by search term when provided', async () => {
    const mockClients = [
      {
        id: 'client-1',
        user_id: 'test-user-id',
        name: 'Société ABC',
        address: '123 Rue de Paris',
        email: 'contact@abc.fr',
        phone: '0123456789',
        notes: null,
        created_at: '2026-02-07T00:00:00Z',
        updated_at: '2026-02-07T00:00:00Z',
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockClients)

    const result = await getClients({ search: 'ABC' })

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockClients)
    expect(api.get).toHaveBeenCalledWith('/clients?search=ABC')
  })

  it('should handle API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Database error', 500))

    const result = await getClients()

    expect(result.error).toBe('Database error')
    expect(result.data).toEqual([])
  })
})

describe('getClient', () => {
  it('should return a single client by ID', async () => {
    const mockClient = {
      id: 'client-1',
      user_id: 'test-user-id',
      name: 'Société ABC',
      address: '123 Rue de Paris',
      email: 'contact@abc.fr',
      phone: '0123456789',
      notes: null,
      created_at: '2026-02-07T00:00:00Z',
      updated_at: '2026-02-07T00:00:00Z',
    }

    vi.mocked(api.get).mockResolvedValue(mockClient)

    const result = await getClient('client-1')

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockClient)
    expect(api.get).toHaveBeenCalledWith('/clients/client-1')
  })

  it('should return error when client not found', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Client non trouvé', 404))

    const result = await getClient('non-existent-id')

    expect(result.error).toBe('Client non trouvé')
    expect(result.data).toBeUndefined()
  })
})

describe('updateClient', () => {
  it('should update a client successfully', async () => {
    const updateData = { name: 'Nouveau Nom' }
    const mockClient = {
      id: 'client-1',
      user_id: 'test-user-id',
      name: 'Nouveau Nom',
      address: '123 Rue de Paris',
      email: 'contact@abc.fr',
      phone: '0123456789',
      notes: null,
      created_at: '2026-02-07T00:00:00Z',
      updated_at: '2026-02-07T01:00:00Z',
    }

    vi.mocked(api.put).mockResolvedValue(mockClient)

    const result = await updateClient('client-1', updateData)

    expect(result.error).toBeNull()
    expect(result.data?.name).toBe('Nouveau Nom')
  })

  it('should validate update data', async () => {
    const invalidData = { name: '' }

    const result = await updateClient('client-1', invalidData)

    expect(result.error).toBe('Le nom du client est requis')
    expect(result.data).toBeUndefined()
  })
})

describe('deleteClient', () => {
  it('should delete a client successfully', async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined)

    const result = await deleteClient('client-1')

    expect(result.error).toBeNull()
    expect(api.delete).toHaveBeenCalledWith('/clients/client-1')
  })

  it('should handle delete error', async () => {
    vi.mocked(api.delete).mockRejectedValue(new ApiError('Cannot delete', 500))

    const result = await deleteClient('client-1')

    expect(result.error).toBe('Cannot delete')
  })
})

describe('validateClient', () => {
  it('should return null for valid data', () => {
    const validData: ClientInsert = {
      name: 'Société ABC',
    }

    expect(validateClient(validData)).toBeNull()
  })

  it('should return error for empty name', () => {
    const data: ClientInsert = {
      name: '',
    }

    expect(validateClient(data)).toBe('Le nom du client est requis')
  })

  it('should return error for whitespace-only name', () => {
    const data: ClientInsert = {
      name: '   ',
    }

    expect(validateClient(data)).toBe('Le nom du client est requis')
  })

  it('should return error for name exceeding 200 characters', () => {
    const data: ClientInsert = {
      name: 'a'.repeat(201),
    }

    expect(validateClient(data)).toBe('Le nom ne peut pas dépasser 200 caractères')
  })

  it('should return error for invalid email format', () => {
    const data: ClientInsert = {
      name: 'Test Client',
      email: 'invalid-email',
    }

    expect(validateClient(data)).toBe("Format d'email invalide")
  })

  it('should pass with valid email', () => {
    const data: ClientInsert = {
      name: 'Test Client',
      email: 'contact@example.com',
    }

    expect(validateClient(data)).toBeNull()
  })

  it('should pass with empty optional email', () => {
    const data: ClientInsert = {
      name: 'Test Client',
      email: '',
    }

    expect(validateClient(data)).toBeNull()
  })

  it('should pass with null email', () => {
    const data: ClientInsert = {
      name: 'Test Client',
      email: null,
    }

    expect(validateClient(data)).toBeNull()
  })
})
