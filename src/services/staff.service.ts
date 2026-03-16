/**
 * Staff Service
 * Provides CRUD operations for staff members
 */

import { supabase } from '../lib/supabase'
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

  const { data: staff, error } = await supabase
    .from('staff_members')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Failed to create staff member:', error)
    return { error: 'Échec de la création du membre' }
  }

  return { data: staff, error: null }
}

/**
 * Get all staff members for the current user
 */
export async function getStaffMembers(
  options?: StaffListOptions
): Promise<ServiceResult<StaffMember[]>> {
  let query = supabase.from('staff_members').select('*')

  // Apply isActive filter if specified
  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive)
  }

  // Apply ordering
  const orderBy = options?.orderBy ?? 'created_at'
  const orderDirection = options?.orderDirection ?? 'desc'
  const ascending = orderDirection === 'asc'

  const { data, error } = await query.order(orderBy, { ascending })

  if (error) {
    console.error('Failed to get staff members:', error)
    return { data: [], error: 'Échec du chargement des membres' }
  }

  return { data: data || [], error: null }
}

/**
 * Get a single staff member by ID
 */
export async function getStaffMember(id: string): Promise<ServiceResult<StaffMember>> {
  const { data, error } = await supabase
    .from('staff_members')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to get staff member:', error)
    return { error: 'Membre du personnel non trouvé' }
  }

  return { data, error: null }
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

  const { data: staff, error } = await supabase
    .from('staff_members')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Failed to update staff member:', error)
    return { error: 'Échec de la mise à jour du membre' }
  }

  return { data: staff, error: null }
}

/**
 * Delete a staff member
 */
export async function deleteStaffMember(id: string): Promise<ServiceResult> {
  const { error } = await supabase
    .from('staff_members')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Failed to delete staff member:', error)
    return { error: 'Échec de la suppression du membre' }
  }

  return { error: null }
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
