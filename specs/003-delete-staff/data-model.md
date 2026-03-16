# Data Model: Supprimer les membres du personnel

**Feature**: 003-delete-staff
**Date**: 2026-02-06

## Entities

### StaffMember (Existing)

Aucune modification de schéma requise. La table `staff_members` existe déjà avec la structure appropriée.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| first_name | TEXT | Prénom du membre |
| last_name | TEXT | Nom du membre |
| position | TEXT | Poste (enum) |
| position_custom | TEXT | Poste personnalisé si position='other' |
| phone | TEXT | Numéro de téléphone |
| email | TEXT | Adresse email |
| start_date | DATE | Date de début |
| notes | TEXT | Notes supplémentaires |
| is_active | BOOLEAN | Statut actif/inactif |
| created_at | TIMESTAMPTZ | Date de création |
| updated_at | TIMESTAMPTZ | Date de mise à jour |

### RLS Policies (Existing)

La politique de suppression existe déjà:

```sql
CREATE POLICY "staff_members_delete_own" ON staff_members
  FOR DELETE USING (auth.uid() = user_id);
```

Cette politique garantit que seul le propriétaire peut supprimer ses propres membres.

## State Transitions

### Suppression Flow

```
[StaffMember exists]
       │
       ▼
[User clicks delete]
       │
       ▼
[Confirmation dialog shown]
       │
       ├─── [Cancel] ──► [No change]
       │
       ▼ [Confirm]
       │
[DELETE request sent]
       │
       ├─── [Success] ──► [Member removed from DB and UI]
       │                        │
       │                        ▼
       │                  [Success toast]
       │
       └─── [Error] ──► [Member remains in UI]
                              │
                              ▼
                        [Error toast]
```

## Validation Rules

### Pre-delete Validation

- **id**: Must be a valid UUID
- **Ownership**: User must own the staff member (enforced by RLS)

### Post-delete Behavior

- **UI Update**: List must refresh to remove the deleted member
- **Empty State**: If no members remain, show empty state
- **Toast Notification**: Display success or error message

## Data Integrity

### Cascade Behavior

Currently, `staff_members` has no dependent tables. If future features add related tables (e.g., schedules, tasks assigned to staff), CASCADE DELETE policies should be considered.

### Hard Delete vs Soft Delete

**Decision**: Hard delete (permanent removal)

**Rationale**: As per spec.md assumptions, this feature implements permanent deletion, not soft delete via `is_active` flag. The `is_active` field is reserved for temporarily disabling members without data loss.
