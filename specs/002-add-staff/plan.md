# Implementation Plan: Ajouter du Personnel

**Branch**: `002-add-staff` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-add-staff/spec.md`

## Summary

Cette fonctionnalité permet aux utilisateurs authentifiés d'enregistrer et de gérer les membres de leur personnel de maison. Elle comprend un formulaire d'ajout avec validation, une liste des membres avec filtrage par statut, et le stockage sécurisé des données dans Supabase avec Row Level Security.

## Technical Context

**Language/Version**: TypeScript 5.9+ avec mode strict
**Primary Dependencies**: SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL avec RLS
**Testing**: Vitest 4.x avec @solidjs/testing-library
**Target Platform**: Web (mobile-first, responsive)
**Project Type**: SPA (Single Page Application)
**Performance Goals**: LCP < 2s, TTI < 3s, bundle < 200KB gzipped
**Constraints**: Authentification requise, données isolées par utilisateur
**Scale/Scope**: MVP - 4 user stories, 11 functional requirements

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | ✅ PASS | TypeScript strict mode, Supabase types will be generated |
| II. TDD | ✅ PASS | Tests écrits avant implémentation (vitest) |
| III. Ship Fast | ✅ PASS | MVP focus, pas d'abstraction prématurée |
| IV. Component-Based | ✅ PASS | Composants < 150 lignes, props typés |
| V. Supabase-Native | ✅ PASS | RLS obligatoire, client Supabase |
| VI. Explicit Errors | ✅ PASS | Messages en français, logging contextuel |
| VII. Accessibility | ✅ PASS | Labels, focus, WCAG AA |

**UI/UX Standards**: Loading states, empty states, responsive, validation inline
**Database Standards**: snake_case, UUID, created_at/updated_at, RLS policies
**Performance**: Bundle < 200KB, lazy loading routes

## Project Structure

### Documentation (this feature)

```text
specs/002-add-staff/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── auth/            # Existing auth components
│   ├── ui/              # Shared UI components (LoadingButton, Toast)
│   └── staff/           # NEW: Staff management components
│       ├── StaffForm.tsx
│       ├── StaffForm.test.tsx
│       ├── StaffList.tsx
│       ├── StaffList.test.tsx
│       ├── StaffCard.tsx
│       └── StaffCard.test.tsx
├── pages/
│   ├── Home.tsx         # Add link to staff page
│   └── Staff.tsx        # NEW: Staff management page
├── services/
│   ├── auth.service.ts  # Existing
│   ├── session.service.ts # Existing
│   └── staff.service.ts # NEW: Staff CRUD operations
├── lib/
│   ├── types/
│   │   └── database.ts  # Add staff_members table types
│   └── utils/
│       └── errorMessages.ts # Add staff-related error messages
└── test/
    └── setup.ts         # Update mocks for staff service
```

**Structure Decision**: Extension du projet SPA existant. Les composants staff suivent le même pattern que les composants auth (colocation tests, services séparés).

## Complexity Tracking

> No violations - simple CRUD feature within existing patterns

## Phase Completion Status

### Phase 0: Research ✅
- [x] research.md created with 5 decisions documented
- [x] All NEEDS CLARIFICATION resolved
- [x] Best practices documented for SolidJS forms and Supabase RLS

### Phase 1: Design & Contracts ✅
- [x] data-model.md created with full schema, RLS policies, TypeScript types
- [x] contracts/staff-service.ts created with service interface
- [x] quickstart.md created with setup instructions and validation checklist
- [x] Agent context updated (CLAUDE.md)

### Constitution Re-check (Post Phase 1) ✅

| Principle | Status | Verification |
|-----------|--------|--------------|
| I. Type-Safe First | ✅ PASS | Full TypeScript types defined in data-model.md |
| II. TDD | ✅ PASS | Test files defined in project structure |
| III. Ship Fast | ✅ PASS | MVP scope, no over-engineering |
| IV. Component-Based | ✅ PASS | 3 components (Form, List, Card) < 150 lines each |
| V. Supabase-Native | ✅ PASS | RLS policies defined, client patterns documented |
| VI. Explicit Errors | ✅ PASS | French error messages in validation rules |
| VII. Accessibility | ✅ PASS | Labels required, form validation inline |

**Ready for Phase 2**: Run `/speckit.tasks` to generate implementation tasks.
