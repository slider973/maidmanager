# Implementation Plan: Complete Authentication System

**Branch**: `001-complete-auth` | **Date**: 2026-02-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-complete-auth/spec.md`

## Summary

Implement a complete authentication system for MaidManager including user registration with email verification, secure login with session persistence, password recovery via email, logout functionality, and session management. The implementation leverages Supabase Auth which already provides most backend functionality - the primary work is extending the existing UI components and adding new pages/features.

## Technical Context

**Language/Version**: TypeScript 5.9 with ES2022 target
**Primary Dependencies**: SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95
**Storage**: Supabase (PostgreSQL with built-in auth tables)
**Testing**: Vitest (to be configured per constitution)
**Target Platform**: Web browser (modern browsers, mobile-responsive)
**Project Type**: Single SPA web application
**Performance Goals**: LCP <2s, bundle <200KB gzipped, Lighthouse 90+
**Constraints**: French UI, 7-day session persistence, 8-char minimum password
**Scale/Scope**: Initial launch, standard household user base

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Compliance Notes |
|-----------|--------|------------------|
| I. Type-Safe First | ✅ PASS | `strict: true` enabled, will generate Supabase types, all components typed |
| II. Test-Driven Development | ✅ PASS | Vitest tests required before implementation per spec |
| III. Ship Fast, Iterate Often | ✅ PASS | MVP approach: P1 stories first, P3 (session mgmt) can iterate |
| IV. Component-Based Architecture | ✅ PASS | Auth components <150 lines, business logic in services |
| V. Supabase-Native Patterns | ✅ PASS | Using Supabase Auth, RLS for session table if custom |
| VI. Explicit Error Handling | ✅ PASS | French error messages, try-catch on all auth calls |
| VII. Accessibility by Default | ✅ PASS | Form labels, keyboard nav, focus management planned |

**UI/UX Standards**: Loading states for auth actions, inline validation, toast notifications
**Database Standards**: snake_case tables, UUIDs, timestamps on custom tables
**Performance**: Auth pages lazy-loaded, minimal bundle impact

## Project Structure

### Documentation (this feature)

```text
specs/001-complete-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-api.md      # Supabase Auth API contract
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ProtectedRoute.tsx      # Existing - may need updates
│   ├── auth/
│   │   ├── LoginForm.tsx       # New - extracted from Login.tsx
│   │   ├── SignupForm.tsx      # New - registration form
│   │   ├── ForgotPasswordForm.tsx  # New - password reset request
│   │   ├── ResetPasswordForm.tsx   # New - new password entry
│   │   ├── EmailVerification.tsx   # New - verification status/resend
│   │   └── SessionList.tsx     # New - active sessions display (P3)
│   └── ui/
│       ├── Toast.tsx           # New - notification component
│       └── LoadingButton.tsx   # New - button with loading state
├── lib/
│   ├── supabase.ts             # Existing - add types
│   ├── auth.tsx                # Existing - extend with new methods
│   └── types/
│       └── database.ts         # New - generated Supabase types
├── pages/
│   ├── Login.tsx               # Existing - refactor to use components
│   ├── Home.tsx                # Existing
│   ├── ForgotPassword.tsx      # New - password reset request page
│   ├── ResetPassword.tsx       # New - password reset completion page
│   ├── VerifyEmail.tsx         # New - email verification landing
│   └── Settings.tsx            # New - includes session management (P3)
├── services/
│   └── auth.service.ts         # New - auth business logic
└── App.tsx                     # Existing - add new routes
```

**Structure Decision**: Single SPA structure (existing pattern). Auth components extracted into `src/components/auth/` for organization. Services layer added for business logic separation per Constitution IV.

## Complexity Tracking

> No violations requiring justification. Design follows constitution principles.

| Check | Result |
|-------|--------|
| Component size | All auth components designed <150 lines |
| Abstraction | Using existing Supabase Auth, minimal custom code |
| Props drilling | AuthContext already exists, no new deep drilling |
