# Research: Ajouter du Personnel

**Feature**: 002-add-staff
**Date**: 2026-02-06

## Research Summary

Cette fonctionnalité suit les patterns établis dans le projet (authentification, session management). Aucune nouvelle technologie n'est requise.

## Decisions

### 1. Structure de données pour les postes

**Decision**: Enum stocké dans la table avec valeur "other" pour personnalisation

**Rationale**:
- Liste de postes prédéfinis dans le code TypeScript (type union)
- Colonne `position` de type TEXT avec contrainte CHECK
- Permet d'ajouter facilement de nouveaux postes via migration
- Simplicité vs table de référence séparée

**Alternatives considered**:
- Table `positions` séparée: Trop complexe pour 7 valeurs fixes
- ENUM PostgreSQL: Moins flexible pour modifications

### 2. Validation du numéro de téléphone

**Decision**: Validation basique côté client, stockage en format libre

**Rationale**:
- Les utilisateurs gèrent leur propre personnel (pas d'appels automatisés)
- Format international variable (France, international)
- Validation stricte ajouterait friction sans valeur ajoutée

**Alternatives considered**:
- Bibliothèque libphonenumber: Trop lourd pour le cas d'usage
- Regex strict E.164: Trop restrictif pour UX

### 3. Gestion des emails en doublon

**Decision**: Permettre les doublons d'email entre membres du personnel

**Rationale**:
- Les membres du personnel ne sont pas des utilisateurs système
- Un email peut être partagé (famille, pas d'email personnel)
- L'unicité n'apporte pas de valeur métier

**Alternatives considered**:
- Unicité par utilisateur: Contrainte arbitraire sans bénéfice

### 4. Pattern de composants

**Decision**: Suivre le pattern auth existant (Form + List + Card)

**Rationale**:
- Cohérence avec SessionList, LoginForm existants
- Pattern prouvé dans le projet
- Réutilisation des composants UI (LoadingButton, Toast)

**Alternatives considered**:
- Composant monolithique: Viole principe IV (< 150 lignes)
- Modal pour formulaire: Ajoute complexité, moins accessible

### 5. Stockage des notes

**Decision**: Champ TEXT sans limite explicite

**Rationale**:
- Cas d'usage flexible (rappels, préférences, historique)
- PostgreSQL gère efficacement les TEXT longs
- Pas de besoin de recherche full-text pour MVP

**Alternatives considered**:
- VARCHAR(500): Limite arbitraire, frustrant pour utilisateurs
- JSONB pour structure: Over-engineering pour notes libres

## Best Practices Applied

### SolidJS Forms
- Signals pour chaque champ (`createSignal`)
- Validation inline avec messages d'erreur
- `LoadingButton` pour état de soumission
- Reset du formulaire après succès

### Supabase RLS
- Policy `staff_members_select_own`: `auth.uid() = user_id`
- Policy `staff_members_insert_own`: `auth.uid() = user_id`
- Policy `staff_members_update_own`: `auth.uid() = user_id`
- Policy `staff_members_delete_own`: `auth.uid() = user_id`

### Testing Strategy
- Unit tests pour validation (staff.service.ts)
- Component tests avec mocks Supabase
- Tests d'intégration pour flows complets

## Resolved Clarifications

| Question | Resolution |
|----------|------------|
| Format téléphone international | Stockage libre, validation basique |
| Email en doublon | Autorisé (pas d'unicité) |
| Caractères spéciaux noms | UTF-8 natif, pas de restriction |
| Annulation formulaire | Confirmation si champs modifiés |
