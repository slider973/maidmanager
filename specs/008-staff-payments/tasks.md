# Tasks: Suivi des paiements du personnel

**Input**: Design documents from `/specs/008-staff-payments/`
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

- [x] T001 Copier les types du contrat dans src/lib/types/payments.types.ts depuis specs/008-staff-payments/contracts/staff-payments.types.ts
- [x] T002 [P] Créer la structure des dossiers src/components/payments/ et src/services/
- [x] T003 [P] Ajouter la route /staff/:id/payments dans src/App.tsx

---

## Phase 2: Foundational (Prérequis bloquants)

**Purpose**: Infrastructure de base DEVANT être complète avant TOUTE user story

**⚠️ CRITIQUE**: Aucun travail sur les user stories ne peut commencer avant la fin de cette phase

- [x] T004 Appliquer la migration pour ajouter hourly_rate_cents à staff_members via Supabase MCP (20260207_005_alter_staff_members_hourly_rate.sql)
- [x] T005 Appliquer la migration pour créer la table work_sessions via Supabase MCP (20260207_006_create_work_sessions.sql)
- [x] T006 Appliquer la migration pour créer la table staff_payments via Supabase MCP (20260207_007_create_staff_payments.sql)
- [x] T007 Régénérer les types TypeScript Supabase avec le MCP generate_typescript_types
- [x] T008 Vérifier les advisors de sécurité Supabase (RLS policies)

**Checkpoint**: Foundation ready - l'implémentation des user stories peut maintenant commencer

---

## Phase 3: User Story 1 - Enregistrer une prestation (Priority: P1) 🎯 MVP

**Goal**: Permettre d'enregistrer les prestations effectuées par le personnel avec calcul automatique du montant

**Independent Test**: Créer une nouvelle prestation pour un membre du personnel avec date, durée et tarif horaire, puis vérifier que le montant dû est calculé automatiquement.

### Tests pour User Story 1

> **NOTE: Écrire ces tests EN PREMIER, s'assurer qu'ils ÉCHOUENT avant l'implémentation**

- [x] T009 [P] [US1] Test unitaire pour work-session.service.ts dans src/services/work-session.service.test.ts
- [x] T010 [P] [US1] Test unitaire pour les fonctions utilitaires (calculateAmount, hoursToMinutes) dans src/lib/types/payments.types.test.ts

### Implémentation pour User Story 1

- [x] T011 [P] [US1] Implémenter work-session.service.ts avec CRUD complet dans src/services/work-session.service.ts
- [x] T012 [US1] Créer le store workSessionStore.ts dans src/stores/workSessionStore.ts
- [x] T013 [P] [US1] Créer le composant WorkSessionForm.tsx dans src/components/payments/WorkSessionForm.tsx
- [x] T014 [P] [US1] Créer le composant WorkSessionCard.tsx dans src/components/payments/WorkSessionCard.tsx
- [x] T015 [US1] Créer le composant WorkSessionList.tsx dans src/components/payments/WorkSessionList.tsx
- [x] T016 [US1] Créer la page StaffPayments.tsx avec formulaire de prestation dans src/pages/StaffPayments.tsx
- [x] T017 [US1] Ajouter validation des heures (> 0) et avertissement tarif à 0€ dans WorkSessionForm.tsx
- [x] T018 [US1] Ajouter le lien "Nouvelle prestation" sur la page Staff.tsx existante

**Checkpoint**: À ce stade, User Story 1 doit être entièrement fonctionnelle et testable indépendamment

---

## Phase 4: User Story 2 - Consulter le solde dû (Priority: P1) 🎯 MVP

**Goal**: Afficher le montant total dû à chaque membre du personnel

**Independent Test**: Accéder à la page du personnel et voir le solde dû à côté de chaque nom, avec un total général.

### Tests pour User Story 2

- [x] T019 [P] [US2] Test unitaire pour le calcul du solde (balance) dans src/services/staff-balance.service.test.ts

### Implémentation pour User Story 2

- [x] T020 [US2] Implémenter staff-balance.service.ts pour calculer les soldes dans src/services/staff-balance.service.ts
- [x] T021 [P] [US2] Créer le composant StaffBalanceCard.tsx dans src/components/payments/StaffBalanceCard.tsx
- [x] T022 [US2] Modifier Staff.tsx pour afficher le solde dû à côté de chaque employé dans src/pages/Staff.tsx
- [x] T023 [US2] Ajouter le widget "Total dû au personnel" sur le Dashboard dans src/pages/Home.tsx

**Checkpoint**: À ce stade, User Stories 1 ET 2 doivent fonctionner indépendamment

---

## Phase 5: User Story 3 - Enregistrer un paiement (Priority: P1) 🎯 MVP

**Goal**: Permettre d'enregistrer les paiements effectués au personnel et mettre à jour le solde

**Independent Test**: Enregistrer un paiement de 100€ à un employé et vérifier que son solde dû diminue de 100€.

### Tests pour User Story 3

- [x] T024 [P] [US3] Test unitaire pour staff-payment.service.ts dans src/services/staff-payment.service.test.ts

### Implémentation pour User Story 3

- [x] T025 [P] [US3] Implémenter staff-payment.service.ts avec CRUD complet dans src/services/staff-payment.service.ts
- [x] T026 [US3] Créer le store staffPaymentStore.ts dans src/stores/staffPaymentStore.ts
- [x] T027 [P] [US3] Créer le composant PaymentForm.tsx avec suggestions de modes de paiement dans src/components/payments/PaymentForm.tsx
- [x] T028 [P] [US3] Créer le composant PaymentCard.tsx dans src/components/payments/PaymentCard.tsx
- [x] T029 [US3] Créer le composant PaymentList.tsx dans src/components/payments/PaymentList.tsx
- [x] T030 [US3] Intégrer le formulaire de paiement dans StaffPayments.tsx
- [x] T031 [US3] Ajouter le bouton "Enregistrer un paiement" sur la page d'un employé

**Checkpoint**: MVP complet - toutes les fonctionnalités P1 sont opérationnelles

---

## Phase 6: User Story 4 - Tarif horaire par défaut (Priority: P2)

**Goal**: Définir un tarif horaire par défaut pour chaque employé, pré-rempli lors des nouvelles prestations

**Independent Test**: Modifier le tarif horaire d'un employé et vérifier qu'il est automatiquement proposé lors de la prochaine prestation.

### Implémentation pour User Story 4

- [x] T032 [US4] Modifier le formulaire staff existant pour inclure le champ hourly_rate_cents dans src/components/staff/StaffForm.tsx (ou équivalent)
- [x] T033 [US4] Mettre à jour le service staff existant pour sauvegarder hourly_rate_cents
- [x] T034 [US4] Modifier WorkSessionForm.tsx pour pré-remplir le tarif avec hourly_rate_cents de l'employé

**Checkpoint**: User Story 4 complète

---

## Phase 7: User Story 5 - Historique des prestations et paiements (Priority: P2)

**Goal**: Afficher l'historique chronologique complet des prestations et paiements pour un employé

**Independent Test**: Accéder au profil d'un employé et voir la liste chronologique de toutes ses prestations et tous ses paiements.

### Implémentation pour User Story 5

- [x] T035 [US5] Créer le composant StaffHistoryList.tsx (timeline unifiée) dans src/components/payments/StaffHistoryList.tsx
- [x] T036 [US5] Implémenter la fonction getStaffHistory() qui combine prestations et paiements triés par date dans src/services/staff-history.service.ts
- [x] T037 [US5] Intégrer StaffHistoryList dans StaffPayments.tsx

**Checkpoint**: User Story 5 complète

---

## Phase 8: User Story 6 - Filtrer les prestations (Priority: P3)

**Goal**: Permettre de filtrer les prestations par période (mois) et par employé

**Independent Test**: Appliquer un filtre par mois et vérifier que seules les prestations de ce mois apparaissent.

### Implémentation pour User Story 6

- [x] T038 [US6] Créer le composant WorkSessionFilters.tsx avec filtre période et employé dans src/components/payments/WorkSessionFilters.tsx
- [x] T039 [US6] Ajouter la logique de filtrage dans workSessionStore.ts
- [x] T040 [US6] Intégrer les filtres dans WorkSessionList.tsx ou créer une page dédiée /work-sessions

**Checkpoint**: Toutes les user stories sont complètes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations qui affectent plusieurs user stories

- [x] T041 [P] Ajouter les états de chargement (loading) sur tous les composants de liste
- [x] T042 [P] Ajouter les états vides (empty states) avec messages appropriés en français
- [x] T043 [P] Vérifier la navigation au clavier sur tous les formulaires
- [ ] T044 Tester manuellement tous les scénarios de quickstart.md
- [x] T045 Exécuter le build final et corriger les erreurs TypeScript éventuelles

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Pas de dépendances - peut démarrer immédiatement
- **Foundational (Phase 2)**: Dépend de Setup - BLOQUE toutes les user stories
- **User Stories (Phase 3-8)**: Toutes dépendent de la phase Foundational
  - US1, US2, US3 peuvent progresser en parallèle (si plusieurs devs)
  - Ou séquentiellement en ordre de priorité (P1 → P2 → P3)
- **Polish (Phase 9)**: Dépend de toutes les user stories désirées

### User Story Dependencies

- **User Story 1 (P1)**: Peut démarrer après Foundational - Pas de dépendance sur les autres stories
- **User Story 2 (P1)**: Peut démarrer après Foundational - Nécessite US1 pour avoir des prestations à calculer
- **User Story 3 (P1)**: Peut démarrer après Foundational - Nécessite US2 pour voir l'impact sur le solde
- **User Story 4 (P2)**: Peut démarrer après Foundational - S'intègre avec US1
- **User Story 5 (P2)**: Peut démarrer après Foundational - Nécessite US1 et US3 pour avoir des données
- **User Story 6 (P3)**: Peut démarrer après US1 - Filtre les prestations créées

### Within Each User Story

- Tests DOIVENT être écrits et ÉCHOUER avant l'implémentation
- Services avant stores
- Stores avant composants
- Composants avant intégration dans les pages
- Story complète avant de passer à la priorité suivante

### Parallel Opportunities

- Toutes les tâches Setup marquées [P] peuvent s'exécuter en parallèle
- Toutes les tâches Foundational (migrations) sont séquentielles
- Une fois Foundational terminée, US1/US2/US3 peuvent démarrer en parallèle
- Tous les tests d'une user story marqués [P] peuvent s'exécuter en parallèle
- Les composants marqués [P] peuvent être développés en parallèle

---

## Parallel Example: User Story 1

```bash
# Lancer tous les tests pour US1 ensemble:
Task: "Test unitaire pour work-session.service.ts"
Task: "Test unitaire pour les fonctions utilitaires"

# Lancer tous les composants pour US1 ensemble:
Task: "Créer le composant WorkSessionForm.tsx"
Task: "Créer le composant WorkSessionCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3)

1. Compléter Phase 1: Setup
2. Compléter Phase 2: Foundational (CRITIQUE - bloque toutes les stories)
3. Compléter Phase 3: User Story 1 (Prestations)
4. Compléter Phase 4: User Story 2 (Soldes)
5. Compléter Phase 5: User Story 3 (Paiements)
6. **STOP et VALIDER**: Tester le MVP complet indépendamment
7. Déployer/demo si prêt

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Test → Deploy (peut enregistrer des prestations)
3. User Story 2 → Test → Deploy (peut voir les soldes)
4. User Story 3 → Test → Deploy (MVP complet!)
5. User Story 4 → Test → Deploy (tarif par défaut)
6. User Story 5 → Test → Deploy (historique)
7. User Story 6 → Test → Deploy (filtres)
8. Chaque story ajoute de la valeur sans casser les précédentes

---

## Notes

- [P] tasks = fichiers différents, pas de dépendances
- [Story] label mappe la tâche à une user story spécifique pour la traçabilité
- Chaque user story doit être complétable et testable indépendamment
- Vérifier que les tests échouent avant d'implémenter
- Commit après chaque tâche ou groupe logique
- S'arrêter à n'importe quel checkpoint pour valider la story indépendamment
- Éviter: tâches vagues, conflits sur le même fichier, dépendances cross-story qui cassent l'indépendance
