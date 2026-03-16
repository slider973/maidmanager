/**
 * Statistics Service
 * Provides calculation functions for statistics/reports
 */

import type { ScheduleEntry, StaffMember } from '../lib/types/database'
import type { Task } from '../lib/types/task.types'
import type {
  StatsPeriod,
  DateRange,
  GlobalStats,
  StaffMemberStats,
  StaffMemberInfo,
  ActivitySeries,
  ActivityDataPoint,
  ChartGranularity,
  StatsExportRow,
} from '../lib/types/statistics.types'

/**
 * Get date range for a period
 * @returns DateRange or null for 'all'
 */
export function getDateRange(period: StatsPeriod): DateRange | null {
  if (period === 'all') return null

  const now = new Date()
  const end = now.toISOString().split('T')[0]

  // Create a new date for calculations to avoid mutating
  const startDate = new Date(now)

  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7)
      break
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
  }

  return {
    start: startDate.toISOString().split('T')[0],
    end,
  }
}

/**
 * Check if a date is within a range
 */
function isInDateRange(date: string, range: DateRange | null): boolean {
  if (!range) return true
  return date >= range.start && date <= range.end
}

/**
 * Check if a task is overdue
 */
function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed') return false
  const today = new Date().toISOString().split('T')[0]
  return task.due_date < today
}

/**
 * Calculate global statistics
 */
export function calculateGlobalStats(
  entries: ScheduleEntry[],
  tasks: Task[],
  staff: StaffMember[],
  dateRange: DateRange | null
): GlobalStats {
  // Filter by date range
  const filteredEntries = entries.filter((e) => isInDateRange(e.scheduled_date, dateRange))
  const filteredTasks = tasks.filter((t) => isInDateRange(t.due_date, dateRange))

  // Schedule entry counts
  const totalScheduled = filteredEntries.length
  const completedScheduled = filteredEntries.filter((e) => e.status === 'completed').length
  const cancelledScheduled = filteredEntries.filter((e) => e.status === 'cancelled').length

  // Schedule completion rate (excluding cancelled)
  const nonCancelledScheduled = totalScheduled - cancelledScheduled
  const scheduledCompletionRate =
    nonCancelledScheduled > 0 ? Math.round((completedScheduled / nonCancelledScheduled) * 10000) / 100 : 0

  // Task counts
  const totalTasks = filteredTasks.length
  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending').length
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress').length
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed').length
  const overdueTasks = filteredTasks.filter(isTaskOverdue).length

  // Task completion rate
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Staff counts
  const activeStaffCount = staff.filter((s) => s.is_active).length
  const totalStaffCount = staff.length

  return {
    totalScheduled,
    completedScheduled,
    cancelledScheduled,
    scheduledCompletionRate,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    taskCompletionRate,
    activeStaffCount,
    totalStaffCount,
  }
}

/**
 * Calculate statistics per staff member
 */
export function calculateStaffStats(
  entries: ScheduleEntry[],
  tasks: Task[],
  staff: StaffMember[],
  dateRange: DateRange | null
): StaffMemberStats[] {
  // Filter by date range
  const filteredEntries = entries.filter((e) => isInDateRange(e.scheduled_date, dateRange))
  const filteredTasks = tasks.filter((t) => isInDateRange(t.due_date, dateRange))

  const result: StaffMemberStats[] = []

  // Calculate stats for each staff member
  for (const member of staff) {
    const memberEntries = filteredEntries.filter((e) => e.staff_member_id === member.id)
    const memberTasks = filteredTasks.filter((t) => t.staff_member_id === member.id)

    const scheduledCount = memberEntries.length
    const completedCount = memberEntries.filter((e) => e.status === 'completed').length
    const taskCount = memberTasks.length
    const completedTaskCount = memberTasks.filter((t) => t.status === 'completed').length
    const overdueTaskCount = memberTasks.filter(isTaskOverdue).length

    const total = scheduledCount + taskCount
    const completed = completedCount + completedTaskCount
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const staffInfo: StaffMemberInfo = {
      id: member.id,
      firstName: member.first_name,
      lastName: member.last_name,
      position: member.position,
    }

    result.push({
      staffMember: staffInfo,
      scheduledCount,
      completedCount,
      taskCount,
      completedTaskCount,
      overdueTaskCount,
      completionRate,
      hasOverdue: overdueTaskCount > 0,
    })
  }

  // Check for orphaned entries (null staff_member_id or non-existent staff)
  const staffIds = new Set(staff.map((s) => s.id))
  const orphanedEntries = filteredEntries.filter(
    (e) => e.staff_member_id === null || !staffIds.has(e.staff_member_id)
  )
  const orphanedTasks = filteredTasks.filter(
    (t) => t.staff_member_id === null || !staffIds.has(t.staff_member_id)
  )

  if (orphanedEntries.length > 0 || orphanedTasks.length > 0) {
    const scheduledCount = orphanedEntries.length
    const completedCount = orphanedEntries.filter((e) => e.status === 'completed').length
    const taskCount = orphanedTasks.length
    const completedTaskCount = orphanedTasks.filter((t) => t.status === 'completed').length
    const overdueTaskCount = orphanedTasks.filter(isTaskOverdue).length

    const total = scheduledCount + taskCount
    const completed = completedCount + completedTaskCount
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    result.push({
      staffMember: null,
      scheduledCount,
      completedCount,
      taskCount,
      completedTaskCount,
      overdueTaskCount,
      completionRate,
      hasOverdue: overdueTaskCount > 0,
    })
  }

  return result
}

/**
 * Get granularity based on period
 */
function getGranularity(period: StatsPeriod): ChartGranularity {
  switch (period) {
    case 'week':
      return 'day'
    case 'month':
      return 'week'
    case 'quarter':
    case 'year':
    case 'all':
      return 'month'
  }
}

/**
 * French month names for labels
 */
const FRENCH_MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

/**
 * French day names for labels
 */
const FRENCH_DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

/**
 * Generate data points based on granularity
 */
function generateDataPoints(
  period: StatsPeriod,
  granularity: ChartGranularity,
  entries: ScheduleEntry[],
  tasks: Task[]
): ActivityDataPoint[] {
  const now = new Date()
  const dataPoints: ActivityDataPoint[] = []

  if (granularity === 'day') {
    // Generate daily data points for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayEntries = entries.filter((e) => e.scheduled_date === dateStr)
      const dayTasks = tasks.filter((t) => t.due_date === dateStr)
      const completedCount =
        dayEntries.filter((e) => e.status === 'completed').length +
        dayTasks.filter((t) => t.status === 'completed').length

      dataPoints.push({
        label: FRENCH_DAYS[date.getDay()],
        startDate: dateStr,
        endDate: dateStr,
        scheduledCount: dayEntries.length,
        taskCount: dayTasks.length,
        completedCount,
      })
    }
  } else if (granularity === 'week') {
    // Generate weekly data points for the last 4-5 weeks
    const weeksCount = period === 'month' ? 4 : 12
    for (let i = weeksCount - 1; i >= 0; i--) {
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - i * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekStart.getDate() - 6)

      const startStr = weekStart.toISOString().split('T')[0]
      const endStr = weekEnd.toISOString().split('T')[0]

      const weekEntries = entries.filter((e) => e.scheduled_date >= startStr && e.scheduled_date <= endStr)
      const weekTasks = tasks.filter((t) => t.due_date >= startStr && t.due_date <= endStr)
      const completedCount =
        weekEntries.filter((e) => e.status === 'completed').length +
        weekTasks.filter((t) => t.status === 'completed').length

      dataPoints.push({
        label: `Sem ${weeksCount - i}`,
        startDate: startStr,
        endDate: endStr,
        scheduledCount: weekEntries.length,
        taskCount: weekTasks.length,
        completedCount,
      })
    }
  } else {
    // Generate monthly data points
    const monthsCount = period === 'quarter' ? 3 : period === 'year' ? 12 : 6
    for (let i = monthsCount - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const startStr = monthDate.toISOString().split('T')[0]
      const endStr = monthEnd.toISOString().split('T')[0]

      const monthEntries = entries.filter((e) => e.scheduled_date >= startStr && e.scheduled_date <= endStr)
      const monthTasks = tasks.filter((t) => t.due_date >= startStr && t.due_date <= endStr)
      const completedCount =
        monthEntries.filter((e) => e.status === 'completed').length +
        monthTasks.filter((t) => t.status === 'completed').length

      dataPoints.push({
        label: FRENCH_MONTHS[monthDate.getMonth()],
        startDate: startStr,
        endDate: endStr,
        scheduledCount: monthEntries.length,
        taskCount: monthTasks.length,
        completedCount,
      })
    }
  }

  return dataPoints
}

/**
 * Calculate activity series for chart
 */
export function calculateActivitySeries(
  entries: ScheduleEntry[],
  tasks: Task[],
  period: StatsPeriod
): ActivitySeries {
  const granularity = getGranularity(period)
  const dataPoints = generateDataPoints(period, granularity, entries, tasks)

  return {
    period,
    granularity,
    dataPoints,
  }
}

/**
 * Export data to CSV file
 */
export function exportToCSV(data: StatsExportRow[], filename: string): void {
  if (data.length === 0) return

  const headers: (keyof StatsExportRow)[] = ['type', 'date', 'staffMember', 'description', 'status', 'priority']
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const value = row[h]
        if (value === null || value === undefined) return ''
        const str = String(value)
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Prepare data for CSV export
 */
export function prepareExportData(
  entries: ScheduleEntry[],
  tasks: Task[],
  staff: StaffMember[],
  dateRange: DateRange | null
): StatsExportRow[] {
  const staffMap = new Map(staff.map((s) => [s.id, `${s.first_name} ${s.last_name}`]))

  const result: StatsExportRow[] = []

  // Filter and add schedule entries
  const filteredEntries = entries.filter((e) => isInDateRange(e.scheduled_date, dateRange))
  for (const entry of filteredEntries) {
    result.push({
      type: 'intervention',
      date: entry.scheduled_date,
      staffMember: entry.staff_member_id ? staffMap.get(entry.staff_member_id) || 'Membre supprimé' : 'Membre supprimé',
      description: entry.description,
      status: entry.status,
    })
  }

  // Filter and add tasks
  const filteredTasks = tasks.filter((t) => isInDateRange(t.due_date, dateRange))
  for (const task of filteredTasks) {
    result.push({
      type: 'mission',
      date: task.due_date,
      staffMember: task.staff_member_id ? staffMap.get(task.staff_member_id) || 'Membre supprimé' : 'Membre supprimé',
      description: task.title,
      status: task.status,
      priority: task.priority,
    })
  }

  return result
}
