# Tasks: Calendrier des Passages Client

**Input**: Design documents from `/specs/010-client-schedule-calendar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Non requis explicitement dans la spec. Tests optionnels en Phase finale.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, types et structure de base

- [x] T001 [P] Créer les types calendrier dans src/lib/types/calendar.types.ts (CalendarEvent, CalendarDay, CalendarMonth)
- [x] T002 [P] Créer le dossier src/components/calendar/ avec fichier index.ts pour les exports
- [x] T003 Créer la migration RLS pour staff dans supabase/migrations/20260208_schedule_entries_staff_rls.sql

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Service et utilitaires partagés par toutes les user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Implémenter le service schedule-calendar.service.ts avec getClientScheduleForMonth() dans src/services/schedule-calendar.service.ts
- [x] T005 Implémenter buildCalendarMonth() helper dans src/services/schedule-calendar.service.ts
- [x] T006 Implémenter getScheduleEntryDetails() dans src/services/schedule-calendar.service.ts

**Checkpoint**: Service calendrier prêt - l'implémentation des user stories peut commencer

---

## Phase 3: User Story 1 - Manager consulte le calendrier d'un client (Priority: P1) 🎯 MVP

**Goal**: Le manager peut voir un calendrier mensuel avec toutes les interventions planifiées pour un client, naviguer entre les mois, et voir le jour actuel mis en évidence.

**Independent Test**: Se connecter en manager, naviguer vers un client, cliquer sur "Calendrier", vérifier que les interventions s'affichent sur les bonnes dates.

### Implementation for User Story 1

- [x] T007 [P] [US1] Créer le composant CalendarEvent.tsx dans src/components/calendar/CalendarEvent.tsx (affichage d'un événement cliquable)
- [x] T008 [P] [US1] Créer le composant CalendarDay.tsx dans src/components/calendar/CalendarDay.tsx (cellule jour avec liste d'événements)
- [x] T009 [US1] Créer le composant CalendarView.tsx dans src/components/calendar/CalendarView.tsx (grille calendrier mensuelle avec navigation)
- [x] T010 [US1] Créer la page ClientSchedule.tsx dans src/pages/ClientSchedule.tsx (page calendrier pour manager)
- [x] T011 [US1] Ajouter la route /clients/:clientId/schedule dans src/App.tsx
- [x] T012 [US1] Ajouter le bouton "Calendrier" dans ClientCard.tsx (src/components/billing/ClientCard.tsx)
- [x] T013 [US1] Ajouter les styles CSS pour le calendrier dans src/App.css (.calendar-*, .calendar-day-*, .calendar-event-*)

**Checkpoint**: Le manager peut consulter le calendrier d'un client avec navigation mensuelle

---

## Phase 4: User Story 2 - Staff consulte ses interventions chez un client (Priority: P2)

**Goal**: L'employée peut voir ses propres interventions chez un client depuis le portail staff.

**Independent Test**: Se connecter en staff, aller sur le portail, accéder au calendrier d'un client, vérifier que seules ses interventions apparaissent.

### Implementation for User Story 2

- [x] T014 [US2] Appliquer la migration RLS schedule_entries_staff_select_own sur la base de données
- [x] T015 [US2] Créer le composant ClientCalendar.tsx dans src/components/portal/ClientCalendar.tsx (wrapper calendrier pour portail staff, showStaffName=false)
- [x] T016 [US2] Ajouter l'accès au calendrier client depuis le portail staff dans src/pages/portal/PortalHome.tsx

**Checkpoint**: Le staff peut consulter le calendrier de ses interventions chez un client

---

## Phase 5: User Story 3 - Détails d'une intervention dans le calendrier (Priority: P3)

**Goal**: Les utilisateurs peuvent cliquer sur une intervention pour voir ses détails dans une modal.

**Independent Test**: Cliquer sur une intervention dans le calendrier, vérifier que la modal affiche date/heure, employé (manager), description, notes, et lien "Modifier" (manager uniquement).

### Implementation for User Story 3

- [x] T017 [US3] Créer le composant EventDetailModal.tsx dans src/components/calendar/EventDetailModal.tsx
- [x] T018 [US3] Intégrer EventDetailModal dans CalendarView.tsx (gestion état selectedEvent, onEventClick)
- [x] T019 [US3] Ajouter le lien "Modifier" dans EventDetailModal (manager uniquement) vers /schedule?edit={id}

**Checkpoint**: Toutes les user stories sont fonctionnelles et testables indépendamment

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations et finitions

- [x] T020 [P] Gérer l'état "calendrier vide" avec message explicatif dans CalendarView.tsx
- [x] T021 [P] Ajouter les attributs ARIA pour accessibilité dans CalendarView.tsx (role="grid", aria-label)
- [x] T022 [P] Ajouter la navigation clavier dans CalendarView.tsx (flèches pour changer de mois)
- [x] T023 Vérifier le build TypeScript (npm run build) et corriger les erreurs éventuelles
- [ ] T024 Tester les scénarios de quickstart.md manuellement

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (types) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (service). No dependencies on other stories.
- **User Story 2 (P2)**: Depends on Phase 2 (service) + T014 (RLS migration). Réutilise composants de US1.
- **User Story 3 (P3)**: Depends on Phase 2 + US1 composants (CalendarView). Ajoute la modal.

### Within Each User Story

- Models/types before services
- Services before components
- Core components before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1**:
- T001 (types) || T002 (folder) || T003 (migration SQL)

**Phase 3 (US1)**:
- T007 (CalendarEvent) || T008 (CalendarDay) - peuvent être développés en parallèle

**Phase 6**:
- T020 || T021 || T022 - améliorations indépendantes

---

## Parallel Example: User Story 1

```bash
# Launch in parallel (different files):
Task: "Créer le composant CalendarEvent.tsx dans src/components/calendar/CalendarEvent.tsx"
Task: "Créer le composant CalendarDay.tsx dans src/components/calendar/CalendarDay.tsx"

# Then sequentially (dependencies):
Task: "Créer le composant CalendarView.tsx" (depends on CalendarEvent + CalendarDay)
Task: "Créer la page ClientSchedule.tsx" (depends on CalendarView)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types, folder, migration)
2. Complete Phase 2: Foundational (service)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Tester le calendrier manager
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Service calendrier prêt
2. Add User Story 1 → Test manager view → Deploy (MVP!)
3. Add User Story 2 → Test staff view → Deploy
4. Add User Story 3 → Test modal détails → Deploy
5. Each story adds value without breaking previous stories

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 (User Story 1)**

Livrables MVP:
- Types calendrier
- Service getClientScheduleForMonth + buildCalendarMonth
- Composants CalendarView, CalendarDay, CalendarEvent
- Page ClientSchedule avec route
- Bouton calendrier dans ClientCard

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Migration RLS (T003) doit être appliquée sur la base avant que le staff puisse accéder aux données
