# Data Model: Gestion du Planning

**Feature**: 004-planning-crud
**Date**: 2026-02-06

## Entity: schedule_entries

Représente une intervention planifiée pour un membre du personnel.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identifiant unique |
| `user_id` | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Propriétaire de l'intervention |
| `staff_member_id` | UUID | REFERENCES staff_members(id) ON DELETE SET NULL | Membre assigné (null si supprimé) |
| `scheduled_date` | DATE | NOT NULL | Date de l'intervention |
| `start_time` | TIME | NOT NULL | Heure de début |
| `end_time` | TIME | NULL | Heure de fin (optionnelle) |
| `description` | TEXT | NOT NULL | Description de la tâche |
| `status` | TEXT | NOT NULL, DEFAULT 'scheduled', CHECK (status IN ('scheduled', 'completed', 'cancelled')) | Statut de l'intervention |
| `notes` | TEXT | NULL | Notes additionnelles |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de dernière modification |

### Indexes

```sql
-- Index pour les requêtes par utilisateur (RLS)
CREATE INDEX idx_schedule_entries_user_id ON schedule_entries(user_id);

-- Index pour les requêtes par date (tri, filtres)
CREATE INDEX idx_schedule_entries_scheduled_date ON schedule_entries(scheduled_date);

-- Index pour les requêtes par membre du personnel
CREATE INDEX idx_schedule_entries_staff_member_id ON schedule_entries(staff_member_id);

-- Index pour les filtres par statut
CREATE INDEX idx_schedule_entries_status ON schedule_entries(status);

-- Index composite pour les requêtes courantes (user + date)
CREATE INDEX idx_schedule_entries_user_date ON schedule_entries(user_id, scheduled_date);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

-- Users can only see their own schedule entries
CREATE POLICY "schedule_entries_select_own" ON schedule_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own schedule entries
CREATE POLICY "schedule_entries_insert_own" ON schedule_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own schedule entries
CREATE POLICY "schedule_entries_update_own" ON schedule_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own schedule entries
CREATE POLICY "schedule_entries_delete_own" ON schedule_entries
  FOR DELETE USING (auth.uid() = user_id);
```

### Trigger: updated_at

```sql
-- Réutilise la fonction existante update_updated_at_column()
CREATE TRIGGER schedule_entries_updated_at
  BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration SQL complète

```sql
-- Migration: 20260206_create_schedule_entries
-- Description: Create schedule_entries table for planning feature

CREATE TABLE schedule_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_schedule_entries_user_id ON schedule_entries(user_id);
CREATE INDEX idx_schedule_entries_scheduled_date ON schedule_entries(scheduled_date);
CREATE INDEX idx_schedule_entries_staff_member_id ON schedule_entries(staff_member_id);
CREATE INDEX idx_schedule_entries_status ON schedule_entries(status);
CREATE INDEX idx_schedule_entries_user_date ON schedule_entries(user_id, scheduled_date);

-- RLS
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedule_entries_select_own" ON schedule_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "schedule_entries_insert_own" ON schedule_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedule_entries_update_own" ON schedule_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "schedule_entries_delete_own" ON schedule_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger (function already exists from staff_members)
CREATE TRIGGER schedule_entries_updated_at
  BEFORE UPDATE ON schedule_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## TypeScript Types

```typescript
// Status enum values
export const SCHEDULE_STATUSES = ['scheduled', 'completed', 'cancelled'] as const;
export type ScheduleStatus = typeof SCHEDULE_STATUSES[number];

// Status labels in French
export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

// Status colors for UI
export const STATUS_COLORS: Record<ScheduleStatus, string> = {
  scheduled: 'var(--color-primary)',
  completed: 'var(--color-sage)',
  cancelled: 'var(--color-rose)'
};

// Database row type
export interface ScheduleEntry {
  id: string;
  user_id: string;
  staff_member_id: string | null;
  scheduled_date: string;  // ISO date string YYYY-MM-DD
  start_time: string;      // HH:MM:SS
  end_time: string | null; // HH:MM:SS
  description: string;
  status: ScheduleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with staff member info for display
export interface ScheduleEntryWithStaff extends ScheduleEntry {
  staff_member: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
  } | null;
}

// Insert type (id, user_id, timestamps auto-generated)
export interface ScheduleEntryInsert {
  staff_member_id: string;
  scheduled_date: string;
  start_time: string;
  end_time?: string | null;
  description: string;
  status?: ScheduleStatus;
  notes?: string | null;
}

// Update type (all fields optional)
export interface ScheduleEntryUpdate {
  staff_member_id?: string | null;
  scheduled_date?: string;
  start_time?: string;
  end_time?: string | null;
  description?: string;
  status?: ScheduleStatus;
  notes?: string | null;
}

// Filter type for queries
export interface ScheduleFilters {
  staffMemberId?: string;
  status?: ScheduleStatus;
  dateFrom?: string;
  dateTo?: string;
}
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `staff_member_id` | Required for new entries | "Veuillez sélectionner un membre du personnel" |
| `scheduled_date` | Required, valid date | "La date est requise" |
| `start_time` | Required, valid time format | "L'heure de début est requise" |
| `end_time` | If provided, must be after start_time | "L'heure de fin doit être après l'heure de début" |
| `description` | Required, non-empty, max 500 chars | "La description est requise" / "Description trop longue (max 500 caractères)" |
| `status` | Must be in enum | "Statut invalide" |

## State Transitions

```
                    +---> [Completed]
                   /
[Scheduled] ------+
                   \
                    +---> [Cancelled]

[Completed] --modify--> [Scheduled] (réouverture possible)
[Cancelled] --modify--> [Scheduled] (réactivation possible)
```

- **Scheduled**: Intervention planifiée, en attente d'exécution
- **Completed**: Intervention effectuée avec succès
- **Cancelled**: Intervention annulée (conservée pour historique)

## Relationships

```
auth.users (1) ----< (N) schedule_entries
staff_members (1) ----< (N) schedule_entries

Note: staff_members.user_id doit correspondre à schedule_entries.user_id
      pour que la jointure fonctionne avec RLS
```
