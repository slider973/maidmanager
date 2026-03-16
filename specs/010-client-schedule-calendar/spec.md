# Feature Specification: Calendrier des Passages Client

**Feature Branch**: `010-client-schedule-calendar`
**Created**: 2026-02-08
**Status**: Draft
**Input**: "il faudrait que quand on clique sur un client on puisse voir un calendrier qui permet de voir quand la femme de ménage est prévue d'y aller comme ça elle peut aussi le consulter dans son écran aussi"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manager consulte le calendrier d'un client (Priority: P1)

En tant que manager, je veux pouvoir consulter le calendrier des interventions prévues pour un client spécifique afin de savoir quand mes employés sont programmés pour y aller et mieux gérer la planification.

**Why this priority**: C'est la fonctionnalité principale demandée. Le manager doit pouvoir visualiser rapidement les passages prévus chez un client pour coordonner son équipe et répondre aux questions du client.

**Independent Test**: Peut être testé en naviguant vers la fiche d'un client, en accédant à son calendrier, et en vérifiant que les interventions planifiées s'affichent correctement sur les bonnes dates.

**Acceptance Scenarios**:

1. **Given** le manager est sur la liste des clients, **When** il clique sur un client puis accède à son calendrier, **Then** il voit un calendrier mensuel avec les interventions prévues pour ce client.
2. **Given** le calendrier d'un client est affiché, **When** il navigue vers le mois suivant ou précédent, **Then** les interventions de ce mois s'affichent correctement.
3. **Given** une intervention est planifiée pour aujourd'hui, **When** le manager consulte le calendrier, **Then** la date du jour est mise en évidence et l'intervention est visible.

---

### User Story 2 - Staff consulte ses interventions chez un client (Priority: P2)

En tant qu'employée (femme de ménage), je veux pouvoir voir quand je suis prévue pour aller chez un client spécifique afin de m'organiser et ne pas oublier mes rendez-vous.

**Why this priority**: Permet à l'employée d'avoir une visibilité sur ses interventions futures chez un client, complémentant la vue manager. Cela améliore la communication et réduit les oublis.

**Independent Test**: L'employée se connecte au portail staff, consulte un client où elle a des interventions planifiées, et vérifie qu'elle voit ses propres passages prévus.

**Acceptance Scenarios**:

1. **Given** l'employée est connectée au portail staff, **When** elle accède au calendrier d'un client, **Then** elle voit uniquement ses propres interventions planifiées (pas celles des autres employés).
2. **Given** le calendrier affiche une intervention, **When** l'employée clique dessus, **Then** elle voit les détails (date, heure prévue, durée estimée).

---

### User Story 3 - Détails d'une intervention dans le calendrier (Priority: P3)

En tant qu'utilisateur (manager ou staff), je veux pouvoir cliquer sur une intervention dans le calendrier pour voir ses détails afin de connaître les informations importantes (heure, employé assigné, notes).

**Why this priority**: Ajoute de la valeur en permettant d'accéder rapidement aux informations détaillées sans quitter la vue calendrier.

**Independent Test**: Cliquer sur un événement dans le calendrier affiche un popup ou une vue avec les détails de l'intervention.

**Acceptance Scenarios**:

1. **Given** une intervention est affichée dans le calendrier, **When** l'utilisateur clique dessus, **Then** un popup ou une modale affiche les détails : date/heure, employé assigné, client, notes éventuelles.
2. **Given** le popup de détails est affiché pour le manager, **When** il souhaite modifier l'intervention, **Then** il peut accéder à la page de modification du planning.

---

### Edge Cases

- Que se passe-t-il quand un client n'a aucune intervention planifiée? → Afficher un calendrier vide avec un message explicatif.
- Comment gérer les interventions récurrentes (ex: tous les lundis)? → Afficher chaque occurrence individuelle dans le calendrier.
- Que se passe-t-il si une intervention est annulée? → Elle n'apparaît plus dans le calendrier (ou apparaît barrée si statut "annulé").
- Comment afficher les interventions passées? → Permettre la navigation vers les mois précédents pour voir l'historique.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher un calendrier mensuel montrant les interventions planifiées pour un client spécifique.
- **FR-002**: Le système DOIT permettre la navigation entre les mois (précédent/suivant) dans le calendrier.
- **FR-003**: Le système DOIT mettre en évidence la date du jour dans le calendrier.
- **FR-004**: Le système DOIT afficher les interventions sous forme d'événements cliquables sur les jours correspondants.
- **FR-005**: Le système DOIT permettre de voir les détails d'une intervention en cliquant dessus.
- **FR-006**: Pour le portail staff, le système DOIT filtrer les interventions pour n'afficher que celles de l'employé connecté.
- **FR-007**: Le calendrier DOIT être accessible depuis la fiche client (pour le manager) et depuis le portail staff.
- **FR-008**: Le système DOIT afficher le nom de l'employé assigné pour chaque intervention (vue manager).
- **FR-009**: Le système DOIT afficher l'heure prévue de l'intervention si elle est définie.

### Key Entities

- **Intervention (schedule_entries)**: Représente un passage planifié chez un client. Attributs clés: date, heure, client, employé assigné, statut, notes.
- **Client**: Le domicile où l'intervention a lieu. Lié aux interventions par client_id.
- **Staff Member**: L'employé assigné à l'intervention. Peut voir ses propres interventions dans le portail.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le manager peut visualiser toutes les interventions d'un client sur un mois en moins de 3 secondes après ouverture du calendrier.
- **SC-002**: L'employée peut consulter ses prochaines interventions chez un client en 2 clics maximum depuis le portail.
- **SC-003**: 100% des interventions planifiées apparaissent correctement sur la bonne date dans le calendrier.
- **SC-004**: La navigation entre mois est instantanée (< 1 seconde) et conserve le contexte du client.
- **SC-005**: Les détails d'une intervention s'affichent en moins de 1 seconde après un clic.

## Assumptions

- Les interventions sont stockées dans la table `schedule_entries` existante avec les champs nécessaires (date, client_id, staff_member_id, etc.).
- La vue calendrier utilise le format mensuel comme standard (pas de vue hebdomadaire ou journalière dans cette version).
- Les heures d'intervention peuvent être nulles (intervention prévue sur la journée sans heure précise).
- Le portail staff a déjà accès à la liste des clients via les interventions planifiées.
