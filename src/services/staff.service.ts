/**
 * Staff Service
 * Provides CRUD operations for staff members
 */

import { api, ApiError } from '../lib/api'
import {
  validateOptionalEmail,
  validateRequired,
  staffValidationMessages,
} from '../lib/utils/errorMessages'
import type { StaffMember, StaffMemberInsert, StaffMemberUpdate } from '../lib/types/database'

export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

export interface StaffListOptions {
  isActive?: boolean
  orderBy?: 'first_name' | 'last_name' | 'position' | 'created_at'
  orderDirection?: 'asc' | 'desc'
}

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Validate staff member data for creation
 * @returns Error message or null if valid
 */
export function validateStaffMember(data: StaffMemberInsert): string | null {
  // Required fields
  const firstNameError = validateRequired(data.first_name, staffValidationMessages.firstNameRequired)
  if (firstNameError) return firstNameError

  const lastNameError = validateRequired(data.last_name, staffValidationMessages.lastNameRequired)
  if (lastNameError) return lastNameError

  // Position custom required if position is 'other'
  if (data.position === 'other') {
    const customError = validateRequired(data.position_custom, staffValidationMessages.positionCustomRequired)
    if (customError) return customError
  }

  // Email validation (optional field)
  const emailError = validateOptionalEmail(data.email)
  if (emailError) return emailError

  return null
}

/**
 * Create a new staff member
 */
export async function createStaffMember(
  data: StaffMemberInsert
): Promise<ServiceResult<StaffMember>> {
  // Validate input
  const validationError = validateStaffMember(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const staff = await api.post<StaffMember>('/staff-members', data)
    return { data: staff, error: null }
  } catch (err) {
    console.error('Failed to create staff member:', err)
    return { error: handleError(err) }
  }
}

/**
 * Get all staff members for the current user
 */
export async function getStaffMembers(
  options?: StaffListOptions
): Promise<ServiceResult<StaffMember[]>> {
  try {
    const params = new URLSearchParams()
    if (options?.isActive !== undefined) {
      params.set('is_active', String(options.isActive))
    }
    if (options?.orderBy) {
      params.set('order_by', options.orderBy)
    }
    if (options?.orderDirection) {
      params.set('order_direction', options.orderDirection)
    }

    const query = params.toString()
    const data = await api.get<StaffMember[]>(`/staff-members${query ? `?${query}` : ''}`)
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to get staff members:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffMember(id: string): Promise<ServiceResult<StaffMember>> {
  try {
    const data = await api.get<StaffMember>(`/staff-members/${id}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to get staff member:', err)
    return { error: handleError(err) }
  }
}

/**
 * Update a staff member
 */
export async function updateStaffMember(
  id: string,
  data: StaffMemberUpdate
): Promise<ServiceResult<StaffMember>> {
  // Validate update data if relevant fields are present
  if (data.first_name !== undefined) {
    const firstNameError = validateRequired(data.first_name, staffValidationMessages.firstNameRequired)
    if (firstNameError) return { error: firstNameError }
  }

  if (data.last_name !== undefined) {
    const lastNameError = validateRequired(data.last_name, staffValidationMessages.lastNameRequired)
    if (lastNameError) return { error: lastNameError }
  }

  if (data.position === 'other') {
    const customError = validateRequired(data.position_custom, staffValidationMessages.positionCustomRequired)
    if (customError) return { error: customError }
  }

  if (data.email !== undefined) {
    const emailError = validateOptionalEmail(data.email)
    if (emailError) return { error: emailError }
  }

  try {
    const staff = await api.put<StaffMember>(`/staff-members/${id}`, data)
    return { data: staff, error: null }
  } catch (err) {
    console.error('Failed to update staff member:', err)
    return { error: handleError(err) }
  }
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(id: string): Promise<ServiceResult> {
  try {
    await api.delete(`/staff-members/${id}`)
    return { error: null }
  } catch (err) {
    console.error('Failed to delete staff member:', err)
    return { error: handleError(err) }
  }
}

/**
 * Toggle staff member active status
 */
export async function setStaffMemberActive(
  id: string,
  isActive: boolean
): Promise<ServiceResult<StaffMember>> {
  return updateStaffMember(id, { is_active: isActive })
}
