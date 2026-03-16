# Feature Specification: Consultez les statistiques

**Feature Branch**: `006-view-statistics`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Consultez les statistiques il faut terminer cette partie la"

## Contexte

L'application MaidManager dispose déjà d'un tableau de bord (Home.tsx) avec quelques statistiques de base (personnel actif, interventions planifiées, en cours, terminées ce mois). Le bouton "Voir les rapports" sur la page d'accueil n'est pas encore fonctionnel.

Cette fonctionnalité crée une page de statistiques détaillées permettant aux utilisateurs de visualiser :
- L'activité du personnel (heures travaillées, missions accomplies)
- L'évolution des interventions et missions dans le temps
- Les tendances et performances

**Données disponibles** :
- `staff_members` : Personnel (actif/inactif, position, date de début)
- `schedule_entries` : Interventions planifiées (date, heure début/fin, statut)
- `tasks` : Missions (échéance, priorité, statut)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vue d'ensemble des statistiques (Priority: P1)

L'utilisateur peut accéder à une page de statistiques avec un résumé global de son activité : nombre total d'interventions, missions, personnel, et taux de complétion.

**Why this priority**: C'est la fonctionnalité principale - sans vue d'ensemble, la page n'a pas de valeur.

**Independent Test**: Depuis la page d'accueil, cliquer sur "Voir les rapports" et voir le tableau de bord statistiques avec les métriques clés.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est connecté et a des données, **When** il clique sur "Voir les rapports", **Then** il voit une page avec les statistiques globales (total interventions, missions, personnel actif).
2. **Given** l'utilisateur n'a aucune donnée, **When** il accède à la page statistiques, **Then** il voit un état vide avec un message explicatif et des liens pour créer du contenu.
3. **Given** des interventions et missions existent, **When** l'utilisateur consulte les statistiques, **Then** il voit le taux de complétion (terminées / total).

---

### User Story 2 - Statistiques par période (Priority: P1)

L'utilisateur peut filtrer les statistiques par période (cette semaine, ce mois, les 3 derniers mois, cette année, toutes).

**Why this priority**: Permet de comparer l'activité entre différentes périodes, essentiel pour le suivi.

**Independent Test**: Sélectionner "Ce mois" et voir uniquement les statistiques de février 2026.

**Acceptance Scenarios**:

1. **Given** l'utilisateur est sur la page statistiques, **When** il sélectionne "Ce mois", **Then** les statistiques affichées concernent uniquement le mois en cours.
2. **Given** l'utilisateur a sélectionné "Cette semaine", **When** il change pour "Cette année", **Then** les statistiques se mettent à jour immédiatement.
3. **Given** aucune donnée n'existe pour la période sélectionnée, **When** l'utilisateur consulte, **Then** un message "Aucune donnée pour cette période" s'affiche.

---

### User Story 3 - Statistiques par membre du personnel (Priority: P2)

L'utilisateur peut voir les statistiques détaillées pour chaque membre du personnel : nombre d'interventions, missions assignées, taux de complétion.

**Why this priority**: Permet de suivre la charge de travail et la performance individuelle.

**Independent Test**: Consulter la section "Par membre" et voir les statistiques de Marie Dupont.

**Acceptance Scenarios**:

1. **Given** plusieurs membres du personnel existent, **When** l'utilisateur consulte la section par membre, **Then** il voit une liste avec les statistiques de chaque membre.
2. **Given** un membre n'a aucune intervention ni mission, **When** l'utilisateur consulte ses statistiques, **Then** il voit "0 interventions, 0 missions".
3. **Given** un membre a des missions en retard, **When** l'utilisateur consulte ses statistiques, **Then** il voit un indicateur visuel d'alerte.

---

### User Story 4 - Graphique d'évolution (Priority: P2)

L'utilisateur peut voir un graphique montrant l'évolution de l'activité dans le temps (interventions/missions par semaine ou par mois).

**Why this priority**: Visualisation qui aide à identifier les tendances et la saisonnalité.

**Independent Test**: Voir un graphique à barres ou courbe montrant l'activité des dernières semaines.

**Acceptance Scenarios**:

1. **Given** des données existent sur plusieurs semaines, **When** l'utilisateur consulte le graphique, **Then** il voit l'évolution hebdomadaire de l'activité.
2. **Given** l'utilisateur sélectionne "Cette année", **When** le graphique s'affiche, **Then** il montre l'évolution mensuelle.
3. **Given** pas assez de données pour un graphique, **When** l'utilisateur consulte, **Then** un message suggère de créer plus de contenu.

---

### User Story 5 - Export des statistiques (Priority: P3)

L'utilisateur peut exporter les statistiques au format CSV pour analyse externe.

**Why this priority**: Fonctionnalité avancée pour les utilisateurs qui veulent analyser les données ailleurs.

**Independent Test**: Cliquer sur "Exporter" et télécharger un fichier CSV avec les données.

**Acceptance Scenarios**:

1. **Given** des statistiques sont affichées, **When** l'utilisateur clique sur "Exporter CSV", **Then** un fichier CSV se télécharge avec les données de la période sélectionnée.
2. **Given** aucune donnée n'existe, **When** l'utilisateur tente d'exporter, **Then** un message indique qu'il n'y a rien à exporter.

---

### Edge Cases

- Que se passe-t-il si un membre du personnel est supprimé ? Ses statistiques historiques restent visibles avec mention "Membre supprimé".
- Comment gérer les interventions annulées ? Elles sont comptées séparément et n'affectent pas le taux de complétion.
- Que se passe-t-il pour les missions en retard ? Elles sont comptées comme non terminées et mises en évidence.
- Comment gérer les interventions sans heure de fin ? On ne calcule pas de durée pour celles-ci.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST afficher le nombre total d'interventions planifiées, terminées et annulées
- **FR-002**: System MUST afficher le nombre total de missions par statut (en attente, en cours, terminées)
- **FR-003**: System MUST afficher le nombre de membres du personnel actifs
- **FR-004**: System MUST calculer et afficher le taux de complétion (interventions et missions terminées / total)
- **FR-005**: System MUST permettre de filtrer par période (semaine, mois, 3 mois, année, tout)
- **FR-006**: System MUST afficher les statistiques par membre du personnel
- **FR-007**: System MUST afficher un graphique d'évolution de l'activité
- **FR-008**: System MUST isoler les statistiques par utilisateur (chaque utilisateur ne voit que ses données)
- **FR-009**: System MUST afficher un état vide explicatif si aucune donnée n'existe
- **FR-010**: System SHOULD permettre l'export CSV des données
- **FR-011**: System MUST mettre en évidence les missions en retard dans les statistiques par membre

### Key Entities

- **Statistiques globales** : Agrégations calculées en temps réel à partir des données existantes
  - Pas de nouvelle table - calculs côté client à partir de schedule_entries, tasks, staff_members
- **Période de filtre** : Enum pour les périodes de temps (week, month, quarter, year, all)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: L'utilisateur peut accéder aux statistiques en moins de 2 clics depuis la page d'accueil
- **SC-002**: Les statistiques s'affichent en moins de 2 secondes après chargement
- **SC-003**: Le changement de période met à jour les statistiques instantanément (sans rechargement)
- **SC-004**: 100% des données sont correctement isolées par utilisateur
- **SC-005**: Le graphique d'évolution est lisible et compréhensible sans légende complexe

## Assumptions

- Les statistiques sont calculées côté client (pas de vues SQL) pour simplifier
- Les données existantes (schedule_entries, tasks) sont suffisantes pour calculer les statistiques
- Le graphique utilise une librairie légère compatible SolidJS ou du CSS/SVG simple
- L'export CSV est généré côté client (pas besoin de backend supplémentaire)
- La période par défaut est "Ce mois"
