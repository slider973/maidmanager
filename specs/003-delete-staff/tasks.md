# Tasks: Supprimer les membres du personnel

**Input**: Design documents from `/specs/003-delete-staff/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: TDD approach per Constitution Principle II - tests written before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a SolidJS SPA with structure:
- Components: `src/components/ui/`, `src/components/staff/`
- Pages: `src/pages/`
- Services: `src/services/`
- Tests: Colocated with source files (`*.test.tsx`, `*.test.ts`)

---

## Phase 1: Setup (No changes required)

**Purpose**: Project infrastructure already in place from feature 002-add-staff

- [x] Infrastructure existante - Aucune modification de schéma requise
- [x] Service `deleteStaffMember` déjà implémenté dans src/services/staff.service.ts
- [x] Politique RLS `staff_members_delete_own` déjà en place

**Checkpoint**: Aucun setup nécessaire - passage direct aux composants

---

## Phase 2: Foundational - ConfirmDialog Component

**Purpose**: Composant de dialogue de confirmation réutilisable - requis par toutes les user stories

**⚠️ CRITICAL**: Ce composant doit être terminé avant l'intégration dans StaffList

### Tests for ConfirmDialog

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T001 [P] Create ConfirmDialog.test.tsx in src/components/ui/ with tests for:
  - Rendering when isOpen is true
  - Not rendering when isOpen is false
  - onConfirm callback when confirm button clicked
  - onCancel callback when cancel button clicked
  - onCancel callback when Escape pressed
  - onCancel callback when clicking outside dialog

### Implementation for ConfirmDialog

- [x] T002 Create ConfirmDialog.tsx in src/components/ui/ per contracts/confirm-dialog.ts:
  - Props: isOpen, title, message, confirmText, cancelText, confirmVariant, isLoading, onConfirm, onCancel
  - Modal overlay with backdrop
  - Accessible: role="dialog", aria-modal, aria-labelledby, aria-describedby
  - Keyboard: Escape closes dialog
  - Focus management on open/close
- [x] T003 Add CSS styles for ConfirmDialog in src/App.css:
  - .confirm-dialog-overlay (backdrop)
  - .confirm-dialog (modal container)
  - .confirm-dialog-title, .confirm-dialog-message
  - .confirm-dialog-actions (buttons container)
  - .btn-danger variant for confirm button
- [x] T004 Run tests to ensure ConfirmDialog component passes

**Checkpoint**: ConfirmDialog ready - user story implementation can begin

---

## Phase 3: User Story 1 & 2 - Supprimer avec confirmation (Priority: P1) 🎯 MVP

**Goal**: Utilisateur peut supprimer un membre avec confirmation obligatoire

**Note**: US1 (Supprimer) et US2 (Confirmation) sont fusionnées car indissociables - la suppression requiert la confirmation.

**Independent Test**: Ajouter un membre, cliquer sur supprimer, confirmer, vérifier que le membre disparaît de la liste

### Tests for User Story 1 & 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Add delete button tests to StaffList.test.tsx:
  - Delete button visible on each staff card
  - Delete button has accessible label
- [x] T006 [P] [US2] Add confirmation dialog tests to StaffList.test.tsx:
  - Dialog opens when delete button clicked
  - Dialog shows member name
  - Dialog closes when cancel clicked
  - Member removed from list when confirm clicked

### Implementation for User Story 1 & 2

- [x] T007 [US1] Add delete button to StaffList.tsx:
  - Trash icon button in each staff-card-header
  - onClick opens confirmation dialog
  - State: memberToDelete (StaffMember | null)
- [x] T008 [US2] Add ConfirmDialog to StaffList.tsx:
  - Show dialog when memberToDelete is set
  - Display member full name in message
  - onConfirm calls deleteStaffMember service
  - onCancel clears memberToDelete
- [x] T009 [US1] Add onDelete callback prop to StaffList.tsx:
  - Called after successful deletion
  - Allows parent (Staff.tsx) to handle refresh
- [x] T010 [US1] Update Staff.tsx to handle onDelete:
  - Increment refetchSignal to refresh list
- [x] T011 Add CSS for delete button in src/App.css:
  - .staff-card-delete (icon button styling)
  - Hover/focus states
- [x] T012 [US1] Run tests and verify User Stories 1 & 2 are complete

**Checkpoint**: User can delete staff member with confirmation dialog

---

## Phase 4: User Story 3 - Feedback après suppression (Priority: P2)

**Goal**: Utilisateur reçoit une notification de succès ou d'erreur après suppression

**Independent Test**: Supprimer un membre et vérifier qu'une notification apparaît

### Tests for User Story 3

- [x] T013 [P] [US3] Add toast notification tests to StaffList.test.tsx:
  - Success toast shown after successful deletion
  - Error toast shown if deletion fails

### Implementation for User Story 3

- [x] T014 [US3] Add success notification in StaffList.tsx:
  - Import showSuccess from Toast component
  - Call showSuccess after successful deleteStaffMember
  - Message: "Membre supprimé avec succès"
- [x] T015 [US3] Add error notification in StaffList.tsx:
  - Import showError from Toast component
  - Call showError if deleteStaffMember returns error
  - Display error message from service
- [x] T016 [US3] Add loading state to ConfirmDialog during deletion:
  - Pass isLoading prop while deleteStaffMember is pending
  - Disable buttons during loading
- [x] T017 [US3] Run tests and verify User Story 3 is complete

**Checkpoint**: User receives feedback for deletion success/failure

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: UI polish, accessibility, and edge case handling

- [x] T018 [P] Verify keyboard accessibility for delete flow (Tab, Enter, Escape)
- [x] T019 [P] Add focus management: return focus to list after dialog closes
- [x] T020 Test empty state: delete last member and verify empty state appears
- [x] T021 Run TypeScript build check (npm run build)
- [x] T022 Run all tests (npm run test)
- [x] T023 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Already complete - no action needed
- **Foundational (Phase 2)**: ConfirmDialog must be complete before user stories
- **User Stories 1 & 2 (Phase 3)**: Depend on Phase 2 - Core deletion functionality
- **User Story 3 (Phase 4)**: Depends on Phase 3 - Adds feedback on top
- **Polish (Phase 5)**: Depends on all user stories being complete

### Task Dependencies Within Phases

**Phase 2 (Foundational)**:
- T001 (tests) → T002 (implementation) → T003 (CSS) → T004 (verify)

**Phase 3 (User Stories 1 & 2)**:
- T005, T006 (tests - parallel) → T007 → T008 → T009 → T010 → T011 → T012

**Phase 4 (User Story 3)**:
- T013 (tests) → T014, T015 (parallel) → T016 → T017

### Parallel Opportunities

**Phase 2** (tests can run in parallel):
- T001 can be written while planning T002

**Phase 3** (tests in parallel):
- T005, T006 (parallel tests first)
- Then sequential implementation

**Phase 4** (some parallel):
- T014, T015 (success/error notifications can be done in parallel)

**Phase 5** (all parallel):
- T018, T019 can run in parallel

---

## Parallel Example: Phase 3

```bash
# Launch tests in parallel:
Task: "Add delete button tests to StaffList.test.tsx"
Task: "Add confirmation dialog tests to StaffList.test.tsx"

# After tests written, implement sequentially:
Task: "Add delete button to StaffList.tsx"
Task: "Add ConfirmDialog to StaffList.tsx"
Task: "Add onDelete callback prop to StaffList.tsx"
Task: "Update Staff.tsx to handle onDelete"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 2: Foundational (ConfirmDialog component)
2. Complete Phase 3: User Stories 1 & 2 (delete with confirmation)
3. **STOP and VALIDATE**: Test deleting staff members
4. Deploy/demo if ready - users can already delete staff!

### Incremental Delivery

1. Complete Foundational → ConfirmDialog ready
2. Add User Stories 1 & 2 → Test → Deploy (MVP - delete with confirmation)
3. Add User Story 3 → Test → Deploy (feedback notifications)
4. Polish phase → Final deployment

### Suggested MVP Scope

**MVP = Phase 2 + Phase 3 (User Stories 1 & 2)**

This delivers:
- Delete button visible on each staff card
- Confirmation dialog prevents accidental deletion
- Member removed from list after confirmation
- Core value is delivered: users can remove staff members

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 & US2 merged in Phase 3 because confirmation is integral to deletion
- Service layer already exists - no backend changes needed
- TDD: Write tests, verify they fail, then implement
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
