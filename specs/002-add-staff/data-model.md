# Data Model: Ajouter du Personnel

**Feature**: 002-add-staff
**Date**: 2026-02-06

## Entity: staff_members

Représente un membre du personnel de maison associé à un utilisateur.

### Schema

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Identifiant unique |
| `user_id` | UUID | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | Propriétaire du membre |
| `first_name` | TEXT | NOT NULL | Prénom |
| `last_name` | TEXT | NOT NULL | Nom de famille |
| `position` | TEXT | NOT NULL, CHECK (position IN ('housekeeper', 'gardener', 'cook', 'driver', 'nanny', 'guard', 'other')) | Poste occupé |
| `position_custom` | TEXT | NULL | Nom personnalisé si position = 'other' |
| `phone` | TEXT | NULL | Numéro de téléphone |
| `email` | TEXT | NULL | Adresse email |
| `start_date` | DATE | NULL | Date de début d'emploi |
| `notes` | TEXT | NULL | Notes libres |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Statut actif/inactif |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de création |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Date de dernière modification |

### Indexes

```sql
CREATE INDEX idx_staff_members_user_id ON staff_members(user_id);
CREATE INDEX idx_staff_members_position ON staff_members(position);
CREATE INDEX idx_staff_members_is_active ON staff_members(is_active);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;

-- Users can only see their own staff
CREATE POLICY "staff_members_select_own" ON staff_members
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own staff
CREATE POLICY "staff_members_insert_own" ON staff_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update their own staff
CREATE POLICY "staff_members_update_own" ON staff_members
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can only delete their own staff
CREATE POLICY "staff_members_delete_own" ON staff_members
  FOR DELETE USING (auth.uid() = user_id);
```

### Trigger: updated_at

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## TypeScript Types

```typescript
// Position enum values
export const STAFF_POSITIONS = [
  'housekeeper',
  'gardener',
  'cook',
  'driver',
  'nanny',
  'guard',
  'other'
] as const;

export type StaffPosition = typeof STAFF_POSITIONS[number];

// Position labels in French
export const POSITION_LABELS: Record<StaffPosition, string> = {
  housekeeper: 'Femme de ménage',
  gardener: 'Jardinier',
  cook: 'Cuisinier',
  driver: 'Chauffeur',
  nanny: 'Nounou',
  guard: 'Gardien',
  other: 'Autre'
};

// Database row type
export interface StaffMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  position: StaffPosition;
  position_custom: string | null;
  phone: string | null;
  email: string | null;
  start_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Insert type (id, user_id, timestamps auto-generated)
export interface StaffMemberInsert {
  first_name: string;
  last_name: string;
  position: StaffPosition;
  position_custom?: string | null;
  phone?: string | null;
  email?: string | null;
  start_date?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

// Update type (all fields optional except those being updated)
export interface StaffMemberUpdate {
  first_name?: string;
  last_name?: string;
  position?: StaffPosition;
  position_custom?: string | null;
  phone?: string | null;
  email?: string | null;
  start_date?: string | null;
  notes?: string | null;
  is_active?: boolean;
}
```

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `first_name` | Required, non-empty | "Le prénom est requis" |
| `last_name` | Required, non-empty | "Le nom est requis" |
| `position` | Required, must be in enum | "Le poste est requis" |
| `position_custom` | Required if position = 'other' | "Veuillez préciser le poste" |
| `email` | Valid email format if provided | "Format d'email invalide" |
| `start_date` | Valid date if provided | "Date invalide" |

## State Transitions

```
[New] --create--> [Active] --deactivate--> [Inactive]
                     ^                          |
                     +-----activate-------------+
```

- **Active**: Membre actif, visible par défaut dans la liste
- **Inactive**: Membre désactivé, masqué par défaut (filtre)
