/**
 * Schedule Calendar Service
 * Feature: 010-client-schedule-calendar
 *
 * Service for fetching and organizing schedule entries for calendar display
 */

import { supabase } from '../lib/supabase'
import type {
  CalendarEvent,
  CalendarDay,
  CalendarMonth,
  CalendarServiceResult,
} from '../lib/types/calendar.types'

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
  // Build date range for the month
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('schedule_entries')
    .select(
      `
      id,
      scheduled_date,
      start_time,
      end_time,
      description,
      status,
      notes,
      staff_member:staff_members(id, first_name, last_name)
    `
    )
    .eq('client_id', clientId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .neq('status', 'cancelled')
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Failed to fetch schedule for month:', error)
    return { data: [], error: 'Erreur lors du chargement du calendrier' }
  }

  // Transform to CalendarEvent format
  const events: CalendarEvent[] = (data || []).map((entry) => ({
    id: entry.id,
    scheduledDate: entry.scheduled_date,
    startTime: entry.start_time,
    endTime: entry.end_time,
    description: entry.description,
    status: entry.status as 'scheduled' | 'completed' | 'cancelled',
    notes: entry.notes,
    staffMember: entry.staff_member
      ? {
          id: (entry.staff_member as { id: string }).id,
          firstName: (entry.staff_member as { first_name: string }).first_name,
          lastName: (entry.staff_member as { last_name: string }).last_name,
        }
      : null,
  }))

  return { data: events, error: null }
}

/**
 * Get details for a specific schedule entry
 */
export async function getScheduleEntryDetails(
  entryId: string
): Promise<CalendarServiceResult<CalendarEvent | null>> {
  const { data, error } = await supabase
    .from('schedule_entries')
    .select(
      `
      id,
      scheduled_date,
      start_time,
      end_time,
      description,
      status,
      notes,
      staff_member:staff_members(id, first_name, last_name)
    `
    )
    .eq('id', entryId)
    .maybeSingle()

  if (error) {
    console.error('Failed to fetch schedule entry:', error)
    return { data: null, error: 'Erreur lors du chargement des details' }
  }

  if (!data) {
    return { data: null, error: null }
  }

  const event: CalendarEvent = {
    id: data.id,
    scheduledDate: data.scheduled_date,
    startTime: data.start_time,
    endTime: data.end_time,
    description: data.description,
    status: data.status as 'scheduled' | 'completed' | 'cancelled',
    notes: data.notes,
    staffMember: data.staff_member
      ? {
          id: (data.staff_member as { id: string }).id,
          firstName: (data.staff_member as { first_name: string }).first_name,
          lastName: (data.staff_member as { last_name: string }).last_name,
        }
      : null,
  }

  return { data: event, error: null }
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
  const { data, error } = await supabase
    .from('schedule_entries')
    .select(
      `
      client:clients(id, name)
    `
    )
    .eq('staff_member_id', staffMemberId)
    .neq('status', 'cancelled')

  if (error) {
    console.error('Failed to fetch staff clients:', error)
    return { data: [], error: 'Erreur lors du chargement des clients' }
  }

  // Extract unique clients
  const clientsMap = new Map<string, string>()
  for (const entry of data || []) {
    const client = entry.client as { id: string; name: string } | null
    if (client && !clientsMap.has(client.id)) {
      clientsMap.set(client.id, client.name)
    }
  }

  const clients = Array.from(clientsMap.entries()).map(([id, name]) => ({
    id,
    name,
  }))

  return { data: clients, error: null }
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
