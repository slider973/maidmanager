# Tasks: Complete Authentication System

**Input**: Design documents from `/specs/001-complete-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Vitest tests required per constitution (TDD approach). Tests MUST be written first and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Tests colocated: `*.test.ts` or `*.test.tsx` alongside source files

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, testing framework, and shared UI components

- [ ] T001 Configure Vitest testing framework in vite.config.ts and create vitest.config.ts
- [ ] T002 [P] Create TypeScript types file at src/lib/types/database.ts with Profile and UserSession interfaces
- [ ] T003 [P] Create Toast notification component at src/components/ui/Toast.tsx with success/error variants
- [ ] T004 [P] Create LoadingButton component at src/components/ui/LoadingButton.tsx with spinner state
- [ ] T005 Create French error messages translation utility at src/lib/utils/errorMessages.ts

**Checkpoint**: Testing framework ready, shared UI components available

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Apply profiles table migration via Supabase dashboard or CLI (SQL from data-model.md)
- [ ] T007 Extend AuthProvider in src/lib/auth.tsx with resetPassword(), updatePassword(), resendVerification() methods
- [ ] T008 Create auth service at src/services/auth.service.ts with error translation and session helpers
- [ ] T009 Update src/lib/supabase.ts to use generated Database types
- [ ] T010 Add new routes to src/App.tsx: /forgot-password, /auth/verify, /auth/reset-password, /settings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow new users to register with email/password and verify their email address

**Independent Test**: Complete registration flow → receive verification email → click link → account verified

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T011 [P] [US1] Create test file src/components/auth/SignupForm.test.tsx with form validation tests
- [ ] T012 [P] [US1] Create test file src/pages/VerifyEmail.test.tsx with verification flow tests

### Implementation for User Story 1

- [ ] T013 [US1] Create SignupForm component at src/components/auth/SignupForm.tsx with email/password fields
- [ ] T014 [US1] Add password validation (8+ chars) with inline error messages in French in SignupForm
- [ ] T015 [US1] Create VerifyEmail page at src/pages/VerifyEmail.tsx to handle token_hash verification
- [ ] T016 [US1] Add "Créer un compte" mode to existing src/pages/Login.tsx using SignupForm component
- [ ] T017 [US1] Add resend verification email button to VerifyEmail page for unverified users

**Checkpoint**: User Story 1 fully functional - registration and email verification working independently

---

## Phase 4: User Story 2 - Returning User Login (Priority: P1) 🎯 MVP

**Goal**: Allow verified users to log in with session persistence

**Independent Test**: Log in with valid credentials → access protected content → close/reopen browser → still logged in

### Tests for User Story 2 ⚠️

- [ ] T018 [P] [US2] Create test file src/components/auth/LoginForm.test.tsx with login flow tests
- [ ] T019 [P] [US2] Add test for unverified user login rejection in LoginForm.test.tsx

### Implementation for User Story 2

- [ ] T020 [US2] Extract LoginForm component from src/pages/Login.tsx to src/components/auth/LoginForm.tsx
- [ ] T021 [US2] Implement login with signInWithPassword in LoginForm component
- [ ] T022 [US2] Add unverified user detection - show "Veuillez confirmer votre email" message
- [ ] T023 [US2] Refactor src/pages/Login.tsx to use LoginForm and SignupForm components with toggle
- [ ] T024 [US2] Verify ProtectedRoute in src/components/ProtectedRoute.tsx redirects unauthenticated users

**Checkpoint**: User Stories 1 AND 2 complete - registration, verification, and login all working

---

## Phase 5: User Story 3 - Password Recovery (Priority: P2)

**Goal**: Allow users to reset forgotten passwords via email

**Independent Test**: Click "Forgot password" → enter email → receive reset email → click link → enter new password → login works

### Tests for User Story 3 ⚠️

- [ ] T025 [P] [US3] Create test file src/components/auth/ForgotPasswordForm.test.tsx
- [ ] T026 [P] [US3] Create test file src/components/auth/ResetPasswordForm.test.tsx
- [ ] T027 [P] [US3] Create test file src/pages/ResetPassword.test.tsx with PASSWORD_RECOVERY event handling

### Implementation for User Story 3

- [ ] T028 [US3] Create ForgotPasswordForm component at src/components/auth/ForgotPasswordForm.tsx
- [ ] T029 [US3] Create ForgotPassword page at src/pages/ForgotPassword.tsx using ForgotPasswordForm
- [ ] T030 [US3] Add "Mot de passe oublié?" link to Login page linking to /forgot-password
- [ ] T031 [US3] Create ResetPasswordForm component at src/components/auth/ResetPasswordForm.tsx
- [ ] T032 [US3] Create ResetPassword page at src/pages/ResetPassword.tsx handling PASSWORD_RECOVERY event
- [ ] T033 [US3] Handle expired token scenario with French error message and link to request new reset

**Checkpoint**: Password recovery flow complete and testable independently

---

## Phase 6: User Story 4 - Secure Logout (Priority: P2)

**Goal**: Allow users to securely end their session

**Independent Test**: Click logout → session terminated → cannot access protected pages → back button doesn't bypass

### Tests for User Story 4 ⚠️

- [ ] T034 [P] [US4] Create logout functionality tests in src/lib/auth.test.tsx

### Implementation for User Story 4

- [ ] T035 [US4] Add logout button to Home page header in src/pages/Home.tsx
- [ ] T036 [US4] Implement signOut() call with redirect to /login on logout
- [ ] T037 [US4] Ensure ProtectedRoute prevents back-button access after logout (check session on mount)

**Checkpoint**: Logout fully functional - sessions properly terminated

---

## Phase 7: User Story 5 - Session Management & Security (Priority: P3)

**Goal**: Allow users to view and manage their active sessions across devices

**Independent Test**: Log in on multiple devices → view sessions list → terminate one session → that session is invalidated

### Tests for User Story 5 ⚠️

- [ ] T038 [P] [US5] Create test file src/components/auth/SessionList.test.tsx
- [ ] T039 [P] [US5] Create test file src/pages/Settings.test.tsx

### Implementation for User Story 5

- [ ] T040 [US5] Apply user_sessions table migration via Supabase dashboard or CLI (SQL from data-model.md)
- [ ] T041 [US5] Add session tracking to auth.service.ts - create record on login with device info
- [ ] T042 [US5] Create SessionList component at src/components/auth/SessionList.tsx displaying active sessions
- [ ] T043 [US5] Add "Déconnecter" button per session in SessionList to terminate individual sessions
- [ ] T044 [US5] Add "Déconnecter tous les autres appareils" button using signOut({ scope: 'others' })
- [ ] T045 [US5] Create Settings page at src/pages/Settings.tsx with Active Sessions section
- [ ] T046 [US5] Update last_active_at on user activity (debounced) via auth.service.ts

**Checkpoint**: Session management complete - users can view and control all sessions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T047 [P] Add loading states (skeletons/spinners) to all auth forms during async operations
- [ ] T048 [P] Implement Toast notifications for success/error feedback across all auth flows
- [ ] T049 [P] Add focus management for accessibility - focus first field on page load, focus error field on validation
- [ ] T050 Verify all form inputs have associated labels (accessibility per constitution)
- [ ] T051 [P] Add keyboard navigation testing - ensure all forms are fully keyboard accessible
- [ ] T052 Run quickstart.md validation checklist to verify all scenarios pass
- [ ] T053 Performance check - verify bundle size impact <200KB gzipped, lazy load auth pages if needed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 and can proceed in parallel
  - US3 and US4 are P2 and can proceed after US1/US2 or in parallel
  - US5 is P3 and can start after Foundational (independent of other stories)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies, but shares Login page refactor with US1
- **User Story 3 (P2)**: Can start after Foundational - Links from Login page (after US2 refactor)
- **User Story 4 (P2)**: Can start after Foundational - Needs Home page (baseline exists)
- **User Story 5 (P3)**: Can start after Foundational - Fully independent, needs user_sessions table

### Within Each User Story

1. Tests MUST be written first and FAIL before implementation
2. Components before pages
3. Core functionality before edge cases
4. Story complete before moving to next priority

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different files)
- T011, T012 can run in parallel (different test files)
- T018, T019 can run in parallel (same test file, different test cases)
- T025, T026, T027 can run in parallel (different test files)
- T038, T039 can run in parallel (different test files)
- T047, T048, T049, T051 can run in parallel (different concerns)

---

## Parallel Example: User Story 1 & 2 (Both P1)

```bash
# After Phase 2 complete, launch US1 and US2 tests in parallel:
Task T011: "SignupForm.test.tsx tests"
Task T018: "LoginForm.test.tsx tests"

# Then implement both stories (some coordination needed for Login.tsx):
# US1: SignupForm → VerifyEmail
# US2: LoginForm → Login page refactor
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (testing framework, shared components)
2. Complete Phase 2: Foundational (migrations, auth provider extensions)
3. Complete Phase 3: User Story 1 (Registration + Verification)
4. Complete Phase 4: User Story 2 (Login)
5. **STOP and VALIDATE**: Test registration → verification → login flow
6. Deploy/demo if ready - this is your MVP!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 + US2 → Test independently → Deploy (MVP: users can register and login!)
3. US3 + US4 → Test independently → Deploy (users can reset password and logout)
4. US5 → Test independently → Deploy (power users can manage sessions)
5. Polish → Final quality pass → Production ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Registration) + US2 (Login) - these share the Login page
   - Developer B: US3 (Password Recovery) - fully independent
   - Developer C: US5 (Session Management) - fully independent
3. After US1+US2 merge: Developer A takes US4 (Logout)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD required: Write test → verify it fails → implement → verify it passes
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- French language for all user-facing text per spec
- Accessibility per constitution: labels, keyboard nav, focus management
