/**
 * Staff Payments Types
 * Feature: 008-staff-payments
 *
 * Contract types for work sessions and staff payments.
 * All monetary values are stored in cents (integer) for precision.
 */

// ============================================================================
// Work Session Types
// ============================================================================

/**
 * Work session as stored in database
 */
export interface WorkSession {
  id: string
  user_id: string
  staff_member_id: string
  schedule_entry_id: string | null
  session_date: string // DATE format: YYYY-MM-DD
  duration_minutes: number
  hourly_rate_cents: number
  amount_cents: number // Calculated: duration_minutes * hourly_rate_cents / 60
  description: string
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Work session with staff member details (for display)
 */
export interface WorkSessionWithStaff extends WorkSession {
  staff_member: {
    id: string
    first_name: string
    last_name: string
    position: string
  } | null
}

/**
 * Data for creating a new work session
 */
export interface WorkSessionInsert {
  staff_member_id: string
  schedule_entry_id?: string | null
  session_date: string
  duration_minutes: number
  hourly_rate_cents: number
  description: string
  notes?: string | null
}

/**
 * Data for updating an existing work session
 */
export interface WorkSessionUpdate {
  session_date?: string
  duration_minutes?: number
  hourly_rate_cents?: number
  description?: string
  notes?: string | null
}

// ============================================================================
// Staff Payment Types
// ============================================================================

/**
 * Payment modes (suggestions, not exhaustive)
 */
export const PAYMENT_METHODS = ['Espèces', 'Virement', 'Chèque'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

/**
 * Payment method labels (same as values for FR)
 */
export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Espèces: 'Espèces',
  Virement: 'Virement',
  Chèque: 'Chèque',
}

/**
 * Staff payment as stored in database
 */
export interface StaffPayment {
  id: string
  user_id: string
  staff_member_id: string
  amount_cents: number
  payment_date: string // DATE format: YYYY-MM-DD
  payment_method: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

/**
 * Staff payment with staff member details (for display)
 */
export interface StaffPaymentWithStaff extends StaffPayment {
  staff_member: {
    id: string
    first_name: string
    last_name: string
    position: string
  } | null
}

/**
 * Data for creating a new payment
 */
export interface StaffPaymentInsert {
  staff_member_id: string
  amount_cents: number
  payment_date: string
  payment_method?: string | null
  notes?: string | null
}

/**
 * Data for updating an existing payment
 */
export interface StaffPaymentUpdate {
  amount_cents?: number
  payment_date?: string
  payment_method?: string | null
  notes?: string | null
}

// ============================================================================
// Balance Types
// ============================================================================

/**
 * Staff member balance summary
 */
export interface StaffBalance {
  staff_member_id: string
  first_name: string
  last_name: string
  position: string
  total_work_cents: number // Sum of all work sessions
  total_paid_cents: number // Sum of all payments
  balance_cents: number // total_work - total_paid (positive = owed to employee)
}

/**
 * Global balance summary
 */
export interface GlobalBalance {
  total_work_cents: number
  total_paid_cents: number
  total_balance_cents: number
  staff_count: number
}

// ============================================================================
// History Types
// ============================================================================

/**
 * Union type for history entries (work session or payment)
 */
export type HistoryEntryType = 'work_session' | 'payment'

/**
 * Unified history entry for timeline display
 */
export interface HistoryEntry {
  id: string
  type: HistoryEntryType
  date: string // session_date or payment_date
  amount_cents: number
  description: string // description for work, "Paiement" for payment
  details: string | null // notes
  created_at: string
}

// ============================================================================
// Filter Types
// ============================================================================

/**
 * Filters for work sessions list
 */
export interface WorkSessionFilters {
  staffMemberId?: string
  startDate?: string
  endDate?: string
}

/**
 * Filters for payments list
 */
export interface StaffPaymentFilters {
  staffMemberId?: string
  startDate?: string
  endDate?: string
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format cents to CHF currency string
 * @example formatMoney(4500) → "CHF 45.00"
 */
export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString('fr-CH', {
    style: 'currency',
    currency: 'CHF',
  })
}

/**
 * Parse CHF amount to cents
 * @example parseMoney("45.50") → 4550
 * @example parseMoney("45,50") → 4550
 */
export function parseMoney(value: string): number {
  const normalized = value.replace(',', '.').replace(/[^\d.-]/g, '')
  return Math.round(parseFloat(normalized) * 100) || 0
}

/**
 * Convert hours (decimal) to minutes
 * @example hoursToMinutes(1.5) → 90
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60)
}

/**
 * Convert minutes to hours (decimal)
 * @example minutesToHours(90) → 1.5
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60
}

/**
 * Format duration in minutes to human-readable string
 * @example formatDuration(90) → "1h30"
 * @example formatDuration(60) → "1h"
 * @example formatDuration(30) → "30min"
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours === 0) return `${mins}min`
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins.toString().padStart(2, '0')}`
}

/**
 * Calculate amount from duration and hourly rate
 * @example calculateAmount(90, 1500) → 2250 (1.5h × 15€ = 22.50€)
 */
export function calculateAmount(
  durationMinutes: number,
  hourlyRateCents: number
): number {
  return Math.round((durationMinutes * hourlyRateCents) / 60)
}
