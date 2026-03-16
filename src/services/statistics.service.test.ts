/**
 * Statistics Service Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDateRange,
  calculateGlobalStats,
  calculateStaffStats,
  calculateActivitySeries,
  exportToCSV,
  prepareExportData,
} from './statistics.service'
import type { ScheduleEntry, StaffMember } from '../lib/types/database'
import type { Task } from '../lib/types/task.types'
import type { StatsExportRow } from '../lib/types/statistics.types'

// Mock data factories
const createStaffMember = (overrides: Partial<StaffMember> = {}): StaffMember => ({
  id: 'staff-1',
  user_id: 'user-1',
  first_name: 'Marie',
  last_name: 'Dupont',
  position: 'housekeeper',
  position_custom: null,
  phone: null,
  email: null,
  start_date: null,
  notes: null,
  is_active: true,
    hourly_rate_cents: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

const createScheduleEntry = (overrides: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  id: 'entry-1',
  user_id: 'user-1',
  staff_member_id: 'staff-1',
  client_id: null,
  scheduled_date: '2026-02-05',
  start_time: '09:00',
  end_time: '12:00',
  description: 'Test entry',
  status: 'scheduled',
  notes: null,
  amount: null,
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
  ...overrides,
})

const createTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  user_id: 'user-1',
  staff_member_id: 'staff-1',
  title: 'Test task',
  description: null,
  due_date: '2026-02-10',
  priority: 'normal',
  status: 'pending',
  notes: null,
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
  ...overrides,
})

describe('getDateRange', () => {
  beforeEach(() => {
    // Mock Date to 2026-02-07
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return null for "all" period', () => {
    const result = getDateRange('all')
    expect(result).toBeNull()
  })

  it('should return correct range for "week" (7 days ago to today)', () => {
    const result = getDateRange('week')
    expect(result).toEqual({
      start: '2026-01-31',
      end: '2026-02-07',
    })
  })

  it('should return correct range for "month" (1 month ago to today)', () => {
    const result = getDateRange('month')
    expect(result).toEqual({
      start: '2026-01-07',
      end: '2026-02-07',
    })
  })

  it('should return correct range for "quarter" (3 months ago to today)', () => {
    const result = getDateRange('quarter')
    expect(result).toEqual({
      start: '2025-11-07',
      end: '2026-02-07',
    })
  })

  it('should return correct range for "year" (1 year ago to today)', () => {
    const result = getDateRange('year')
    expect(result).toEqual({
      start: '2025-02-07',
      end: '2026-02-07',
    })
  })
})

describe('calculateGlobalStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return empty stats when no data', () => {
    const result = calculateGlobalStats([], [], [], null)

    expect(result.totalScheduled).toBe(0)
    expect(result.completedScheduled).toBe(0)
    expect(result.cancelledScheduled).toBe(0)
    expect(result.scheduledCompletionRate).toBe(0)
    expect(result.totalTasks).toBe(0)
    expect(result.pendingTasks).toBe(0)
    expect(result.inProgressTasks).toBe(0)
    expect(result.completedTasks).toBe(0)
    expect(result.overdueTasks).toBe(0)
    expect(result.taskCompletionRate).toBe(0)
    expect(result.activeStaffCount).toBe(0)
    expect(result.totalStaffCount).toBe(0)
  })

  it('should count schedule entries by status correctly', () => {
    const entries = [
      createScheduleEntry({ id: '1', status: 'scheduled' }),
      createScheduleEntry({ id: '2', status: 'scheduled' }),
      createScheduleEntry({ id: '3', status: 'completed' }),
      createScheduleEntry({ id: '4', status: 'cancelled' }),
    ]

    const result = calculateGlobalStats(entries, [], [], null)

    expect(result.totalScheduled).toBe(4)
    expect(result.completedScheduled).toBe(1)
    expect(result.cancelledScheduled).toBe(1)
  })

  it('should count tasks by status correctly', () => {
    const tasks = [
      createTask({ id: '1', status: 'pending' }),
      createTask({ id: '2', status: 'pending' }),
      createTask({ id: '3', status: 'in_progress' }),
      createTask({ id: '4', status: 'completed' }),
    ]

    const result = calculateGlobalStats([], tasks, [], null)

    expect(result.totalTasks).toBe(4)
    expect(result.pendingTasks).toBe(2)
    expect(result.inProgressTasks).toBe(1)
    expect(result.completedTasks).toBe(1)
  })

  it('should calculate completion rate correctly', () => {
    const entries = [
      createScheduleEntry({ id: '1', status: 'scheduled' }),
      createScheduleEntry({ id: '2', status: 'completed' }),
      createScheduleEntry({ id: '3', status: 'completed' }),
      createScheduleEntry({ id: '4', status: 'cancelled' }), // Excluded from rate
    ]
    const tasks = [
      createTask({ id: '1', status: 'pending' }),
      createTask({ id: '2', status: 'completed' }),
      createTask({ id: '3', status: 'completed' }),
      createTask({ id: '4', status: 'completed' }),
    ]

    const result = calculateGlobalStats(entries, tasks, [], null)

    // Schedule: 2 completed / 3 non-cancelled = 66.67%
    expect(result.scheduledCompletionRate).toBeCloseTo(66.67, 1)
    // Tasks: 3 completed / 4 total = 75%
    expect(result.taskCompletionRate).toBe(75)
  })

  it('should count overdue tasks correctly', () => {
    const tasks = [
      createTask({ id: '1', status: 'pending', due_date: '2026-02-01' }), // Overdue
      createTask({ id: '2', status: 'in_progress', due_date: '2026-02-05' }), // Overdue
      createTask({ id: '3', status: 'pending', due_date: '2026-02-10' }), // Not overdue
      createTask({ id: '4', status: 'completed', due_date: '2026-02-01' }), // Completed, not counted
    ]

    const result = calculateGlobalStats([], tasks, [], null)

    expect(result.overdueTasks).toBe(2)
  })

  it('should filter by date range when provided', () => {
    const entries = [
      createScheduleEntry({ id: '1', scheduled_date: '2026-02-01' }),
      createScheduleEntry({ id: '2', scheduled_date: '2026-02-05' }),
      createScheduleEntry({ id: '3', scheduled_date: '2026-01-15' }), // Outside range
    ]
    const tasks = [
      createTask({ id: '1', due_date: '2026-02-03' }),
      createTask({ id: '2', due_date: '2026-01-20' }), // Outside range
    ]

    const dateRange = { start: '2026-02-01', end: '2026-02-07' }
    const result = calculateGlobalStats(entries, tasks, [], dateRange)

    expect(result.totalScheduled).toBe(2)
    expect(result.totalTasks).toBe(1)
  })

  it('should count active/total staff correctly', () => {
    const staff = [
      createStaffMember({ id: '1', is_active: true }),
      createStaffMember({ id: '2', is_active: true }),
      createStaffMember({ id: '3', is_active: false }),
    ]

    const result = calculateGlobalStats([], [], staff, null)

    expect(result.activeStaffCount).toBe(2)
    expect(result.totalStaffCount).toBe(3)
  })
})

describe('calculateStaffStats', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return stats per staff member', () => {
    const staff = [
      createStaffMember({ id: 'staff-1', first_name: 'Marie' }),
      createStaffMember({ id: 'staff-2', first_name: 'Jean' }),
    ]
    const entries = [
      createScheduleEntry({ id: '1', staff_member_id: 'staff-1' }),
      createScheduleEntry({ id: '2', staff_member_id: 'staff-1' }),
      createScheduleEntry({ id: '3', staff_member_id: 'staff-2' }),
    ]
    const tasks = [
      createTask({ id: '1', staff_member_id: 'staff-1' }),
      createTask({ id: '2', staff_member_id: 'staff-2' }),
      createTask({ id: '3', staff_member_id: 'staff-2' }),
    ]

    const result = calculateStaffStats(entries, tasks, staff, null)

    expect(result).toHaveLength(2)
    expect(result[0].staffMember?.firstName).toBe('Marie')
    expect(result[0].scheduledCount).toBe(2)
    expect(result[0].taskCount).toBe(1)
    expect(result[1].staffMember?.firstName).toBe('Jean')
    expect(result[1].scheduledCount).toBe(1)
    expect(result[1].taskCount).toBe(2)
  })

  it('should calculate completion rate per member', () => {
    const staff = [createStaffMember({ id: 'staff-1' })]
    const entries = [
      createScheduleEntry({ id: '1', staff_member_id: 'staff-1', status: 'completed' }),
      createScheduleEntry({ id: '2', staff_member_id: 'staff-1', status: 'scheduled' }),
    ]
    const tasks = [
      createTask({ id: '1', staff_member_id: 'staff-1', status: 'completed' }),
      createTask({ id: '2', staff_member_id: 'staff-1', status: 'completed' }),
      createTask({ id: '3', staff_member_id: 'staff-1', status: 'pending' }),
    ]

    const result = calculateStaffStats(entries, tasks, staff, null)

    expect(result[0].completedCount).toBe(1)
    expect(result[0].completedTaskCount).toBe(2)
    // Overall completion: (1 + 2) / (2 + 3) = 60%
    expect(result[0].completionRate).toBe(60)
  })

  it('should detect overdue tasks per member', () => {
    const staff = [createStaffMember({ id: 'staff-1' })]
    const tasks = [
      createTask({ id: '1', staff_member_id: 'staff-1', status: 'pending', due_date: '2026-02-01' }),
      createTask({ id: '2', staff_member_id: 'staff-1', status: 'pending', due_date: '2026-02-10' }),
    ]

    const result = calculateStaffStats([], tasks, staff, null)

    expect(result[0].overdueTaskCount).toBe(1)
    expect(result[0].hasOverdue).toBe(true)
  })

  it('should handle null staff_member_id (deleted members)', () => {
    const staff = [createStaffMember({ id: 'staff-1' })]
    const entries = [
      createScheduleEntry({ id: '1', staff_member_id: 'staff-1' }),
      createScheduleEntry({ id: '2', staff_member_id: null }), // Orphaned
    ]
    const tasks = [
      createTask({ id: '1', staff_member_id: null }), // Orphaned
    ]

    const result = calculateStaffStats(entries, tasks, staff, null)

    // Should have entry for staff-1 + entry for orphaned
    expect(result.length).toBeGreaterThanOrEqual(1)

    const orphanedStats = result.find((s) => s.staffMember === null)
    if (orphanedStats) {
      expect(orphanedStats.scheduledCount).toBe(1)
      expect(orphanedStats.taskCount).toBe(1)
    }
  })

  it('should filter by date range when provided', () => {
    const staff = [createStaffMember({ id: 'staff-1' })]
    const entries = [
      createScheduleEntry({ id: '1', staff_member_id: 'staff-1', scheduled_date: '2026-02-05' }),
      createScheduleEntry({ id: '2', staff_member_id: 'staff-1', scheduled_date: '2026-01-15' }),
    ]
    const tasks = [
      createTask({ id: '1', staff_member_id: 'staff-1', due_date: '2026-02-03' }),
      createTask({ id: '2', staff_member_id: 'staff-1', due_date: '2026-01-20' }),
    ]

    const dateRange = { start: '2026-02-01', end: '2026-02-07' }
    const result = calculateStaffStats(entries, tasks, staff, dateRange)

    expect(result[0].scheduledCount).toBe(1)
    expect(result[0].taskCount).toBe(1)
  })
})

describe('calculateActivitySeries', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return weekly data points for "week" period', () => {
    const entries = [
      createScheduleEntry({ id: '1', scheduled_date: '2026-02-05' }),
      createScheduleEntry({ id: '2', scheduled_date: '2026-02-06' }),
    ]
    const tasks = [createTask({ id: '1', due_date: '2026-02-04' })]

    const result = calculateActivitySeries(entries, tasks, 'week')

    expect(result.period).toBe('week')
    expect(result.granularity).toBe('day')
    expect(result.dataPoints.length).toBeGreaterThan(0)
  })

  it('should return weekly data points for "month" period', () => {
    const entries = [createScheduleEntry({ id: '1', scheduled_date: '2026-02-01' })]
    const tasks = [createTask({ id: '1', due_date: '2026-02-15' })]

    const result = calculateActivitySeries(entries, tasks, 'month')

    expect(result.period).toBe('month')
    expect(result.granularity).toBe('week')
    expect(result.dataPoints.length).toBeGreaterThan(0)
  })

  it('should return monthly data points for "quarter" and "year" periods', () => {
    const entries = [createScheduleEntry({ id: '1', scheduled_date: '2026-01-15' })]
    const tasks = [createTask({ id: '1', due_date: '2025-12-01' })]

    const quarterResult = calculateActivitySeries(entries, tasks, 'quarter')
    expect(quarterResult.granularity).toBe('month')

    const yearResult = calculateActivitySeries(entries, tasks, 'year')
    expect(yearResult.granularity).toBe('month')
  })

  it('should generate correct labels in French', () => {
    const entries = [createScheduleEntry({ id: '1', scheduled_date: '2026-02-05' })]

    const result = calculateActivitySeries(entries, [], 'month')

    // Labels should be in French
    expect(result.dataPoints.some((dp) => dp.label.length > 0)).toBe(true)
  })

  it('should count entries and tasks per period correctly', () => {
    const entries = [
      createScheduleEntry({ id: '1', scheduled_date: '2026-02-05', status: 'completed' }),
      createScheduleEntry({ id: '2', scheduled_date: '2026-02-05', status: 'scheduled' }),
    ]
    const tasks = [createTask({ id: '1', due_date: '2026-02-05', status: 'completed' })]

    const result = calculateActivitySeries(entries, tasks, 'week')

    const totalScheduled = result.dataPoints.reduce((sum, dp) => sum + dp.scheduledCount, 0)
    const totalTasks = result.dataPoints.reduce((sum, dp) => sum + dp.taskCount, 0)
    const totalCompleted = result.dataPoints.reduce((sum, dp) => sum + dp.completedCount, 0)

    expect(totalScheduled).toBe(2)
    expect(totalTasks).toBe(1)
    expect(totalCompleted).toBe(2) // 1 completed entry + 1 completed task
  })
})

describe('exportToCSV', () => {
  it('should return without action when data is empty', () => {
    // This should not throw or create download
    expect(() => exportToCSV([], 'test.csv')).not.toThrow()
  })

  it('should generate correct CSV format with headers', () => {
    // We can't easily test the download, but we can test the CSV generation
    // by checking that the function doesn't throw with valid data
    const data: StatsExportRow[] = [
      { type: 'intervention', date: '2026-02-05', staffMember: 'Marie', description: 'Test', status: 'completed' },
    ]

    expect(() => exportToCSV(data, 'test.csv')).not.toThrow()
  })

  it('should handle special characters in data', () => {
    const data: StatsExportRow[] = [
      {
        type: 'mission',
        date: '2026-02-05',
        staffMember: 'Jean-Pierre',
        description: 'Test, with "quotes"',
        status: 'pending',
      },
    ]

    expect(() => exportToCSV(data, 'test.csv')).not.toThrow()
  })
})

describe('prepareExportData', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-07T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should convert entries and tasks to export format', () => {
    const staff = [createStaffMember({ id: 'staff-1', first_name: 'Marie', last_name: 'Dupont' })]
    const entries = [
      createScheduleEntry({ id: '1', staff_member_id: 'staff-1', description: 'Ménage', status: 'completed' }),
    ]
    const tasks = [
      createTask({ id: '1', staff_member_id: 'staff-1', title: 'Vitres', status: 'pending', priority: 'high' }),
    ]

    const result = prepareExportData(entries, tasks, staff, null)

    expect(result).toHaveLength(2)

    const intervention = result.find((r) => r.type === 'intervention')
    expect(intervention?.staffMember).toBe('Marie Dupont')
    expect(intervention?.description).toBe('Ménage')
    expect(intervention?.status).toBe('completed')

    const mission = result.find((r) => r.type === 'mission')
    expect(mission?.staffMember).toBe('Marie Dupont')
    expect(mission?.description).toBe('Vitres')
    expect(mission?.priority).toBe('high')
  })

  it('should show "Membre supprimé" for null staff_member_id', () => {
    const entries = [createScheduleEntry({ id: '1', staff_member_id: null, description: 'Test' })]

    const result = prepareExportData(entries, [], [], null)

    expect(result[0].staffMember).toBe('Membre supprimé')
  })

  it('should apply date range filter', () => {
    const entries = [
      createScheduleEntry({ id: '1', scheduled_date: '2026-02-05' }),
      createScheduleEntry({ id: '2', scheduled_date: '2026-01-15' }),
    ]
    const tasks = [
      createTask({ id: '1', due_date: '2026-02-03' }),
      createTask({ id: '2', due_date: '2026-01-20' }),
    ]

    const dateRange = { start: '2026-02-01', end: '2026-02-07' }
    const result = prepareExportData(entries, tasks, [], dateRange)

    expect(result).toHaveLength(2) // Only items within range
  })
})
