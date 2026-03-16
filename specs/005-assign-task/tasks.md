# Tasks: Assignez une mission

**Feature**: 005-assign-task
**Generated**: 2026-02-07
**Completed**: 2026-02-07
**Source**: [spec.md](./spec.md) | [plan.md](./plan.md) | [data-model.md](./data-model.md)

## Legend

- [ ] Task not started
- [x] Task completed
- **[TEST]** Test task (write before implementation)
- **[IMPL]** Implementation task
- **[STYLE]** CSS/styling task

---

## Phase 0: Setup

### 0.1 Database Migration

- [x] **[IMPL]** Apply migration to create `tasks` table
  - File: `supabase/migrations/20260207_create_tasks.sql`
  - Copy from: `specs/005-assign-task/data-model.md` (Migration SQL complète section)
  - Verify: Table created with all columns, indexes, RLS policies, and trigger

### 0.2 Type Definitions

- [x] **[IMPL]** Copy task types to source
  - Copy `specs/005-assign-task/contracts/task.types.ts` to `src/lib/types/task.types.ts`
  - Export from `src/lib/types/index.ts` if exists

### 0.3 Route Setup

- [x] **[IMPL]** Add `/tasks` route to App.tsx
  - Import Tasks page (lazy or direct)
  - Add protected route: `<Route path="/tasks" component={() => <ProtectedRoute><Tasks /></ProtectedRoute>} />`

---

## Phase 1: Foundational (Service Layer)

### 1.1 Validation Functions

- [x] **[TEST]** Write tests for `validateTask` function
  - File: `src/services/task.service.test.ts`
  - Test: Returns error for missing `staff_member_id`
  - Test: Returns error for missing `title`
  - Test: Returns error for title > 200 characters
  - Test: Returns error for missing `due_date`
  - Test: Returns error for description > 1000 characters
  - Test: Returns null for valid task data

- [x] **[IMPL]** Implement `validateTask` function
  - File: `src/services/task.service.ts`
  - Validate all required fields with French error messages
  - Check character limits

### 1.2 CRUD Service Functions

- [x] **[TEST]** Write tests for `createTask`
  - File: `src/services/task.service.test.ts`
  - Test: Creates task and returns it
  - Test: Returns validation error for invalid data
  - Test: Handles Supabase errors gracefully

- [x] **[IMPL]** Implement `createTask`
  - File: `src/services/task.service.ts`
  - Validate input → Insert → Return ServiceResult

- [x] **[TEST]** Write tests for `getTasks`
  - Test: Returns all tasks for user
  - Test: Joins staff_member data
  - Test: Orders by due_date ascending
  - Test: Applies filters correctly

- [x] **[IMPL]** Implement `getTasks`
  - Query with staff_member join
  - Apply filters (staffMemberId, status, priority)
  - Order by due_date ASC

- [x] **[TEST]** Write tests for `updateTask`
  - Test: Updates task and returns it
  - Test: Returns error for non-existent task

- [x] **[IMPL]** Implement `updateTask`
  - Validate → Update → Return ServiceResult

- [x] **[TEST]** Write tests for `deleteTask`
  - Test: Deletes task successfully
  - Test: Returns error for non-existent task

- [x] **[IMPL]** Implement `deleteTask`
  - Delete by ID → Return ServiceResult

- [x] **[TEST]** Write tests for `updateTaskStatus`
  - Test: Updates status to in_progress
  - Test: Updates status to completed
  - Test: Updates status back to pending

- [x] **[IMPL]** Implement `updateTaskStatus`
  - Shortcut for status-only update

---

## Phase 2: Store Layer

### 2.1 Task Store

- [x] **[IMPL]** Create task store
  - File: `src/stores/task.store.ts`
  - State: `tasks`, `loading`, `error`, `initialized`, `filters`
  - Actions: `fetch`, `add`, `update`, `delete`, `setFilters`, `clearFilters`, `reset`
  - Follow pattern from `schedule.store.ts`

---

## Phase 3: User Story 1 - Créer une mission (P1)

> L'utilisateur peut créer une nouvelle mission et l'assigner à un membre du personnel.

### 3.1 TaskForm Component

- [x] **[TEST]** Write tests for TaskForm
  - File: `src/components/tasks/TaskForm.test.tsx`
  - Test: Renders all form fields (staff select, title, description, due_date, priority)
  - Test: Calls onSubmit with form data
  - Test: Shows validation errors
  - Test: Disables submit button when loading
  - Test: All fields have accessible labels

- [x] **[IMPL]** Implement TaskForm component
  - File: `src/components/tasks/TaskForm.tsx`
  - Staff member select (from staffStore)
  - Title input (required)
  - Description textarea (optional)
  - Due date input (required)
  - Priority select (default: normal)
  - Submit button with loading state
  - Accessibility: labels, aria-describedby for errors

- [x] **[STYLE]** Style TaskForm
  - Form layout consistent with existing forms
  - Priority colors on select options

### 3.2 Tasks Page - Create Flow

- [x] **[IMPL]** Create Tasks page with create functionality
  - File: `src/pages/Tasks.tsx`
  - Show TaskForm (modal or inline)
  - Call taskStore.add on submit
  - Show success toast
  - Handle errors

### 3.3 Home.tsx Integration

- [x] **[IMPL]** Update Home.tsx "Nouvelle tâche" button
  - Change div to `<A href="/tasks">` link
  - Keep existing styling

---

## Phase 4: User Story 2 - Consulter les missions (P1)

> L'utilisateur peut voir la liste de toutes les missions.

### 4.1 TaskCard Component

- [x] **[TEST]** Write tests for TaskCard
  - File: `src/components/tasks/TaskCard.test.tsx`
  - Test: Displays task title, description, due date
  - Test: Displays staff member name
  - Test: Displays priority badge with correct color
  - Test: Displays status badge
  - Test: Shows "En retard" indicator for overdue tasks
  - Test: Shows "Urgent" indicator for tasks due today
  - Test: Calls onEdit when edit button clicked
  - Test: Calls onStatusChange when status changed

- [x] **[IMPL]** Implement TaskCard component
  - File: `src/components/tasks/TaskCard.tsx`
  - Display all task info
  - Use utility functions: `isTaskOverdue`, `isTaskUrgent`
  - Priority badge with PRIORITY_COLORS
  - Status badge with TASK_STATUS_LABELS
  - Edit/Delete action buttons

- [x] **[STYLE]** Style TaskCard
  - `.task-card` base styles
  - `.task-card-overdue` red left border
  - `.task-card-urgent` gold left border
  - `.task-card-completed` reduced opacity
  - Priority badges: `.task-priority-*`
  - Status badges: `.task-status-*`

### 4.2 TaskList Component

- [x] **[TEST]** Write tests for TaskList
  - File: `src/components/tasks/TaskList.test.tsx`
  - Test: Shows loading spinner when loading
  - Test: Shows error message when error
  - Test: Shows "Aucune mission" when empty
  - Test: Shows CTA button to create first task when empty
  - Test: Renders TaskCard for each task
  - Test: Tasks ordered by due_date (nearest first)

- [x] **[IMPL]** Implement TaskList component
  - File: `src/components/tasks/TaskList.tsx`
  - Loading state with spinner
  - Error state with message
  - Empty state with CTA
  - Map tasks to TaskCard components

### 4.3 Tasks Page - List View

- [x] **[IMPL]** Complete Tasks page with list
  - Fetch tasks on mount via taskStore.fetch()
  - Display TaskList component
  - Handle loading/error states

---

## Phase 5: User Story 3 - Marquer comme terminée (P2)

> L'utilisateur peut changer le statut d'une mission.

### 5.1 Status Change Flow

- [x] **[IMPL]** Add status dropdown/buttons to TaskCard
  - Quick action buttons: "En cours", "Terminé"
  - Or dropdown select for status
  - Call taskStore.update with new status

- [x] **[IMPL]** Visual feedback for completed tasks
  - Apply `.task-card-completed` class
  - Strikethrough or grayed styling

---

## Phase 6: User Story 4 - Modifier une mission (P2)

> L'utilisateur peut modifier les détails d'une mission existante.

### 6.1 Edit Flow

- [x] **[IMPL]** Add edit mode to TaskForm
  - Accept `task` prop for pre-filling
  - Different submit label: "Modifier" vs "Créer"

- [x] **[IMPL]** Add edit modal/flow to Tasks page
  - Open TaskForm with selected task
  - Call taskStore.update on submit
  - Close modal on success

---

## Phase 7: User Story 5 - Supprimer une mission (P3)

> L'utilisateur peut supprimer une mission avec confirmation.

### 7.1 Delete Flow

- [x] **[IMPL]** Add delete button to TaskCard
  - Show ConfirmDialog on click
  - Message: "Voulez-vous vraiment supprimer cette mission ?"
  - Call taskStore.delete on confirm

---

## Phase 8: User Story 6 - Filtrer les missions (P3)

> L'utilisateur peut filtrer les missions par membre, statut ou priorité.

### 8.1 TaskFilters Component

- [x] **[TEST]** Write tests for TaskFilters
  - File: `src/components/tasks/TaskFilters.test.tsx`
  - Test: Renders staff member filter
  - Test: Renders status filter
  - Test: Renders priority filter
  - Test: Calls onFiltersChange when filter changed
  - Test: Shows "Effacer" button when filters active

- [x] **[IMPL]** Implement TaskFilters component
  - File: `src/components/tasks/TaskFilters.tsx`
  - Staff member select (all + individual)
  - Status select (all + pending/in_progress/completed)
  - Priority select (all + low/normal/high/urgent)
  - Clear filters button

- [x] **[STYLE]** Style TaskFilters
  - Horizontal layout
  - Consistent with existing filter patterns

### 8.2 Integrate Filters

- [x] **[IMPL]** Add TaskFilters to Tasks page
  - Connect to taskStore.setFilters
  - Re-fetch tasks when filters change
  - Show active filter count

---

## Phase 9: Polish & Edge Cases

### 9.1 Edge Case: Deleted Staff Member

- [x] **[IMPL]** Handle null staff_member in TaskCard
  - Display "Membre supprimé" when staff_member is null
  - Use different styling (italic, gray)

### 9.2 Overdue/Urgent Indicators

- [x] **[IMPL]** Add "En retard" badge
  - Show when `isTaskOverdue(task)` is true
  - Red badge style

- [x] **[IMPL]** Add "Urgent" badge
  - Show when `isTaskUrgent(task)` is true
  - Gold/orange badge style

### 9.3 Final Verification

- [x] Run all tests: `npm test` (241 tests passing)
- [x] Run build: `npm run build` (success)
- [ ] Manual testing: Full CRUD workflow
- [ ] Check accessibility: Keyboard navigation, screen reader
- [ ] Check mobile responsiveness

---

## Summary

| Phase | Tasks | Priority | Status |
|-------|-------|----------|--------|
| Phase 0: Setup | 3 | Required | ✓ Complete |
| Phase 1: Service Layer | 12 | Required | ✓ Complete |
| Phase 2: Store | 1 | Required | ✓ Complete |
| Phase 3: US1 Create | 5 | P1 | ✓ Complete |
| Phase 4: US2 List | 7 | P1 | ✓ Complete |
| Phase 5: US3 Status | 2 | P2 | ✓ Complete |
| Phase 6: US4 Edit | 2 | P2 | ✓ Complete |
| Phase 7: US5 Delete | 1 | P3 | ✓ Complete |
| Phase 8: US6 Filters | 5 | P3 | ✓ Complete |
| Phase 9: Polish | 5 | Required | 3/5 Complete |
| **Total** | **43** | | **40/43** |

**MVP (P1)**: Phases 0-4 ✓ Complete
**Full Feature**: All phases - 40/43 tasks complete (remaining: manual testing)
