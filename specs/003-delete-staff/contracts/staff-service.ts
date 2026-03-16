/**
 * Staff Service Contract - Delete Operations
 * Feature: 003-delete-staff
 *
 * This contract defines the interface for staff deletion operations.
 * The implementation already exists in src/services/staff.service.ts
 */

/**
 * Result type for service operations
 */
export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

/**
 * Delete a staff member by ID
 *
 * @param id - UUID of the staff member to delete
 * @returns ServiceResult with error message if failed
 *
 * @security
 * - RLS policy ensures only owner can delete their staff members
 * - Returns error if user doesn't own the staff member
 *
 * @example
 * const result = await deleteStaffMember('123e4567-e89b-12d3-a456-426614174000')
 * if (result.error) {
 *   showError(result.error)
 * } else {
 *   showSuccess('Membre supprimé')
 * }
 */
export async function deleteStaffMember(id: string): Promise<ServiceResult>
