# Tasks: Ajouter du Personnel

**Input**: Design documents from `/specs/002-add-staff/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD approach per Constitution Principle II - tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a SolidJS SPA with structure:
- Components: `src/components/staff/`
- Pages: `src/pages/`
- Services: `src/services/`
- Types: `src/lib/types/`
- Tests: Colocated with source files (`*.test.tsx`, `*.test.ts`)

---

## Phase 1: Setup (Database & Types)

**Purpose**: Database schema and TypeScript types required by all user stories

- [x] T001 Create staff_members table migration SQL in Supabase dashboard per data-model.md
- [x] T002 Add RLS policies for staff_members table per data-model.md
- [x] T003 Add StaffMember types to src/lib/types/database.ts per data-model.md
- [x] T004 [P] Add STAFF_POSITIONS and POSITION_LABELS constants to src/lib/types/database.ts
- [x] T005 [P] Add staff-related error messages to src/lib/utils/errorMessages.ts

---

## Phase 2: Foundational (Service Layer)

**Purpose**: Staff service that ALL user stories depend on

**⚠️ CRITICAL**: No component work can begin until this phase is complete

### Tests for Service Layer

- [x] T006 [P] Create staff.service.test.ts in src/services/ with tests for createStaffMember, getStaffMembers
- [x] T007 [P] Update src/test/setup.ts to mock staff_members Supabase calls

### Implementation

- [x] T008 Create staff.service.ts in src/services/ with createStaffMember function per contracts/staff-service.ts
- [x] T009 Add getStaffMembers function to src/services/staff.service.ts
- [x] T010 Add getStaffMember function to src/services/staff.service.ts
- [x] T011 [P] Add validateStaffMember function to src/services/staff.service.ts per data-model.md validation rules
- [x] T012 Run tests to ensure service layer passes

**Checkpoint**: Service layer ready - component implementation can now begin

---

## Phase 3: User Story 1 - Enregistrer un nouveau membre (Priority: P1) 🎯 MVP

**Goal**: Utilisateur peut créer un nouveau membre avec nom, prénom, poste et voir le résultat

**Independent Test**: Créer un membre avec les champs obligatoires et vérifier qu'il apparaît dans une liste basique

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Create StaffForm.test.tsx in src/components/staff/ testing form display and submission
- [x] T014 [P] [US1] Create StaffList.test.tsx in src/components/staff/ testing list rendering and empty state

### Implementation for User Story 1

- [x] T015 [US1] Create StaffForm.tsx in src/components/staff/ with first_name, last_name, position fields
- [x] T016 [US1] Add form validation for required fields with French error messages in StaffForm.tsx
- [x] T017 [US1] Add position dropdown with POSITION_LABELS to StaffForm.tsx
- [x] T018 [US1] Add position_custom input when position='other' in StaffForm.tsx
- [x] T019 [US1] Create StaffList.tsx in src/components/staff/ using createResource for data fetching
- [x] T020 [US1] Add loading state and empty state to StaffList.tsx
- [x] T021 [US1] Create Staff.tsx page in src/pages/ integrating StaffForm and StaffList
- [x] T022 [US1] Add /staff route to src/App.tsx with ProtectedRoute wrapper
- [x] T023 [US1] Add link to staff page from src/pages/Home.tsx
- [x] T024 [US1] Run tests and verify User Story 1 is complete

**Checkpoint**: User can add staff member with required fields and see them in a list

---

## Phase 4: User Story 2 - Définir le poste et les coordonnées (Priority: P1)

**Goal**: Ajouter numéro de téléphone et email au formulaire avec validation

**Independent Test**: Ajouter un membre avec coordonnées et vérifier qu'elles sont enregistrées

### Tests for User Story 2

- [x] T025 [P] [US2] Add tests for phone/email fields to StaffForm.test.tsx
- [x] T026 [P] [US2] Add tests for email validation error display

### Implementation for User Story 2

- [x] T027 [US2] Add phone input field to StaffForm.tsx
- [x] T028 [US2] Add email input field with validation to StaffForm.tsx
- [x] T029 [US2] Display phone and email in StaffList.tsx
- [x] T030 [US2] Run tests and verify User Story 2 is complete

**Checkpoint**: User can add contact information for staff members

---

## Phase 5: User Story 3 - Ajouter des informations complémentaires (Priority: P2)

**Goal**: Permettre d'ajouter date de début et notes

**Independent Test**: Ajouter un membre avec date et notes, vérifier leur affichage

### Tests for User Story 3

- [x] T031 [P] [US3] Add tests for start_date and notes fields to StaffForm.test.tsx

### Implementation for User Story 3

- [x] T032 [US3] Add start_date date picker to StaffForm.tsx
- [x] T033 [US3] Add notes textarea to StaffForm.tsx
- [x] T034 [US3] Display start_date and notes in staff details (StaffList or separate StaffCard)
- [x] T035 [US3] Run tests and verify User Story 3 is complete

**Checkpoint**: User can add supplementary information to staff profiles

---

## Phase 6: User Story 4 - Consulter la liste du personnel (Priority: P2)

**Goal**: Afficher liste complète avec indicateur de statut actif/inactif

**Independent Test**: Voir tous les membres avec leur statut affiché

### Tests for User Story 4

- [x] T036 [P] [US4] Add tests for status indicator display to StaffList.test.tsx
- [x] T037 [P] [US4] Create StaffCard.test.tsx in src/components/staff/ testing card display

### Implementation for User Story 4

- [x] T038 [US4] Create StaffCard.tsx in src/components/staff/ for individual staff display
- [x] T039 [US4] Add is_active status indicator (badge) to StaffCard.tsx
- [x] T040 [US4] Update StaffList.tsx to use StaffCard component
- [x] T041 [US4] Add visual differentiation for inactive members (opacity, strikethrough, or badge style)
- [x] T042 [US4] Run tests and verify User Story 4 is complete

**Checkpoint**: User sees complete staff list with status indicators

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UI polish, CSS, accessibility, and validation

- [x] T043 [P] Add staff list CSS styles to src/App.css (staff-list, staff-card, staff-form classes)
- [x] T044 [P] Add form validation CSS (error states, focus styles) to src/App.css
- [x] T045 Verify all form inputs have associated labels (accessibility)
- [x] T046 Add focus management when form is submitted successfully
- [x] T047 [P] Add Toast notifications for create success/error in StaffForm.tsx
- [x] T048 Run TypeScript build check (npm run build)
- [x] T049 Run all tests (npm run test)
- [x] T050 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all components
- **User Stories (Phase 3-6)**: All depend on Phase 2 completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P1)**: Extends US1 form - Can run in parallel with US1 if coordinated
- **User Story 3 (P2)**: Extends US1/US2 form - Can run in parallel
- **User Story 4 (P2)**: Uses components from US1 - Can start after US1 T019 (StaffList)

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD)
- Service layer before components
- Components before page integration
- Core implementation before polish
- Story complete before checkpoint

### Parallel Opportunities

**Phase 1** (all can run in parallel after T001-T003):
- T004, T005

**Phase 2** (tests in parallel, then service functions):
- T006, T007 (parallel tests)
- T011 can run in parallel with T009, T010

**Phase 3** (User Story 1):
- T013, T014 (parallel tests first)
- Then sequential: T015 → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023

**Phase 4-6** (User Stories 2-4):
- Tests for each story can run in parallel
- Implementation within each story is sequential

**Phase 7** (Polish):
- T043, T044, T047 can run in parallel

---

## Parallel Example: Phase 2 Service Layer

```bash
# Launch service tests in parallel:
Task: "Create staff.service.test.ts with tests for createStaffMember, getStaffMembers"
Task: "Update setup.ts to mock staff_members"

# After tests written, implement service:
Task: "Create staff.service.ts with createStaffMember"
# Then sequential service functions
```

---

## Parallel Example: User Story 1

```bash
# Launch component tests in parallel (TDD - write first):
Task: "Create StaffForm.test.tsx testing form display and submission"
Task: "Create StaffList.test.tsx testing list rendering and empty state"

# After tests fail, implement components sequentially
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database, types)
2. Complete Phase 2: Foundational (service layer)
3. Complete Phase 3: User Story 1 (form + list with required fields)
4. **STOP and VALIDATE**: Test adding staff members with required fields
5. Deploy/demo if ready - users can already add and view staff!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test → Deploy (MVP - basic add/view)
3. Add User Story 2 → Test → Deploy (contact info)
4. Add User Story 3 → Test → Deploy (supplementary info)
5. Add User Story 4 → Test → Deploy (enhanced list view)
6. Polish phase → Final deployment

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1)**

This delivers:
- Staff members can be created with required fields
- Staff members appear in a list
- Position selection works including custom positions
- Validation prevents invalid submissions
- Core value is delivered: users can start managing their staff

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Stories 1 & 2 are both P1 priority - implement US1 first as it's the foundation
- TDD: Write tests, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
