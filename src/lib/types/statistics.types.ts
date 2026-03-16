/**
 * Statistics Types
 * Type definitions for the statistics/reports feature
 * Feature: 006-view-statistics
 */

import type { ScheduleEntry, StaffMember } from './database'
import type { Task } from './task.types'

// ============================================================
// Period Filter Types
// ============================================================

/**
 * Time period for filtering statistics
 */
export type StatsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'

/**
 * Period labels in French
 */
export const PERIOD_LABELS: Record<StatsPeriod, string> = {
  week: 'Cette semaine',
  month: 'Ce mois',
  quarter: '3 derniers mois',
  year: 'Cette année',
  all: 'Tout',
}

/**
 * All available periods in order
 */
export const STATS_PERIODS: StatsPeriod[] = ['week', 'month', 'quarter', 'year', 'all']

/**
 * Date range for filtering
 */
export interface DateRange {
  start: string // ISO date YYYY-MM-DD
  end: string // ISO date YYYY-MM-DD
}

// ============================================================
// Global Statistics Types
// ============================================================

/**
 * Overview statistics for the dashboard header
 */
export interface GlobalStats {
  // Schedule entries
  totalScheduled: number
  completedScheduled: number
  cancelledScheduled: number
  scheduledCompletionRate: number // 0-100 percentage

  // Tasks
  totalTasks: number
  pendingTasks: number
  inProgressTasks: number
  completedTasks: number
  overdueTasks: number
  taskCompletionRate: number // 0-100 percentage

  // Staff
  activeStaffCount: number
  totalStaffCount: number
}

/**
 * Default/empty global stats
 */
export const EMPTY_GLOBAL_STATS: GlobalStats = {
  totalScheduled: 0,
  completedScheduled: 0,
  cancelledScheduled: 0,
  scheduledCompletionRate: 0,
  totalTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  taskCompletionRate: 0,
  activeStaffCount: 0,
  totalStaffCount: 0,
}

// ============================================================
// Staff Statistics Types
// ============================================================

/**
 * Minimal staff member info for display
 */
export interface StaffMemberInfo {
  id: string
  firstName: string
  lastName: string
  position: string
}

/**
 * Statistics for a single staff member
 */
export interface StaffMemberStats {
  /** Staff member info, null if member was deleted */
  staffMember: StaffMemberInfo | null

  // Schedule entries for this member
  scheduledCount: number
  completedCount: number

  // Tasks for this member
  taskCount: number
  completedTaskCount: number
  overdueTaskCount: number

  // Calculated
  completionRate: number // 0-100 percentage
  hasOverdue: boolean // true if any overdue tasks
}

// ============================================================
// Activity Chart Types
// ============================================================

/**
 * Activity data point for time series chart
 */
export interface ActivityDataPoint {
  /** Display label (e.g., "Sem 1", "Fév", "2026") */
  label: string
  /** Start of period (ISO date) */
  startDate: string
  /** End of period (ISO date) */
  endDate: string
  /** Number of schedule entries in period */
  scheduledCount: number
  /** Number of tasks in period */
  taskCount: number
  /** Number of completed items in period */
  completedCount: number
}

/**
 * Granularity for chart display
 */
export type ChartGranularity = 'day' | 'week' | 'month'

/**
 * Activity series for charting
 */
export interface ActivitySeries {
  /** Selected period */
  period: StatsPeriod
  /** Granularity based on period */
  granularity: ChartGranularity
  /** Data points for the chart */
  dataPoints: ActivityDataPoint[]
}

// ============================================================
// Export Types
// ============================================================

/**
 * Type of exportable item
 */
export type ExportItemType = 'intervention' | 'mission'

/**
 * Row format for CSV export
 */
export interface StatsExportRow {
  type: ExportItemType
  date: string
  staffMember: string
  description: string
  status: string
  priority?: string
}

// ============================================================
// Service Input Types
// ============================================================

/**
 * Input data for statistics calculation
 */
export interface StatsInput {
  entries: ScheduleEntry[]
  tasks: Task[]
  staff: StaffMember[]
  dateRange: DateRange | null
}

/**
 * Result from statistics calculation
 */
export interface StatsResult {
  global: GlobalStats
  byStaff: StaffMemberStats[]
  activity: ActivitySeries
}

// ============================================================
// Component Props Types
// ============================================================

/**
 * Props for StatCard component
 */
export interface StatCardProps {
  label: string
  value: number | string
  icon?: 'users' | 'calendar' | 'tasks' | 'check' | 'alert'
  variant?: 'default' | 'success' | 'warning' | 'danger'
  subtext?: string
}

/**
 * Props for PeriodFilter component
 */
export interface PeriodFilterProps {
  value: StatsPeriod
  onChange: (period: StatsPeriod) => void
}

/**
 * Props for StatsOverview component
 */
export interface StatsOverviewProps {
  stats: GlobalStats
  loading?: boolean
}

/**
 * Props for StaffStats component
 */
export interface StaffStatsProps {
  staffStats: StaffMemberStats[]
  loading?: boolean
}

/**
 * Props for ActivityChart component
 */
export interface ActivityChartProps {
  series: ActivitySeries
  loading?: boolean
}
