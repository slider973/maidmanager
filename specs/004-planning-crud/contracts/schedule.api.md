# API Contract: Schedule Service

**Feature**: 004-planning-crud
**Date**: 2026-02-06

Ce document définit les contrats de l'API pour le service de gestion des interventions. L'implémentation utilise le client Supabase directement (pas de REST API séparée).

## Service: schedule.service.ts

### getScheduleEntries

Récupère toutes les interventions de l'utilisateur connecté avec possibilité de filtrage.

```typescript
interface GetScheduleEntriesParams {
  filters?: ScheduleFilters;
}

interface GetScheduleEntriesResult {
  data: ScheduleEntryWithStaff[] | null;
  error: string | null;
}

async function getScheduleEntries(
  params?: GetScheduleEntriesParams
): Promise<GetScheduleEntriesResult>
```

**Behavior**:
- Retourne les interventions triées par `scheduled_date` ASC, `start_time` ASC
- Inclut les informations du membre du personnel via jointure
- Si `staff_member_id` est null, `staff_member` sera null dans le résultat
- Applique les filtres si fournis

**Filters**:
| Filter | Supabase Query |
|--------|----------------|
| `staffMemberId` | `.eq('staff_member_id', value)` |
| `status` | `.eq('status', value)` |
| `dateFrom` | `.gte('scheduled_date', value)` |
| `dateTo` | `.lte('scheduled_date', value)` |

**Errors**:
- `"Échec du chargement des interventions"` - Erreur Supabase

---

### getScheduleEntry

Récupère une intervention spécifique par ID.

```typescript
async function getScheduleEntry(
  id: string
): Promise<{ data: ScheduleEntryWithStaff | null; error: string | null }>
```

**Behavior**:
- Retourne l'intervention avec les infos du membre
- RLS garantit que seul le propriétaire peut accéder

**Errors**:
- `"Intervention non trouvée"` - ID invalide ou pas d'accès
- `"Échec du chargement de l'intervention"` - Erreur Supabase

---

### createScheduleEntry

Crée une nouvelle intervention.

```typescript
async function createScheduleEntry(
  data: ScheduleEntryInsert
): Promise<{ data: ScheduleEntry | null; error: string | null }>
```

**Behavior**:
- Ajoute automatiquement `user_id` depuis `auth.uid()`
- Valide que `staff_member_id` appartient à l'utilisateur
- Retourne l'intervention créée

**Validation** (côté client avant appel):
- `staff_member_id`: requis
- `scheduled_date`: requis, format YYYY-MM-DD
- `start_time`: requis, format HH:MM
- `end_time`: si fourni, doit être > start_time
- `description`: requis, max 500 caractères

**Errors**:
- `"Membre du personnel invalide"` - staff_member_id n'appartient pas à l'utilisateur
- `"Échec de la création de l'intervention"` - Erreur Supabase

---

### updateScheduleEntry

Met à jour une intervention existante.

```typescript
async function updateScheduleEntry(
  id: string,
  data: ScheduleEntryUpdate
): Promise<{ data: ScheduleEntry | null; error: string | null }>
```

**Behavior**:
- Met à jour uniquement les champs fournis
- RLS garantit que seul le propriétaire peut modifier
- `updated_at` est mis à jour automatiquement par trigger

**Errors**:
- `"Intervention non trouvée"` - ID invalide ou pas d'accès
- `"Échec de la modification de l'intervention"` - Erreur Supabase

---

### deleteScheduleEntry

Supprime une intervention.

```typescript
async function deleteScheduleEntry(
  id: string
): Promise<{ error: string | null }>
```

**Behavior**:
- Suppression définitive (hard delete)
- RLS garantit que seul le propriétaire peut supprimer

**Errors**:
- `"Échec de la suppression de l'intervention"` - Erreur Supabase

---

### updateScheduleStatus

Raccourci pour changer uniquement le statut d'une intervention.

```typescript
async function updateScheduleStatus(
  id: string,
  status: ScheduleStatus
): Promise<{ error: string | null }>
```

**Behavior**:
- Équivalent à `updateScheduleEntry(id, { status })`
- Utile pour les actions rapides (marquer comme terminé)

**Errors**:
- Mêmes que `updateScheduleEntry`

---

## Store: schedule.store.ts

### State

```typescript
interface ScheduleState {
  entries: ScheduleEntryWithStaff[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  filters: ScheduleFilters;
}
```

### Actions

```typescript
const actions = {
  // Fetch entries with current filters
  fetch(): Promise<void>;

  // Add new entry (optimistic update)
  add(data: ScheduleEntryInsert): Promise<{ data: ScheduleEntry | null; error: string | null }>;

  // Update entry (optimistic update)
  update(id: string, data: ScheduleEntryUpdate): Promise<{ error: string | null }>;

  // Delete entry (optimistic update)
  delete(id: string): Promise<{ error: string | null }>;

  // Update status shortcut
  markAsCompleted(id: string): Promise<{ error: string | null }>;
  markAsCancelled(id: string): Promise<{ error: string | null }>;

  // Filter management
  setFilters(filters: Partial<ScheduleFilters>): void;
  clearFilters(): void;

  // Reset store
  reset(): void;
}
```

---

## Supabase Query Examples

### Select with join

```typescript
const { data, error } = await supabase
  .from('schedule_entries')
  .select(`
    *,
    staff_member:staff_members (
      id,
      first_name,
      last_name,
      position
    )
  `)
  .order('scheduled_date', { ascending: true })
  .order('start_time', { ascending: true });
```

### Insert

```typescript
const { data, error } = await supabase
  .from('schedule_entries')
  .insert({
    user_id: (await supabase.auth.getUser()).data.user?.id,
    staff_member_id: '...',
    scheduled_date: '2026-02-10',
    start_time: '09:00',
    description: 'Ménage salon'
  })
  .select()
  .single();
```

### Update status

```typescript
const { error } = await supabase
  .from('schedule_entries')
  .update({ status: 'completed' })
  .eq('id', entryId);
```

### Delete

```typescript
const { error } = await supabase
  .from('schedule_entries')
  .delete()
  .eq('id', entryId);
```

### Filter by date range

```typescript
const { data, error } = await supabase
  .from('schedule_entries')
  .select('*, staff_member:staff_members(*)')
  .gte('scheduled_date', '2026-02-01')
  .lte('scheduled_date', '2026-02-28')
  .eq('status', 'scheduled');
```
