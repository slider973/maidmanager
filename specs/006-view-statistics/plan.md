# Implementation Plan: Consultez les statistiques

**Branch**: `006-view-statistics` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-view-statistics/spec.md`

## Summary

Create a comprehensive statistics dashboard page that aggregates data from existing tables (staff_members, schedule_entries, tasks) to show:
- Global overview metrics (totals, completion rates)
- Period-based filtering (week, month, quarter, year, all)
- Per-staff breakdown with performance indicators
- Activity evolution chart
- Optional CSV export

All statistics are computed client-side using existing SolidJS stores - no new database tables or backend changes required.

## Technical Context

**Language/Version**: TypeScript 5.9 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL (existing tables: staff_members, schedule_entries, tasks) - No new tables
**Testing**: Vitest 4.0 with @solidjs/testing-library 0.8
**Target Platform**: Web browser (responsive design, mobile-first)
**Project Type**: Single page web application (SolidJS SPA)
**Performance Goals**: Statistics load < 2 seconds, period filter changes instant (client-side)
**Constraints**: No external charting library - use CSS/SVG for simple bar chart
**Scale/Scope**: Single user dashboard, ~100-1000 entries per table typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | ✅ PASS | All statistics types will be defined in TypeScript |
| II. Test-Driven Development | ✅ PASS | Tests written before implementation for service and components |
| III. Ship Fast, Iterate Often | ✅ PASS | MVP focuses on P1 stories; P2/P3 can iterate later |
| IV. Component-Based Architecture | ✅ PASS | Small, reusable components (StatCard, Chart, Filters) |
| V. Supabase-Native Patterns | ✅ PASS | Uses existing stores which use Supabase client |
| VI. Explicit Error Handling | ✅ PASS | Loading/error states handled in UI |
| VII. Accessibility by Default | ✅ PASS | Semantic HTML, keyboard navigation, ARIA labels |

**All gates passed. No violations to justify.**

## Project Structure

### Documentation (this feature)

```text
specs/006-view-statistics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (types only, no DB tables)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── statistics.types.ts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   └── types/
│       └── statistics.types.ts    # Statistics type definitions
├── services/
│   └── statistics.service.ts      # Statistics calculation logic
│   └── statistics.service.test.ts # Service tests
├── components/
│   └── statistics/
│       ├── StatCard.tsx           # Single metric card
│       ├── StatCard.test.tsx
│       ├── StatsOverview.tsx      # Global stats grid
│       ├── StatsOverview.test.tsx
│       ├── StaffStats.tsx         # Per-member breakdown
│       ├── StaffStats.test.tsx
│       ├── ActivityChart.tsx      # Simple bar chart (SVG)
│       ├── ActivityChart.test.tsx
│       ├── PeriodFilter.tsx       # Period selector
│       └── PeriodFilter.test.tsx
├── pages/
│   └── Statistics.tsx             # Main statistics page
└── stores/
    └── (uses existing staff, schedule, task stores)
```

**Structure Decision**: Follows existing pattern - new page with dedicated components in `src/components/statistics/`. Service layer for calculations. No new store needed - reuses existing stores for data fetching.
