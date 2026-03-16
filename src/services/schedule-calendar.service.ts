/**
 * Schedule Calendar Service
 * Feature: 010-client-schedule-calendar
 *
 * Service for fetching and organizing schedule entries for calendar display
 */

import { api, ApiError } from '../lib/api'
import type {
  CalendarEvent,
  CalendarDay,
  CalendarMonth,
  CalendarServiceResult,
} from '../lib/types/calendar.types'

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

// ============================================================================
// Data Fetching
// ============================================================================

/**
 * Get all schedule entries for a client in a specific month
 * RLS will filter based on user role (manager sees all, staff sees own)
 */
export async function getClientScheduleForMonth(
  clientId: string,
  year: number,
  month: number
): Promise<CalendarServiceResult<CalendarEvent[]>> {
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const data = await api.get<CalendarEvent[]>(
      `/calendar?client_id=${clientId}&date_from=${startDate}&date_to=${endDate}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to fetch schedule for month:', err)
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get details for a specific schedule entry
 */
export async function getScheduleEntryDetails(
  entryId: string
): Promise<CalendarServiceResult<CalendarEvent | null>> {
  try {
    const data = await api.get<CalendarEvent | null>(`/calendar/${entryId}`)
    return { data, error: null }
  } catch (err) {
    console.error('Failed to fetch schedule entry:', err)
    return { data: null, error: handleError(err) }
  }
}

// ============================================================================
// Calendar Grid Building
// ============================================================================

/**
 * Build a calendar month grid with events placed on their respective days
 * Includes padding days from previous/next months to complete weeks
 */
export function buildCalendarMonth(
  year: number,
  month: number,
  events: CalendarEvent[]
): CalendarMonth {
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // First day of the month
  const firstDayOfMonth = new Date(year, month, 1)
  // Day of week for first day (0 = Sunday, 1 = Monday, ...)
  // We want Monday = 0, so adjust
  let firstDayOfWeek = firstDayOfMonth.getDay()
  firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 // Convert to Monday-based

  // Last day of the month
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  // Create event lookup by date
  const eventsByDate = new Map<string, CalendarEvent[]>()
  for (const event of events) {
    const dateKey = event.scheduledDate
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, [])
    }
    eventsByDate.get(dateKey)!.push(event)
  }

  // Add padding days from previous month
  const prevMonth = month === 0 ? 11 : month - 1
  const prevMonthYear = month === 0 ? year - 1 : year
  const daysInPrevMonth = new Date(prevMonthYear, prevMonth + 1, 0).getDate()

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const date = new Date(prevMonthYear, prevMonth, day)
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    })
  }

  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const isToday = date.getTime() === today.getTime()
    const dayEvents = eventsByDate.get(dateStr) || []

    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: true,
      isToday,
      events: dayEvents,
    })
  }

  // Add padding days from next month to complete the grid (6 rows * 7 days = 42)
  const remainingDays = 42 - days.length
  const nextMonth = month === 11 ? 0 : month + 1
  const nextMonthYear = month === 11 ? year + 1 : year

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextMonthYear, nextMonth, day)
    days.push({
      date,
      dayOfMonth: day,
      isCurrentMonth: false,
      isToday: false,
      events: [],
    })
  }

  return {
    year,
    month,
    days,
  }
}

/**
 * Get list of clients that a staff member has scheduled interventions with
 */
export async function getStaffClients(
  staffMemberId: string
): Promise<CalendarServiceResult<Array<{ id: string; name: string }>>> {
  try {
    const data = await api.get<Array<{ id: string; name: string }>>(
      `/calendar/staff-clients?staff_member_id=${staffMemberId}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    console.error('Failed to fetch staff clients:', err)
    return { data: [], error: handleError(err) }
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format time for display (HH:MM)
 */
export function formatTime(time: string | null): string {
  if (!time) return ''
  // time is in HH:MM:SS format, extract HH:MM
  return time.substring(0, 5)
}

/**
 * Get month name in French
 */
export function getMonthName(month: number): string {
  const months = [
    'Janvier',
    'Fevrier',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Aout',
    'Septembre',
    'Octobre',
    'Novembre',
    'Decembre',
  ]
  return months[month]
}

/**
 * Get day names in French (abbreviated)
 */
export function getDayNames(): string[] {
  return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
}
