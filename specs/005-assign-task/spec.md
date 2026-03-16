# Feature Specification: Assignez une mission

**Feature Branch**: `005-assign-task`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Assignez une mission"

## Contexte

L'application MaidManager dispose déjà d'un système de planning pour les interventions planifiées (schedule_entries). Cette fonctionnalité "Assignez une mission" ajoute la possibilité de créer des tâches/missions ponctuelles ou récurrentes assignées au personnel, distinctes des interventions planifiées.

**Différence avec le planning**:
- **Planning (schedule_entries)**: Interventions planifiées avec date/heure précise (ex: "Ménage salon le 10 février à 9h")
- **Missions (tasks)**: Tâches à accomplir avec une échéance, sans horaire précis (ex: "Nettoyer les vitres avant vendredi")

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Créer une mission (Priority: P1)

L'utilisateur peut créer une nouvelle mission et l'assigner à un membre du personnel avec une description, une priorité et une date d'échéance.

**Why this priority**: C'est la fonctionnalité principale - sans pouvoir créer de missions, les autres fonctionnalités n'ont pas de sens.

**Independent Test**: Depuis la page d'accueil, cliquer sur "Nouvelle tâche", remplir le formulaire et voir la mission apparaître dans la liste des missions.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté et a du personnel enregistré, **When** il clique sur "Nouvelle tâche" et remplit le formulaire (membre, description, échéance, priorité), **Then** la mission est créée et apparaît dans la liste.
2. **Given** le formulaire de mission est affiché, **When** l'utilisateur soumet sans sélectionner de membre, **Then** un message d'erreur indique que le membre est requis.
3. **Given** le formulaire de mission est affiché, **When** l'utilisateur soumet sans description, **Then** un message d'erreur indique que la description est requise.

---

### User Story 2 - Consulter les missions (Priority: P1)

L'utilisateur peut voir la liste de toutes les missions avec leur statut, l'assigné, la priorité et l'échéance.

**Why this priority**: Essentiel pour suivre les missions créées et leur avancement.

**Independent Test**: Naviguer vers la page des missions et voir la liste avec toutes les informations pertinentes.

**Acceptance Scenarios**:

1. **Given** l'utilisateur a créé des missions, **When** il accède à la page des missions, **Then** il voit la liste avec membre assigné, description, échéance, priorité et statut.
2. **Given** aucune mission n'existe, **When** l'utilisateur accède à la page des missions, **Then** un message "Aucune mission" s'affiche avec un bouton pour en créer une.
3. **Given** des missions existent, **When** l'utilisateur consulte la liste, **Then** les missions sont triées par échéance (les plus urgentes en premier).

---

### User Story 3 - Marquer une mission comme terminée (Priority: P2)

L'utilisateur peut changer le statut d'une mission pour indiquer qu'elle est terminée ou en cours.

**Why this priority**: Permet de suivre la progression des missions et de savoir ce qui a été accompli.

**Independent Test**: Cliquer sur le bouton "Terminé" d'une mission et voir son statut changer visuellement.

**Acceptance Scenarios**:

1. **Given** une mission est en attente, **When** l'utilisateur clique sur "Terminé", **Then** le statut passe à "Terminé" avec un indicateur visuel.
2. **Given** une mission est terminée, **When** l'utilisateur la consulte, **Then** elle apparaît avec un style différent (grisée ou barrée).

---

### User Story 4 - Modifier une mission (Priority: P2)

L'utilisateur peut modifier les détails d'une mission existante (membre, description, échéance, priorité).

**Why this priority**: Permet de corriger des erreurs ou d'ajuster les missions selon les besoins.

**Independent Test**: Cliquer sur "Modifier", changer les valeurs, sauvegarder et voir les changements.

**Acceptance Scenarios**:

1. **Given** une mission existe, **When** l'utilisateur clique sur "Modifier" et change la description, **Then** la mission est mise à jour avec la nouvelle description.
2. **Given** une mission existe, **When** l'utilisateur change le membre assigné, **Then** la mission est réassignée au nouveau membre.

---

### User Story 5 - Supprimer une mission (Priority: P3)

L'utilisateur peut supprimer une mission avec confirmation.

**Why this priority**: Fonctionnalité secondaire mais nécessaire pour nettoyer les missions obsolètes.

**Independent Test**: Cliquer sur "Supprimer", confirmer, voir la mission disparaître.

**Acceptance Scenarios**:

1. **Given** une mission existe, **When** l'utilisateur clique sur "Supprimer" et confirme, **Then** la mission est supprimée de la liste.
2. **Given** une mission existe, **When** l'utilisateur clique sur "Supprimer" et annule, **Then** la mission reste inchangée.

---

### User Story 6 - Filtrer les missions (Priority: P3)

L'utilisateur peut filtrer les missions par membre, statut ou priorité.

**Why this priority**: Améliore l'utilisabilité quand beaucoup de missions existent.

**Independent Test**: Appliquer un filtre et voir uniquement les missions correspondantes.

**Acceptance Scenarios**:

1. **Given** des missions avec différents statuts existent, **When** l'utilisateur filtre par "En attente", **Then** seules les missions en attente s'affichent.
2. **Given** des missions assignées à différents membres existent, **When** l'utilisateur filtre par membre, **Then** seules les missions de ce membre s'affichent.

---

### Edge Cases

- Que se passe-t-il si le membre assigné est supprimé ? La mission reste avec une indication "Membre supprimé".
- Comment gérer une échéance passée ? La mission apparaît avec un indicateur visuel "En retard".
- Que se passe-t-il si la date d'échéance est aujourd'hui ? Un indicateur "Urgent" s'affiche.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST permettre de créer une mission avec un membre assigné, une description, une échéance et une priorité
- **FR-002**: System MUST valider que le membre assigné et la description sont renseignés
- **FR-003**: System MUST afficher la liste des missions triées par échéance
- **FR-004**: System MUST permettre de changer le statut d'une mission (en attente, en cours, terminé)
- **FR-005**: System MUST isoler les missions par utilisateur (chaque utilisateur ne voit que ses missions)
- **FR-006**: System MUST permettre de modifier une mission existante
- **FR-007**: System MUST permettre de supprimer une mission avec confirmation
- **FR-008**: System MUST afficher un indicateur visuel pour les missions en retard
- **FR-009**: System MUST permettre de filtrer par membre, statut et priorité
- **FR-010**: System MUST conserver les missions même si le membre assigné est supprimé

### Key Entities

- **Mission (Task)**: Représente une tâche à accomplir
  - Membre assigné (référence optionnelle à staff_members)
  - Description de la tâche
  - Date d'échéance
  - Priorité (basse, normale, haute, urgente)
  - Statut (en attente, en cours, terminé)
  - Notes additionnelles (optionnel)
  - Propriétaire (l'utilisateur qui a créé la mission)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les utilisateurs peuvent créer une mission en moins de 30 secondes
- **SC-002**: L'interface affiche clairement les missions urgentes ou en retard
- **SC-003**: 100% des missions sont correctement isolées par utilisateur
- **SC-004**: Les utilisateurs peuvent retrouver une mission spécifique via les filtres en moins de 10 secondes
- **SC-005**: Le changement de statut d'une mission est instantané (feedback visuel immédiat)

## Assumptions

- Les utilisateurs ont déjà du personnel enregistré avant de créer des missions
- Les niveaux de priorité sont fixes (basse, normale, haute, urgente)
- Les statuts sont fixes (en attente, en cours, terminé)
- L'échéance est une date sans heure précise (contrairement au planning qui a des horaires)
- Une mission ne peut être assignée qu'à un seul membre à la fois
