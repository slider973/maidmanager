/**
 * Calendar Types
 * Feature: 010-client-schedule-calendar
 *
 * Types for the client schedule calendar feature
 */

// ============================================================================
// Calendar Event (represents a schedule_entry)
// ============================================================================

export interface CalendarEvent {
  id: string
  scheduledDate: string // YYYY-MM-DD
  startTime: string | null // HH:MM:SS
  endTime: string | null // HH:MM:SS
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  staffMember?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

// ============================================================================
// Calendar Day (a single cell in the calendar grid)
// ============================================================================

export interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

// ============================================================================
// Calendar Month (the full calendar grid)
// ============================================================================

export interface CalendarMonth {
  year: number
  month: number // 0-11 (JavaScript convention)
  days: CalendarDay[]
}

// ============================================================================
// Service Result
// ============================================================================

export interface CalendarServiceResult<T> {
  data: T
  error: string | null
}
