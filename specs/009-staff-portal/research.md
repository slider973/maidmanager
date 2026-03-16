# Research: Portail Personnel

**Feature**: 009-staff-portal
**Date**: 2026-02-07

## Research Topics

### 1. Gestion des rôles staff vs manager

**Decision**: Utiliser un champ `staff_account_id` nullable dans `profiles` pour lier un compte auth à une fiche staff. Si `staff_account_id` est non-null, l'utilisateur est un membre du personnel avec accès limité.

**Rationale**:
- Réutilise l'infrastructure auth existante (Supabase Auth)
- Pas besoin de système de rôles complexe
- RLS peut facilement distinguer : `staff_account_id IS NOT NULL` = staff, sinon = manager
- Un manager peut aussi avoir un lien staff (cas du propriétaire qui travaille)

**Alternatives considered**:
- Custom claims JWT : Plus complexe, nécessite Edge Functions
- Table `user_roles` séparée : Over-engineering pour 2 rôles
- Champ `role` enum : Moins flexible si rôles multiples à l'avenir

### 2. Invitation par email pour créer un compte staff

**Decision**: Utiliser `supabase.auth.admin.inviteUserByEmail()` via une Edge Function sécurisée. Le gestionnaire déclenche l'invitation, le staff reçoit un lien magic link pour définir son mot de passe.

**Rationale**:
- Fonctionnalité native Supabase, pas de développement custom
- Sécurisé : l'invitation est signée et temporaire
- UX simple pour le personnel (pas de mot de passe temporaire)

**Alternatives considered**:
- Création manuelle + email custom : Plus de travail, moins sécurisé
- Auto-inscription staff : Risque de comptes non liés, problème de sécurité

### 3. Lien pointage → work_session existant

**Decision**: Créer une table `time_entries` séparée pour les pointages bruts. À la sortie (clock-out), créer automatiquement une `work_session` avec les données calculées. Le gestionnaire peut ajuster via l'interface existante.

**Rationale**:
- Séparation des préoccupations : pointage temps réel vs prestation comptable
- Réutilise le système de paie existant (work_sessions)
- Permet des pointages multiples par jour (si évolution future)
- Historique des pointages bruts conservé pour audit

**Alternatives considered**:
- Modification directe de work_sessions : Mélange données temps réel et comptables
- Pointage sans lien paie : Perte d'intégration, double saisie

### 4. Référentiel pièces et actions

**Decision**: Deux tables `room_types` et `action_types` avec :
- Valeurs pré-définies (seed data)
- Champ `user_id` nullable : NULL = valeur système, non-null = valeur custom du gestionnaire
- Champ `position_filter` sur actions pour filtrer par poste (housekeeper, gardener, etc.)

**Rationale**:
- Extension facile par le gestionnaire
- Filtrage automatique des actions selon le poste du staff
- Pas de configuration par client (simplifie le modèle)

**Alternatives considered**:
- Enum TypeScript uniquement : Pas extensible sans redéploiement
- Configuration par client : Trop complexe pour le MVP

### 5. Détection des pointages manquants

**Decision**: Vérification côté client au login + job Supabase (pg_cron) quotidien pour alerter le gestionnaire.

**Rationale**:
- Feedback immédiat au staff concerné
- Notification gestionnaire pour les cas non résolus
- Pas de blocage du staff (peut quand même pointer)

**Alternatives considered**:
- Vérification uniquement côté serveur : Pas de feedback immédiat
- Blocage du staff : Mauvaise UX, empêche le travail

### 6. Isolation des données via RLS

**Decision**: Politiques RLS basées sur :
- Staff : `staff_account_id = auth.uid()` pour ses propres données
- Manager : `user_id = auth.uid()` (propriétaire des données business)

**Rationale**:
- Sécurité native PostgreSQL, pas de code applicatif
- Impossible de contourner côté client
- Performance : filtrage au niveau DB

**Alternatives considered**:
- Filtrage applicatif : Risque de fuite de données si bug
- Vues séparées : Duplication du schéma

## Technical Decisions Summary

| Topic | Decision |
|-------|----------|
| Auth/Rôles | Champ `staff_account_id` dans profiles |
| Invitation | Supabase `inviteUserByEmail()` via Edge Function |
| Pointage | Table `time_entries` séparée → crée `work_session` à la sortie |
| Référentiels | Tables `room_types` et `action_types` extensibles |
| Alertes | Vérification login + pg_cron quotidien |
| Sécurité | RLS basé sur `staff_account_id` ou `user_id` |
