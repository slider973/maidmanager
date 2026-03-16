# Quickstart: Consultez les statistiques

**Feature**: 006-view-statistics
**Date**: 2026-02-07

## Overview

This feature adds a statistics dashboard accessible via the "Voir les rapports" button on the home page. It displays aggregated metrics from existing data (staff, schedule entries, tasks).

## Prerequisites

- Existing stores must be functional: `staffStore`, `scheduleStore`, `taskStore`
- No database migrations required
- No new dependencies to install

## Key Files to Create

```
src/
├── lib/types/
│   └── statistics.types.ts    # Copy from contracts/statistics.types.ts
├── services/
│   └── statistics.service.ts  # Calculation functions
├── components/statistics/
│   ├── StatCard.tsx           # Individual metric display
│   ├── StatsOverview.tsx      # Global metrics grid
│   ├── StaffStats.tsx         # Per-member breakdown
│   ├── ActivityChart.tsx      # SVG bar chart
│   └── PeriodFilter.tsx       # Period selector
└── pages/
    └── Statistics.tsx         # Main page
```

## Implementation Order

### Phase 1: Types & Service (TDD)

1. Copy `contracts/statistics.types.ts` → `src/lib/types/statistics.types.ts`
2. Write tests for `statistics.service.ts`:
   - `calculateGlobalStats()` - aggregates totals and rates
   - `calculateStaffStats()` - per-member breakdown
   - `calculateActivitySeries()` - time series for chart
   - `getDateRange()` - period to date range conversion
   - `exportToCSV()` - CSV generation
3. Implement service functions to pass tests

### Phase 2: Components (TDD)

For each component:
1. Write test file first
2. Implement component to pass tests
3. Add styles

**Component order**:
1. `PeriodFilter` - simplest, no data dependencies
2. `StatCard` - reusable metric display
3. `StatsOverview` - uses StatCard, shows global stats
4. `StaffStats` - table of per-member stats
5. `ActivityChart` - SVG bar chart

### Phase 3: Page Integration

1. Create `Statistics.tsx` page
2. Add route to `App.tsx`: `/statistics`
3. Update `Home.tsx` - link "Voir les rapports" button to `/statistics`

## Quick Reference

### Period Filter Values

```typescript
type StatsPeriod = 'week' | 'month' | 'quarter' | 'year' | 'all'
```

### Completion Rate Formula

```typescript
// For tasks
const rate = total > 0 ? (completed / total) * 100 : 0

// For schedule entries (excludes cancelled)
const validTotal = scheduled + completed
const rate = validTotal > 0 ? (completed / validTotal) * 100 : 0
```

### Overdue Check

```typescript
const isOverdue = (task: Task) =>
  task.status !== 'completed' && task.due_date < new Date().toISOString().split('T')[0]
```

### SVG Chart Pattern

```tsx
<svg viewBox="0 0 400 200" role="img" aria-label="Évolution de l'activité">
  <For each={dataPoints}>
    {(point, i) => (
      <g>
        <rect
          x={i() * barWidth + gap}
          y={chartHeight - (point.value / maxValue) * chartHeight}
          width={barWidth - gap}
          height={(point.value / maxValue) * chartHeight}
          fill="var(--color-primary)"
        />
        <text x={i() * barWidth + barWidth / 2} y={chartHeight + 15}>
          {point.label}
        </text>
      </g>
    )}
  </For>
</svg>
```

### CSV Export Pattern

```typescript
const exportToCSV = (data: StatsExportRow[], filename: string) => {
  const headers = ['Type', 'Date', 'Membre', 'Description', 'Statut', 'Priorité']
  const rows = data.map(row => [
    row.type === 'intervention' ? 'Intervention' : 'Mission',
    row.date,
    row.staffMember,
    `"${row.description}"`, // Quote for CSV safety
    row.status,
    row.priority || ''
  ].join(','))

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

## Testing Commands

```bash
# Run all tests
npm test

# Run statistics tests only
npm test -- statistics

# Run with coverage
npm run test:coverage
```

## Styling Notes

- Use existing CSS variables from `App.css`
- Stats cards: reuse `.stat-card` from Home.tsx
- Period filter: horizontal button group, active state highlighted
- Chart: use `--color-primary`, `--color-sage` for bars
- Tables: alternate row colors for readability

## Accessibility Checklist

- [ ] All interactive elements keyboard accessible
- [ ] Chart has `role="img"` and descriptive `aria-label`
- [ ] Period filter buttons have `aria-pressed` state
- [ ] Loading states announced to screen readers
- [ ] Color is not the only indicator (use icons/text too)
