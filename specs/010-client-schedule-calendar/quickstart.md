# Quickstart: Calendrier des Passages Client

**Feature**: 010-client-schedule-calendar
**Date**: 2026-02-08

## Prérequis

- Node.js 18+
- Accès à la base Supabase (db.wefamily.ch)
- Variables d'environnement configurées (`.env.local`)

## Installation

```bash
# Aucune nouvelle dépendance requise
npm install
```

## Migration à appliquer

```sql
-- Ajouter la politique RLS pour le staff
CREATE POLICY "schedule_entries_staff_select_own" ON schedule_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN staff_members sm ON p.staff_account_id = sm.id
      WHERE p.id = auth.uid()
      AND sm.id = schedule_entries.staff_member_id
    )
  );
```

## Démarrage

```bash
npm run dev
# App disponible sur http://localhost:5173
```

## Test manuel - Vue Manager

1. Se connecter en tant que manager (ex: `jojo@test.fr`)
2. Aller sur `/clients`
3. Cliquer sur un client
4. Cliquer sur le bouton "Calendrier" (icône calendrier)
5. Vérifier:
   - Le calendrier mensuel s'affiche
   - Les interventions du mois apparaissent sur les bonnes dates
   - Naviguer vers le mois suivant/précédent fonctionne
   - Cliquer sur une intervention affiche les détails

## Test manuel - Vue Staff

1. Se connecter en tant que staff (ex: `test@jojo.fr`)
2. Aller sur le portail (`/portal`)
3. Accéder à la section calendrier d'un client
4. Vérifier:
   - Seules ses propres interventions sont visibles
   - Le nom du staff n'est pas affiché (implicite)
   - Cliquer sur une intervention affiche les détails

## Scénarios de test

### Calendrier vide

1. Créer un nouveau client sans interventions
2. Accéder à son calendrier
3. Vérifier: message "Aucune intervention ce mois-ci"

### Navigation entre mois

1. Ouvrir le calendrier d'un client
2. Cliquer sur "mois suivant"
3. Vérifier: le mois change et les interventions du nouveau mois s'affichent
4. Cliquer sur "mois précédent" 2 fois
5. Vérifier: retour au mois initial

### Aujourd'hui mis en évidence

1. Ajouter une intervention pour aujourd'hui
2. Ouvrir le calendrier
3. Vérifier: la date du jour est visuellement différente (surlignée)

### Détails intervention

1. Cliquer sur une intervention dans le calendrier
2. Vérifier le popup contient:
   - Date et heure
   - Description
   - Nom de l'employé (vue manager uniquement)
   - Statut
   - Notes (si présentes)
3. Vue manager: vérifier le bouton "Modifier" est présent
4. Vue staff: vérifier le bouton "Modifier" est absent

## Fichiers clés

```
src/
├── components/calendar/
│   ├── CalendarView.tsx        # Composant principal
│   ├── CalendarDay.tsx         # Cellule jour
│   ├── CalendarEvent.tsx       # Événement
│   └── EventDetailModal.tsx    # Modal détails
├── pages/
│   └── ClientSchedule.tsx      # Page calendrier (manager)
├── services/
│   └── schedule-calendar.service.ts
└── lib/types/
    └── calendar.types.ts
```

## Dépannage

### Les interventions ne s'affichent pas (staff)

Vérifier que la politique RLS `schedule_entries_staff_select_own` est bien créée.

### Erreur "permission denied"

Vérifier que l'utilisateur est bien authentifié et que le profil est lié au staff_member.

### Le calendrier est lent

Vérifier l'index `idx_schedule_entries_client_id` existe sur la table.
