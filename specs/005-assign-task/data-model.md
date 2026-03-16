# Data Model: Assignez une mission

**Feature**: 005-assign-task
**Date**: 2026-02-06

## Entity: tasks

Représente une mission/tâche assignée à un membre du personnel.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identifiant unique |
| `user_id` | UUID | NOT NULL, DEFAULT auth.uid(), REFERENCES auth.users(id) ON DELETE CASCADE | Propriétaire de la mission |
| `staff_member_id` | UUID | REFERENCES staff_members(id) ON DELETE SET NULL | Membre assigné (null si supprimé) |
| `title` | TEXT | NOT NULL | Titre court de la mission |
| `description` | TEXT | NULL | Description détaillée (optionnel) |
| `due_date` | DATE | NOT NULL | Date d'échéance |
| `priority` | TEXT | NOT NULL, DEFAULT 'normal', CHECK (priority IN ('low', 'normal', 'high', 'urgent')) | Niveau de priorité |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK (status IN ('pending', 'in_progress', 'completed')) | Statut de la mission |
| `notes` | TEXT | NULL | Notes additionnelles |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de dernière modification |

### Indexes

```sql
-- Index pour les requêtes par utilisateur (RLS)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index pour les requêtes par échéance (tri principal)
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Index pour les requêtes par membre du personnel
CREATE INDEX idx_tasks_staff_member_id ON tasks(staff_member_id);

-- Index pour les filtres par statut
CREATE INDEX idx_tasks_status ON tasks(status);

-- Index pour les filtres par priorité
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Index composite pour les requêtes courantes (user + due_date)
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tasks
CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own tasks
CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own tasks
CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own tasks
CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

### Trigger: updated_at

```sql
-- Réutilise la fonction existante update_updated_at_column()
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Migration SQL complète

```sql
-- Migration: 20260207_create_tasks
-- Description: Create tasks table for mission assignment feature

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID REFERENCES staff_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_staff_member_id ON tasks(staff_member_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tasks_insert_own" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tasks_update_own" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tasks_delete_own" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger (function already exists from staff_members)
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## TypeScript Types

```typescript
// Priority enum values
export const TASK_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const;
export type TaskPriority = typeof TASK_PRIORITIES[number];

// Priority labels in French
export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
  urgent: 'Urgente'
};

// Priority colors for UI
export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'var(--color-sage)',
  normal: 'var(--color-navy)',
  high: 'var(--color-gold)',
  urgent: 'var(--color-rose)'
};

// Status enum values
export const TASK_STATUSES = ['pending', 'in_progress', 'completed'] as const;
export type TaskStatus = typeof TASK_STATUSES[number];

// Status labels in French
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  completed: 'Terminé'
};

// Database row type
export interface Task {
  id: string;
  user_id: string;
  staff_member_id: string | null;
  title: string;
  description: string | null;
  due_date: string;  // ISO date string YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended type with staff member info for display
export interface TaskWithStaff extends Task {
  staff_member: {
    id: string;
    first_name: string;
    last_name: string;
    position: string;
  } | null;
}

// Insert type (id, user_id, timestamps auto-generated)
export interface TaskInsert {
  staff_member_id: string;
  title: string;
  description?: string | null;
  due_date: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  notes?: string | null;
}

// Update type (all fields optional)
export interface TaskUpdate {
  staff_member_id?: string | null;
  title?: string;
  description?: string | null;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  notes?: string | null;
}

// Filter type for queries
export interface TaskFilters {
  staffMemberId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
}
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `staff_member_id` | Required for new tasks | "Veuillez sélectionner un membre du personnel" |
| `title` | Required, non-empty, max 200 chars | "Le titre est requis" / "Titre trop long (max 200 caractères)" |
| `due_date` | Required, valid date | "La date d'échéance est requise" |
| `description` | Optional, max 1000 chars | "Description trop longue (max 1000 caractères)" |
| `priority` | Must be in enum | "Priorité invalide" |
| `status` | Must be in enum | "Statut invalide" |

## State Transitions

```
                    +---> [In Progress] ---> [Completed]
                   /
[Pending] --------+
                   \
                    +---> [Completed] (direct completion possible)

Any status can return to [Pending] (reopening)
```

- **Pending** (en attente): Mission créée, pas encore commencée
- **In Progress** (en cours): Mission en cours de réalisation
- **Completed** (terminé): Mission accomplie

## Relationships

```
auth.users (1) ----< (N) tasks
staff_members (1) ----< (N) tasks

Note: staff_members.user_id doit correspondre à tasks.user_id
      pour que la jointure fonctionne avec RLS
```

## Computed Fields (client-side)

| Field | Calculation | Use |
|-------|-------------|-----|
| `isOverdue` | `due_date < today && status !== 'completed'` | Badge "En retard" |
| `isUrgent` | `due_date === today && status !== 'completed'` | Badge "Urgent" |
| `daysUntilDue` | `due_date - today` | Affichage "Dans X jours" |
