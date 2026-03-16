# Feature Specification: Suivi des paiements du personnel

**Feature Branch**: `008-staff-payments`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "L'idée est de surtout enregistrer chaque action qui a été réalisée par soit la femme de ménage soit le jardinier, d'enregistrer le tarif horaire et de créer un statut des règlements que je dois leur faire"

## Clarifications

### Session 2026-02-07

- Q: Lien entre prestations et interventions planifiées ? → A: Hybride - Possibilité de créer une prestation depuis une intervention complétée OU manuellement sans lien avec le planning
- Q: Marquage des prestations comme payées ? → A: Paiement global - Le paiement diminue le solde global de l'employé, sans affectation à des prestations spécifiques

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enregistrer une prestation réalisée (Priority: P1)

En tant qu'employeur, je veux enregistrer chaque prestation effectuée par mon personnel (femme de ménage ou jardinier) avec les heures travaillées et le tarif applicable, afin de suivre précisément ce que je leur dois.

**Why this priority**: C'est la fonctionnalité fondamentale qui permet de calculer les montants dus. Sans enregistrement des prestations, aucun suivi de paiement n'est possible.

**Independent Test**: Créer une nouvelle prestation pour un membre du personnel avec date, durée et tarif horaire, puis vérifier que le montant dû est calculé automatiquement.

**Acceptance Scenarios**:

1. **Given** une intervention planifiée marquée comme "complétée", **When** je clique sur "Enregistrer la prestation", **Then** je peux saisir les heures réellement travaillées et le tarif horaire applicable (les infos de l'intervention sont pré-remplies)
2. **Given** la page des prestations, **When** je clique sur "Nouvelle prestation", **Then** je peux créer une prestation manuellement sans lien avec le planning
3. **Given** une prestation avec 3 heures à 15€/h, **When** j'enregistre la prestation, **Then** le système calcule automatiquement 45€ comme montant dû
4. **Given** un membre du personnel avec un tarif horaire par défaut de 12€, **When** je crée une nouvelle prestation pour cette personne, **Then** le tarif est pré-rempli avec 12€ mais reste modifiable

---

### User Story 2 - Consulter le solde dû à chaque employé (Priority: P1)

En tant qu'employeur, je veux voir le montant total que je dois à chaque membre de mon personnel, afin de savoir combien je dois leur payer.

**Why this priority**: Essentiel pour avoir une vue d'ensemble des dettes envers le personnel et planifier les paiements.

**Independent Test**: Accéder à la page du personnel et voir le solde dû à côté de chaque nom, avec un total général.

**Acceptance Scenarios**:

1. **Given** plusieurs prestations non payées pour Marie (femme de ménage), **When** je consulte la liste du personnel, **Then** je vois le montant total dû à Marie
2. **Given** un membre du personnel avec toutes ses prestations payées, **When** je consulte son profil, **Then** le solde affiché est de 0€
3. **Given** des prestations pour plusieurs membres du personnel, **When** je consulte le tableau de bord, **Then** je vois le total général dû à tout le personnel

---

### User Story 3 - Enregistrer un paiement à un employé (Priority: P1)

En tant qu'employeur, je veux enregistrer les paiements que je fais à mon personnel, afin de maintenir un historique précis et mettre à jour les soldes.

**Why this priority**: Sans possibilité d'enregistrer les paiements, le système ne peut pas refléter la réalité des règlements effectués.

**Independent Test**: Enregistrer un paiement de 100€ à un employé et vérifier que son solde dû diminue de 100€.

**Acceptance Scenarios**:

1. **Given** un solde dû de 150€ pour Jean, **When** j'enregistre un paiement de 100€, **Then** son solde dû devient 50€
2. **Given** un paiement à enregistrer, **When** je remplis le formulaire, **Then** je peux saisir le montant, la date et un mode de paiement optionnel (espèces, virement, chèque)
3. **Given** un paiement enregistré, **When** je consulte l'historique des paiements, **Then** je vois la date, le montant et le mode de paiement

---

### User Story 4 - Définir le tarif horaire par défaut d'un employé (Priority: P2)

En tant qu'employeur, je veux définir un tarif horaire par défaut pour chaque membre du personnel, afin de ne pas avoir à le saisir à chaque prestation.

**Why this priority**: Améliore l'ergonomie mais n'est pas bloquant - on peut toujours saisir le tarif manuellement.

**Independent Test**: Modifier le tarif horaire d'un employé et vérifier qu'il est automatiquement proposé lors de la prochaine prestation.

**Acceptance Scenarios**:

1. **Given** la fiche d'un membre du personnel, **When** je modifie son tarif horaire par défaut à 15€, **Then** ce tarif est sauvegardé
2. **Given** un tarif par défaut de 15€ pour Marie, **When** je crée une nouvelle prestation pour Marie, **Then** le champ tarif est pré-rempli avec 15€

---

### User Story 5 - Consulter l'historique des prestations et paiements (Priority: P2)

En tant qu'employeur, je veux consulter l'historique complet des prestations et paiements pour un employé, afin de vérifier les détails et résoudre d'éventuels litiges.

**Why this priority**: Important pour la traçabilité mais pas nécessaire pour le fonctionnement de base.

**Independent Test**: Accéder au profil d'un employé et voir la liste chronologique de toutes ses prestations et tous ses paiements.

**Acceptance Scenarios**:

1. **Given** un employé avec plusieurs prestations et paiements, **When** je consulte son historique, **Then** je vois toutes les entrées triées par date (plus récentes en premier)
2. **Given** l'historique d'un employé, **When** je regarde une ligne de prestation, **Then** je vois la date, la description, les heures, le tarif et le montant
3. **Given** l'historique d'un employé, **When** je regarde une ligne de paiement, **Then** je vois la date, le montant et le mode de paiement

---

### User Story 6 - Filtrer les prestations par période et employé (Priority: P3)

En tant qu'employeur, je veux filtrer les prestations par période (mois, année) et par employé, afin de consulter facilement l'historique.

**Why this priority**: Fonctionnalité de confort qui facilite la gestion au quotidien.

**Independent Test**: Appliquer un filtre par mois et vérifier que seules les prestations de ce mois apparaissent.

**Acceptance Scenarios**:

1. **Given** des prestations sur plusieurs mois, **When** je filtre par "Février 2026", **Then** je ne vois que les prestations de février 2026
2. **Given** des prestations pour plusieurs employés, **When** je filtre par "Marie", **Then** je ne vois que les prestations de Marie

---

### Edge Cases

- Que se passe-t-il si je saisis un nombre d'heures négatif ou nul ? → Message d'erreur, les heures doivent être positives
- Que se passe-t-il si je saisis un tarif horaire de 0€ ? → Accepté (bénévolat possible), affichage d'un avertissement
- Que se passe-t-il si j'enregistre un paiement supérieur au solde dû ? → Accepté, le solde devient négatif (avance sur salaire)
- Que se passe-t-il si je supprime une prestation déjà payée ? → Demande de confirmation, le paiement associé reste dans l'historique
- Que se passe-t-il si je modifie le tarif horaire par défaut ? → Les prestations existantes conservent leur tarif, seules les nouvelles utilisent le nouveau tarif

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre d'enregistrer une prestation avec : membre du personnel, date, durée (heures et minutes), description, tarif horaire — soit manuellement, soit à partir d'une intervention complétée (mode hybride)
- **FR-002**: Le système DOIT calculer automatiquement le montant d'une prestation (durée × tarif horaire)
- **FR-003**: Le système DOIT afficher le solde total dû à chaque membre du personnel
- **FR-004**: Le système DOIT permettre d'enregistrer un paiement avec : membre du personnel, date, montant, mode de paiement optionnel
- **FR-005**: Le système DOIT mettre à jour automatiquement le solde dû après chaque prestation ou paiement
- **FR-006**: Le système DOIT permettre de définir un tarif horaire par défaut pour chaque membre du personnel
- **FR-007**: Le système DOIT pré-remplir le tarif horaire avec le tarif par défaut de l'employé lors de la création d'une prestation
- **FR-008**: Le système DOIT conserver l'historique complet des prestations et paiements pour chaque employé
- **FR-009**: Le système DOIT permettre de filtrer les prestations par période (mois/année) et par employé
- **FR-010**: Le système DOIT afficher un récapitulatif global du montant total dû à l'ensemble du personnel
- **FR-011**: Le système DOIT empêcher la saisie d'heures négatives ou nulles
- **FR-012**: Le système DOIT afficher un avertissement si le tarif horaire est de 0€
- **FR-013**: Le système DOIT permettre les paiements supérieurs au solde dû (solde négatif = avance)

### Key Entities

- **Prestation (Work Session)**: Représente un travail effectué par un membre du personnel. Attributs : date, durée, description, tarif horaire appliqué, montant calculé, lien optionnel avec une intervention planifiée, lien avec le membre du personnel
- **Paiement (Payment)**: Représente un règlement effectué à un membre du personnel (paiement global, non affecté à des prestations spécifiques). Attributs : date, montant, mode de paiement, lien avec le membre du personnel
- **Membre du personnel (Staff Member)**: Extension de l'entité existante avec : tarif horaire par défaut, solde dû (calculé = total prestations - total paiements)

## Assumptions

- Le tarif horaire par défaut est de 0€ si non défini (l'utilisateur doit le saisir manuellement)
- Les montants sont en euros (€), arrondis au centime
- Les heures peuvent être saisies en format décimal (ex: 1.5 pour 1h30) ou en heures/minutes séparées
- Un paiement peut couvrir plusieurs prestations ou être une avance
- Les modes de paiement suggérés sont : Espèces, Virement, Chèque (liste non exhaustive, champ texte libre)
- L'historique est conservé indéfiniment
- La suppression d'un membre du personnel conserve son historique pour traçabilité

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut enregistrer une prestation complète en moins de 30 secondes
- **SC-002**: Le solde dû à chaque employé est visible en un coup d'œil sur la liste du personnel
- **SC-003**: L'utilisateur peut enregistrer un paiement et voir le solde mis à jour immédiatement
- **SC-004**: 100% des calculs de montants (prestation et solde) sont exacts au centime près
- **SC-005**: L'historique complet des 6 derniers mois est accessible en moins de 3 clics
- **SC-006**: Le total général dû à tout le personnel est affiché sur le tableau de bord
