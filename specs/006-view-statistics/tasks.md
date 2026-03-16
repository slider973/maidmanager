# Tasks: Consultez les statistiques

**Feature**: 006-view-statistics
**Generated**: 2026-02-07
**Source**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

## Legend

- [ ] Task not started
- [x] Task completed
- **[TEST]** Test task (write before implementation)
- **[IMPL]** Implementation task
- **[STYLE]** CSS/styling task

---

## Phase 0: Setup ✅

### 0.1 Type Definitions

- [x] **[IMPL]** Copy statistics types to source
  - Copy `specs/006-view-statistics/contracts/statistics.types.ts` to `src/lib/types/statistics.types.ts`
  - Export from `src/lib/types/index.ts` if exists

### 0.2 Route Setup

- [x] **[IMPL]** Add `/statistics` route to App.tsx
  - Import Statistics page (lazy or direct)
  - Add protected route: `<Route path="/statistics" component={() => <ProtectedRoute><Statistics /></ProtectedRoute>} />`

---

## Phase 1: Foundational (Service Layer) ✅

### 1.1 Date Utility Functions

- [x] **[TEST]** Write tests for `getDateRange` function
  - File: `src/services/statistics.service.test.ts`
  - Test: Returns null for 'all' period
  - Test: Returns correct range for 'week' (7 days ago to today)
  - Test: Returns correct range for 'month' (1 month ago to today)
  - Test: Returns correct range for 'quarter' (3 months ago to today)
  - Test: Returns correct range for 'year' (1 year ago to today)

- [ ] **[IMPL]** Implement `getDateRange` function
  - File: `src/services/statistics.service.ts`
  - Convert period to DateRange or null

### 1.2 Global Statistics Calculation

- [ ] **[TEST]** Write tests for `calculateGlobalStats`
  - File: `src/services/statistics.service.test.ts`
  - Test: Returns empty stats when no data
  - Test: Counts schedule entries by status correctly
  - Test: Counts tasks by status correctly
  - Test: Calculates completion rate correctly
  - Test: Counts overdue tasks correctly
  - Test: Filters by date range when provided
  - Test: Counts active/total staff correctly

- [ ] **[IMPL]** Implement `calculateGlobalStats`
  - File: `src/services/statistics.service.ts`
  - Aggregate schedule_entries, tasks, staff_members
  - Calculate completion rates
  - Apply date range filter

### 1.3 Staff Statistics Calculation

- [ ] **[TEST]** Write tests for `calculateStaffStats`
  - File: `src/services/statistics.service.test.ts`
  - Test: Returns stats per staff member
  - Test: Calculates completion rate per member
  - Test: Detects overdue tasks per member
  - Test: Handles null staff_member_id (deleted members)
  - Test: Filters by date range when provided

- [ ] **[IMPL]** Implement `calculateStaffStats`
  - File: `src/services/statistics.service.ts`
  - Group by staff member
  - Calculate per-member metrics
  - Handle orphaned entries

### 1.4 Activity Series Calculation

- [ ] **[TEST]** Write tests for `calculateActivitySeries`
  - File: `src/services/statistics.service.test.ts`
  - Test: Returns weekly data points for 'week' and 'month' periods
  - Test: Returns monthly data points for 'quarter' and 'year' periods
  - Test: Generates correct labels in French
  - Test: Counts entries and tasks per period correctly

- [ ] **[IMPL]** Implement `calculateActivitySeries`
  - File: `src/services/statistics.service.ts`
  - Group data by time buckets
  - Generate labels based on granularity

### 1.5 CSV Export Function

- [ ] **[TEST]** Write tests for `exportToCSV`
  - File: `src/services/statistics.service.test.ts`
  - Test: Returns without action when data is empty
  - Test: Generates correct CSV format with headers
  - Test: Handles special characters in data

- [ ] **[IMPL]** Implement `exportToCSV`
  - File: `src/services/statistics.service.ts`
  - Generate CSV string from data array
  - Trigger download via Blob API

---

## Phase 2: User Story 1 - Vue d'ensemble des statistiques (P1)

> L'utilisateur peut accéder à une page de statistiques avec un résumé global.

### 2.1 StatCard Component

- [ ] **[TEST]** Write tests for StatCard
  - File: `src/components/statistics/StatCard.test.tsx`
  - Test: Displays label and value
  - Test: Applies correct variant class
  - Test: Displays subtext when provided
  - Test: Has accessible structure

- [ ] **[IMPL]** Implement StatCard component
  - File: `src/components/statistics/StatCard.tsx`
  - Display single metric with label, value, icon, variant
  - Accessibility: proper heading structure

- [ ] **[STYLE]** Style StatCard
  - Reuse existing `.stat-card` pattern from Home.tsx
  - Add variant colors (success, warning, danger)

### 2.2 StatsOverview Component

- [ ] **[TEST]** Write tests for StatsOverview
  - File: `src/components/statistics/StatsOverview.test.tsx`
  - Test: Shows loading spinner when loading
  - Test: Displays all global metrics
  - Test: Shows completion rates as percentages
  - Test: Has accessible grid structure

- [ ] **[IMPL]** Implement StatsOverview component
  - File: `src/components/statistics/StatsOverview.tsx`
  - Grid of StatCard components for global metrics
  - Schedule stats section (total, completed, cancelled)
  - Task stats section (total by status, overdue count)
  - Staff count section

### 2.3 Statistics Page - Basic

- [ ] **[IMPL]** Create Statistics page with overview
  - File: `src/pages/Statistics.tsx`
  - Fetch data from stores on mount
  - Calculate stats using service functions
  - Display StatsOverview component
  - Handle loading and error states
  - Empty state with CTA to create content

### 2.4 Home.tsx Integration

- [ ] **[IMPL]** Update Home.tsx "Voir les rapports" button
  - Change div to `<A href="/statistics">` link
  - Keep existing styling

---

## Phase 3: User Story 2 - Statistiques par période (P1)

> L'utilisateur peut filtrer les statistiques par période.

### 3.1 PeriodFilter Component

- [ ] **[TEST]** Write tests for PeriodFilter
  - File: `src/components/statistics/PeriodFilter.test.tsx`
  - Test: Renders all period options
  - Test: Highlights current selection
  - Test: Calls onChange when option clicked
  - Test: Keyboard accessible (Tab, Enter)

- [ ] **[IMPL]** Implement PeriodFilter component
  - File: `src/components/statistics/PeriodFilter.tsx`
  - Button group for period options
  - aria-pressed state for accessibility
  - Labels from PERIOD_LABELS constant

- [ ] **[STYLE]** Style PeriodFilter
  - Horizontal button group
  - Active state highlighted
  - Mobile responsive (wrap or scroll)

### 3.2 Integrate Period Filter

- [ ] **[IMPL]** Add period filter to Statistics page
  - Add period signal (default: 'month')
  - Place PeriodFilter at top of page
  - Recalculate stats when period changes
  - Show "Aucune donnée pour cette période" when empty

---

## Phase 4: User Story 3 - Statistiques par membre (P2)

> L'utilisateur peut voir les statistiques par membre du personnel.

### 4.1 StaffStats Component

- [ ] **[TEST]** Write tests for StaffStats
  - File: `src/components/statistics/StaffStats.test.tsx`
  - Test: Shows loading spinner when loading
  - Test: Displays row per staff member
  - Test: Shows scheduled/completed counts
  - Test: Shows task counts and overdue indicator
  - Test: Shows "Membre supprimé" for null staff
  - Test: Highlights members with overdue tasks

- [ ] **[IMPL]** Implement StaffStats component
  - File: `src/components/statistics/StaffStats.tsx`
  - Table or card list of staff statistics
  - Columns: Name, Interventions, Missions, Taux, Alertes
  - Visual indicator for overdue tasks
  - Handle deleted member display

- [ ] **[STYLE]** Style StaffStats
  - Table with alternating rows
  - Overdue badge in red
  - Responsive: collapse to cards on mobile

### 4.2 Integrate Staff Stats

- [ ] **[IMPL]** Add StaffStats section to Statistics page
  - Section header "Statistiques par membre"
  - Calculate staff stats using service
  - Pass to StaffStats component
  - Respect current period filter

---

## Phase 5: User Story 4 - Graphique d'évolution (P2)

> L'utilisateur peut voir un graphique d'évolution de l'activité.

### 5.1 ActivityChart Component

- [ ] **[TEST]** Write tests for ActivityChart
  - File: `src/components/statistics/ActivityChart.test.tsx`
  - Test: Shows loading spinner when loading
  - Test: Renders SVG with bars
  - Test: Shows labels for each data point
  - Test: Shows message when no data
  - Test: Has accessible role and label

- [ ] **[IMPL]** Implement ActivityChart component
  - File: `src/components/statistics/ActivityChart.tsx`
  - SVG bar chart with dynamic scaling
  - X-axis labels (weeks/months)
  - Bars for scheduled + task counts
  - Empty state message
  - role="img" and aria-label for accessibility

- [ ] **[STYLE]** Style ActivityChart
  - SVG responsive (viewBox based)
  - Bars using CSS variables
  - Labels readable on mobile

### 5.2 Integrate Activity Chart

- [ ] **[IMPL]** Add ActivityChart section to Statistics page
  - Section header "Évolution de l'activité"
  - Calculate activity series using service
  - Pass to ActivityChart component
  - Respect current period filter

---

## Phase 6: User Story 5 - Export CSV (P3)

> L'utilisateur peut exporter les statistiques en CSV.

### 6.1 Export Button

- [ ] **[IMPL]** Add export button to Statistics page
  - "Exporter CSV" button in header
  - Disabled when no data
  - Call exportToCSV function on click
  - Include toast notification on success

### 6.2 Export Data Formatting

- [ ] **[IMPL]** Implement `prepareExportData` function
  - File: `src/services/statistics.service.ts`
  - Convert schedule_entries and tasks to StatsExportRow format
  - Apply current period filter
  - Include staff member names (or "Membre supprimé")

---

## Phase 7: Polish & Edge Cases

### 7.1 Edge Case: Deleted Staff Member

- [ ] **[IMPL]** Handle null staff_member in all statistics
  - Display "Membre supprimé" with italic/gray styling
  - Count in totals but show separately in staff breakdown

### 7.2 Empty State Improvements

- [ ] **[IMPL]** Add rich empty state to Statistics page
  - Message explaining no data
  - Links to create staff, schedule, tasks
  - Different message per section if partial data

### 7.3 Final Verification

- [ ] Run all tests: `npm test` (verify pass count)
- [ ] Run build: `npm run build` (verify success)
- [ ] Manual testing: Full statistics workflow
- [ ] Check accessibility: Keyboard navigation, screen reader
- [ ] Check mobile responsiveness

---

## Summary

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| Phase 0: Setup | 2 | Required | Pending |
| Phase 1: Foundational | 10 | Required | Pending |
| Phase 2: US1 Overview | 7 | P1 | Pending |
| Phase 3: US2 Period Filter | 4 | P1 | Pending |
| Phase 4: US3 Staff Stats | 4 | P2 | Pending |
| Phase 5: US4 Chart | 4 | P2 | Pending |
| Phase 6: US5 Export | 2 | P3 | Pending |
| Phase 7: Polish | 5 | Required | Pending |
| **Total** | **38** | | **0/38** |

**MVP (P1)**: Phases 0-3 (23 tasks) - Overview + Period Filter
**Full Feature**: All phases (38 tasks)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 0: Setup
    ↓
Phase 1: Foundational (Service Layer)
    ↓
┌───────────────────┬───────────────────┐
│                   │                   │
↓                   ↓                   ↓
Phase 2: US1      Phase 3: US2       (can start)
(Overview)        (Period Filter)
    ↓                   ↓
    └─────────┬─────────┘
              ↓
┌─────────────┴─────────────┐
↓                           ↓
Phase 4: US3              Phase 5: US4
(Staff Stats)             (Chart)
↓                           ↓
└─────────────┬─────────────┘
              ↓
        Phase 6: US5
        (Export CSV)
              ↓
        Phase 7: Polish
```

### Parallel Opportunities

**Within Phase 1 (Foundational)**:
- T: getDateRange tests + T: calculateGlobalStats tests (parallel)
- After tests pass: implementations can be parallel if different functions

**Within Phase 2 (Overview)**:
- StatCard tests + StatsOverview tests (parallel)
- StatCard impl + styling (sequential)

**Phase 4 + Phase 5 (Staff Stats + Chart)**:
- These user stories can run in parallel after US1+US2 complete

---

## Implementation Notes

- **No database changes** - All stats computed from existing stores
- **No new dependencies** - SVG for charts, Blob API for export
- **TDD required** - Constitution mandates tests before implementation
- **French UI** - All labels from PERIOD_LABELS and TASK_STATUS_LABELS
