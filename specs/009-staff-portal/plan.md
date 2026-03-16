# Implementation Plan: Portail Personnel

**Branch**: `009-staff-portal` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-staff-portal/spec.md`

## Summary

Créer un portail dédié au personnel permettant :
1. Liaison compte utilisateur ↔ fiche staff existante (invitation par email)
2. Pointage entrée/sortie avec sélection obligatoire du client
3. Enregistrement des actions par pièce (nettoyage salle de bain, etc.)
4. Historique personnel des pointages et actions
5. Vue gestionnaire du travail effectué

L'approche technique s'appuie sur l'infrastructure existante (Supabase Auth, RLS) avec ajout de nouveaux rôles (staff vs manager) et de nouvelles tables pour les pointages et actions.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: SolidJS 1.9, @solidjs/router, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL avec RLS
**Testing**: Vitest avec @solidjs/testing-library
**Target Platform**: Web responsive (mobile-first pour le personnel)
**Project Type**: Web SPA (frontend seul, Supabase BaaS)
**Performance Goals**: Pointage < 10s, action < 15s (critères spec)
**Constraints**: Mobile-first, offline-aware (mode dégradé)
**Scale/Scope**: ~10-50 membres du personnel, usage quotidien

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | ✅ PASS | TypeScript strict, types Supabase générés |
| II. TDD | ✅ PASS | Tests écrits avant implémentation |
| III. Ship Fast | ✅ PASS | MVP = US1 + US2 (compte + pointage) |
| IV. Component-Based | ✅ PASS | Composants < 150 lignes, services séparés |
| V. Supabase-Native | ✅ PASS | RLS pour isolation staff/manager, Auth existant |
| VI. Explicit Error Handling | ✅ PASS | Gestion erreurs pointage, validation |
| VII. Accessibility | ✅ PASS | Mobile touch targets, labels formulaires |

**Gate Status**: ✅ PASS - No violations

## Project Structure

### Documentation (this feature)

```text
specs/009-staff-portal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── staff-portal.types.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── portal/              # NEW: Composants portail personnel
│   │   ├── ClockInButton.tsx
│   │   ├── ClockOutButton.tsx
│   │   ├── RoomActionForm.tsx
│   │   ├── RoomActionList.tsx
│   │   ├── TimeEntryCard.tsx
│   │   └── StaffHistoryView.tsx
│   └── staff/               # EXISTING: Gestion personnel (côté manager)
├── pages/
│   ├── portal/              # NEW: Pages portail personnel
│   │   ├── PortalHome.tsx       # Dashboard staff
│   │   ├── PortalHistory.tsx    # Historique personnel
│   │   └── PortalClockIn.tsx    # Pointage
│   └── staff/               # EXISTING: Pages gestion (manager)
│       └── StaffWorkView.tsx    # NEW: Vue travail effectué
├── services/
│   ├── time-entry.service.ts    # NEW: CRUD pointages
│   ├── room-action.service.ts   # NEW: CRUD actions pièces
│   ├── staff-account.service.ts # NEW: Liaison compte/staff
│   └── referential.service.ts   # NEW: Pièces/actions référentiel
├── stores/
│   ├── timeEntryStore.ts        # NEW: État pointages
│   ├── roomActionStore.ts       # NEW: État actions
│   └── portalStore.ts           # NEW: État portail staff
├── lib/
│   ├── auth.tsx                 # MODIFY: Ajout rôle staff/manager
│   └── types/
│       ├── database.ts          # MODIFY: Nouveaux types
│       └── portal.types.ts      # NEW: Types portail
└── App.tsx                      # MODIFY: Routes portail
```

**Structure Decision**: Extension de la structure existante avec un namespace `portal/` pour les composants et pages spécifiques au personnel, séparé de l'interface gestionnaire existante.

## Complexity Tracking

> No violations detected - table not required.
