# Feature Specification: Gestion du Planning

**Feature Branch**: `004-planning-crud`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "créer un planning fais tout la gestion crud"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consulter le planning (Priority: P1)

L'utilisateur accède à une vue liste de toutes les interventions planifiées pour visualiser l'organisation du travail de son personnel de maison.

**Why this priority**: Voir le planning est l'action la plus fondamentale - sans visualisation, aucune autre fonctionnalité n'a de sens. C'est le point d'entrée de la feature.

**Independent Test**: Peut être testé en naviguant vers la page planning et en vérifiant que les interventions existantes s'affichent correctement avec les informations du membre du personnel assigné.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté et a des interventions planifiées, **When** il accède à la page planning, **Then** il voit la liste de toutes ses interventions avec le nom du membre assigné, la date, l'heure et la description.
2. **Given** l'utilisateur est connecté et n'a aucune intervention, **When** il accède à la page planning, **Then** il voit un état vide avec un message l'invitant à créer sa première intervention.
3. **Given** l'utilisateur consulte le planning, **When** il regarde une intervention, **Then** il peut voir le statut (planifié, terminé, annulé).

---

### User Story 2 - Créer une intervention (Priority: P1)

L'utilisateur crée une nouvelle intervention en sélectionnant un membre du personnel, une date, une heure de début et de fin, et en ajoutant une description de la tâche à effectuer.

**Why this priority**: La création est essentielle pour pouvoir utiliser le planning. Sans création, le système ne peut pas fonctionner.

**Independent Test**: Peut être testé en remplissant le formulaire de création, en soumettant, et en vérifiant que l'intervention apparaît dans la liste du planning.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur la page planning, **When** il clique sur "Ajouter une intervention", **Then** un formulaire s'affiche avec les champs requis.
2. **Given** l'utilisateur remplit le formulaire avec toutes les informations valides, **When** il soumet le formulaire, **Then** l'intervention est créée et s'affiche dans le planning avec un message de confirmation.
3. **Given** l'utilisateur remplit le formulaire mais omet un champ obligatoire (membre, date, heure début), **When** il tente de soumettre, **Then** un message d'erreur indique le champ manquant.
4. **Given** l'utilisateur sélectionne une date passée, **When** il tente de soumettre, **Then** le système affiche un avertissement mais permet la création (pour saisie rétroactive).

---

### User Story 3 - Modifier une intervention (Priority: P2)

L'utilisateur modifie une intervention existante pour changer le membre assigné, la date/heure, ou la description.

**Why this priority**: La modification est importante pour corriger les erreurs et adapter le planning aux changements, mais vient après la consultation et création.

**Independent Test**: Peut être testé en sélectionnant une intervention existante, en modifiant ses informations, et en vérifiant que les changements sont persistés.

**Acceptance Scenarios**:

1. **Given** l'utilisateur consulte une intervention, **When** il clique sur "Modifier", **Then** un formulaire pré-rempli s'affiche avec les données actuelles.
2. **Given** l'utilisateur modifie les informations d'une intervention, **When** il sauvegarde, **Then** les modifications sont enregistrées et visibles immédiatement.
3. **Given** une intervention a le statut "terminé", **When** l'utilisateur tente de la modifier, **Then** le système permet la modification avec un avertissement.

---

### User Story 4 - Supprimer une intervention (Priority: P2)

L'utilisateur supprime une intervention qu'il ne souhaite plus conserver dans le planning.

**Why this priority**: La suppression permet de nettoyer le planning des interventions obsolètes ou créées par erreur.

**Independent Test**: Peut être testé en sélectionnant une intervention et en confirmant sa suppression, puis en vérifiant qu'elle n'apparaît plus.

**Acceptance Scenarios**:

1. **Given** l'utilisateur consulte une intervention, **When** il clique sur "Supprimer", **Then** une confirmation lui est demandée avant suppression.
2. **Given** l'utilisateur confirme la suppression, **When** l'action est exécutée, **Then** l'intervention est supprimée et un message de confirmation s'affiche.
3. **Given** l'utilisateur annule la confirmation de suppression, **When** la modale se ferme, **Then** l'intervention reste inchangée.

---

### User Story 5 - Marquer une intervention comme terminée (Priority: P2)

L'utilisateur marque une intervention comme terminée pour suivre l'avancement du travail.

**Why this priority**: Le suivi du statut est important pour la gestion quotidienne mais peut être ajouté après les opérations CRUD de base.

**Independent Test**: Peut être testé en marquant une intervention comme terminée et en vérifiant que son statut change visuellement.

**Acceptance Scenarios**:

1. **Given** une intervention a le statut "planifié", **When** l'utilisateur la marque comme terminée, **Then** le statut passe à "terminé" avec un indicateur visuel (coche, couleur).
2. **Given** une intervention est terminée, **When** l'utilisateur veut la remettre en "planifié", **Then** il peut changer le statut via modification.

---

### User Story 6 - Filtrer les interventions (Priority: P3)

L'utilisateur filtre les interventions par membre du personnel, par date, ou par statut pour retrouver facilement les informations.

**Why this priority**: Les filtres améliorent l'expérience mais ne sont pas essentiels pour le MVP.

**Independent Test**: Peut être testé en appliquant différents filtres et en vérifiant que seules les interventions correspondantes s'affichent.

**Acceptance Scenarios**:

1. **Given** l'utilisateur a plusieurs interventions, **When** il filtre par membre du personnel, **Then** seules les interventions de ce membre s'affichent.
2. **Given** l'utilisateur filtre par statut "terminé", **When** le filtre est appliqué, **Then** seules les interventions terminées s'affichent.
3. **Given** l'utilisateur a des filtres actifs, **When** il clique sur "Réinitialiser", **Then** tous les filtres sont supprimés et toutes les interventions s'affichent.

---

### Edge Cases

- Que se passe-t-il si un membre du personnel est supprimé alors qu'il a des interventions planifiées ? Les interventions sont conservées avec mention "Membre supprimé".
- Que se passe-t-il si l'utilisateur crée une intervention avec une heure de fin avant l'heure de début ? Le système affiche une erreur de validation.
- Comment gérer les interventions qui chevauchent pour le même membre ? Le système affiche un avertissement mais permet la création (le même membre peut avoir plusieurs tâches en parallèle dans différents lieux).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre de créer une intervention avec : membre du personnel, date, heure de début, heure de fin (optionnelle), description.
- **FR-002**: Le système DOIT afficher la liste des interventions triées par date (les plus proches en premier).
- **FR-003**: Le système DOIT permettre de modifier toutes les informations d'une intervention existante.
- **FR-004**: Le système DOIT demander confirmation avant de supprimer une intervention.
- **FR-005**: Le système DOIT permettre de marquer une intervention comme "terminé" ou "annulé".
- **FR-006**: Le système DOIT afficher uniquement les interventions de l'utilisateur connecté (isolation des données).
- **FR-007**: Le système DOIT valider que la date et l'heure de début sont renseignées avant création.
- **FR-008**: Le système DOIT afficher le nom complet du membre du personnel assigné à chaque intervention.
- **FR-009**: Le système DOIT permettre de filtrer les interventions par membre, par statut, et par plage de dates.
- **FR-010**: Le système DOIT afficher un état vide explicite quand aucune intervention n'existe.

### Key Entities

- **Intervention (Schedule Entry)**: Représente une tâche planifiée. Contient une référence au membre du personnel assigné, une date, des heures de début/fin, une description, et un statut (planifié/terminé/annulé). Appartient à un utilisateur.
- **Staff Member** (existant): Membre du personnel pouvant être assigné à une intervention. Relation un-à-plusieurs avec les interventions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut créer une nouvelle intervention en moins de 30 secondes.
- **SC-002**: L'utilisateur peut retrouver une intervention spécifique parmi 50+ interventions en moins de 10 secondes grâce aux filtres.
- **SC-003**: 100% des opérations CRUD (créer, lire, modifier, supprimer) fonctionnent sans perte de données.
- **SC-004**: Le planning affiche correctement les interventions pour les 12 prochains mois sans problème de performance.
- **SC-005**: L'utilisateur comprend le statut de chaque intervention au premier coup d'oeil grâce aux indicateurs visuels.

## Assumptions

- Une intervention ne concerne qu'un seul membre du personnel à la fois.
- Les heures sont en format 24h et dans le fuseau horaire local de l'utilisateur.
- Le statut par défaut d'une nouvelle intervention est "planifié".
- Les interventions passées restent visibles dans l'historique.
- L'heure de fin est optionnelle (certaines tâches n'ont pas de durée définie).
- Les interventions récurrentes (hebdomadaires) sont hors scope pour cette version (pourront être ajoutées ultérieurement).
