# Tasks: Portail Personnel

**Input**: Design documents from `/specs/009-staff-portal/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests inclus (constitution requiert TDD)

**Organization**: Tasks groupées par user story pour permettre l'implémentation et le test indépendant de chaque story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Peut s'exécuter en parallèle (fichiers différents, pas de dépendances)
- **[Story]**: User story concernée (US1, US2, US3...)
- Chemins de fichiers exacts inclus

---

## Phase 1: Setup (Infrastructure partagée)

**Purpose**: Initialisation du projet et structure de base

- [x] T001 Copier les types du contrat dans src/lib/types/portal.types.ts depuis specs/009-staff-portal/contracts/staff-portal.types.ts
- [x] T002 [P] Créer la structure des dossiers src/components/portal/ et src/pages/portal/
- [x] T003 [P] Ajouter les routes portail dans src/App.tsx (/portal, /portal/history, /portal/clock-in)

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Infrastructure de base DEVANT être complète avant TOUTE user story

**⚠️ CRITIQUE**: Aucun travail sur les user stories ne peut commencer avant la fin de cette phase

- [x] T004 Appliquer la migration pour ajouter staff_account_id à profiles via Supabase MCP
- [x] T005 Appliquer la migration pour créer la table room_types avec seed data via Supabase MCP
- [x] T006 Appliquer la migration pour créer la table action_types avec seed data via Supabase MCP
- [x] T007 Appliquer la migration pour créer la table time_entries via Supabase MCP
- [x] T008 Appliquer la migration pour créer la table room_actions via Supabase MCP
- [x] T009 Régénérer les types TypeScript Supabase avec le MCP generate_typescript_types
- [x] T010 Vérifier les advisors de sécurité Supabase (RLS policies)
- [x] T011 Modifier src/lib/auth.tsx pour ajouter la détection du rôle staff (isStaff, staffMemberId)
- [x] T012 Créer le composant ProtectedStaffRoute dans src/components/portal/ProtectedStaffRoute.tsx

**Checkpoint**: Foundation ready - l'implémentation des user stories peut maintenant commencer

---

## Phase 3: User Story 1 - Créer et lier un compte staff (Priority: P1) 🎯 MVP

**Goal**: Permettre au gestionnaire de créer un compte utilisateur lié à un membre du personnel existant

**Independent Test**: Créer un compte pour Marie (femme de ménage existante) et vérifier qu'elle peut se connecter à son espace personnel.

### Tests pour User Story 1

> **NOTE: Écrire ces tests EN PREMIER, s'assurer qu'ils ÉCHOUENT avant l'implémentation**

- [x] T013 [P] [US1] Test unitaire pour staff-account.service.ts dans src/services/staff-account.service.test.ts

### Implémentation pour User Story 1

- [x] T014 [US1] Implémenter staff-account.service.ts avec inviteStaff, linkAccount, isStaffLinked dans src/services/staff-account.service.ts
- [x] T015 [P] [US1] Créer le composant InviteStaffButton.tsx dans src/components/staff/InviteStaffButton.tsx
- [x] T016 [P] [US1] Créer le composant StaffAccountBadge.tsx dans src/components/staff/StaffAccountBadge.tsx
- [x] T017 [US1] Intégrer InviteStaffButton dans la page Staff.tsx existante (bouton sur fiche employé)
- [x] T018 [US1] Créer la page PortalHome.tsx (dashboard personnel après connexion) dans src/pages/portal/PortalHome.tsx
- [x] T019 [US1] Modifier le flux de login pour rediriger le staff vers /portal au lieu de / dans src/lib/auth.tsx

**Checkpoint**: À ce stade, User Story 1 doit être entièrement fonctionnelle et testable indépendamment

---

## Phase 4: User Story 2 - Pointer entrée/sortie (Priority: P1) 🎯 MVP

**Goal**: Permettre au personnel de pointer son arrivée et sa sortie avec sélection du client

**Independent Test**: Marie peut pointer à 8h00, puis pointer sa sortie à 12h00, et voir ses 4 heures enregistrées.

### Tests pour User Story 2

- [x] T020 [P] [US2] Test unitaire pour time-entry.service.ts dans src/services/time-entry.service.test.ts

### Implémentation pour User Story 2

- [x] T021 [US2] Implémenter time-entry.service.ts avec clockIn, clockOut, getCurrentEntry, getMissingEntries dans src/services/time-entry.service.ts
- [x] T022 [US2] Créer le store timeEntryStore.ts dans src/stores/timeEntryStore.ts
- [x] T023 [P] [US2] Créer le composant ClockInButton.tsx (sélection client + confirmation) dans src/components/portal/ClockInButton.tsx
- [x] T024 [P] [US2] Créer le composant ClockOutButton.tsx dans src/components/portal/ClockOutButton.tsx
- [x] T025 [P] [US2] Créer le composant TimeEntryCard.tsx (affichage pointage en cours) dans src/components/portal/TimeEntryCard.tsx
- [x] T026 [P] [US2] Créer le composant MissingEntryAlert.tsx dans src/components/portal/MissingEntryAlert.tsx
- [x] T027 [US2] Intégrer les composants de pointage dans PortalHome.tsx
- [x] T028 [US2] Implémenter la création automatique de work_session au clock-out dans time-entry.service.ts

**Checkpoint**: À ce stade, User Stories 1 ET 2 doivent fonctionner indépendamment

---

## Phase 5: User Story 3 - Enregistrer une action par pièce (Priority: P2)

**Goal**: Permettre au personnel d'enregistrer les actions effectuées sur chaque pièce/zone

**Independent Test**: Marie peut sélectionner "Salle de bain" et indiquer "Nettoyage" avec une note optionnelle.

### Tests pour User Story 3

- [x] T029 [P] [US3] Test unitaire pour room-action.service.ts dans src/services/room-action.service.test.ts
- [x] T030 [P] [US3] Test unitaire pour referential.service.ts dans src/services/referential.service.test.ts

### Implémentation pour User Story 3

- [x] T031 [P] [US3] Implémenter referential.service.ts avec getRoomTypes, getActionTypes, getActionTypesForPosition dans src/services/referential.service.ts
- [x] T032 [US3] Implémenter room-action.service.ts avec createAction, getActionsForEntry, getTodayActions dans src/services/room-action.service.ts
- [x] T033 [US3] Créer le store roomActionStore.ts dans src/stores/roomActionStore.ts
- [x] T034 [P] [US3] Créer le composant RoomActionForm.tsx (sélection pièce + action) dans src/components/portal/RoomActionForm.tsx
- [x] T035 [P] [US3] Créer le composant RoomActionList.tsx (liste des actions du jour) dans src/components/portal/RoomActionList.tsx
- [x] T036 [P] [US3] Créer le composant RoomActionCard.tsx dans src/components/portal/RoomActionCard.tsx
- [x] T037 [US3] Intégrer RoomActionForm et RoomActionList dans PortalHome.tsx (visible uniquement si pointé)

**Checkpoint**: User Story 3 complète

---

## Phase 6: User Story 4 - Consulter son historique (Priority: P2)

**Goal**: Permettre au personnel de consulter l'historique de ses pointages et actions

**Independent Test**: Marie peut voir l'historique de la semaine passée avec le total d'heures travaillées.

### Implémentation pour User Story 4

- [x] T038 [US4] Ajouter getHistory, getWeekSummary, getDaySummary dans time-entry.service.ts
- [x] T039 [P] [US4] Créer le composant StaffHistoryView.tsx (vue semaine avec totaux) dans src/components/portal/StaffHistoryView.tsx
- [x] T040 [P] [US4] Créer le composant DayDetailCard.tsx (détail d'une journée) dans src/components/portal/DayDetailCard.tsx
- [x] T041 [P] [US4] Créer le composant WeekNavigator.tsx (navigation semaine précédente/suivante) dans src/components/portal/WeekNavigator.tsx
- [x] T042 [US4] Créer la page PortalHistory.tsx dans src/pages/portal/PortalHistory.tsx
- [x] T043 [US4] Ajouter la navigation vers l'historique dans PortalHome.tsx

**Checkpoint**: User Story 4 complète

---

## Phase 7: User Story 5 - Vue gestionnaire du travail effectué (Priority: P3)

**Goal**: Permettre au gestionnaire de voir le détail du travail effectué par son personnel

**Independent Test**: Le gestionnaire peut voir que Marie a nettoyé 3 salles de bain et 2 cuisines aujourd'hui.

### Implémentation pour User Story 5

- [x] T044 [US5] Ajouter getAllTimeEntries, getDailyReport, getStaffWorkSummary dans time-entry.service.ts
- [x] T045 [P] [US5] Créer le composant StaffWorkCard.tsx (résumé travail d'un employé) dans src/components/staff/StaffWorkCard.tsx
- [x] T046 [P] [US5] Créer le composant DailyWorkReport.tsx (vue d'ensemble journée) dans src/components/staff/DailyWorkReport.tsx
- [x] T047 [P] [US5] Créer le composant TimeEntryEditForm.tsx (correction pointage par manager) dans src/components/staff/TimeEntryEditForm.tsx
- [x] T048 [US5] Créer la page StaffWorkView.tsx dans src/pages/StaffWorkView.tsx
- [x] T049 [US5] Ajouter le lien "Travail effectué" dans la navigation manager (Home.tsx ou sidebar)
- [x] T050 [US5] Intégrer la correction de pointage avec mise à jour de work_session associée

**Checkpoint**: Toutes les user stories sont complètes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations qui affectent plusieurs user stories

- [x] T051 [P] Ajouter les états de chargement (loading) sur tous les composants portal
- [x] T052 [P] Ajouter les états vides (empty states) avec messages appropriés en français
- [x] T053 [P] Ajouter le CSS responsive mobile-first pour tous les composants portal dans src/App.css
- [x] T054 [P] Vérifier l'accessibilité (touch targets 44x44px, labels, contraste)
- [x] T055 Tester manuellement tous les scénarios de quickstart.md
- [x] T056 Exécuter le build final et corriger les erreurs TypeScript éventuelles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut démarrer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les user stories
- **User Stories (Phase 3-7)**: Toutes dépendent de la phase Foundational
  - US1 et US2 sont prioritaires (MVP)
  - US3 et US4 peuvent progresser en parallèle après US2
  - US5 est côté manager, peut progresser indépendamment
- **Polish (Phase 8)**: Dépend de toutes les user stories désirées

### User Story Dependencies

- **User Story 1 (P1)**: Peut démarrer après Foundational - Pas de dépendance sur les autres stories
- **User Story 2 (P1)**: Peut démarrer après Foundational - Nécessite US1 pour avoir un compte staff connecté
- **User Story 3 (P2)**: Nécessite US2 pour avoir un pointage actif sur lequel ajouter des actions
- **User Story 4 (P2)**: Nécessite US2 pour avoir des pointages à afficher
- **User Story 5 (P3)**: Peut démarrer après Foundational - Vue manager indépendante

### Within Each User Story

- Tests DOIVENT être écrits et ÉCHOUER avant l'implémentation
- Services avant stores
- Stores avant composants
- Composants avant intégration dans les pages
- Story complète avant de passer à la priorité suivante

### Parallel Opportunities

- Toutes les tâches Setup marquées [P] peuvent s'exécuter en parallèle
- Toutes les tâches Foundational (migrations) sont séquentielles
- Une fois Foundational terminée, US1 peut démarrer immédiatement
- Les composants marqués [P] peuvent être développés en parallèle
- US5 (manager) peut progresser en parallèle de US3/US4 (staff)

---

## Parallel Example: User Story 2

```bash
# Lancer tous les composants pour US2 ensemble:
Task: "Créer le composant ClockInButton.tsx"
Task: "Créer le composant ClockOutButton.tsx"
Task: "Créer le composant TimeEntryCard.tsx"
Task: "Créer le composant MissingEntryAlert.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Compléter Phase 1: Setup
2. Compléter Phase 2: Foundational (CRITIQUE - bloque toutes les stories)
3. Compléter Phase 3: User Story 1 (Compte staff)
4. Compléter Phase 4: User Story 2 (Pointage)
5. **STOP et VALIDER**: Tester le MVP complet indépendamment
6. Déployer/demo si prêt

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test → Deploy (peut créer des comptes staff)
3. User Story 2 → Test → Deploy (MVP complet - pointage fonctionne!)
4. User Story 3 → Test → Deploy (actions par pièce)
5. User Story 4 → Test → Deploy (historique personnel)
6. User Story 5 → Test → Deploy (vue manager)
7. Chaque story ajoute de la valeur sans casser les précédentes

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label mappe la tâche à une user story spécifique pour la traçabilité
- Chaque user story doit être complétable et testable indépendamment
- Vérifier que les tests échouent avant d'implémenter
- Commit après chaque tâche ou groupe logique
- S'arrêter à n'importe quel checkpoint pour valider la story indépendamment
- Éviter: tâches vagues, conflits sur le même fichier, dépendances cross-story qui cassent l'indépendance
