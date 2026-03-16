# Data Model: Consultez les statistiques

**Feature**: 006-view-statistics
**Date**: 2026-02-07

## Overview

This feature does **not** create any new database tables. All statistics are computed client-side from existing data:

- `staff_members` - Personnel information
- `schedule_entries` - Planned interventions
- `tasks` - Assigned missions

## Existing Tables Used

### staff_members (read-only)

| Column | Type | Used For |
|--------|------|----------|
| id | uuid | Grouping statistics by member |
| first_name | text | Display in staff stats |
| last_name | text | Display in staff stats |
| position | enum | Optional grouping by role |
| is_active | boolean | Filter active/inactive |

### schedule_entries (read-only)

| Column | Type | Used For |
|--------|------|----------|
| id | uuid | Counting entries |
| staff_member_id | uuid (nullable) | Grouping by member |
| scheduled_date | date | Period filtering |
| status | enum | Counting by status (scheduled/completed/cancelled) |

### tasks (read-only)

| Column | Type | Used For |
|--------|------|----------|
| id | uuid | Counting tasks |
| staff_member_id | uuid (nullable) | Grouping by member |
| due_date | date | Period filtering, overdue detection |
| status | enum | Counting by status (pending/in_progress/completed) |
| priority | enum | Optional priority breakdown |

## TypeScript Types

### Period Filter

```typescript
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
```

### Global Statistics

```typescript
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
```

### Staff Statistics

```typescript
/**
 * Statistics for a single staff member
 */
export interface StaffMemberStats {
  staffMember: {
    id: string
    firstName: string
    lastName: string
    position: string
  } | null // null = deleted member

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
```

### Activity Data (for chart)

```typescript
/**
 * Activity data point for time series chart
 */
export interface ActivityDataPoint {
  label: string // e.g., "Sem 1", "Fév", "2026"
  startDate: string // ISO date
  endDate: string // ISO date
  scheduledCount: number
  taskCount: number
  completedCount: number
}

/**
 * Activity series for charting
 */
export interface ActivitySeries {
  period: StatsPeriod
  granularity: 'day' | 'week' | 'month'
  dataPoints: ActivityDataPoint[]
}
```

### Export Data

```typescript
/**
 * Row format for CSV export
 */
export interface StatsExportRow {
  type: 'intervention' | 'mission'
  date: string
  staffMember: string
  description: string
  status: string
  priority?: string
}
```

## Computed Values

### Completion Rate Formula

```
completionRate = (completed / (total - cancelled)) * 100
```

- For schedule entries: `completed / (scheduled + completed)` (excludes cancelled)
- For tasks: `completed / (pending + in_progress + completed)`

### Overdue Detection

```typescript
function isTaskOverdue(task: Task): boolean {
  if (task.status === 'completed') return false
  const today = new Date().toISOString().split('T')[0]
  return task.due_date < today
}
```

### Period Date Ranges

| Period | Start Date | End Date |
|--------|------------|----------|
| week | 7 days ago | today |
| month | 1 month ago | today |
| quarter | 3 months ago | today |
| year | 1 year ago | today |
| all | (no filter) | (no filter) |

## Data Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  staffStore     │     │  scheduleStore  │     │    taskStore    │
│  .state.members │     │  .state.entries │     │  .state.tasks   │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  statistics.service.ts │
                    │  calculateStats()      │
                    │  calculateStaffStats() │
                    │  calculateActivity()   │
                    └────────────┬───────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Statistics.tsx        │
                    │  (createMemo signals)  │
                    └────────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  StatsOverview  │     │   StaffStats    │     │  ActivityChart  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## No Migration Required

This feature reads from existing tables only. No database migrations needed.
