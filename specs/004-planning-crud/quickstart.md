# Quickstart: Gestion du Planning

**Feature**: 004-planning-crud
**Date**: 2026-02-06

Guide rapide pour démarrer l'implémentation de la gestion du planning.

## Prérequis

- Node.js 18+
- npm installé
- Accès au projet Supabase configuré (variables dans `.env.local`)
- Feature `002-add-staff` et `003-delete-staff` fonctionnelles

## 1. Migration Base de Données

Appliquer la migration via le dashboard Supabase ou la CLI:

```sql
-- Coller le contenu de data-model.md > Migration SQL complète
```

Ou via Supabase CLI:
```bash
supabase db push
```

## 2. Génération des Types

Après la migration, régénérer les types TypeScript:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/supabase.ts
```

Puis ajouter les types dans `src/lib/types/database.ts`:

```typescript
// Ajouter après les types StaffMember existants

export const SCHEDULE_STATUSES = ['scheduled', 'completed', 'cancelled'] as const;
export type ScheduleStatus = typeof SCHEDULE_STATUSES[number];

export const STATUS_LABELS: Record<ScheduleStatus, string> = {
  scheduled: 'Planifié',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export interface ScheduleEntry {
  id: string;
  user_id: string;
  staff_member_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string | null;
  description: string;
  status: ScheduleStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ... autres types du data-model.md
```

## 3. Structure des Fichiers

Créer les fichiers suivants:

```bash
mkdir -p src/components/schedule
touch src/components/schedule/ScheduleForm.tsx
touch src/components/schedule/ScheduleForm.test.tsx
touch src/components/schedule/ScheduleList.tsx
touch src/components/schedule/ScheduleList.test.tsx
touch src/components/schedule/ScheduleCard.tsx
touch src/services/schedule.service.ts
touch src/services/schedule.service.test.ts
touch src/stores/schedule.store.ts
touch src/pages/Schedule.tsx
```

## 4. Ordre d'Implémentation (TDD)

Suivre cet ordre pour respecter le TDD:

### Phase 1: Service (P1)

1. **Test**: `schedule.service.test.ts` - Tests pour `getScheduleEntries`
2. **Impl**: `schedule.service.ts` - Fonction `getScheduleEntries`
3. **Test**: Tests pour `createScheduleEntry`
4. **Impl**: Fonction `createScheduleEntry`

### Phase 2: Store (P1)

5. **Impl**: `schedule.store.ts` - Pattern identique à `staff.store.ts`

### Phase 3: Composants Liste (P1)

6. **Test**: `ScheduleList.test.tsx` - Affichage liste vide, avec données
7. **Impl**: `ScheduleList.tsx` + `ScheduleCard.tsx`

### Phase 4: Formulaire (P1)

8. **Test**: `ScheduleForm.test.tsx` - Validation, soumission
9. **Impl**: `ScheduleForm.tsx`

### Phase 5: Page (P1)

10. **Impl**: `Schedule.tsx` - Assemblage des composants
11. **Route**: Ajouter dans `App.tsx`

### Phase 6: CRUD complet (P2)

12. **Test + Impl**: Modification (formulaire pré-rempli)
13. **Test + Impl**: Suppression (confirmation dialog)
14. **Test + Impl**: Changement de statut

### Phase 7: Filtres (P3)

15. **Impl**: `ScheduleFilters.tsx`
16. **Intégration**: Connecter au store

## 5. Commandes Utiles

```bash
# Développement
npm run dev

# Tests en watch mode
npm run test

# Tests une fois
npm run test:run

# Build de vérification
npm run build
```

## 6. Patterns à Suivre

### Service Pattern (copier de staff.service.ts)

```typescript
export async function getScheduleEntries(): Promise<{
  data: ScheduleEntryWithStaff[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabase
      .from('schedule_entries')
      .select(`*, staff_member:staff_members(id, first_name, last_name, position)`)
      .order('scheduled_date')
      .order('start_time');

    if (error) throw error;
    return { data, error: null };
  } catch (err) {
    console.error('Failed to get schedule entries:', err);
    return { data: null, error: 'Échec du chargement des interventions' };
  }
}
```

### Store Pattern (copier de staff.store.ts)

```typescript
function createScheduleStore() {
  const [state, setState] = createStore<ScheduleState>({
    entries: [],
    loading: false,
    error: null,
    initialized: false,
    filters: {},
  });

  // ... actions identiques au staff store
}

export const scheduleStore = createRoot(createScheduleStore);
```

### Test Pattern (copier de StaffList.test.tsx)

```typescript
vi.mock('../../services/schedule.service', () => ({
  getScheduleEntries: vi.fn(),
  // ...
}));

describe('ScheduleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scheduleStore.actions.reset();
  });

  it('should show empty state when no entries', async () => {
    // ...
  });
});
```

## 7. Checklist de Validation

Avant de considérer la feature terminée:

- [ ] Migration appliquée en production
- [ ] Types TypeScript générés et utilisés
- [ ] Tous les tests passent (`npm run test:run`)
- [ ] Build réussit sans erreurs (`npm run build`)
- [ ] RLS testé manuellement (2 users différents)
- [ ] Accessibilité vérifiée (navigation clavier, labels)
- [ ] Messages d'erreur en français
- [ ] Toast de confirmation pour chaque action CRUD
