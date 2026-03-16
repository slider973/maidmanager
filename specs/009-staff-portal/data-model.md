# Data Model: Portail Personnel

**Feature**: 009-staff-portal
**Date**: 2026-02-07

## Entity Relationship Diagram

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    profiles     │      │  staff_members  │      │     clients     │
│  (EXISTING)     │      │   (EXISTING)    │      │   (EXISTING)    │
├─────────────────┤      ├─────────────────┤      ├─────────────────┤
│ id (PK)         │      │ id (PK)         │      │ id (PK)         │
│ staff_account_id│──┐   │ user_id (FK)    │      │ user_id (FK)    │
│ ...             │  │   │ position        │      │ name            │
└─────────────────┘  │   │ ...             │      └────────┬────────┘
                     │   └────────┬────────┘               │
                     │            │                        │
                     └────────────┼────────────────────────┤
                                  │                        │
                     ┌────────────▼────────────┐          │
                     │      time_entries       │          │
                     │        (NEW)            │          │
                     ├─────────────────────────┤          │
                     │ id (PK)                 │          │
                     │ user_id (FK)            │          │
                     │ staff_member_id (FK) ───┤          │
                     │ client_id (FK) ─────────┼──────────┘
                     │ clock_in_at             │
                     │ clock_out_at            │
                     │ duration_minutes        │
                     │ work_session_id (FK)    │───────┐
                     │ status                  │       │
                     └────────────┬────────────┘       │
                                  │                    │
                     ┌────────────▼────────────┐       │
                     │      room_actions       │       │
                     │        (NEW)            │       │
                     ├─────────────────────────┤       │
                     │ id (PK)                 │       │
                     │ time_entry_id (FK)      │       │
                     │ room_type_id (FK)───────┼───┐   │
                     │ action_type_id (FK)─────┼─┐ │   │
                     │ performed_at            │ │ │   │
                     │ notes                   │ │ │   │
                     └─────────────────────────┘ │ │   │
                                                 │ │   │
                     ┌───────────────────────────┼─┘   │
                     │                           │     │
          ┌──────────▼──────────┐   ┌────────────▼─────▼───┐
          │    action_types     │   │     room_types       │
          │       (NEW)         │   │       (NEW)          │
          ├─────────────────────┤   ├──────────────────────┤
          │ id (PK)             │   │ id (PK)              │
          │ user_id (FK/NULL)   │   │ user_id (FK/NULL)    │
          │ name                │   │ name                 │
          │ name_fr             │   │ name_fr              │
          │ position_filter     │   │ icon                 │
          │ is_active           │   │ is_active            │
          └─────────────────────┘   └──────────────────────┘
```

## Tables

### profiles (MODIFY)

Ajout d'un champ pour lier un compte auth à une fiche staff.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| staff_account_id | UUID | FK staff_members, NULLABLE | Lien vers fiche staff (si compte personnel) |

### time_entries (NEW)

Enregistrement des pointages d'entrée/sortie.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | UUID | FK auth.users, NOT NULL | Propriétaire (gestionnaire) |
| staff_member_id | UUID | FK staff_members, NOT NULL | Employé qui pointe |
| client_id | UUID | FK clients, NOT NULL | Client chez qui le travail est effectué |
| clock_in_at | TIMESTAMPTZ | NOT NULL | Heure de pointage entrée |
| clock_out_at | TIMESTAMPTZ | NULLABLE | Heure de pointage sortie |
| duration_minutes | INTEGER | NULLABLE | Durée calculée (clock_out - clock_in) |
| work_session_id | UUID | FK work_sessions, NULLABLE | Lien vers prestation créée |
| status | TEXT | NOT NULL, DEFAULT 'open' | 'open', 'closed', 'cancelled' |
| notes | TEXT | NULLABLE | Notes optionnelles |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date création |
| updated_at | TIMESTAMPTZ | DEFAULT now() | Date modification |

**Indexes**:
- `idx_time_entries_staff_date` ON (staff_member_id, clock_in_at DESC)
- `idx_time_entries_status` ON (status) WHERE status = 'open'

**RLS Policies**:
- `staff_select_own`: Staff peut voir ses propres pointages
- `manager_select_all`: Manager voit tous les pointages de son organisation
- `staff_insert_own`: Staff peut créer un pointage pour lui-même
- `staff_update_own`: Staff peut modifier ses pointages ouverts
- `manager_full_access`: Manager a accès complet

### room_actions (NEW)

Enregistrement des actions effectuées par pièce.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| time_entry_id | UUID | FK time_entries, NOT NULL | Pointage associé |
| room_type_id | UUID | FK room_types, NOT NULL | Type de pièce |
| action_type_id | UUID | FK action_types, NOT NULL | Type d'action |
| performed_at | TIMESTAMPTZ | DEFAULT now() | Heure de l'action |
| notes | TEXT | NULLABLE | Commentaire optionnel |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date création |

**Indexes**:
- `idx_room_actions_time_entry` ON (time_entry_id)

**RLS Policies**:
- Hérite des policies de time_entries via jointure

### room_types (NEW)

Référentiel des types de pièces.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | UUID | FK auth.users, NULLABLE | NULL = système, non-null = custom |
| name | TEXT | NOT NULL | Nom technique (slug) |
| name_fr | TEXT | NOT NULL | Libellé français |
| icon | TEXT | NULLABLE | Nom d'icône (optionnel) |
| sort_order | INTEGER | DEFAULT 0 | Ordre d'affichage |
| is_active | BOOLEAN | DEFAULT true | Actif/Inactif |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date création |

**Seed Data**:
```sql
INSERT INTO room_types (name, name_fr, icon, sort_order) VALUES
('bathroom', 'Salle de bain', 'bath', 1),
('kitchen', 'Cuisine', 'utensils', 2),
('bedroom', 'Chambre', 'bed', 3),
('living_room', 'Salon', 'sofa', 4),
('dining_room', 'Salle à manger', 'chair', 5),
('office', 'Bureau', 'briefcase', 6),
('laundry', 'Buanderie', 'washing-machine', 7),
('garage', 'Garage', 'car', 8),
('garden', 'Jardin', 'tree', 9),
('terrace', 'Terrasse', 'sun', 10),
('other', 'Autre', 'more-horizontal', 99);
```

### action_types (NEW)

Référentiel des types d'actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | UUID | FK auth.users, NULLABLE | NULL = système, non-null = custom |
| name | TEXT | NOT NULL | Nom technique (slug) |
| name_fr | TEXT | NOT NULL | Libellé français |
| position_filter | TEXT[] | NULLABLE | Postes concernés (NULL = tous) |
| sort_order | INTEGER | DEFAULT 0 | Ordre d'affichage |
| is_active | BOOLEAN | DEFAULT true | Actif/Inactif |
| created_at | TIMESTAMPTZ | DEFAULT now() | Date création |

**Seed Data**:
```sql
INSERT INTO action_types (name, name_fr, position_filter, sort_order) VALUES
('cleaning', 'Nettoyage', ARRAY['housekeeper'], 1),
('dusting', 'Dépoussiérage', ARRAY['housekeeper'], 2),
('vacuuming', 'Aspirateur', ARRAY['housekeeper'], 3),
('mopping', 'Serpillière', ARRAY['housekeeper'], 4),
('ironing', 'Repassage', ARRAY['housekeeper'], 5),
('laundry', 'Lessive', ARRAY['housekeeper'], 6),
('dishes', 'Vaisselle', ARRAY['housekeeper', 'cook'], 7),
('cooking', 'Cuisine', ARRAY['cook'], 10),
('meal_prep', 'Préparation repas', ARRAY['cook'], 11),
('mowing', 'Tonte', ARRAY['gardener'], 20),
('pruning', 'Taille', ARRAY['gardener'], 21),
('watering', 'Arrosage', ARRAY['gardener'], 22),
('weeding', 'Désherbage', ARRAY['gardener'], 23),
('planting', 'Plantation', ARRAY['gardener'], 24),
('childcare', 'Garde enfant', ARRAY['nanny'], 30),
('homework_help', 'Aide devoirs', ARRAY['nanny'], 31),
('driving', 'Transport', ARRAY['driver'], 40),
('security_check', 'Ronde', ARRAY['guard'], 50),
('other', 'Autre', NULL, 99);
```

## State Transitions

### time_entries.status

```
              ┌─────────┐
              │  open   │ (création au clock-in)
              └────┬────┘
                   │ clock-out
              ┌────▼────┐
              │ closed  │ (crée work_session)
              └─────────┘

              ┌─────────┐
              │  open   │
              └────┬────┘
                   │ annulation (manager)
              ┌────▼─────┐
              │cancelled │
              └──────────┘
```

## Relationships Summary

| From | To | Type | Description |
|------|-----|------|-------------|
| profiles | staff_members | 0..1 → 1 | Un profil peut être lié à un staff |
| time_entries | staff_members | N → 1 | Plusieurs pointages par staff |
| time_entries | clients | N → 1 | Pointage chez un client |
| time_entries | work_sessions | 0..1 → 1 | Un pointage peut créer une prestation |
| room_actions | time_entries | N → 1 | Plusieurs actions par pointage |
| room_actions | room_types | N → 1 | Action sur un type de pièce |
| room_actions | action_types | N → 1 | Action de quel type |
