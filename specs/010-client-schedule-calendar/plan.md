# Implementation Plan: Calendrier des Passages Client

**Branch**: `010-client-schedule-calendar` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-client-schedule-calendar/spec.md`

## Summary

Cette fonctionnalité ajoute une vue calendrier mensuelle permettant de visualiser les interventions planifiées pour un client spécifique. Le manager peut voir toutes les interventions (avec le nom de l'employé assigné), tandis que le staff ne voit que ses propres interventions. Le calendrier est accessible depuis la fiche client (manager) et le portail staff.

L'implémentation utilise les données existantes de `schedule_entries` avec un composant calendrier SolidJS léger, sans dépendances externes.

## Technical Context

**Language/Version**: TypeScript 5.9 with strict mode
**Primary Dependencies**: SolidJS 1.9, @solidjs/router 0.15, @supabase/supabase-js 2.95
**Storage**: Supabase PostgreSQL (table `schedule_entries` existante)
**Testing**: Vitest (mandated by constitution)
**Target Platform**: Web (responsive, mobile-first)
**Project Type**: web (frontend SolidJS + Supabase backend)
**Performance Goals**: Chargement calendrier < 3s, navigation mois < 1s
**Constraints**: Bundle JS < 200KB gzip, pas de bibliothèque calendrier externe
**Scale/Scope**: ~100 clients, ~10 employés, ~500 interventions/mois typique

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Type-Safe First | ✅ PASS | Types existants pour schedule_entries, props interfaces requises |
| II. TDD | ✅ PASS | Tests Vitest pour le service calendrier et composants |
| III. Ship Fast | ✅ PASS | Composant calendrier simple, pas d'abstraction prématurée |
| IV. Component-Based | ✅ PASS | Composant CalendarView réutilisable, < 150 lignes |
| V. Supabase-Native | ✅ PASS | RLS existante sur schedule_entries, filtre par auth |
| VI. Error Handling | ✅ PASS | État vide/erreur géré dans le composant |
| VII. Accessibility | ✅ PASS | Navigation clavier, ARIA pour calendrier interactif |

**Gate Result**: ✅ ALL PASS - Proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/010-client-schedule-calendar/
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
│   ├── calendar/
│   │   ├── CalendarView.tsx       # Composant calendrier mensuel principal
│   │   ├── CalendarDay.tsx        # Cellule jour avec événements
│   │   ├── CalendarEvent.tsx      # Événement cliquable
│   │   └── EventDetailModal.tsx   # Modal détails intervention
│   └── portal/
│       └── ClientCalendar.tsx     # Wrapper calendrier pour portail staff
├── pages/
│   └── ClientSchedule.tsx         # Page calendrier client (manager)
├── services/
│   └── schedule-calendar.service.ts # Service récupération interventions par mois/client
└── lib/
    └── types/
        └── calendar.types.ts      # Types spécifiques calendrier
```

**Structure Decision**: Extension de la structure web existante. Nouveaux composants dans `src/components/calendar/` pour réutilisabilité. Service dédié pour les requêtes calendrier optimisées par mois.

## Complexity Tracking

> Aucune violation de constitution nécessitant justification.
