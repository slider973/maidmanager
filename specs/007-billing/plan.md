# Implementation Plan: Gestion de la facturation

**Branch**: `007-billing` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-billing/spec.md`

## Summary

Implement a billing/invoicing module for MaidManager allowing users to manage clients, associate clients with interventions, create invoices from completed interventions, track payments, and export invoices as PDF. The feature requires new database tables (clients, invoices, invoice_lines) and modifications to the existing schedule_entries table.

## Technical Context

**Language/Version**: TypeScript 5.9, SolidJS 1.9
**Primary Dependencies**: SolidJS, @solidjs/router, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL with RLS
**Testing**: Vitest with @solidjs/testing-library
**Target Platform**: Web browser (responsive, mobile-first)
**Project Type**: Web application (SPA frontend + Supabase backend)
**Performance Goals**: Page load < 2s, invoice creation < 3 minutes (user workflow)
**Constraints**: No server-side code (client-side only), PDF generation in browser
**Scale/Scope**: Single-user household management, ~100 clients max, ~1000 invoices/year

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | PASS | All new types will be in database.ts with strict TypeScript |
| II. Test-Driven Development | PASS | Tests written before implementation per constitution |
| III. Ship Fast, Iterate Often | PASS | MVP (P1 features) first, PDF export (P3) later |
| IV. Component-Based Architecture | PASS | Reusable components: ClientForm, InvoiceForm, InvoiceCard |
| V. Supabase-Native Patterns | PASS | RLS on all new tables, migrations versioned |
| VI. Explicit Error Handling | PASS | Error states in forms, validation messages |
| VII. Accessibility by Default | PASS | Form labels, keyboard navigation, semantic HTML |

**Gate Result**: PASS - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/007-billing/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── billing.types.ts # TypeScript interfaces
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── billing/           # New: billing components
│       ├── ClientForm.tsx
│       ├── ClientList.tsx
│       ├── InvoiceForm.tsx
│       ├── InvoiceList.tsx
│       ├── InvoiceCard.tsx
│       └── InvoiceDetail.tsx
├── lib/
│   └── types/
│       └── database.ts    # Modified: add Client, Invoice, InvoiceLine types
├── pages/
│   ├── Clients.tsx        # New: client management page
│   └── Invoices.tsx       # New: invoice management page
├── services/
│   ├── client.service.ts  # New: client CRUD operations
│   └── invoice.service.ts # New: invoice operations
└── stores/
    ├── clientStore.ts     # New: client state management
    └── invoiceStore.ts    # New: invoice state management

supabase/migrations/
├── 20260207_create_clients.sql        # New: clients table
├── 20260207_create_invoices.sql       # New: invoices table
├── 20260207_create_invoice_lines.sql  # New: invoice_lines table
└── 20260207_alter_schedule_entries.sql # Modify: add client_id, amount
```

**Structure Decision**: Web application structure, following existing patterns from staff, schedule, and tasks features. Components colocated in `/components/billing/`, services in `/services/`, stores in `/stores/`.

## Complexity Tracking

> No violations to justify - all principles pass.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
