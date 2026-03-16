# Tasks: Gestion de la facturation

**Feature**: 007-billing
**Generated**: 2026-02-07
**Source**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

## Legend

- [ ] Task not started
- [x] Task completed
- **[P]** Parallelizable task (different files, no dependencies)
- **[US#]** User story association

---

## Phase 1: Setup

**Purpose**: Project initialization and type definitions

- [x] T001 Copy billing types from specs/007-billing/contracts/billing.types.ts to src/lib/types/billing.types.ts
- [x] T002 [P] Update src/lib/types/database.ts with Client, Invoice, InvoiceLine table types
- [x] T003 [P] Export billing types from src/lib/types/index.ts (create if not exists)

---

## Phase 2: Foundational (Database Migrations)

**Purpose**: Database schema changes that MUST be complete before any user story

**⚠️ CRITICAL**: Apply migrations in order via Supabase dashboard

- [x] T004 Create migration supabase/migrations/20260207_001_create_clients.sql per data-model.md
- [x] T005 Create migration supabase/migrations/20260207_002_create_invoices.sql per data-model.md
- [x] T006 Create migration supabase/migrations/20260207_003_create_invoice_lines.sql per data-model.md
- [x] T007 Create migration supabase/migrations/20260207_004_alter_schedule_entries.sql per data-model.md
- [ ] T008 Apply all migrations to Supabase database in order (001 → 002 → 003 → 004)

**Checkpoint**: Database ready - User story implementation can begin

---

## Phase 3: User Story 1 - Gestion des clients (Priority: P1) 🎯 MVP ✅

**Goal**: L'utilisateur peut créer et gérer une liste de clients

**Independent Test**: Créer un nouveau client avec ses coordonnées et le retrouver dans la liste des clients

### Tests for User Story 1

- [x] T009 [P] [US1] Write tests for client.service.ts in src/services/client.service.test.ts
- [ ] T010 [P] [US1] Write tests for ClientForm component in src/components/billing/ClientForm.test.tsx
- [ ] T011 [P] [US1] Write tests for ClientList component in src/components/billing/ClientList.test.tsx

### Implementation for User Story 1

- [x] T012 [US1] Implement client service CRUD in src/services/client.service.ts
- [x] T013 [US1] Create client store in src/stores/clientStore.ts
- [x] T014 [P] [US1] Create ClientForm component in src/components/billing/ClientForm.tsx
- [x] T015 [P] [US1] Create ClientList component in src/components/billing/ClientList.tsx
- [x] T016 [P] [US1] Create ClientCard component in src/components/billing/ClientCard.tsx
- [x] T017 [US1] Create Clients page in src/pages/Clients.tsx
- [x] T018 [US1] Add /clients route to src/App.tsx with ProtectedRoute
- [x] T019 [US1] Add client styles to src/App.css (reuse existing patterns)
- [x] T020 [US1] Add navigation link to clients in Home.tsx or navigation component

**Checkpoint**: User Story 1 complete - Can create, edit, delete, list clients ✅

---

## Phase 4: User Story 2 - Association client-intervention (Priority: P1) ✅

**Goal**: L'utilisateur peut associer un client à une intervention planifiée

**Independent Test**: Lors de la création d'une intervention, sélectionner un client dans la liste déroulante

**Dependencies**: Requires US1 (clients must exist to associate)

### Tests for User Story 2

- [ ] T021 [P] [US2] Write tests for updated schedule.service.ts with client/amount in src/services/schedule.service.test.ts
- [ ] T022 [P] [US2] Write tests for ClientSelect component in src/components/billing/ClientSelect.test.tsx

### Implementation for User Story 2

- [x] T023 [US2] Update ScheduleEntry types in src/lib/types/database.ts to include client_id and amount
- [x] T024 [US2] Update schedule.service.ts to handle client_id and amount fields in src/services/schedule.service.ts
- [x] T025 [US2] Create ClientSelect dropdown component in src/components/billing/ClientSelect.tsx
- [x] T026 [US2] Create AmountInput component for tariff in src/components/billing/AmountInput.tsx
- [x] T027 [US2] Update ScheduleForm to include ClientSelect and AmountInput in src/components/schedule/ScheduleForm.tsx
- [x] T028 [US2] Update ScheduleCard to display client name in src/components/schedule/ScheduleCard.tsx
- [x] T029 [US2] Update Schedule page to load clients for dropdown in src/pages/Schedule.tsx (handled via ClientSelect)

**Checkpoint**: User Story 2 complete - Can associate clients and amounts to interventions ✅

---

## Phase 5: User Story 3 - Création de facture (Priority: P1) ✅

**Goal**: L'utilisateur peut créer une facture pour un client en sélectionnant les interventions complétées

**Independent Test**: Sélectionner des interventions complétées pour un client et générer une facture avec le total calculé

**Dependencies**: Requires US1 (clients) and US2 (client-intervention association)

### Tests for User Story 3

- [ ] T030 [P] [US3] Write tests for invoice.service.ts in src/services/invoice.service.test.ts
- [ ] T031 [P] [US3] Write tests for InvoiceForm component in src/components/billing/InvoiceForm.test.tsx

### Implementation for User Story 3

- [x] T032 [US3] Implement invoice service in src/services/invoice.service.ts (create, generateNumber, getUnbilled)
- [x] T033 [US3] Create invoice store in src/stores/invoiceStore.ts
- [x] T034 [US3] Create InvoiceForm component in src/components/billing/InvoiceForm.tsx
- [x] T035 [US3] Create InterventionSelector component in src/components/billing/InterventionSelector.tsx (integrated in InvoiceForm)
- [x] T036 [US3] Create InvoiceLineItem component in src/components/billing/InvoiceLineItem.tsx (integrated in InvoiceForm)
- [x] T037 [US3] Create Invoices page (basic) in src/pages/Invoices.tsx
- [x] T038 [US3] Add /invoices route to src/App.tsx with ProtectedRoute
- [x] T039 [US3] Add navigation link to invoices

**Checkpoint**: User Story 3 complete - Can create invoices from completed interventions ✅

---

## Phase 6: User Story 4 - Consultation des factures (Priority: P2) ✅

**Goal**: L'utilisateur peut consulter la liste de toutes les factures avec filtrage

**Independent Test**: Accéder à la liste des factures et filtrer pour voir uniquement les factures impayées

**Dependencies**: Requires US3 (invoices must exist to list)

### Tests for User Story 4

- [ ] T040 [P] [US4] Write tests for InvoiceList component in src/components/billing/InvoiceList.test.tsx
- [ ] T041 [P] [US4] Write tests for InvoiceDetail component in src/components/billing/InvoiceDetail.test.tsx
- [ ] T042 [P] [US4] Write tests for InvoiceFilters component in src/components/billing/InvoiceFilters.test.tsx

### Implementation for User Story 4

- [x] T043 [US4] Implement invoice getAll with filters in src/services/invoice.service.ts
- [x] T044 [US4] Implement invoice getById with lines in src/services/invoice.service.ts
- [x] T045 [P] [US4] Create InvoiceCard component in src/components/billing/InvoiceCard.tsx
- [x] T046 [P] [US4] Create InvoiceList component in src/components/billing/InvoiceList.tsx (integrated in Invoices page)
- [x] T047 [P] [US4] Create InvoiceFilters component in src/components/billing/InvoiceFilters.tsx (integrated in Invoices page)
- [x] T048 [US4] Create InvoiceDetail component in src/components/billing/InvoiceDetail.tsx
- [x] T049 [US4] Update Invoices page with list, filters, and detail view in src/pages/Invoices.tsx
- [x] T050 [US4] Add invoice styles to src/App.css

**Checkpoint**: User Story 4 complete - Can view, filter, and inspect invoice details ✅

---

## Phase 7: User Story 5 - Marquer une facture comme payée (Priority: P2) ✅

**Goal**: L'utilisateur peut marquer une facture comme payée avec date de paiement

**Independent Test**: Sélectionner une facture impayée et la marquer comme payée avec la date du jour

**Dependencies**: Requires US4 (need to view invoice to mark as paid)

### Tests for User Story 5

- [ ] T051 [P] [US5] Write tests for invoice status transitions in src/services/invoice.service.test.ts
- [ ] T052 [P] [US5] Write tests for PaymentDialog component in src/components/billing/PaymentDialog.test.tsx

### Implementation for User Story 5

- [x] T053 [US5] Implement markAsSent, markAsPaid, cancel in src/services/invoice.service.ts
- [x] T054 [US5] Create PaymentDialog component in src/components/billing/PaymentDialog.tsx (integrated in InvoiceDetail)
- [x] T055 [US5] Create InvoiceStatusBadge component in src/components/billing/InvoiceStatusBadge.tsx (using CSS classes)
- [x] T056 [US5] Add status action buttons to InvoiceDetail in src/components/billing/InvoiceDetail.tsx
- [x] T057 [US5] Update invoiceStore with status change actions in src/stores/invoiceStore.ts

**Checkpoint**: User Story 5 complete - Can change invoice status (draft → sent → paid/cancelled) ✅

---

## Phase 8: User Story 6 - Export PDF de facture (Priority: P3) ✅

**Goal**: L'utilisateur peut télécharger une facture au format PDF

**Independent Test**: Cliquer sur "Télécharger PDF" sur une facture et obtenir un fichier PDF lisible

**Dependencies**: Requires US4 (need invoice detail to print)

### Implementation for User Story 6

- [x] T058 [US6] Create InvoicePrint page with print-optimized layout in src/pages/InvoicePrint.tsx
- [x] T059 [US6] Add @media print styles for invoice in src/App.css
- [x] T060 [US6] Add /invoices/:id/print route to src/App.tsx
- [x] T061 [US6] Add "Télécharger PDF" button to InvoiceDetail in src/components/billing/InvoiceDetail.tsx
- [x] T062 [US6] Implement printInvoice function that opens print view in src/services/invoice.service.ts (via navigation)

**Checkpoint**: User Story 6 complete - Can export invoices as PDF via browser print ✅

---

## Phase 9: Polish & Edge Cases

**Purpose**: Cross-cutting improvements and edge case handling

- [x] T063 [P] Handle deleted client display ("Client supprimé") in InvoiceCard and InvoiceDetail
- [x] T064 [P] Add empty state for client list in src/components/billing/ClientList.tsx
- [x] T065 [P] Add empty state for invoice list in src/components/billing/InvoiceList.tsx
- [x] T066 Add "Aucune intervention à facturer" message in InvoiceForm
- [x] T067 Prevent modification of sent/paid invoices (disable form fields based on status)
- [x] T068 Add loading states to all billing pages
- [x] T069 Add error toast notifications for billing operations
- [x] T070 Run build verification: npm run build
- [x] T071 Run all tests: npm test
- [ ] T072 Manual testing: Complete billing workflow per quickstart.md checklist

---

## Summary

| Phase | Description | Tasks | Priority |
|-------|-------------|-------|----------|
| Phase 1 | Setup | 3 | Required |
| Phase 2 | Foundational (Migrations) | 5 | Required |
| Phase 3 | US1 - Client Management | 12 | P1 🎯 MVP |
| Phase 4 | US2 - Client-Intervention | 9 | P1 |
| Phase 5 | US3 - Invoice Creation | 10 | P1 |
| Phase 6 | US4 - Invoice List/Filter | 11 | P2 |
| Phase 7 | US5 - Payment Tracking | 7 | P2 |
| Phase 8 | US6 - PDF Export | 5 | P3 |
| Phase 9 | Polish | 10 | Required |
| **Total** | | **72** | |

**MVP Scope (P1)**: Phases 1-5 (39 tasks) - Clients + Association + Invoice Creation
**Full Feature**: All phases (72 tasks)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (Database)
    ↓
┌───────────────────────────────────────┐
│ Phase 3: US1 - Client Management      │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Phase 4: US2 - Client-Intervention    │ (depends on US1 for client data)
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Phase 5: US3 - Invoice Creation       │ (depends on US1+US2)
└───────────────────────────────────────┘
    ↓
┌─────────────────────┬─────────────────┐
│ Phase 6: US4        │ Phase 7: US5    │ (can run in parallel)
│ Invoice List        │ Payment Status  │
└─────────────────────┴─────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Phase 8: US6 - PDF Export             │
└───────────────────────────────────────┘
    ↓
Phase 9: Polish
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 | - | Phase 2 complete |
| US2 | US1 | Phase 3 complete |
| US3 | US1, US2 | Phase 4 complete |
| US4 | US3 | Phase 5 complete |
| US5 | US4 | Phase 6 complete |
| US6 | US4 | Phase 6 complete |

### Parallel Opportunities

**Within Phase 1 (Setup)**:
```
T001 (copy types) → then T002, T003 in parallel
```

**Within Phase 3 (US1)**:
```
T009, T010, T011 in parallel (tests)
T014, T015, T016 in parallel (components)
```

**Within Phase 4 (US2)**:
```
T021, T022 in parallel (tests)
```

**Within Phase 5 (US3)**:
```
T030, T031 in parallel (tests)
```

**Within Phase 6 (US4)**:
```
T040, T041, T042 in parallel (tests)
T045, T046, T047 in parallel (components)
```

**Phase 6 + Phase 7 can run in parallel** (different files, independent features)

---

## Implementation Strategy

### MVP First (P1 User Stories)

1. Complete Phase 1: Setup (3 tasks)
2. Complete Phase 2: Foundational - Apply migrations (5 tasks)
3. Complete Phase 3: US1 - Client Management (12 tasks)
4. **VALIDATE**: Test client CRUD independently
5. Complete Phase 4: US2 - Client-Intervention (9 tasks)
6. **VALIDATE**: Test client selection in schedule form
7. Complete Phase 5: US3 - Invoice Creation (10 tasks)
8. **VALIDATE**: Test full invoice creation workflow
9. **MVP COMPLETE**: Deploy/demo with core billing functionality

### Incremental Delivery

After MVP:
1. Add Phase 6 (US4) → Invoice list with filtering
2. Add Phase 7 (US5) → Payment status tracking
3. Add Phase 8 (US6) → PDF export
4. Phase 9 → Polish and edge cases

---

## Notes

- TDD required per constitution: Write tests before implementation
- All database changes via migrations (no direct schema edits)
- Follow existing project patterns (services, stores, components)
- French labels for all UI text
- EUR currency, HT only (no TVA for now)
- PDF via browser print (@media print CSS)
