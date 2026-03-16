# Feature Specification: Gestion de la facturation

**Feature Branch**: `007-billing`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "il faut la parti facturation aussi"

## Contexte

L'application MaidManager permet de gérer le personnel d'entretien, les interventions planifiées et les missions. La fonctionnalité de facturation vient compléter le cycle de gestion en permettant de générer des factures pour les clients basées sur les interventions effectuées.

**Données existantes** :
- `staff_members` : Personnel effectuant les interventions
- `schedule_entries` : Interventions planifiées (date, heure début/fin, statut, description)
- `tasks` : Missions assignées au personnel

**Nouvelle donnée requise** :
- `clients` : Clients pour lesquels les interventions sont effectuées
- `invoices` : Factures générées pour les clients

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestion des clients (Priority: P1)

L'utilisateur peut créer et gérer une liste de clients pour lesquels les interventions sont effectuées. Chaque client possède des informations de contact et de facturation.

**Why this priority**: Sans clients, impossible de générer des factures. C'est la base du module facturation.

**Independent Test**: Créer un nouveau client avec ses coordonnées et le retrouver dans la liste des clients.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté, **When** il accède à la section clients et clique sur "Ajouter un client", **Then** il voit un formulaire avec les champs : nom, adresse, email, téléphone, notes.
2. **Given** un formulaire client rempli, **When** l'utilisateur valide, **Then** le client apparaît dans la liste des clients.
3. **Given** une liste de clients existe, **When** l'utilisateur consulte la liste, **Then** il voit tous ses clients avec leurs informations principales.
4. **Given** un client existant, **When** l'utilisateur clique dessus, **Then** il peut modifier ou supprimer le client.

---

### User Story 2 - Association client-intervention (Priority: P1)

L'utilisateur peut associer un client à une intervention planifiée. Cela permet de savoir pour quel client chaque intervention est réalisée.

**Why this priority**: Le lien entre client et intervention est essentiel pour générer des factures automatiquement.

**Independent Test**: Lors de la création d'une intervention, sélectionner un client dans la liste déroulante.

**Acceptance Scenarios**:

1. **Given** des clients existent, **When** l'utilisateur crée une intervention, **Then** il peut sélectionner un client dans une liste déroulante.
2. **Given** une intervention existante, **When** l'utilisateur la modifie, **Then** il peut changer ou ajouter un client.
3. **Given** une intervention avec client associé, **When** l'utilisateur consulte l'intervention, **Then** il voit le nom du client.

---

### User Story 3 - Création de facture (Priority: P1)

L'utilisateur peut créer une facture pour un client en sélectionnant les interventions complétées à facturer. La facture calcule automatiquement le total.

**Why this priority**: La création de factures est l'objectif principal de cette fonctionnalité.

**Independent Test**: Sélectionner des interventions complétées pour un client et générer une facture avec le total calculé.

**Acceptance Scenarios**:

1. **Given** un client avec des interventions complétées non facturées, **When** l'utilisateur clique sur "Créer une facture", **Then** il voit la liste des interventions à facturer avec leurs tarifs.
2. **Given** la liste des interventions à facturer, **When** l'utilisateur sélectionne les interventions et valide, **Then** une facture est créée avec un numéro unique.
3. **Given** une facture en création, **When** l'utilisateur la valide, **Then** le total est calculé automatiquement (somme des interventions).
4. **Given** des interventions facturées, **When** l'utilisateur consulte ces interventions, **Then** elles sont marquées comme "facturées".

---

### User Story 4 - Consultation des factures (Priority: P2)

L'utilisateur peut consulter la liste de toutes les factures, filtrer par statut (brouillon, envoyée, payée) et par client.

**Why this priority**: Permet de suivre l'état des factures et les paiements.

**Independent Test**: Accéder à la liste des factures et filtrer pour voir uniquement les factures impayées.

**Acceptance Scenarios**:

1. **Given** des factures existent, **When** l'utilisateur accède à la section facturation, **Then** il voit la liste des factures avec numéro, client, montant, date, statut.
2. **Given** la liste des factures, **When** l'utilisateur filtre par statut "Impayée", **Then** seules les factures impayées s'affichent.
3. **Given** une facture, **When** l'utilisateur clique dessus, **Then** il voit le détail avec la liste des interventions incluses.

---

### User Story 5 - Marquer une facture comme payée (Priority: P2)

L'utilisateur peut marquer une facture comme payée et enregistrer la date de paiement.

**Why this priority**: Permet de suivre les encaissements et avoir une vue claire des impayés.

**Independent Test**: Sélectionner une facture impayée et la marquer comme payée avec la date du jour.

**Acceptance Scenarios**:

1. **Given** une facture avec statut "Envoyée", **When** l'utilisateur clique sur "Marquer comme payée", **Then** il peut saisir la date de paiement.
2. **Given** une date de paiement saisie, **When** l'utilisateur valide, **Then** le statut passe à "Payée" et la date est enregistrée.
3. **Given** une facture payée, **When** l'utilisateur la consulte, **Then** il voit la date de paiement.

---

### User Story 6 - Export PDF de facture (Priority: P3)

L'utilisateur peut télécharger une facture au format PDF pour l'envoyer au client.

**Why this priority**: Fonctionnalité pratique mais non bloquante pour la gestion de base.

**Independent Test**: Cliquer sur "Télécharger PDF" sur une facture et obtenir un fichier PDF lisible.

**Acceptance Scenarios**:

1. **Given** une facture existante, **When** l'utilisateur clique sur "Télécharger PDF", **Then** un fichier PDF est généré avec les informations de la facture.
2. **Given** le PDF généré, **When** l'utilisateur l'ouvre, **Then** il contient : en-tête avec informations entreprise, coordonnées client, détail des prestations, total, mentions légales.

---

### Edge Cases

- Que se passe-t-il si l'utilisateur supprime un client avec des factures existantes ? Les factures restent avec une mention "Client supprimé".
- Que se passe-t-il si l'utilisateur modifie une intervention déjà facturée ? L'intervention reste liée à la facture originale, la modification crée une nouvelle ligne.
- Comment gérer une intervention sans tarif défini ? Le système demande de saisir un montant lors de la facturation.
- Que se passe-t-il si aucune intervention n'est disponible pour facturer ? Message "Aucune intervention à facturer pour ce client".

## Requirements *(mandatory)*

### Functional Requirements

**Gestion des clients**
- **FR-001**: Le système DOIT permettre de créer un client avec : nom (obligatoire), adresse, email, téléphone, notes.
- **FR-002**: Le système DOIT permettre de modifier les informations d'un client existant.
- **FR-003**: Le système DOIT permettre de supprimer un client (avec conservation des factures associées).
- **FR-004**: Le système DOIT afficher la liste des clients avec recherche par nom.

**Association client-intervention**
- **FR-005**: Le système DOIT permettre d'associer un client à une intervention lors de la création ou modification.
- **FR-006**: Le système DOIT permettre de définir un tarif par intervention (montant en euros).

**Gestion des factures**
- **FR-007**: Le système DOIT générer un numéro de facture unique séquentiel (format : FACT-AAAA-NNNN).
- **FR-008**: Le système DOIT permettre de créer une facture en sélectionnant des interventions complétées non facturées.
- **FR-009**: Le système DOIT calculer automatiquement le total d'une facture.
- **FR-010**: Le système DOIT stocker pour chaque facture : numéro, date de création, client, liste des lignes, total, statut.
- **FR-011**: Le système DOIT permettre les statuts de facture : Brouillon, Envoyée, Payée, Annulée.
- **FR-012**: Le système DOIT permettre de marquer une facture comme payée avec date de paiement.
- **FR-013**: Le système DOIT empêcher la modification d'une facture une fois envoyée (sauf annulation).

**Consultation et filtrage**
- **FR-014**: Le système DOIT afficher la liste des factures triées par date décroissante.
- **FR-015**: Le système DOIT permettre de filtrer les factures par statut et par client.
- **FR-016**: Le système DOIT afficher le détail d'une facture avec toutes ses lignes.

**Export**
- **FR-017**: Le système DOIT permettre d'exporter une facture au format PDF.
- **FR-018**: Le PDF DOIT contenir : en-tête avec informations entreprise, coordonnées client, détail des prestations, total HT/TTC, mentions légales.

### Key Entities

- **Client** : Représente un client pour lequel des interventions sont effectuées. Attributs : nom, adresse, email, téléphone, notes, date de création.
- **Invoice (Facture)** : Document regroupant des prestations facturées à un client. Attributs : numéro unique, date, client, statut, total, date de paiement.
- **InvoiceLine (Ligne de facture)** : Une prestation incluse dans une facture. Lien vers l'intervention source, description, montant.

### Assumptions

- Les montants sont en euros (EUR).
- Le taux de TVA applicable sera défini ultérieurement (pour l'instant, afficher HT uniquement).
- L'entreprise utilisatrice a déjà ses informations légales configurées (ou à configurer dans les paramètres - hors scope).
- Un client peut avoir plusieurs factures.
- Une facture concerne un seul client.
- Une intervention ne peut être incluse que dans une seule facture.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut créer un client et une facture en moins de 3 minutes.
- **SC-002**: 100% des interventions complétées associées à un client peuvent être facturées.
- **SC-003**: Le numéro de facture est unique et séquentiel sans doublon.
- **SC-004**: L'utilisateur peut retrouver une facture par client ou par statut en moins de 10 secondes.
- **SC-005**: Le PDF de facture contient toutes les informations légales requises.
- **SC-006**: Le total de la facture correspond exactement à la somme des lignes.
