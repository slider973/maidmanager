/**
 * Time Entry Service
 * Feature: 009-staff-portal (US2)
 * Manages staff clock-in/clock-out functionality
 */

import { api, ApiError } from '../lib/api'
import type {
  TimeEntry,
  TimeEntryWithRelations,
  ClockInRequest,
  ClockOutRequest,
} from '../lib/types/portal.types'

function handleError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error && err.message === 'Failed to fetch') return 'Erreur de connexion'
  return 'Une erreur est survenue'
}

/**
 * Calculate duration in minutes between two timestamps
 */
export function calculateDuration(clockIn: string, clockOut: string): number {
  try {
    const start = new Date(clockIn)
    const end = new Date(clockOut)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0
    }

    const diffMs = end.getTime() - start.getTime()
    return Math.round(diffMs / (1000 * 60))
  } catch {
    return 0
  }
}

/**
 * Get the current open time entry for a staff member
 */
export async function getCurrentEntry(
  staffMemberId: string
): Promise<{ data: TimeEntryWithRelations | null; error: string | null }> {
  try {
    const data = await api.get<TimeEntryWithRelations | null>(
      `/time-entries/current?staff_member_id=${staffMemberId}`
    )
    return { data, error: null }
  } catch (err) {
    return { data: null, error: handleError(err) }
  }
}

/**
 * Clock in - create a new time entry
 */
export async function clockIn(
  staffMemberId: string,
  request: ClockInRequest
): Promise<{ data?: TimeEntry; error: string | null }> {
  const { client_id, notes } = request

  // Validate client_id
  if (!client_id?.trim()) {
    return { error: 'Le client est requis' }
  }

  try {
    const data = await api.post<TimeEntry>('/time-entries/clock-in', {
      staff_member_id: staffMemberId,
      client_id,
      notes: notes || null,
    })
    return { data, error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Clock out - close the current open time entry
 */
export async function clockOut(
  staffMemberId: string,
  request?: ClockOutRequest
): Promise<{ data?: TimeEntry; error: string | null }> {
  try {
    const data = await api.post<TimeEntry>('/time-entries/clock-out', {
      staff_member_id: staffMemberId,
      notes: request?.notes || null,
    })
    return { data, error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

/**
 * Get missing entries (open entries from previous days)
 */
export async function getMissingEntries(
  staffMemberId: string
): Promise<{ data: TimeEntryWithRelations[]; error: string | null }> {
  try {
    const data = await api.get<TimeEntryWithRelations[]>(
      `/time-entries/missing?staff_member_id=${staffMemberId}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get time entries for a date range (for history)
 */
export async function getHistory(
  staffMemberId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ data: TimeEntryWithRelations[]; error: string | null }> {
  try {
    const data = await api.get<TimeEntryWithRelations[]>(
      `/time-entries?staff_member_id=${staffMemberId}&date_from=${dateFrom}&date_to=${dateTo}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get week summary for a staff member
 */
export async function getWeekSummary(
  staffMemberId: string,
  weekStart: string
): Promise<{
  data: {
    week_start: string
    week_end: string
    total_minutes: number
    entries: TimeEntryWithRelations[]
  } | null
  error: string | null
}> {
  const startDate = new Date(weekStart)
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const weekEnd = endDate.toISOString().split('T')[0]

  const { data: entries, error } = await getHistory(staffMemberId, weekStart, weekEnd)

  if (error) {
    return { data: null, error }
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

  return {
    data: {
      week_start: weekStart,
      week_end: weekEnd,
      total_minutes: totalMinutes,
      entries,
    },
    error: null,
  }
}

/**
 * Get day summary for a staff member
 */
export async function getDaySummary(
  staffMemberId: string,
  date: string
): Promise<{
  data: {
    date: string
    total_minutes: number
    entries: TimeEntryWithRelations[]
  } | null
  error: string | null
}> {
  const { data: entries, error } = await getHistory(staffMemberId, date, date)

  if (error) {
    return { data: null, error }
  }

  const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)

  return {
    data: {
      date,
      total_minutes: totalMinutes,
      entries,
    },
    error: null,
  }
}

/**
 * Update a time entry (for corrections by manager)
 */
export async function updateTimeEntry(
  entryId: string,
  updates: {
    clock_in_at?: string
    clock_out_at?: string
    notes?: string
  }
): Promise<{ data?: TimeEntry; error: string | null }> {
  try {
    const data = await api.put<TimeEntry>(`/time-entries/${entryId}`, updates)
    return { data, error: null }
  } catch (err) {
    return { error: handleError(err) }
  }
}

// ============================================================================
// Manager Functions
// ============================================================================

/**
 * Get all time entries for a date range (manager view)
 */
export async function getAllTimeEntries(
  dateFrom: string,
  dateTo: string
): Promise<{ data: TimeEntryWithRelations[]; error: string | null }> {
  try {
    const data = await api.get<TimeEntryWithRelations[]>(
      `/time-entries?date_from=${dateFrom}&date_to=${dateTo}`
    )
    return { data: data || [], error: null }
  } catch (err) {
    return { data: [], error: handleError(err) }
  }
}

/**
 * Get staff work summary for a specific date
 */
export async function getStaffWorkSummary(
  staffMemberId: string,
  date: string
): Promise<{
  data: {
    staff_member_id: string
    staff_name: string
    date: string
    total_minutes: number
    action_count: number
    clients_visited: string[]
    entries: TimeEntryWithRelations[]
  } | null
  error: string | null
}> {
  try {
    const data = await api.get<{
      staff_member_id: string
      staff_name: string
      date: string
      total_minutes: number
      action_count: number
      clients_visited: string[]
      entries: TimeEntryWithRelations[]
    }>(`/time-entries/work-summary?staff_member_id=${staffMemberId}&date=${date}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: handleError(err) }
  }
}

/**
 * Get daily work report for all staff
 */
export async function getDailyReport(
  date: string
): Promise<{
  data: {
    date: string
    staff_summaries: Array<{
      staff_member_id: string
      staff_name: string
      total_minutes: number
      action_count: number
      clients_visited: string[]
      entries: TimeEntryWithRelations[]
    }>
    total_staff_count: number
    total_minutes: number
    total_actions: number
  } | null
  error: string | null
}> {
  try {
    const data = await api.get<{
      date: string
      staff_summaries: Array<{
        staff_member_id: string
        staff_name: string
        total_minutes: number
        action_count: number
        clients_visited: string[]
        entries: TimeEntryWithRelations[]
      }>
      total_staff_count: number
      total_minutes: number
      total_actions: number
    }>(`/time-entries/daily-report?date=${date}`)
    return { data, error: null }
  } catch (err) {
    return { data: null, error: handleError(err) }
  }
}
