# Research: Assignez une mission

**Feature**: 005-assign-task
**Date**: 2026-02-06

## Pattern Analysis: Existing Implementation

### Decision: Follow Existing schedule_entries Pattern

**Rationale**: Le projet a déjà un pattern bien établi pour les entités similaires (schedule_entries, staff_members) qui fonctionne et respecte la constitution. Réutiliser ce pattern assure la cohérence et réduit la courbe d'apprentissage.

**Pattern identifié**:
1. Table Supabase avec RLS policies (isolation par user_id)
2. Service TypeScript avec CRUD + validation
3. Store SolidJS avec createStore pour le state management
4. Composants: Card, List, Form, Filters
5. Tests colocalisés avec les fichiers source

**Alternatives considérées**:
- Redux-like store: Rejeté - trop complexe pour l'échelle du projet
- Zustand: Rejeté - pas de support natif SolidJS
- Direct Supabase sans store: Rejeté - difficile à tester et gérer le state

## Data Model Decisions

### Decision: Table `tasks` distincte de `schedule_entries`

**Rationale**:
- Les missions ont une sémantique différente (échéance vs horaire précis)
- Les champs sont différents (priorité au lieu de start_time/end_time)
- Séparation claire des responsabilités
- Évite la pollution du modèle existant

**Alternatives considérées**:
- Ajouter un champ `type` à schedule_entries: Rejeté - complexifie les requêtes et la logique
- Héritage/polymorphisme: Rejeté - over-engineering pour le besoin

### Decision: Priorité comme enum TEXT

**Rationale**:
- Pattern cohérent avec status dans schedule_entries
- CHECK constraint assure l'intégrité
- Pas besoin de table de référence pour 4 valeurs fixes

**Valeurs**: `'low' | 'normal' | 'high' | 'urgent'`

### Decision: Statut simplifié à 3 états

**Rationale**:
- `pending` (en attente): État initial
- `in_progress` (en cours): Travail commencé
- `completed` (terminé): Travail fini

**Alternatives considérées**:
- Ajouter `cancelled`: Rejeté initialement - peut être ajouté si besoin (YAGNI)
- Workflow complexe avec validation: Rejeté - over-engineering

## UI/UX Decisions

### Decision: Page dédiée `/tasks` vs modal

**Rationale**:
- Cohérent avec `/staff` et `/schedule`
- Plus d'espace pour la liste et les filtres
- Navigation prévisible

### Decision: Indicateurs visuels pour urgence

**Rationale**:
- Missions en retard: Badge rouge "En retard"
- Missions urgentes (aujourd'hui): Badge orange "Urgent"
- Priorité haute/urgente: Icône ou bordure colorée

**Implémentation**:
- Calcul côté client basé sur `due_date` vs `Date.now()`
- CSS classes conditionnelles

## Technical Findings

### Supabase RLS Pattern (verified)

```sql
-- Pattern standard utilisé dans le projet
CREATE POLICY "tasks_select_own" ON tasks
  FOR SELECT USING (auth.uid() = user_id);
```

### Store Pattern (verified from schedule.store.ts)

```typescript
// Pattern à réutiliser
interface TaskState {
  tasks: TaskWithStaff[]
  loading: boolean
  error: string | null
  initialized: boolean
  filters: TaskFilters
}

function createTaskStore() {
  const [state, setState] = createStore<TaskState>({...})
  // Actions: fetch, add, update, delete, setFilters, clearFilters
}
```

### Service Pattern (verified from schedule.service.ts)

```typescript
// Pattern à réutiliser
export interface ServiceResult<T = void> {
  data?: T
  error: string | null
}

export function validateTask(data: TaskInsert): string | null {
  // Validation côté client
}

export async function createTask(data: TaskInsert): Promise<ServiceResult<Task>> {
  // Validation + Supabase insert
}
```

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| Comment distinguer des schedule_entries? | Table séparée avec champs différents |
| Quels niveaux de priorité? | 4 niveaux: low, normal, high, urgent |
| Quels statuts? | 3 statuts: pending, in_progress, completed |
| Comment afficher l'urgence? | Calcul client-side basé sur due_date |
| Pattern de routing? | Page dédiée /tasks comme /staff et /schedule |

## Dependencies

- Aucune nouvelle dépendance npm requise
- Réutilisation des composants UI existants (LoadingButton, ConfirmDialog, Toast)
- Migration Supabase standard
