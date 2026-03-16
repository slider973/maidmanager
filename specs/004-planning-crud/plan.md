# Implementation Plan: Gestion du Planning

**Branch**: `004-planning-crud` | **Date**: 2026-02-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-planning-crud/spec.md`

## Summary

Implémenter un système CRUD complet pour gérer les interventions planifiées du personnel de maison. Les utilisateurs pourront créer, consulter, modifier et supprimer des interventions, ainsi que filtrer et marquer leur statut. Approche: nouvelle table `schedule_entries` avec relation vers `staff_members`, store SolidJS pour l'état, service Supabase pour les opérations.

## Technical Context

**Language/Version**: TypeScript 5.9, SolidJS 1.9
**Primary Dependencies**: @solidjs/router 0.15, @supabase/supabase-js 2.95, solid-js 1.9
**Storage**: Supabase PostgreSQL (table `schedule_entries`)
**Testing**: Vitest 4.0 avec @solidjs/testing-library
**Target Platform**: Web (navigateurs modernes)
**Project Type**: Web application (SPA)
**Performance Goals**: LCP < 2s, bundle < 200KB gzip (per constitution)
**Constraints**: RLS obligatoire, TypeScript strict, TDD
**Scale/Scope**: ~100 interventions/utilisateur, 6 écrans (liste, formulaire, filtres, détail)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|-----------|-------------|--------|-------|
| I. Type-Safe First | TypeScript strict, types Supabase générés | ✅ PASS | Types pour `ScheduleEntry` à générer |
| II. TDD | Tests avant implémentation | ✅ PASS | Tests service et composants planifiés |
| III. Ship Fast | MVP simple, pas d'abstraction prématurée | ✅ PASS | CRUD basique d'abord, filtres P3 |
| IV. Component-Based | Composants < 150 lignes, logique dans services | ✅ PASS | ScheduleForm, ScheduleList, ScheduleCard |
| V. Supabase-Native | RLS policies, client Supabase | ✅ PASS | Policies pour CRUD isolé par user |
| VI. Explicit Error | Try-catch, messages utilisateur | ✅ PASS | Toasts erreur/succès existants |
| VII. Accessibility | Labels, keyboard nav, ARIA | ✅ PASS | Patterns existants à suivre |

**Gate Status**: ✅ PASS - Aucune violation

## Project Structure

### Documentation (this feature)

```text
specs/004-planning-crud/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── schedule.api.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── schedule/
│   │   ├── ScheduleForm.tsx        # Formulaire création/édition
│   │   ├── ScheduleForm.test.tsx
│   │   ├── ScheduleList.tsx        # Liste des interventions
│   │   ├── ScheduleList.test.tsx
│   │   ├── ScheduleCard.tsx        # Carte individuelle
│   │   └── ScheduleFilters.tsx     # Filtres (P3)
│   └── ui/                         # Composants existants (ConfirmDialog, Toast)
├── services/
│   ├── schedule.service.ts         # CRUD Supabase
│   └── schedule.service.test.ts
├── stores/
│   └── schedule.store.ts           # État centralisé
├── pages/
│   └── Schedule.tsx                # Page planning
└── lib/
    └── types/
        └── database.ts             # Types ScheduleEntry ajoutés
```

**Structure Decision**: Extension de la structure existante avec nouveau module `schedule/` suivant le pattern établi par `staff/`. Réutilisation des composants UI existants (ConfirmDialog, Toast).
