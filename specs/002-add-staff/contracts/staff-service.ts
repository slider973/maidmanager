/**
 * Staff Service Contract
 * Defines the interface for staff management operations
 *
 * This is a contract file - implementation in src/services/staff.service.ts
 */

import type { StaffMember, StaffMemberInsert, StaffMemberUpdate } from '../../../src/lib/types/database';

/**
 * Result type for all service operations
 */
export interface ServiceResult<T = void> {
  data?: T;
  error: string | null;
}

/**
 * Filter options for listing staff members
 */
export interface StaffListOptions {
  /** Filter by active status. If undefined, returns all. */
  isActive?: boolean;
  /** Order by field */
  orderBy?: 'first_name' | 'last_name' | 'position' | 'created_at';
  /** Order direction */
  orderDirection?: 'asc' | 'desc';
}

/**
 * Staff Service Interface
 */
export interface IStaffService {
  /**
   * Create a new staff member
   * @param data - Staff member data (user_id auto-filled from auth)
   * @returns Created staff member or error
   */
  createStaffMember(data: StaffMemberInsert): Promise<ServiceResult<StaffMember>>;

  /**
   * Get all staff members for the current user
   * @param options - Optional filters and sorting
   * @returns List of staff members or error
   */
  getStaffMembers(options?: StaffListOptions): Promise<ServiceResult<StaffMember[]>>;

  /**
   * Get a single staff member by ID
   * @param id - Staff member UUID
   * @returns Staff member or error
   */
  getStaffMember(id: string): Promise<ServiceResult<StaffMember>>;

  /**
   * Update a staff member
   * @param id - Staff member UUID
   * @param data - Fields to update
   * @returns Updated staff member or error
   */
  updateStaffMember(id: string, data: StaffMemberUpdate): Promise<ServiceResult<StaffMember>>;

  /**
   * Delete a staff member (hard delete)
   * @param id - Staff member UUID
   * @returns Success or error
   */
  deleteStaffMember(id: string): Promise<ServiceResult>;

  /**
   * Toggle staff member active status
   * @param id - Staff member UUID
   * @param isActive - New active status
   * @returns Updated staff member or error
   */
  setStaffMemberActive(id: string, isActive: boolean): Promise<ServiceResult<StaffMember>>;
}

/**
 * Validation functions
 */
export interface IStaffValidation {
  /**
   * Validate staff member data for creation
   * @returns Error message or null if valid
   */
  validateCreate(data: StaffMemberInsert): string | null;

  /**
   * Validate email format
   * @returns Error message or null if valid
   */
  validateEmail(email: string): string | null;

  /**
   * Validate required fields are not empty
   * @returns Error message or null if valid
   */
  validateRequired(value: string, fieldName: string): string | null;
}
