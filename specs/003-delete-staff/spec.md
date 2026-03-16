# Feature Specification: Supprimer les membres du personnel

**Feature Branch**: `003-delete-staff`
**Created**: 2026-02-06
**Status**: Draft
**Input**: User description: "il faut pouvoir supprimer les membres du personnel"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Supprimer un membre du personnel (Priority: P1)

En tant qu'utilisateur connecté, je veux pouvoir supprimer un membre du personnel de ma liste afin de retirer les personnes qui ne travaillent plus pour moi.

**Why this priority**: C'est la fonctionnalité principale demandée. Sans elle, les utilisateurs ne peuvent pas gérer correctement leur liste de personnel lorsqu'un employé quitte définitivement.

**Independent Test**: Peut être testé en ajoutant un membre du personnel, puis en le supprimant et en vérifiant qu'il n'apparaît plus dans la liste.

**Acceptance Scenarios**:

1. **Given** un utilisateur connecté avec au moins un membre du personnel dans sa liste, **When** l'utilisateur clique sur le bouton de suppression d'un membre, **Then** une demande de confirmation s'affiche
2. **Given** la demande de confirmation est affichée, **When** l'utilisateur confirme la suppression, **Then** le membre est supprimé de la base de données et n'apparaît plus dans la liste
3. **Given** la demande de confirmation est affichée, **When** l'utilisateur annule la suppression, **Then** le membre reste dans la liste et aucune modification n'est effectuée

---

### User Story 2 - Confirmation avant suppression (Priority: P1)

En tant qu'utilisateur, je veux qu'une confirmation me soit demandée avant de supprimer définitivement un membre du personnel afin d'éviter les suppressions accidentelles.

**Why this priority**: La confirmation est essentielle pour éviter la perte de données accidentelle. Elle fait partie intégrante de l'expérience de suppression.

**Independent Test**: Peut être testé en cliquant sur supprimer et en vérifiant que la boîte de dialogue de confirmation apparaît avec les options Confirmer/Annuler.

**Acceptance Scenarios**:

1. **Given** un utilisateur clique sur supprimer un membre, **When** la boîte de dialogue s'affiche, **Then** elle contient le nom du membre à supprimer et deux boutons (Confirmer et Annuler)
2. **Given** la boîte de dialogue est ouverte, **When** l'utilisateur clique en dehors de la boîte, **Then** la boîte se ferme sans supprimer le membre

---

### User Story 3 - Feedback après suppression (Priority: P2)

En tant qu'utilisateur, je veux recevoir une notification de succès après avoir supprimé un membre du personnel afin de confirmer que l'action a bien été effectuée.

**Why this priority**: Le feedback utilisateur améliore l'expérience mais n'est pas critique pour la fonctionnalité de base.

**Independent Test**: Peut être testé en supprimant un membre et en vérifiant qu'une notification de succès apparaît.

**Acceptance Scenarios**:

1. **Given** un utilisateur confirme la suppression d'un membre, **When** la suppression réussit, **Then** une notification de succès s'affiche avec un message approprié
2. **Given** un utilisateur confirme la suppression d'un membre, **When** la suppression échoue (erreur réseau, etc.), **Then** une notification d'erreur s'affiche et le membre reste dans la liste

---

### Edge Cases

- Que se passe-t-il si l'utilisateur essaie de supprimer un membre qui a déjà été supprimé (par exemple, dans un autre onglet) ? → Afficher un message d'erreur approprié et rafraîchir la liste
- Que se passe-t-il en cas de perte de connexion pendant la suppression ? → Afficher un message d'erreur et conserver le membre dans la liste
- Que se passe-t-il si l'utilisateur n'a qu'un seul membre dans sa liste et le supprime ? → Afficher l'état vide de la liste après suppression

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT afficher un bouton de suppression pour chaque membre du personnel dans la liste
- **FR-002**: Le système DOIT afficher une boîte de dialogue de confirmation avant toute suppression
- **FR-003**: La boîte de dialogue DOIT afficher le nom complet du membre à supprimer
- **FR-004**: La boîte de dialogue DOIT proposer deux options : Confirmer et Annuler
- **FR-005**: Le système DOIT supprimer définitivement le membre de la base de données lors de la confirmation
- **FR-006**: Le système DOIT mettre à jour la liste des membres immédiatement après une suppression réussie
- **FR-007**: Le système DOIT afficher une notification de succès après une suppression réussie
- **FR-008**: Le système DOIT afficher une notification d'erreur si la suppression échoue
- **FR-009**: Le système DOIT fermer la boîte de dialogue si l'utilisateur clique en dehors ou appuie sur Échap
- **FR-010**: Seul le propriétaire d'un membre du personnel DOIT pouvoir le supprimer (sécurisé par RLS existant)

### Key Entities

- **StaffMember**: Membre du personnel existant avec id, nom, prénom, poste, etc. La suppression retire définitivement cette entité de la base de données.
- **User**: Propriétaire des membres du personnel. Seul le propriétaire peut supprimer ses propres membres.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Les utilisateurs peuvent supprimer un membre du personnel en moins de 5 secondes (2 clics : bouton supprimer + confirmation)
- **SC-002**: 100% des suppressions sont précédées d'une demande de confirmation
- **SC-003**: La liste se met à jour instantanément (moins de 1 seconde) après une suppression réussie
- **SC-004**: Les utilisateurs reçoivent un feedback visuel clair pour chaque suppression (succès ou erreur)
- **SC-005**: Aucune suppression accidentelle ne peut se produire sans confirmation explicite de l'utilisateur

## Assumptions

- La fonctionnalité de suppression est une suppression définitive (hard delete), pas une désactivation (soft delete via is_active)
- Les politiques RLS existantes sur la table staff_members gèrent déjà les autorisations de suppression
- Le système de notification Toast existant sera réutilisé pour les messages de succès/erreur
- L'interface utilisateur actuelle (StaffList/StaffCard) sera étendue pour inclure le bouton de suppression

## Out of Scope

- Suppression en masse de plusieurs membres à la fois
- Fonctionnalité d'annulation (undo) après suppression
- Archivage des membres supprimés
- Historique des suppressions
