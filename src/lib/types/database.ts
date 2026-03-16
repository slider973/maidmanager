/**
 * Database Types
 * Core entity types that map to Supabase database tables.
 * Re-created after migration to restore imports across the codebase.
 */

// ============================================================================
// Staff Position Types
// ============================================================================

export const STAFF_POSITIONS = [
  'housekeeper',
  'gardener',
  'cook',
  'driver',
  'nanny',
  'guard',
  'other',
] as const
export type StaffPosition = (typeof STAFF_POSITIONS)[number]

export const POSITION_LABELS: Record<StaffPosition, string> = {
  housekeeper: 'Femme de ménage',
  gardener: 'Jardinier',
  cook: 'Cuisinier(ère)',
  driver: 'Chauffeur',
  nanny: 'Nounou',
  guard: 'Gardien',
  other: 'Autre',
}

// ============================================================================
// Schedule Status Types
// ============================================================================

export const SCHEDULE_STATUSES = ['scheduled', 'completed', 'cancelled'] as const
export type ScheduleStatus = (typeof SCHEDULE_STATUSES)[number]

export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé',
}

// ============================================================================
// Staff Member Entity
// ============================================================================

export interface StaffMember {
  id: string
  user_id: string
  first_name: string
  last_name: string
  position: StaffPosition
  position_custom: string | null
  phone: string | null
  email: string | null
  start_date: string | null
  hourly_rate_cents: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffMemberInsert {
  user_id?: string | number
  first_name: string
  last_name: string
  position: StaffPosition
  position_custom?: string | null
  phone?: string | null
  email?: string | null
  start_date?: string | null
  hourly_rate_cents?: number
  notes?: string | null
  is_active?: boolean
}

export interface StaffMemberUpdate {
  first_name?: string
  last_name?: string
  position?: StaffPosition
  position_custom?: string | null
  phone?: string | null
  email?: string | null
  start_date?: string | null
  hourly_rate_cents?: number
  notes?: string | null
  is_active?: boolean
}

// ============================================================================
// Schedule Entry Entity
// ============================================================================

export interface ScheduleEntry {
  id: string
  user_id: string
  staff_member_id: string | null
  client_id: string | null
  scheduled_date: string
  start_time: string
  end_time: string | null
  description: string
  status: ScheduleStatus
  notes: string | null
  amount: number | null
  created_at: string
  updated_at: string
}

export interface ScheduleEntryWithStaff extends ScheduleEntry {
  staff_member: {
    id: string
    first_name: string
    last_name: string
    position: StaffPosition
  } | null
  client?: {
    id: string
    name: string
  } | null
}

export interface ScheduleEntryInsert {
  staff_member_id: string
  client_id?: string | null
  scheduled_date: string
  start_time: string
  end_time?: string | null
  description?: string
  status?: ScheduleStatus
  notes?: string | null
  amount?: number | null
}

export interface ScheduleEntryUpdate {
  staff_member_id?: string
  client_id?: string | null
  scheduled_date?: string
  start_time?: string
  end_time?: string | null
  description?: string
  status?: ScheduleStatus
  notes?: string | null
  amount?: number | null
}

export interface ScheduleFilters {
  staffMemberId?: string
  clientId?: string
  status?: ScheduleStatus
  dateFrom?: string
  dateTo?: string
}

// ============================================================================
// User Session Entity
// ============================================================================

export interface UserSession {
  id: string
  user_id: string
  device_info: string | null
  browser: string | null
  os: string | null
  is_current: boolean
  last_active_at: string
  created_at: string
}

export interface UserSessionInsert {
  user_id: string
  device_info?: string | null
  browser?: string | null
  os?: string | null
  is_current?: boolean
}

// ============================================================================
// Utility re-export
// ============================================================================

// parseMoney is also available from payments.types.ts, but many files
// import it from this module for convenience.
export { parseMoney } from './payments.types'
