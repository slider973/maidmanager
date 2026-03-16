# Research: Calendrier des Passages Client

**Feature**: 010-client-schedule-calendar
**Date**: 2026-02-08

## 1. Structure de données existante

### Decision: Utiliser `schedule_entries` existante

**Rationale**: La table `schedule_entries` contient déjà tous les champs nécessaires:
- `scheduled_date` (DATE) - date de l'intervention
- `start_time` (TIME) - heure de début
- `end_time` (TIME) - heure de fin (nullable)
- `client_id` (UUID) - référence au client
- `staff_member_id` (UUID) - employé assigné
- `status` (TEXT) - 'scheduled', 'completed', 'cancelled'
- `description` (TEXT) - description de l'intervention
- `notes` (TEXT) - notes additionnelles

**Alternatives considered**:
- Créer une nouvelle table dédiée au calendrier → Rejeté: duplication inutile, schedule_entries suffit
- Ajouter des colonnes supplémentaires → Non nécessaire, structure actuelle complète

## 2. Accès RLS pour le staff

### Decision: Ajouter une politique RLS pour le staff

**Rationale**: Actuellement, seul le manager (user_id) peut voir les schedule_entries. Le staff doit pouvoir voir ses propres interventions.

**Politique à ajouter**:
```sql
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

**Alternatives considered**:
- Passer par le backend avec service_role → Rejeté: moins sécurisé, viole le principe Supabase-Native
- Créer une vue SQL → Rejeté: plus complexe, RLS directe préférable

## 3. Composant calendrier

### Decision: Composant calendrier custom léger

**Rationale**: Un composant calendrier mensuel simple en SolidJS (~100 lignes) est suffisant. Pas besoin de bibliothèque externe comme FullCalendar (trop lourd, 150KB+).

**Fonctionnalités du composant**:
- Grille 7 colonnes (jours de la semaine)
- Navigation mois précédent/suivant
- Mise en évidence du jour actuel
- Événements cliquables par jour
- État vide avec message

**Alternatives considered**:
- FullCalendar → Rejeté: bundle trop lourd (150KB+), dépasse la contrainte de 200KB
- date-fns uniquement → Pourrait être utile pour le formatage, évaluer le bundle size
- Moment.js → Rejeté: obsolète, recommandé d'utiliser date-fns ou natif

### Decision: Utiliser l'API Date native

**Rationale**: Les opérations de date requises sont simples (obtenir jours du mois, naviguer). L'API Date native suffit, pas besoin de date-fns pour cette feature.

## 4. Performance - Chargement des données

### Decision: Charger les interventions par plage de dates (mois)

**Rationale**: Charger uniquement les interventions du mois affiché réduit le payload et améliore les performances.

**Requête optimisée**:
```typescript
const getScheduleForMonth = async (clientId: string, year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return supabase
    .from('schedule_entries')
    .select(`
      id, scheduled_date, start_time, end_time, description, status, notes,
      staff_member:staff_members(id, first_name, last_name)
    `)
    .eq('client_id', clientId)
    .gte('scheduled_date', startDate.toISOString().split('T')[0])
    .lte('scheduled_date', endDate.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true });
};
```

**Alternatives considered**:
- Charger toutes les interventions du client → Rejeté: mauvaises performances pour clients avec beaucoup d'historique
- Cache côté client avec SWR/React Query → Non nécessaire pour MVP, les données changent peu fréquemment

## 5. Navigation et routes

### Decision: Ajouter une route `/clients/:clientId/schedule` pour le manager

**Rationale**: Cohérent avec le pattern existant (`/clients/:clientId/rooms`, `/clients/:clientId/instructions`).

**Routes**:
- Manager: `/clients/:clientId/schedule` → page ClientSchedule.tsx
- Staff: Intégré dans le portail avec un composant ClientCalendar

**Alternatives considered**:
- Modal calendrier sur la page clients → Rejeté: moins flexible, URL non bookmarkable
- Onglet sur la fiche client → Pourrait être ajouté plus tard, route dédiée pour MVP

## 6. Affichage des détails d'intervention

### Decision: Modal/Popup pour les détails

**Rationale**: Un popup au clic sur un événement permet de voir les détails sans quitter la vue calendrier. Pattern UX standard pour les calendriers.

**Contenu du popup**:
- Date et heure
- Nom de l'employé (vue manager)
- Client (pour rappel)
- Description
- Notes
- Statut
- Lien "Modifier" (manager uniquement) → vers `/schedule?edit={id}`

**Alternatives considered**:
- Page dédiée pour chaque intervention → Rejeté: trop de navigation pour une simple consultation
- Panneau latéral → Plus complexe, popup suffit pour MVP

## Résumé des décisions

| Aspect | Décision | Impact |
|--------|----------|--------|
| Données | Utiliser schedule_entries existante | Pas de migration de schéma |
| RLS | Ajouter politique staff_select | 1 migration SQL |
| UI Calendrier | Composant custom léger | ~4 fichiers composants |
| Performance | Chargement par mois | Query optimisée |
| Navigation | Route /clients/:clientId/schedule | 1 route + 1 page |
| Détails | Modal popup | 1 composant modal |
