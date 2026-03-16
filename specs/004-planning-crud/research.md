# Research: Gestion du Planning

**Feature**: 004-planning-crud
**Date**: 2026-02-06

## Decisions

### 1. Nom de la table

**Decision**: `schedule_entries`

**Rationale**: Nom explicite en anglais suivant la convention existante (`staff_members`, `user_sessions`). "Entries" reflète mieux la nature unitaire de chaque intervention qu'un terme générique comme "schedules".

**Alternatives considered**:
- `interventions`: Trop spécifique au français
- `appointments`: Implique des rendez-vous avec des tiers
- `tasks`: Pourrait être confondu avec une future table de tâches génériques

### 2. Structure des statuts

**Decision**: Enum avec 3 valeurs: `scheduled`, `completed`, `cancelled`

**Rationale**: Couvre les cas d'usage essentiels sans complexité. Termes anglais pour cohérence avec le code. Statut `cancelled` préféré à la suppression pour traçabilité.

**Alternatives considered**:
- Soft delete avec `deleted_at`: Plus complexe, pas nécessaire pour MVP
- Statut `in_progress`: Sur-ingénierie pour une app de planning domestique
- Workflow complexe (pending → confirmed → completed): YAGNI

### 3. Gestion de la relation staff_member supprimé

**Decision**: Conserver `staff_member_id` même si le membre est supprimé, afficher "Membre supprimé" dans l'UI

**Rationale**: Permet de garder l'historique des interventions. La FK avec `ON DELETE SET NULL` permet de détecter les membres supprimés.

**Alternatives considered**:
- CASCADE DELETE: Perte de données historiques
- Empêcher suppression si interventions: Friction utilisateur excessive
- Copier le nom dans l'intervention: Dénormalisation excessive

### 4. Format des heures

**Decision**: Colonnes `start_time` et `end_time` en type `TIME` (HH:MM:SS)

**Rationale**: Stockage natif PostgreSQL, simplifie les comparaisons et validations. Combiné avec `scheduled_date` (DATE) pour flexibilité.

**Alternatives considered**:
- `TIMESTAMPTZ` unique: Plus complexe pour les requêtes par date seule
- Stockage en minutes depuis minuit: Moins lisible, pas de validation native

### 5. Pattern de store SolidJS

**Decision**: Suivre exactement le pattern `staff.store.ts` existant

**Rationale**: Cohérence du codebase. Le pattern avec `createStore` + `createSignal` pour fetchPromise fonctionne bien pour éviter les fetches dupliqués.

**Alternatives considered**:
- createResource: Moins de contrôle sur le cache et les mutations
- Store externe (zustand-like): Dépendance supplémentaire inutile

## Best Practices Applied

### Supabase avec SolidJS

- Utiliser `supabase.from().select()` avec types générés
- RLS policies pour isolation des données par user_id
- Pas de realtime pour MVP (polling implicite via refetch manuel)

### Formulaires SolidJS

- Controlled inputs avec `createSignal` pour chaque champ
- Validation côté client avant soumission
- Affichage des erreurs inline sous chaque champ

### Filtres avec query params

- Stocker l'état des filtres dans le store (pas URL pour MVP)
- Filtrage côté serveur via `.eq()`, `.gte()`, `.lte()` Supabase
- Option "Réinitialiser" pour revenir à l'état par défaut
