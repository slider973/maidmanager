# Quickstart: Assignez une mission

**Feature**: 005-assign-task
**Date**: 2026-02-06

## Overview

Cette fonctionnalité ajoute un système de gestion de missions/tâches dans MaidManager, permettant aux utilisateurs d'assigner des tâches à leur personnel avec une échéance et une priorité.

## Prerequisites

- Compte Supabase configuré
- Personnel (staff_members) déjà existant
- Environnement de développement local fonctionnel

## Quick Setup

### 1. Appliquer la migration

```bash
# Copier la migration vers le dossier supabase
cp specs/005-assign-task/contracts/migration.sql supabase/migrations/20260207_create_tasks.sql

# Ou appliquer directement via le SQL Editor Supabase
```

### 2. Structure des fichiers à créer

```
src/
├── components/tasks/
│   ├── TaskCard.tsx          # Carte d'affichage d'une mission
│   ├── TaskCard.test.tsx
│   ├── TaskList.tsx          # Liste des missions
│   ├── TaskList.test.tsx
│   ├── TaskForm.tsx          # Formulaire création/édition
│   ├── TaskForm.test.tsx
│   ├── TaskFilters.tsx       # Filtres par statut/priorité/membre
│   └── TaskFilters.test.tsx
├── pages/
│   └── Tasks.tsx             # Page principale
├── services/
│   ├── task.service.ts       # CRUD operations
│   └── task.service.test.ts
└── stores/
    └── task.store.ts         # State management
```

### 3. Ajouter les types dans database.ts

```typescript
// Dans src/lib/types/database.ts, ajouter:
import type { Task, TaskWithStaff, TaskInsert, TaskUpdate, TaskFilters } from './task.types'

// Ajouter dans l'interface Database:
tasks: {
  Row: Task
  Insert: TaskInsert
  Update: TaskUpdate
}
```

### 4. Ajouter la route

```typescript
// Dans src/App.tsx
import Tasks from './pages/Tasks'

// Dans les routes:
<Route path="/tasks" component={() => (
  <ProtectedRoute>
    <Tasks />
  </ProtectedRoute>
)} />
```

### 5. Lier depuis Home.tsx

Le bouton "Nouvelle tâche" existe déjà dans Home.tsx, il suffit de le transformer en lien:

```tsx
// Remplacer le div par un A (link)
<A href="/tasks" class="action-card">
  ...
  <span class="action-title">Nouvelle tâche</span>
  <span class="action-desc">Assignez une mission</span>
</A>
```

## Key Patterns

### Service Pattern

```typescript
// task.service.ts
export async function createTask(data: TaskInsert): Promise<ServiceResult<Task>> {
  const validationError = validateTask(data)
  if (validationError) {
    return { error: validationError }
  }

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return { data: task, error: null }
  } catch (err) {
    console.error('Failed to create task:', err)
    return { error: "Échec de la création de la mission" }
  }
}
```

### Store Pattern

```typescript
// task.store.ts
function createTaskStore() {
  const [state, setState] = createStore<TaskState>({
    tasks: [],
    loading: false,
    error: null,
    initialized: false,
    filters: {},
  })

  const actions = {
    async fetch() { ... },
    async add(data: TaskInsert) { ... },
    async update(id: string, data: TaskUpdate) { ... },
    async delete(id: string) { ... },
    setFilters(filters: Partial<TaskFilters>) { ... },
    clearFilters() { ... },
    reset() { ... },
  }

  return { state, actions }
}

export const taskStore = createRoot(createTaskStore)
```

### Component Pattern

```tsx
// TaskCard.tsx
interface TaskCardProps {
  task: TaskWithStaff
  onEdit?: (task: TaskWithStaff) => void
  onDelete?: (task: TaskWithStaff) => void
  onStatusChange?: (task: TaskWithStaff, status: TaskStatus) => void
}

export const TaskCard: Component<TaskCardProps> = (props) => {
  const isOverdue = () => isTaskOverdue(props.task)
  const isUrgent = () => isTaskUrgent(props.task)

  return (
    <div class={`task-card ${isOverdue() ? 'task-card-overdue' : ''}`}>
      {/* ... */}
    </div>
  )
}
```

## Validation Messages (French)

```typescript
const validationMessages = {
  staffMemberRequired: 'Veuillez sélectionner un membre du personnel',
  titleRequired: 'Le titre est requis',
  titleTooLong: 'Titre trop long (max 200 caractères)',
  dueDateRequired: "La date d'échéance est requise",
  descriptionTooLong: 'Description trop longue (max 1000 caractères)',
}
```

## Testing Approach

1. **Service tests first** (TDD)
   - validateTask function
   - createTask, getTasks, updateTask, deleteTask
   - updateTaskStatus

2. **Component tests**
   - TaskCard displays task info correctly
   - TaskList handles loading/empty/error states
   - TaskForm validates and submits
   - TaskFilters calls onFiltersChange

3. **Integration**
   - Tasks page loads and fetches data
   - Full CRUD workflow

## CSS Classes to Add

```css
/* Task card variants */
.task-card-overdue { border-left: 3px solid var(--color-rose); }
.task-card-urgent { border-left: 3px solid var(--color-gold); }
.task-card-completed { opacity: 0.7; }

/* Priority badges */
.task-priority { ... }
.task-priority-low { ... }
.task-priority-normal { ... }
.task-priority-high { ... }
.task-priority-urgent { ... }

/* Status badges */
.task-status { ... }
.task-status-pending { ... }
.task-status-in_progress { ... }
.task-status-completed { ... }
```

## Common Issues

1. **RLS Policy Error**: Assurez-vous que `DEFAULT auth.uid()` est défini sur `user_id`
2. **Staff member not found**: Vérifiez que le staff appartient au même user
3. **Date format**: Utilisez toujours ISO format `YYYY-MM-DD`
