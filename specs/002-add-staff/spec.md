# Feature Specification: Ajouter du Personnel

**Feature Branch**: `002-add-staff`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "Ajouter du personnel - Enregistrez un nouveau membre"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enregistrer un nouveau membre du personnel (Priority: P1)

En tant que gestionnaire de maison, je veux pouvoir enregistrer un nouveau membre du personnel afin de gérer efficacement mon équipe de maison.

**Why this priority**: C'est la fonctionnalité principale demandée. Sans pouvoir ajouter du personnel, le système de gestion n'a pas de raison d'être.

**Independent Test**: Peut être testé en créant un nouveau membre du personnel et en vérifiant qu'il apparaît dans la liste du personnel.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté et sur la page de gestion du personnel, **When** l'utilisateur clique sur "Ajouter un membre", **Then** un formulaire d'enregistrement s'affiche.
2. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur remplit les informations obligatoires (nom, prénom, poste) et soumet le formulaire, **Then** le nouveau membre est créé et apparaît dans la liste du personnel.
3. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur soumet le formulaire avec des champs obligatoires manquants, **Then** un message d'erreur indique les champs à compléter.

---

### User Story 2 - Définir le poste et les coordonnées (Priority: P1)

En tant que gestionnaire, je veux pouvoir définir le poste occupé et les coordonnées du membre du personnel pour pouvoir le contacter et organiser son travail.

**Why this priority**: Les informations de contact et le poste sont essentiels pour la gestion quotidienne du personnel.

**Independent Test**: Peut être testé en ajoutant un membre avec un poste spécifique et des coordonnées, puis en vérifiant que ces informations sont correctement enregistrées.

**Acceptance Scenarios**:

1. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur sélectionne un poste parmi la liste prédéfinie (femme de ménage, jardinier, cuisinier, chauffeur, nounou, gardien, autre), **Then** le poste est associé au membre.
2. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur entre un numéro de téléphone et/ou une adresse email, **Then** ces coordonnées sont enregistrées pour le membre.

---

### User Story 3 - Ajouter des informations complémentaires (Priority: P2)

En tant que gestionnaire, je veux pouvoir ajouter des informations complémentaires (date de début, notes) pour garder un historique complet de chaque membre.

**Why this priority**: Ces informations enrichissent le profil mais ne sont pas critiques pour l'enregistrement initial.

**Independent Test**: Peut être testé en ajoutant un membre avec une date de début et des notes, puis en vérifiant leur affichage.

**Acceptance Scenarios**:

1. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur entre une date de début d'emploi, **Then** cette date est enregistrée pour le membre.
2. **Given** le formulaire d'enregistrement est affiché, **When** l'utilisateur ajoute des notes libres, **Then** ces notes sont enregistrées et visibles sur le profil du membre.

---

### User Story 4 - Consulter la liste du personnel (Priority: P2)

En tant que gestionnaire, je veux pouvoir voir la liste de tout mon personnel pour avoir une vue d'ensemble de mon équipe.

**Why this priority**: Complémente l'ajout de personnel en permettant de visualiser les membres ajoutés.

**Independent Test**: Peut être testé en ajoutant plusieurs membres puis en vérifiant qu'ils apparaissent tous dans la liste.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté, **When** l'utilisateur accède à la page du personnel, **Then** une liste de tous les membres du personnel s'affiche.
2. **Given** la liste du personnel est affichée, **When** l'utilisateur regarde un membre, **Then** il voit le nom, le poste et un indicateur de statut (actif/inactif).

---

### Edge Cases

- Que se passe-t-il si l'utilisateur essaie d'ajouter un membre avec un email déjà existant dans le système ?
- Comment le système gère-t-il les numéros de téléphone au format international ?
- Que se passe-t-il si l'utilisateur annule le formulaire en cours de saisie ?
- Comment le système gère-t-il les caractères spéciaux dans les noms (accents, tirets, apostrophes) ?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre d'ajouter un nouveau membre du personnel avec les informations obligatoires : nom, prénom et poste.
- **FR-002**: Le système DOIT proposer une liste de postes prédéfinis : femme de ménage, jardinier, cuisinier, chauffeur, nounou, gardien, autre.
- **FR-003**: Le système DOIT permettre d'enregistrer les coordonnées optionnelles : numéro de téléphone et adresse email.
- **FR-004**: Le système DOIT valider le format de l'adresse email si elle est fournie.
- **FR-005**: Le système DOIT permettre d'enregistrer une date de début d'emploi optionnelle.
- **FR-006**: Le système DOIT permettre d'ajouter des notes libres optionnelles pour chaque membre.
- **FR-007**: Le système DOIT afficher la liste de tous les membres du personnel enregistrés.
- **FR-008**: Le système DOIT associer chaque membre du personnel au compte utilisateur qui l'a créé.
- **FR-009**: Le système DOIT empêcher l'ajout d'un membre avec des champs obligatoires vides.
- **FR-010**: Le système DOIT supporter les caractères spéciaux dans les noms (accents, tirets, apostrophes).
- **FR-011**: Le système DOIT afficher un indicateur de statut (actif/inactif) pour chaque membre du personnel.

### Key Entities

- **StaffMember (Membre du personnel)**: Représente une personne travaillant pour le gestionnaire. Attributs clés : identifiant unique, nom, prénom, poste, téléphone, email, date de début, notes, statut (actif/inactif), date de création.
- **Position (Poste)**: Représente le type de travail effectué. Liste prédéfinie avec possibilité de valeur personnalisée ("autre").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut créer un nouveau membre du personnel en moins de 2 minutes.
- **SC-002**: 100% des membres ajoutés apparaissent correctement dans la liste du personnel.
- **SC-003**: Les messages d'erreur de validation sont affichés en moins de 500ms après la soumission.
- **SC-004**: Le formulaire d'ajout est accessible et utilisable sur mobile et desktop.
- **SC-005**: 95% des utilisateurs réussissent à ajouter un membre du premier coup sans erreur.

## Assumptions

- L'utilisateur doit être authentifié pour accéder aux fonctionnalités de gestion du personnel.
- Chaque utilisateur gère sa propre liste de personnel (pas de partage entre comptes).
- Le système utilise l'interface en français conformément au reste de l'application.
- Les membres du personnel ne sont pas des utilisateurs du système (pas de compte utilisateur associé).
- Le statut par défaut d'un nouveau membre est "actif".
