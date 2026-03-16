/**
 * Time Entry Service
 * Feature: 009-staff-portal (US2)
 * Manages staff clock-in/clock-out functionality
 */

import { supabase } from '../lib/supabase'
import type {
  TimeEntry,
  TimeEntryWithRelations,
  ClockInRequest,
  ClockOutRequest,
} from '../lib/types/portal.types'

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
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name)
    `)
    .eq('staff_member_id', staffMemberId)
    .eq('status', 'open')
    .maybeSingle()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as TimeEntryWithRelations | null, error: null }
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

  // Check for existing open entry
  const { data: existingEntry } = await supabase
    .from('time_entries')
    .select('id, status')
    .eq('staff_member_id', staffMemberId)
    .eq('status', 'open')
    .maybeSingle()

  if (existingEntry) {
    return { error: 'Vous etes deja pointe. Veuillez d\'abord pointer votre sortie.' }
  }

  // Get the staff member to find the owner (user_id)
  const { data: staffMember, error: staffError } = await supabase
    .from('staff_members')
    .select('user_id')
    .eq('id', staffMemberId)
    .single()

  if (staffError || !staffMember) {
    return { error: 'Membre du personnel introuvable' }
  }

  // Create new time entry
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      user_id: staffMember.user_id,
      staff_member_id: staffMemberId,
      client_id,
      notes: notes || null,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return { error: `Erreur lors du pointage: ${error.message}` }
  }

  return { data: data as TimeEntry, error: null }
}

/**
 * Clock out - close the current open time entry
 */
export async function clockOut(
  staffMemberId: string,
  request?: ClockOutRequest
): Promise<{ data?: TimeEntry; error: string | null }> {
  // Get current open entry
  const { data: currentEntry, error: fetchError } = await supabase
    .from('time_entries')
    .select('id, clock_in_at, staff_member_id, client_id, user_id')
    .eq('staff_member_id', staffMemberId)
    .eq('status', 'open')
    .single()

  if (fetchError || !currentEntry) {
    return { error: 'Vous n\'avez pas de pointage en cours' }
  }

  const clockOutAt = new Date().toISOString()
  const durationMinutes = calculateDuration(currentEntry.clock_in_at, clockOutAt)

  // Update the entry
  const { data, error } = await supabase
    .from('time_entries')
    .update({
      clock_out_at: clockOutAt,
      duration_minutes: durationMinutes,
      status: 'closed',
      notes: request?.notes || null,
    })
    .eq('id', currentEntry.id)
    .select()
    .single()

  if (error) {
    return { error: `Erreur lors du pointage de sortie: ${error.message}` }
  }

  // Create work_session automatically
  await createWorkSessionFromEntry(data as TimeEntry)

  return { data: data as TimeEntry, error: null }
}

/**
 * Get missing entries (open entries from previous days)
 */
export async function getMissingEntries(
  staffMemberId: string
): Promise<{ data: TimeEntryWithRelations[]; error: string | null }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name)
    `)
    .eq('staff_member_id', staffMemberId)
    .eq('status', 'open')
    .lt('clock_in_at', today.toISOString())
    .order('clock_in_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as TimeEntryWithRelations[], error: null }
}

/**
 * Get time entries for a date range (for history)
 */
export async function getHistory(
  staffMemberId: string,
  dateFrom: string,
  dateTo: string
): Promise<{ data: TimeEntryWithRelations[]; error: string | null }> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      staff_member:staff_members(id, first_name, last_name, position)
    `)
    .eq('staff_member_id', staffMemberId)
    .gte('clock_in_at', `${dateFrom}T00:00:00`)
    .lte('clock_in_at', `${dateTo}T23:59:59`)
    .order('clock_in_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as TimeEntryWithRelations[], error: null }
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
 * Create a work_session from a completed time entry (T028)
 */
async function createWorkSessionFromEntry(entry: TimeEntry): Promise<void> {
  if (!entry.duration_minutes || entry.duration_minutes <= 0) {
    return
  }

  // Get staff hourly rate
  const { data: staff } = await supabase
    .from('staff_members')
    .select('hourly_rate_cents')
    .eq('id', entry.staff_member_id)
    .single()

  const hourlyRateCents = staff?.hourly_rate_cents || 0
  const amountCents = Math.round((entry.duration_minutes / 60) * hourlyRateCents)

  // Create work session
  const { data: workSession, error } = await supabase
    .from('work_sessions')
    .insert({
      user_id: entry.user_id,
      staff_member_id: entry.staff_member_id,
      session_date: entry.clock_in_at.split('T')[0],
      duration_minutes: entry.duration_minutes,
      hourly_rate_cents: hourlyRateCents,
      amount_cents: amountCents,
      description: `Pointage du ${new Date(entry.clock_in_at).toLocaleDateString('fr-FR')}`,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create work_session:', error)
    return
  }

  // Link work_session to time_entry
  if (workSession) {
    await supabase
      .from('time_entries')
      .update({ work_session_id: workSession.id })
      .eq('id', entry.id)
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
  // Recalculate duration if times changed
  let durationMinutes: number | undefined
  if (updates.clock_in_at && updates.clock_out_at) {
    durationMinutes = calculateDuration(updates.clock_in_at, updates.clock_out_at)
  }

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      ...updates,
      ...(durationMinutes !== undefined && { duration_minutes: durationMinutes }),
    })
    .eq('id', entryId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data: data as TimeEntry, error: null }
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
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      client:clients(id, name),
      staff_member:staff_members(id, first_name, last_name, position)
    `)
    .gte('clock_in_at', `${dateFrom}T00:00:00`)
    .lte('clock_in_at', `${dateTo}T23:59:59`)
    .order('clock_in_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data || []) as TimeEntryWithRelations[], error: null }
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
  // Get time entries for the day
  const { data: entries, error: entriesError } = await getHistory(staffMemberId, date, date)

  if (entriesError) {
    return { data: null, error: entriesError }
  }

  // Get staff member info
  const { data: staffMember, error: staffError } = await supabase
    .from('staff_members')
    .select('id, first_name, last_name')
    .eq('id', staffMemberId)
    .single()

  if (staffError) {
    return { data: null, error: staffError.message }
  }

  // Get room actions count for the day
  const { count: actionCount } = await supabase
    .from('room_actions')
    .select('id', { count: 'exact', head: true })
    .gte('performed_at', `${date}T00:00:00`)
    .lt('performed_at', `${date}T23:59:59.999`)

  // Calculate totals
  const totalMinutes = entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
  const clientsVisited = [...new Set(entries.map((e) => e.client?.name).filter(Boolean))] as string[]

  return {
    data: {
      staff_member_id: staffMemberId,
      staff_name: `${staffMember.first_name} ${staffMember.last_name}`,
      date,
      total_minutes: totalMinutes,
      action_count: actionCount || 0,
      clients_visited: clientsVisited,
      entries,
    },
    error: null,
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
  // Get all time entries for the date
  const { data: entries, error } = await getAllTimeEntries(date, date)

  if (error) {
    return { data: null, error }
  }

  // Group entries by staff member
  const staffMap = new Map<
    string,
    {
      staff_member_id: string
      staff_name: string
      entries: TimeEntryWithRelations[]
    }
  >()

  for (const entry of entries) {
    const staffId = entry.staff_member_id
    const staffName = entry.staff_member
      ? `${entry.staff_member.first_name} ${entry.staff_member.last_name}`
      : 'Inconnu'

    if (!staffMap.has(staffId)) {
      staffMap.set(staffId, {
        staff_member_id: staffId,
        staff_name: staffName,
        entries: [],
      })
    }
    staffMap.get(staffId)!.entries.push(entry)
  }

  // Get room actions count per staff for the day
  const { data: roomActions } = await supabase
    .from('room_actions')
    .select(`
      id,
      time_entry:time_entries!inner(staff_member_id)
    `)
    .gte('performed_at', `${date}T00:00:00`)
    .lt('performed_at', `${date}T23:59:59.999`)

  // Count actions per staff
  const actionCountMap = new Map<string, number>()
  for (const action of roomActions || []) {
    const staffId = (action.time_entry as any)?.staff_member_id
    if (staffId) {
      actionCountMap.set(staffId, (actionCountMap.get(staffId) || 0) + 1)
    }
  }

  // Build staff summaries
  const staffSummaries = Array.from(staffMap.values()).map((staff) => {
    const totalMinutes = staff.entries.reduce((sum, e) => sum + (e.duration_minutes || 0), 0)
    const clientsVisited = [
      ...new Set(staff.entries.map((e) => e.client?.name).filter(Boolean)),
    ] as string[]

    return {
      ...staff,
      total_minutes: totalMinutes,
      action_count: actionCountMap.get(staff.staff_member_id) || 0,
      clients_visited: clientsVisited,
    }
  })

  // Calculate totals
  const totalMinutes = staffSummaries.reduce((sum, s) => sum + s.total_minutes, 0)
  const totalActions = staffSummaries.reduce((sum, s) => sum + s.action_count, 0)

  return {
    data: {
      date,
      staff_summaries: staffSummaries,
      total_staff_count: staffSummaries.length,
      total_minutes: totalMinutes,
      total_actions: totalActions,
    },
    error: null,
  }
}
