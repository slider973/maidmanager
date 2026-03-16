# Implementation Plan: Assignez une mission

**Branch**: `005-assign-task` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-assign-task/spec.md`

## Summary

Ajouter un système de gestion de missions/tâches permettant aux utilisateurs d'assigner des tâches à leur personnel avec échéance, priorité et suivi de statut. Distinct du planning (schedule_entries) qui a des horaires précis, les missions ont uniquement une date d'échéance.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: SolidJS 1.9, @solidjs/router, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL (self-hosted at wefamily.ch)
**Testing**: Vitest 4.0 avec @solidjs/testing-library
**Target Platform**: Web (mobile-responsive)
**Project Type**: Single SPA (frontend SolidJS + Supabase backend)
**Performance Goals**: LCP < 2s, TTI < 3s, bundle < 200KB gzipped
**Constraints**: RLS obligatoire, isolation par utilisateur, offline non requis
**Scale/Scope**: ~10 utilisateurs, ~100 missions par utilisateur

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence/Action |
|-----------|--------|-----------------|
| I. Type-Safe First | PASS | TypeScript strict mode, types générés pour Supabase |
| II. Test-Driven Development | PASS | Tests Vitest écrits avant implémentation |
| III. Ship Fast, Iterate Often | PASS | MVP = créer + consulter missions (US1 + US2) |
| IV. Component-Based Architecture | PASS | Composants < 150 lignes, services séparés |
| V. Supabase-Native Patterns | PASS | RLS obligatoire, table tasks avec policies |
| VI. Explicit Error Handling | PASS | Try-catch sur toutes les opérations async |
| VII. Accessibility by Default | PASS | Labels sur formulaires, navigation clavier |

**Gate Status**: PASS - Toutes les principes respectés

## Project Structure

### Documentation (this feature)

```text
specs/005-assign-task/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (TypeScript interfaces)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── tasks/           # Nouveaux composants pour les missions
│       ├── TaskCard.tsx
│       ├── TaskCard.test.tsx
│       ├── TaskList.tsx
│       ├── TaskList.test.tsx
│       ├── TaskForm.tsx
│       ├── TaskForm.test.tsx
│       ├── TaskFilters.tsx
│       └── TaskFilters.test.tsx
├── pages/
│   └── Tasks.tsx        # Page principale des missions
├── services/
│   ├── task.service.ts  # CRUD operations
│   └── task.service.test.ts
├── stores/
│   └── task.store.ts    # State management
└── lib/
    └── types/
        └── database.ts  # Types à étendre pour tasks

supabase/
└── migrations/
    └── 20260207_create_tasks.sql
```

**Structure Decision**: Extension du pattern existant utilisé pour schedule_entries et staff_members. Composants colocalisés avec leurs tests, services et stores séparés.

## Post-Design Constitution Re-Check

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Type-Safe First | PASS | Types définis dans contracts/task.types.ts |
| II. Test-Driven Development | PASS | Tests colocalisés, workflow TDD documenté dans quickstart |
| III. Ship Fast, Iterate Often | PASS | MVP clairement défini (US1 + US2), pas d'over-engineering |
| IV. Component-Based Architecture | PASS | Composants < 150 lignes prévu, logique dans services |
| V. Supabase-Native Patterns | PASS | RLS policies, migration standard, DEFAULT auth.uid() |
| VI. Explicit Error Handling | PASS | ServiceResult pattern, messages d'erreur français |
| VII. Accessibility by Default | PASS | Labels requis dans formulaires, navigation clavier |

**Gate Status**: PASS - Design validé, prêt pour la génération des tâches

## Generated Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | `specs/005-assign-task/research.md` | Complete |
| Data Model | `specs/005-assign-task/data-model.md` | Complete |
| Type Contract | `specs/005-assign-task/contracts/task.types.ts` | Complete |
| Quickstart | `specs/005-assign-task/quickstart.md` | Complete |
| Tasks | `specs/005-assign-task/tasks.md` | Complete |
