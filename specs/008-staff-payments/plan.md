# Implementation Plan: Suivi des paiements du personnel

**Branch**: `008-staff-payments` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-staff-payments/spec.md`

## Summary

Implémenter un système de suivi des paiements dus au personnel domestique (femme de ménage, jardinier). Les fonctionnalités principales incluent :
- Enregistrement des prestations réalisées (heures × tarif horaire)
- Suivi du solde dû à chaque employé
- Enregistrement des paiements effectués
- Historique complet des transactions

L'approche technique utilise le stack existant (SolidJS + Supabase) avec deux nouvelles tables (work_sessions, staff_payments) et une extension de la table staff_members pour le tarif horaire par défaut.

## Technical Context

**Language/Version**: TypeScript 5.9 (strict mode)
**Primary Dependencies**: SolidJS 1.9, @solidjs/router, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL avec RLS
**Testing**: Vitest 4.0 avec @solidjs/testing-library
**Target Platform**: Web (navigateurs modernes)
**Project Type**: Single-page application (SPA)
**Performance Goals**: < 2s initial load, < 100ms pour les calculs de solde
**Constraints**: Calculs monétaires précis au centime, offline non requis
**Scale/Scope**: Usage personnel (1 utilisateur, < 100 employés, < 10k transactions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | ✅ PASS | TypeScript strict, types Supabase générés |
| II. Test-Driven Development | ✅ PASS | Tests Vitest avant implémentation |
| III. Ship Fast, Iterate Often | ✅ PASS | MVP = US1-3 (prestations + solde + paiements) |
| IV. Component-Based Architecture | ✅ PASS | Composants < 150 lignes, extraction services |
| V. Supabase-Native Patterns | ✅ PASS | RLS obligatoire, client Supabase typé |
| VI. Explicit Error Handling | ✅ PASS | Try-catch sur async, messages utilisateur FR |
| VII. Accessibility by Default | ✅ PASS | Labels formulaires, navigation clavier |

**Gate Status**: ✅ PASSED - Aucune violation détectée

## Project Structure

### Documentation (this feature)

```text
specs/008-staff-payments/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── staff-payments.types.ts
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── payments/        # NEW - Composants paiements
│       ├── WorkSessionForm.tsx
│       ├── WorkSessionCard.tsx
│       ├── WorkSessionList.tsx
│       ├── PaymentForm.tsx
│       ├── PaymentCard.tsx
│       ├── PaymentList.tsx
│       ├── StaffBalanceCard.tsx
│       └── StaffHistoryList.tsx
├── pages/
│   ├── Staff.tsx        # MODIFY - Ajouter solde dû
│   └── StaffPayments.tsx # NEW - Page détail employé + historique
├── services/
│   ├── work-session.service.ts      # NEW
│   ├── work-session.service.test.ts # NEW
│   ├── staff-payment.service.ts     # NEW
│   └── staff-payment.service.test.ts # NEW
├── stores/
│   ├── workSessionStore.ts  # NEW
│   └── staffPaymentStore.ts # NEW
└── lib/
    └── types/
        └── payments.types.ts # NEW

supabase/
└── migrations/
    ├── 20260207_005_alter_staff_members_hourly_rate.sql
    ├── 20260207_006_create_work_sessions.sql
    └── 20260207_007_create_staff_payments.sql
```

**Structure Decision**: Extension du pattern existant (services + stores + composants). Nouveaux composants dans `components/payments/`, services dédiés, deux nouvelles tables Supabase.

## Complexity Tracking

> Aucune violation de la constitution. Pas de justification requise.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
