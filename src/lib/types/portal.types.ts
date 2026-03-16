/**
 * Staff Portal Types
 * Feature: 009-staff-portal
 *
 * These types define the data structures for the staff portal feature.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

export const TIME_ENTRY_STATUSES = ['open', 'closed', 'cancelled'] as const
export type TimeEntryStatus = (typeof TIME_ENTRY_STATUSES)[number]

export const TIME_ENTRY_STATUS_LABELS: Record<TimeEntryStatus, string> = {
  open: 'En cours',
  closed: 'Termine',
  cancelled: 'Annule',
}

// ============================================================================
// Room Types (Referentiel pieces)
// ============================================================================

export interface RoomType {
  id: string
  user_id: string | null // NULL = system, non-null = custom
  name: string // Technical name (slug)
  name_fr: string // French label
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface RoomTypeInsert {
  name: string
  name_fr: string
  icon?: string | null
  sort_order?: number
  is_active?: boolean
}

// ============================================================================
// Action Types (Referentiel actions)
// ============================================================================

export interface ActionType {
  id: string
  user_id: string | null // NULL = system, non-null = custom
  name: string // Technical name (slug)
  name_fr: string // French label
  position_filter: string[] | null // Staff positions that can use this action
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ActionTypeInsert {
  name: string
  name_fr: string
  position_filter?: string[] | null
  sort_order?: number
  is_active?: boolean
}

// ============================================================================
// Time Entries (Pointages)
// ============================================================================

export interface TimeEntry {
  id: string
  user_id: string
  staff_member_id: string
  client_id: string
  clock_in_at: string // ISO timestamp
  clock_out_at: string | null // ISO timestamp, null if still open
  duration_minutes: number | null // Calculated on clock-out
  work_session_id: string | null // Link to created work_session
  status: TimeEntryStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TimeEntryWithRelations extends TimeEntry {
  staff_member: {
    id: string
    first_name: string
    last_name: string
    position: string
  }
  client: {
    id: string
    name: string
  }
  room_actions?: RoomAction[]
}

export interface TimeEntryInsert {
  staff_member_id: string
  client_id: string
  clock_in_at?: string // Defaults to now()
  notes?: string | null
}

export interface TimeEntryUpdate {
  clock_out_at?: string
  duration_minutes?: number
  status?: TimeEntryStatus
  notes?: string | null
}

export interface ClockInRequest {
  client_id: string
  notes?: string
}

export interface ClockOutRequest {
  notes?: string
}

// ============================================================================
// Room Actions (Actions par piece)
// ============================================================================

export interface RoomAction {
  id: string
  time_entry_id: string
  room_type_id: string
  action_type_id: string
  client_room_id: string | null // Link to specific client room
  performed_at: string // ISO timestamp
  notes: string | null
  created_at: string
}

export interface RoomActionWithRelations extends RoomAction {
  room_type: Pick<RoomType, 'id' | 'name' | 'name_fr' | 'icon'>
  action_type: Pick<ActionType, 'id' | 'name' | 'name_fr'>
  client_room?: {
    id: string
    custom_name: string
    instructions: string | null
  } | null
}

export interface RoomActionInsert {
  time_entry_id: string
  room_type_id: string
  action_type_id: string
  client_room_id?: string | null // Optional link to specific client room
  performed_at?: string // Defaults to now()
  notes?: string | null
}

// ============================================================================
// Staff Account (Liaison compte/staff)
// ============================================================================

export interface StaffAccountLink {
  profile_id: string // auth.users.id
  staff_member_id: string
  linked_at: string
}

export interface InviteStaffRequest {
  staff_member_id: string
  email: string
}

export interface InviteStaffResponse {
  success: boolean
  message: string
  invitation_sent_at?: string
}

// ============================================================================
// Portal State & Views
// ============================================================================

export interface PortalState {
  isStaff: boolean
  staffMemberId: string | null
  currentTimeEntry: TimeEntry | null
  todayActions: RoomAction[]
}

export interface StaffDaySummary {
  date: string // YYYY-MM-DD
  total_minutes: number
  time_entries: TimeEntryWithRelations[]
  action_count: number
}

export interface StaffWeekSummary {
  week_start: string // YYYY-MM-DD (Monday)
  week_end: string // YYYY-MM-DD (Sunday)
  total_minutes: number
  days: StaffDaySummary[]
}

// ============================================================================
// Manager Views
// ============================================================================

export interface StaffWorkSummary {
  staff_member_id: string
  staff_name: string
  date: string
  total_minutes: number
  action_count: number
  clients_visited: string[]
}

export interface DailyWorkReport {
  date: string
  staff_summaries: StaffWorkSummary[]
  total_staff_count: number
  total_minutes: number
  total_actions: number
}

// ============================================================================
// Filters
// ============================================================================

export interface TimeEntryFilters {
  staff_member_id?: string
  client_id?: string
  status?: TimeEntryStatus
  date_from?: string // YYYY-MM-DD
  date_to?: string // YYYY-MM-DD
}

export interface RoomActionFilters {
  time_entry_id?: string
  room_type_id?: string
  action_type_id?: string
  date_from?: string
  date_to?: string
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Check if user is a staff member (has linked staff account)
 */
export type IsStaffMember = (userId: string) => Promise<boolean>

/**
 * Get staff member ID for authenticated user
 */
export type GetStaffMemberIdForUser = (userId: string) => Promise<string | null>

/**
 * Calculate duration in minutes between two timestamps
 */
export type CalculateDuration = (clockIn: string, clockOut: string) => number

/**
 * Check if staff has open (unclosed) time entry
 */
export type HasOpenTimeEntry = (staffMemberId: string) => Promise<boolean>

/**
 * Get action types filtered by staff position
 */
export type GetActionTypesForPosition = (position: string) => Promise<ActionType[]>
