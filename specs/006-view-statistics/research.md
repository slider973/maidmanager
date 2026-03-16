# Research: Consultez les statistiques

**Feature**: 006-view-statistics
**Date**: 2026-02-07

## Research Questions

### 1. Chart Implementation Without External Library

**Question**: How to implement a simple bar chart in SolidJS without adding a charting library dependency?

**Decision**: Use SVG elements directly within SolidJS components

**Rationale**:
- Keeps bundle size minimal (constitution: <200KB gzipped)
- Full control over styling and accessibility
- SolidJS fine-grained reactivity works well with SVG
- Bar charts are simple enough not to need a library

**Alternatives Considered**:
- Chart.js: Too heavy (~60KB), overkill for simple bars
- D3.js: Complex API, steep learning curve
- Solid-charts: Limited community, uncertain maintenance

**Implementation Pattern**:
```tsx
// Simple SVG bar chart with computed dimensions
const BarChart = (props: { data: { label: string; value: number }[] }) => {
  const maxValue = () => Math.max(...props.data.map(d => d.value), 1)
  return (
    <svg viewBox="0 0 400 200" role="img" aria-label="Activity chart">
      <For each={props.data}>
        {(item, i) => (
          <rect
            x={i() * 50 + 10}
            y={200 - (item.value / maxValue()) * 180}
            width="40"
            height={(item.value / maxValue()) * 180}
            fill="var(--color-primary)"
          />
        )}
      </For>
    </svg>
  )
}
```

---

### 2. Period Filtering Strategy

**Question**: How to efficiently filter data by time period client-side?

**Decision**: Create date range utility functions that work with ISO date strings

**Rationale**:
- All dates in database are ISO strings (YYYY-MM-DD)
- Simple string comparison for date ranges is efficient
- No need for Date objects until display formatting

**Alternatives Considered**:
- Date-fns library: Adds dependency, overkill for simple ranges
- Moment.js: Deprecated, too heavy
- Native Date only: Less readable, more error-prone

**Implementation Pattern**:
```typescript
type Period = 'week' | 'month' | 'quarter' | 'year' | 'all'

function getDateRange(period: Period): { start: string; end: string } | null {
  if (period === 'all') return null

  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start: Date

  switch (period) {
    case 'week':
      start = new Date(now.setDate(now.getDate() - 7))
      break
    case 'month':
      start = new Date(now.setMonth(now.getMonth() - 1))
      break
    case 'quarter':
      start = new Date(now.setMonth(now.getMonth() - 3))
      break
    case 'year':
      start = new Date(now.setFullYear(now.getFullYear() - 1))
      break
  }

  return { start: start.toISOString().split('T')[0], end }
}
```

---

### 3. CSV Export Implementation

**Question**: How to generate and download CSV files client-side?

**Decision**: Use Blob API with data: URL for download

**Rationale**:
- No backend needed
- Works in all modern browsers
- Simple implementation

**Alternatives Considered**:
- FileSaver.js: Adds dependency for simple task
- Server-side generation: Unnecessary complexity

**Implementation Pattern**:
```typescript
function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const rows = data.map(row =>
    headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
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
```

---

### 4. Statistics Calculation Architecture

**Question**: Where should statistics be calculated - service layer or derived signals in components?

**Decision**: Service layer for calculations, memoized signals in components for reactivity

**Rationale**:
- Service layer is testable in isolation
- Memoized signals prevent recalculation on every render
- Separation of concerns: service = logic, component = presentation

**Alternatives Considered**:
- All in components: Hard to test, duplicated logic
- Dedicated store: Overkill - data already in other stores
- Server-side aggregation: Unnecessary latency

**Implementation Pattern**:
```typescript
// Service (pure functions, testable)
export function calculateStats(
  entries: ScheduleEntry[],
  tasks: Task[],
  staff: StaffMember[],
  dateRange: { start: string; end: string } | null
): GlobalStats { ... }

// Component (reactive)
const Statistics = () => {
  const stats = createMemo(() =>
    calculateStats(
      scheduleStore.state.entries,
      taskStore.state.tasks,
      staffStore.state.members,
      dateRange()
    )
  )
  return <StatsOverview stats={stats()} />
}
```

---

### 5. Handling Deleted Staff Members in Statistics

**Question**: How to display statistics for entries/tasks where staff_member was deleted?

**Decision**: Check for null staff_member in aggregations, display as "Membre supprimé"

**Rationale**:
- Database uses SET NULL on delete (preserves historical data)
- Statistics should still count these entries
- User needs to know some data has orphaned references

**Implementation Pattern**:
```typescript
// When aggregating by staff member
const staffStats = staff.map(member => ({
  member,
  taskCount: tasks.filter(t => t.staff_member_id === member.id).length,
  // ... other stats
}))

// Add orphaned entries
const orphanedTasks = tasks.filter(t =>
  t.staff_member_id === null ||
  !staff.some(s => s.id === t.staff_member_id)
)
if (orphanedTasks.length > 0) {
  staffStats.push({
    member: null, // null indicates deleted
    taskCount: orphanedTasks.length,
    // ...
  })
}
```

---

## Summary

All research questions resolved. No external dependencies needed:
- SVG for charts (native browser API)
- Blob API for CSV export (native browser API)
- Date calculations with standard JavaScript Date

This aligns with constitution principle III (Ship Fast) and keeps bundle size minimal.
