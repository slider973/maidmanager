# Feature Specification: Portail Personnel

**Feature Branch**: `009-staff-portal`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "il faut une vue personnel il doivent pouvoir créer un compte que je lie a un personnel et il sont la possibilité de pointer et de dire les pieces sur lequel ils ont fait une action ainsi que l'action donc nettoyage pour la femme de menage et salle de bain pour la piece"

## Clarifications

### Session 2026-02-07

- Q: Les pointages créent-ils automatiquement des work_sessions pour la paie ? → A: Les deux : auto-création à la sortie + possibilité d'ajustement manuel par le gestionnaire
- Q: Le client/site est-il obligatoire lors du pointage ? → A: Oui, client obligatoire à l'arrivée
- Q: Les listes de pièces et actions sont-elles configurables ? → A: Listes pré-définies + gestionnaire peut en ajouter

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Créer et lier un compte staff (Priority: P1)

En tant que gestionnaire, je veux pouvoir créer un compte utilisateur pour un membre du personnel et le lier à sa fiche existante, afin qu'il puisse accéder à son propre espace de travail.

**Why this priority**: C'est le prérequis fondamental pour toutes les autres fonctionnalités. Sans compte lié, le personnel ne peut pas accéder au portail.

**Independent Test**: Créer un compte pour Marie (femme de ménage existante) et vérifier qu'elle peut se connecter à son espace personnel.

**Acceptance Scenarios**:

1. **Given** un membre du personnel "Marie" existe sans compte, **When** le gestionnaire crée un compte avec son email, **Then** Marie reçoit une invitation par email pour définir son mot de passe
2. **Given** Marie a reçu l'invitation, **When** elle définit son mot de passe, **Then** elle peut se connecter et voir son espace personnel
3. **Given** un membre du personnel a déjà un compte lié, **When** le gestionnaire essaie de créer un autre compte, **Then** un message indique qu'un compte existe déjà

---

### User Story 2 - Pointer (entrée/sortie) (Priority: P1)

En tant que membre du personnel, je veux pouvoir enregistrer mon heure d'arrivée et de départ, afin que mes heures de travail soient automatiquement comptabilisées.

**Why this priority**: Le pointage est la fonction principale pour le suivi du temps de travail. Il alimente directement le calcul des heures et donc la paie.

**Independent Test**: Marie peut pointer à 8h00, puis pointer sa sortie à 12h00, et voir ses 4 heures enregistrées dans son historique.

**Acceptance Scenarios**:

1. **Given** Marie est connectée à son espace, **When** elle appuie sur "Pointer mon arrivée" et sélectionne un client, **Then** l'heure d'arrivée est enregistrée avec le client associé
2. **Given** Marie a pointé son arrivée, **When** elle appuie sur "Pointer ma sortie", **Then** l'heure de sortie est enregistrée et la durée calculée
3. **Given** Marie n'a pas pointé sa sortie hier, **When** elle se connecte aujourd'hui, **Then** un avertissement lui demande de régulariser son pointage manquant
4. **Given** Marie a déjà pointé son arrivée aujourd'hui, **When** elle essaie de pointer à nouveau son arrivée, **Then** un message lui indique qu'elle est déjà pointée comme présente

---

### User Story 3 - Enregistrer une action par pièce (Priority: P2)

En tant que membre du personnel, je veux pouvoir enregistrer les actions que j'ai effectuées sur chaque pièce/zone, afin que mon travail soit détaillé et vérifiable.

**Why this priority**: Complète le pointage avec le détail du travail effectué. Permet au gestionnaire de suivre précisément ce qui a été fait.

**Independent Test**: Marie peut sélectionner "Salle de bain" et indiquer "Nettoyage complet" avec une durée estimée.

**Acceptance Scenarios**:

1. **Given** Marie est pointée comme présente, **When** elle sélectionne une pièce et une action, **Then** l'action est enregistrée avec l'heure
2. **Given** Marie a effectué plusieurs actions, **When** elle consulte son historique du jour, **Then** elle voit la liste chronologique de toutes ses actions
3. **Given** le gestionnaire consulte le travail de Marie, **When** il ouvre le détail d'une journée, **Then** il voit toutes les pièces et actions effectuées

---

### User Story 4 - Consulter son historique (Priority: P2)

En tant que membre du personnel, je veux pouvoir consulter l'historique de mes pointages et actions, afin de vérifier mes heures et mon travail.

**Why this priority**: Donne de la transparence au personnel sur ses propres données. Réduit les litiges potentiels.

**Independent Test**: Marie peut voir l'historique de la semaine passée avec le total d'heures travaillées.

**Acceptance Scenarios**:

1. **Given** Marie a travaillé cette semaine, **When** elle consulte son historique, **Then** elle voit ses pointages jour par jour avec les totaux
2. **Given** Marie consulte un jour spécifique, **When** elle clique sur ce jour, **Then** elle voit le détail des actions par pièce
3. **Given** Marie consulte son historique, **When** elle filtre par semaine ou mois, **Then** elle voit le total des heures pour la période

---

### User Story 5 - Vue gestionnaire du travail effectué (Priority: P3)

En tant que gestionnaire, je veux voir le détail du travail effectué par mon personnel, afin de suivre la productivité et la qualité du service.

**Why this priority**: Complète les fonctionnalités côté gestionnaire. Permet le suivi et le contrôle qualité.

**Independent Test**: Le gestionnaire peut voir que Marie a nettoyé 3 salles de bain et 2 cuisines aujourd'hui.

**Acceptance Scenarios**:

1. **Given** plusieurs employés ont travaillé aujourd'hui, **When** le gestionnaire consulte le tableau de bord, **Then** il voit un résumé des heures et actions par employé
2. **Given** le gestionnaire sélectionne un employé, **When** il consulte son détail, **Then** il voit l'historique complet des pointages et actions
3. **Given** le gestionnaire consulte une période, **When** il exporte les données, **Then** il obtient un rapport des heures et actions

---

### Edge Cases

- Que se passe-t-il si un employé oublie de pointer sa sortie ? → Notification au gestionnaire + rappel à l'employé
- Comment gérer un pointage erroné ? → Le gestionnaire peut corriger les pointages manuellement
- Que faire si l'employé perd l'accès à son compte ? → Le gestionnaire peut réinitialiser le mot de passe
- Comment gérer le travail sur plusieurs sites dans la même journée ? → Chaque site/client peut être sélectionné lors de l'enregistrement d'une action

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre au gestionnaire de créer un compte utilisateur pour un membre du personnel existant
- **FR-002**: Le système DOIT envoyer une invitation par email au personnel pour définir son mot de passe
- **FR-003**: Le système DOIT permettre au personnel de pointer son arrivée (avec sélection obligatoire du client) et sa sortie
- **FR-004**: Le système DOIT calculer automatiquement la durée travaillée à partir des pointages
- **FR-004b**: Le système DOIT créer automatiquement une work_session (prestation) lorsque l'employé pointe sa sortie, avec possibilité d'ajustement manuel par le gestionnaire
- **FR-005**: Le système DOIT permettre au personnel d'enregistrer des actions effectuées sur des pièces/zones
- **FR-006**: Le système DOIT afficher l'historique des pointages et actions au personnel
- **FR-007**: Le système DOIT permettre au gestionnaire de voir le détail du travail de chaque employé
- **FR-008**: Le système DOIT détecter les pointages manquants et alerter l'employé et le gestionnaire
- **FR-009**: Le système DOIT permettre au gestionnaire de corriger les pointages manuellement
- **FR-010**: Le système DOIT séparer l'accès personnel (vue limitée à ses propres données) de l'accès gestionnaire (vue complète)
- **FR-011**: Le système DOIT fournir des listes pré-définies de pièces et d'actions, extensibles par le gestionnaire

### Key Entities

- **Compte Personnel (Staff Account)**: Lien entre un utilisateur (auth) et une fiche staff_member existante. Permet l'authentification et définit le niveau d'accès (personnel vs gestionnaire).

- **Pointage (Time Entry)**: Enregistrement d'une entrée ou sortie avec horodatage. Lié à un membre du personnel et optionnellement à un client/site.

- **Action sur Pièce (Room Action)**: Enregistrement d'une action effectuée (nettoyage, rangement, etc.) sur une pièce/zone (salle de bain, cuisine, etc.) avec horodatage. Lié à un pointage ou une journée de travail.

- **Pièce/Zone (Room)**: Référentiel des types de pièces disponibles. Inclut des valeurs pré-définies (salle de bain, cuisine, chambre, salon, etc.) extensibles par le gestionnaire.

- **Type d'Action (Action Type)**: Référentiel des actions possibles selon le poste. Inclut des valeurs pré-définies (nettoyage, repassage, jardinage, etc.) extensibles par le gestionnaire.

## Assumptions

- L'email du personnel est requis et valide pour créer un compte
- Le personnel accède au portail depuis un smartphone ou tablette
- Les actions disponibles dépendent du poste de l'employé (femme de ménage → nettoyage, jardinier → jardinage)
- Un pointage par jour par défaut (pas de gestion des pauses multiples dans un premier temps)
- Les pièces et actions sont pré-définies avec possibilité d'extension par le gestionnaire (pas de personnalisation par client)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le personnel peut créer son compte et se connecter en moins de 5 minutes après réception de l'invitation
- **SC-002**: Le pointage (entrée ou sortie) prend moins de 10 secondes
- **SC-003**: L'enregistrement d'une action sur une pièce prend moins de 15 secondes
- **SC-004**: 95% des pointages sont effectués sans intervention du gestionnaire (pas de correction nécessaire)
- **SC-005**: Le gestionnaire peut consulter le travail d'un employé pour une journée en moins de 30 secondes
- **SC-006**: Le personnel consulte son historique hebdomadaire en moins de 20 secondes
