/**
 * Staff Service Tests
 * TDD: Write tests first, then implement
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api, ApiError } from '../lib/api'
import {
  createStaffMember,
  getStaffMembers,
  getStaffMember,
  validateStaffMember,
} from './staff.service'
import type { StaffMemberInsert } from '../lib/types/database'

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks()
})

describe('createStaffMember', () => {
  const validData: StaffMemberInsert = {
    user_id: 'test-user-id',
    first_name: 'Jean',
    last_name: 'Dupont',
    position: 'housekeeper',
  }

  it('should create a staff member with valid data', async () => {
    const mockStaff = {
      id: 'staff-1',
      ...validData,
      position_custom: null,
      phone: null,
      email: null,
      start_date: null,
      notes: null,
      is_active: true,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockStaff)

    const result = await createStaffMember(validData)

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockStaff)
    expect(api.post).toHaveBeenCalledWith('/staff-members', validData)
  })

  it('should return validation error when first_name is missing', async () => {
    const invalidData = { ...validData, first_name: '' }

    const result = await createStaffMember(invalidData)

    expect(result.error).toBe('Le prénom est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when last_name is missing', async () => {
    const invalidData = { ...validData, last_name: '' }

    const result = await createStaffMember(invalidData)

    expect(result.error).toBe('Le nom est requis')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error when position_custom is required but missing', async () => {
    const invalidData: StaffMemberInsert = {
      ...validData,
      position: 'other',
      position_custom: '',
    }

    const result = await createStaffMember(invalidData)

    expect(result.error).toBe('Veuillez préciser le poste')
    expect(result.data).toBeUndefined()
  })

  it('should return validation error for invalid email format', async () => {
    const invalidData = { ...validData, email: 'invalid-email' }

    const result = await createStaffMember(invalidData)

    expect(result.error).toBe("Format d'email invalide")
    expect(result.data).toBeUndefined()
  })

  it('should allow valid email', async () => {
    const dataWithEmail = { ...validData, email: 'jean@example.com' }
    const mockStaff = {
      id: 'staff-1',
      ...dataWithEmail,
      position_custom: null,
      phone: null,
      start_date: null,
      notes: null,
      is_active: true,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.post).mockResolvedValue(mockStaff)

    const result = await createStaffMember(dataWithEmail)

    expect(result.error).toBeNull()
    expect(result.data?.email).toBe('jean@example.com')
  })

  it('should handle API error', async () => {
    vi.mocked(api.post).mockRejectedValue(new ApiError('Database error', 500))

    const result = await createStaffMember(validData)

    expect(result.error).toBe('Database error')
    expect(result.data).toBeUndefined()
  })
})

describe('getStaffMembers', () => {
  it('should return all staff members for the user', async () => {
    const mockStaff = [
      {
        id: 'staff-1',
        user_id: 'test-user-id',
        first_name: 'Jean',
        last_name: 'Dupont',
        position: 'housekeeper',
        position_custom: null,
        phone: null,
        email: null,
        start_date: null,
        notes: null,
        is_active: true,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
      {
        id: 'staff-2',
        user_id: 'test-user-id',
        first_name: 'Marie',
        last_name: 'Martin',
        position: 'cook',
        position_custom: null,
        phone: '0612345678',
        email: 'marie@example.com',
        start_date: '2026-01-01',
        notes: 'Excellente cuisinière',
        is_active: true,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockStaff)

    const result = await getStaffMembers()

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(mockStaff)
  })

  it('should return empty array when no staff members', async () => {
    vi.mocked(api.get).mockResolvedValue([])

    const result = await getStaffMembers()

    expect(result.error).toBeNull()
    expect(result.data).toEqual([])
  })

  it('should filter by isActive when provided', async () => {
    const mockActiveStaff = [
      {
        id: 'staff-1',
        user_id: 'test-user-id',
        first_name: 'Jean',
        last_name: 'Dupont',
        position: 'housekeeper',
        position_custom: null,
        phone: null,
        email: null,
        start_date: null,
        notes: null,
        is_active: true,
        created_at: '2026-02-06T00:00:00Z',
        updated_at: '2026-02-06T00:00:00Z',
      },
    ]

    vi.mocked(api.get).mockResolvedValue(mockActiveStaff)

    const result = await getStaffMembers({ isActive: true })

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockActiveStaff)
    expect(api.get).toHaveBeenCalledWith('/staff-members?is_active=true')
  })

  it('should handle API error', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Database error', 500))

    const result = await getStaffMembers()

    expect(result.error).toBe('Database error')
    expect(result.data).toEqual([])
  })
})

describe('getStaffMember', () => {
  it('should return a single staff member by ID', async () => {
    const mockStaff = {
      id: 'staff-1',
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'housekeeper',
      position_custom: null,
      phone: null,
      email: null,
      start_date: null,
      notes: null,
      is_active: true,
      created_at: '2026-02-06T00:00:00Z',
      updated_at: '2026-02-06T00:00:00Z',
    }

    vi.mocked(api.get).mockResolvedValue(mockStaff)

    const result = await getStaffMember('staff-1')

    expect(result.error).toBeNull()
    expect(result.data).toEqual(mockStaff)
    expect(api.get).toHaveBeenCalledWith('/staff-members/staff-1')
  })

  it('should return error when staff member not found', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Membre du personnel non trouvé', 404))

    const result = await getStaffMember('non-existent-id')

    expect(result.error).toBe('Membre du personnel non trouvé')
    expect(result.data).toBeUndefined()
  })
})

describe('validateStaffMember', () => {
  it('should return null for valid data', () => {
    const validData: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'housekeeper',
    }

    expect(validateStaffMember(validData)).toBeNull()
  })

  it('should return error for empty first_name', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: '',
      last_name: 'Dupont',
      position: 'housekeeper',
    }

    expect(validateStaffMember(data)).toBe('Le prénom est requis')
  })

  it('should return error for empty last_name', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: '',
      position: 'housekeeper',
    }

    expect(validateStaffMember(data)).toBe('Le nom est requis')
  })

  it('should return error for position=other without position_custom', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'other',
    }

    expect(validateStaffMember(data)).toBe('Veuillez préciser le poste')
  })

  it('should pass when position=other with position_custom', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'other',
      position_custom: 'Assistant',
    }

    expect(validateStaffMember(data)).toBeNull()
  })

  it('should return error for invalid email format', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'housekeeper',
      email: 'invalid-email',
    }

    expect(validateStaffMember(data)).toBe("Format d'email invalide")
  })

  it('should pass with valid email', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'housekeeper',
      email: 'jean@example.com',
    }

    expect(validateStaffMember(data)).toBeNull()
  })

  it('should pass with empty optional email', () => {
    const data: StaffMemberInsert = {
      user_id: 'test-user-id',
      first_name: 'Jean',
      last_name: 'Dupont',
      position: 'housekeeper',
      email: '',
    }

    expect(validateStaffMember(data)).toBeNull()
  })
})
