# Tasks: Gestion du Planning

**Input**: Design documents from `/specs/004-planning-crud/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests inclus (TDD requis par la constitution du projet)

**Organization**: Tasks groupées par user story pour permettre l'implémentation et le test indépendant de chaque story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: À quelle user story appartient cette tâche (US1, US2, etc.)
- Chemins de fichiers exacts inclus dans les descriptions

---

## Phase 1: Setup

**Purpose**: Initialisation du projet et structure de base

- [x] T001 Appliquer la migration SQL pour créer la table `schedule_entries` via Supabase Dashboard (MANUAL - apply via Supabase dashboard)
- [x] T002 [P] Ajouter les types TypeScript pour ScheduleEntry dans `src/lib/types/database.ts`
- [x] T003 [P] Créer le dossier `src/components/schedule/`
- [x] T004 [P] Ajouter les styles CSS pour le planning dans `src/App.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infrastructure core nécessaire AVANT toute user story

**⚠️ CRITICAL**: Aucune user story ne peut commencer avant la fin de cette phase

- [x] T005 Créer les tests du service schedule dans `src/services/schedule.service.test.ts`
- [x] T006 Implémenter `getScheduleEntries()` dans `src/services/schedule.service.ts`
- [x] T007 Implémenter `createScheduleEntry()` dans `src/services/schedule.service.ts`
- [x] T008 Créer le store schedule dans `src/stores/schedule.store.ts` avec state et actions de base (fetch, add)

**Checkpoint**: Foundation prête - l'implémentation des user stories peut commencer

---

## Phase 3: User Story 1 - Consulter le planning (Priority: P1) 🎯 MVP

**Goal**: L'utilisateur peut voir la liste de toutes ses interventions planifiées avec le membre assigné, la date, l'heure et le statut.

**Independent Test**: Naviguer vers `/schedule`, voir la liste des interventions ou l'état vide si aucune intervention.

### Tests for User Story 1

- [x] T009 [P] [US1] Écrire les tests pour ScheduleList dans `src/components/schedule/ScheduleList.test.tsx`
- [x] T010 [P] [US1] Écrire les tests pour ScheduleCard dans `src/components/schedule/ScheduleCard.test.tsx`

### Implementation for User Story 1

- [x] T011 [P] [US1] Créer le composant ScheduleCard dans `src/components/schedule/ScheduleCard.tsx`
- [x] T012 [US1] Créer le composant ScheduleList dans `src/components/schedule/ScheduleList.tsx`
- [x] T013 [US1] Créer la page Schedule dans `src/pages/Schedule.tsx` avec header et navigation
- [x] T014 [US1] Ajouter la route `/schedule` dans `src/App.tsx` avec ProtectedRoute
- [x] T015 [US1] Ajouter le lien "Planning" dans la page Home `src/pages/Home.tsx`

**Checkpoint**: User Story 1 fonctionnelle - on peut consulter le planning (vide ou avec données)

---

## Phase 4: User Story 2 - Créer une intervention (Priority: P1) 🎯 MVP

**Goal**: L'utilisateur peut créer une nouvelle intervention avec membre, date, heure et description.

**Independent Test**: Remplir le formulaire, soumettre, voir l'intervention dans la liste.

### Tests for User Story 2

- [x] T016 [P] [US2] Écrire les tests pour ScheduleForm dans `src/components/schedule/ScheduleForm.test.tsx`

### Implementation for User Story 2

- [x] T017 [US2] Créer le composant ScheduleForm dans `src/components/schedule/ScheduleForm.tsx`
- [x] T018 [US2] Intégrer ScheduleForm dans la page Schedule `src/pages/Schedule.tsx`
- [x] T019 [US2] Ajouter la validation des champs (membre requis, date requise, heure début requise)
- [x] T020 [US2] Ajouter le toast de succès après création

**Checkpoint**: User Stories 1 ET 2 fonctionnelles - on peut créer et voir les interventions

---

## Phase 5: User Story 3 - Modifier une intervention (Priority: P2)

**Goal**: L'utilisateur peut modifier une intervention existante.

**Independent Test**: Cliquer sur "Modifier", changer les valeurs, sauvegarder, voir les changements.

### Tests for User Story 3

- [x] T021 [P] [US3] Ajouter les tests de modification dans `src/services/schedule.service.test.ts`

### Implementation for User Story 3

- [x] T022 [US3] Implémenter `updateScheduleEntry()` dans `src/services/schedule.service.ts`
- [x] T023 [US3] Ajouter l'action `update` dans `src/stores/schedule.store.ts`
- [x] T024 [US3] Ajouter le bouton "Modifier" dans ScheduleCard `src/components/schedule/ScheduleCard.tsx`
- [x] T025 [US3] Ajouter le mode édition dans ScheduleForm (props `initialData`, `mode`)
- [x] T026 [US3] Gérer l'état d'édition dans la page Schedule `src/pages/Schedule.tsx`

**Checkpoint**: User Story 3 fonctionnelle - on peut modifier les interventions

---

## Phase 6: User Story 4 - Supprimer une intervention (Priority: P2)

**Goal**: L'utilisateur peut supprimer une intervention avec confirmation.

**Independent Test**: Cliquer sur "Supprimer", confirmer, voir l'intervention disparaître.

### Tests for User Story 4

- [x] T027 [P] [US4] Ajouter les tests de suppression dans `src/services/schedule.service.test.ts`

### Implementation for User Story 4

- [x] T028 [US4] Implémenter `deleteScheduleEntry()` dans `src/services/schedule.service.ts`
- [x] T029 [US4] Ajouter l'action `delete` dans `src/stores/schedule.store.ts`
- [x] T030 [US4] Ajouter le bouton "Supprimer" dans ScheduleCard `src/components/schedule/ScheduleCard.tsx`
- [x] T031 [US4] Intégrer ConfirmDialog pour la confirmation dans la page Schedule `src/pages/Schedule.tsx`
- [x] T032 [US4] Ajouter le toast de succès après suppression

**Checkpoint**: User Story 4 fonctionnelle - on peut supprimer les interventions

---

## Phase 7: User Story 5 - Marquer comme terminée (Priority: P2)

**Goal**: L'utilisateur peut marquer une intervention comme terminée ou annulée.

**Independent Test**: Cliquer sur "Marquer terminé", voir le statut changer visuellement.

### Tests for User Story 5

- [x] T033 [P] [US5] Ajouter les tests de changement de statut dans `src/services/schedule.service.test.ts`

### Implementation for User Story 5

- [x] T034 [US5] Implémenter `updateScheduleStatus()` dans `src/services/schedule.service.ts`
- [x] T035 [US5] Ajouter les actions `markAsCompleted`, `markAsCancelled` dans `src/stores/schedule.store.ts`
- [x] T036 [US5] Ajouter les boutons de statut dans ScheduleCard `src/components/schedule/ScheduleCard.tsx`
- [x] T037 [US5] Ajouter l'indicateur visuel de statut (couleur, icône) dans ScheduleCard

**Checkpoint**: User Story 5 fonctionnelle - on peut changer le statut des interventions

---

## Phase 8: User Story 6 - Filtrer les interventions (Priority: P3)

**Goal**: L'utilisateur peut filtrer par membre, statut ou date.

**Independent Test**: Appliquer un filtre, voir uniquement les interventions correspondantes.

### Tests for User Story 6

- [x] T038 [P] [US6] Écrire les tests pour ScheduleFilters dans `src/components/schedule/ScheduleFilters.test.tsx`

### Implementation for User Story 6

- [x] T039 [US6] Ajouter les filtres dans `src/services/schedule.service.ts` (paramètres de getScheduleEntries)
- [x] T040 [US6] Ajouter l'état `filters` et les actions `setFilters`, `clearFilters` dans `src/stores/schedule.store.ts`
- [x] T041 [US6] Créer le composant ScheduleFilters dans `src/components/schedule/ScheduleFilters.tsx`
- [x] T042 [US6] Intégrer ScheduleFilters dans la page Schedule `src/pages/Schedule.tsx`
- [x] T043 [US6] Ajouter le bouton "Réinitialiser" les filtres

**Checkpoint**: User Story 6 fonctionnelle - on peut filtrer les interventions

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations qui touchent plusieurs user stories

- [x] T044 [P] Mettre à jour les stats du dashboard Home avec le nombre d'interventions `src/pages/Home.tsx`
- [x] T045 [P] Ajouter les styles CSS manquants pour responsive mobile `src/App.css`
- [x] T046 Vérifier l'accessibilité (labels, navigation clavier) dans tous les composants schedule
- [x] T047 Nettoyer les console.log de debug
- [x] T048 Exécuter `npm run build` et corriger les erreurs TypeScript
- [x] T049 Exécuter `npm run test:run` et s'assurer que tous les tests passent

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut démarrer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les user stories
- **User Stories (Phases 3-8)**: Dépendent de la phase Foundational
  - US1 et US2 sont P1 (MVP) - à faire d'abord
  - US3, US4, US5 sont P2 - peuvent être faites en parallèle après MVP
  - US6 est P3 - dernière priorité
- **Polish (Phase 9)**: Dépend de toutes les user stories souhaitées

### User Story Dependencies

| User Story | Dépend de | Notes |
|------------|-----------|-------|
| US1 (Consulter) | Foundational | MVP - faire en premier |
| US2 (Créer) | Foundational | MVP - peut être fait en parallèle avec US1 |
| US3 (Modifier) | US2 (formulaire) | Réutilise ScheduleForm |
| US4 (Supprimer) | US1 (liste) | Ajoute bouton dans ScheduleCard |
| US5 (Statut) | US1 (liste) | Ajoute boutons dans ScheduleCard |
| US6 (Filtres) | US1 (liste) | Ajoute composant de filtres |

### Within Each User Story

1. Tests MUST fail avant implémentation (TDD)
2. Service avant store
3. Composants avant intégration page
4. Validation et feedback utilisateur en dernier

### Parallel Opportunities

```bash
# Phase 1: Setup - tout en parallèle
Task: T002, T003, T004 (après T001)

# Phase 3: US1 - tests en parallèle
Task: T009, T010 (tests)
Task: T011 (ScheduleCard, parallélisable avec tests)

# Phases 5-7: US3, US4, US5 - peuvent être faites en parallèle par différents devs
Developer A: US3 (modifier)
Developer B: US4 (supprimer)
Developer C: US5 (statut)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. ✅ Complete Phase 1: Setup
2. ✅ Complete Phase 2: Foundational
3. ✅ Complete Phase 3: User Story 1 (Consulter)
4. ✅ Complete Phase 4: User Story 2 (Créer)
5. **STOP and VALIDATE**: Tester le MVP indépendamment
6. Deploy/demo si prêt

### Incremental Delivery

1. Setup + Foundational → Foundation prête
2. Add US1 + US2 → **MVP déployable!**
3. Add US3 → Modification disponible
4. Add US4 → Suppression disponible
5. Add US5 → Gestion statut disponible
6. Add US6 → Filtres disponibles (nice-to-have)

---

## Summary

| Phase | Story | Tasks | Priority |
|-------|-------|-------|----------|
| 1 | Setup | 4 | - |
| 2 | Foundational | 4 | - |
| 3 | US1 - Consulter | 7 | P1 (MVP) |
| 4 | US2 - Créer | 5 | P1 (MVP) |
| 5 | US3 - Modifier | 6 | P2 |
| 6 | US4 - Supprimer | 6 | P2 |
| 7 | US5 - Statut | 5 | P2 |
| 8 | US6 - Filtres | 6 | P3 |
| 9 | Polish | 6 | - |

**Total**: 49 tâches
**MVP**: 20 tâches (Phases 1-4)
**Full feature**: 49 tâches
