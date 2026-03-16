# Data Model: Calendrier des Passages Client

**Feature**: 010-client-schedule-calendar
**Date**: 2026-02-08

## Entités existantes utilisées

Cette feature n'introduit pas de nouvelles tables. Elle utilise les entités existantes.

### schedule_entries (existante)

Table principale contenant les interventions planifiées.

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| user_id | UUID | Manager propriétaire (FK → auth.users) |
| staff_member_id | UUID | Employé assigné (FK → staff_members, nullable) |
| client_id | UUID | Client concerné (FK → clients, nullable) |
| scheduled_date | DATE | Date de l'intervention |
| start_time | TIME | Heure de début |
| end_time | TIME | Heure de fin (nullable) |
| description | TEXT | Description de l'intervention |
| status | TEXT | 'scheduled' | 'completed' | 'cancelled' |
| notes | TEXT | Notes additionnelles (nullable) |
| amount | DECIMAL(10,2) | Montant facturé (nullable) |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de modification |

**Index existants**:
- `idx_schedule_entries_user_id`
- `idx_schedule_entries_scheduled_date`
- `idx_schedule_entries_staff_member_id`
- `idx_schedule_entries_client_id`
- `idx_schedule_entries_status`
- `idx_schedule_entries_user_date`

### clients (existante)

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| user_id | UUID | Manager propriétaire |
| name | TEXT | Nom du client |
| address | TEXT | Adresse (nullable) |
| email | TEXT | Email (nullable) |
| phone | TEXT | Téléphone (nullable) |

### staff_members (existante)

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Identifiant unique (PK) |
| user_id | UUID | Manager propriétaire |
| first_name | TEXT | Prénom |
| last_name | TEXT | Nom |
| position | TEXT | Poste |

## Relations

```
schedule_entries
    └── staff_member_id → staff_members.id (N:1)
    └── client_id → clients.id (N:1)
    └── user_id → auth.users.id (N:1)

clients
    └── user_id → auth.users.id (N:1)
    └── schedule_entries (1:N via client_id)

staff_members
    └── user_id → auth.users.id (N:1)
    └── schedule_entries (1:N via staff_member_id)
```

## Modifications RLS requises

### Nouvelle politique: schedule_entries_staff_select_own

Permet au staff de voir ses propres interventions.

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

## Types TypeScript

### CalendarEvent (nouveau)

```typescript
interface CalendarEvent {
  id: string
  scheduledDate: string      // YYYY-MM-DD
  startTime: string | null   // HH:MM:SS
  endTime: string | null     // HH:MM:SS
  description: string
  status: 'scheduled' | 'completed' | 'cancelled'
  notes: string | null
  staffMember?: {
    id: string
    firstName: string
    lastName: string
  } | null
}
```

### CalendarDay (nouveau)

```typescript
interface CalendarDay {
  date: Date
  dayOfMonth: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}
```

### CalendarMonth (nouveau)

```typescript
interface CalendarMonth {
  year: number
  month: number              // 0-11
  days: CalendarDay[]
  firstDayOfWeek: number     // 0=Sunday, 1=Monday
}
```

## Requêtes optimisées

### Interventions d'un client pour un mois

```typescript
// Pour le manager: toutes les interventions du client
const getClientScheduleForMonth = async (
  clientId: string,
  year: number,
  month: number
) => {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`

  return supabase
    .from('schedule_entries')
    .select(`
      id,
      scheduled_date,
      start_time,
      end_time,
      description,
      status,
      notes,
      staff_member:staff_members(id, first_name, last_name)
    `)
    .eq('client_id', clientId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .neq('status', 'cancelled')
    .order('scheduled_date')
    .order('start_time')
}
```

### Interventions du staff pour un client (portail)

```typescript
// Pour le staff: ses propres interventions chez un client
// RLS filtre automatiquement par staff_member_id
const getMyScheduleForClientMonth = async (
  clientId: string,
  year: number,
  month: number
) => {
  // Même requête, RLS applique le filtre staff
  return getClientScheduleForMonth(clientId, year, month)
}
```
