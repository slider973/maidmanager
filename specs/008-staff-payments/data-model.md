# Data Model: Suivi des paiements du personnel

**Feature**: 008-staff-payments
**Date**: 2026-02-07

## Entity Relationship Diagram

```
┌─────────────────────┐
│   staff_members     │
│─────────────────────│
│ id (PK)             │
│ user_id (FK)        │
│ first_name          │
│ last_name           │
│ position            │
│ hourly_rate_cents   │ ← NEW
│ ...                 │
└─────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────┐       ┌─────────────────────┐
│   work_sessions     │       │   staff_payments    │
│─────────────────────│       │─────────────────────│
│ id (PK)             │       │ id (PK)             │
│ user_id (FK)        │       │ user_id (FK)        │
│ staff_member_id(FK) │       │ staff_member_id(FK) │
│ schedule_entry_id   │       │ amount_cents        │
│ session_date        │       │ payment_date        │
│ duration_minutes    │       │ payment_method      │
│ hourly_rate_cents   │       │ notes               │
│ amount_cents        │       │ created_at          │
│ description         │       │ updated_at          │
│ notes               │       └─────────────────────┘
│ created_at          │
│ updated_at          │
└─────────────────────┘
         │
         │ N:1 (optional)
         ▼
┌─────────────────────┐
│  schedule_entries   │
│─────────────────────│
│ id (PK)             │
│ ...                 │
└─────────────────────┘
```

## Tables

### 1. staff_members (ALTER)

Ajout d'un champ pour le tarif horaire par défaut.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| hourly_rate_cents | INTEGER | DEFAULT 0, NOT NULL | Tarif horaire par défaut en centimes |

**Migration**: `20260207_005_alter_staff_members_hourly_rate.sql`

```sql
ALTER TABLE staff_members
ADD COLUMN hourly_rate_cents INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN staff_members.hourly_rate_cents IS 'Tarif horaire par défaut en centimes (ex: 1500 = 15.00€)';
```

### 2. work_sessions (NEW)

Enregistre les prestations de travail effectuées.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | UUID | FK → auth.users, NOT NULL | Propriétaire |
| staff_member_id | UUID | FK → staff_members, NOT NULL | Employé concerné |
| schedule_entry_id | UUID | FK → schedule_entries, NULL | Lien optionnel vers intervention planifiée |
| session_date | DATE | NOT NULL | Date de la prestation |
| duration_minutes | INTEGER | NOT NULL, CHECK > 0 | Durée en minutes |
| hourly_rate_cents | INTEGER | NOT NULL, CHECK >= 0 | Tarif horaire appliqué (centimes) |
| amount_cents | INTEGER | NOT NULL, GENERATED | Montant calculé (duration × rate / 60) |
| description | TEXT | NOT NULL | Description du travail |
| notes | TEXT | NULL | Notes optionnelles |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Date création |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Date modification |

**Indexes**:
- `idx_work_sessions_staff_member` ON (staff_member_id)
- `idx_work_sessions_user_date` ON (user_id, session_date DESC)

**RLS Policies**:
- `work_sessions_select_own`: SELECT WHERE user_id = auth.uid()
- `work_sessions_insert_own`: INSERT WHERE user_id = auth.uid()
- `work_sessions_update_own`: UPDATE WHERE user_id = auth.uid()
- `work_sessions_delete_own`: DELETE WHERE user_id = auth.uid()

**Migration**: `20260207_006_create_work_sessions.sql`

```sql
CREATE TABLE work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE RESTRICT,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE SET NULL,
  session_date DATE NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  hourly_rate_cents INTEGER NOT NULL CHECK (hourly_rate_cents >= 0),
  amount_cents INTEGER NOT NULL GENERATED ALWAYS AS (
    ROUND(duration_minutes * hourly_rate_cents / 60.0)
  ) STORED,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_work_sessions_staff_member ON work_sessions(staff_member_id);
CREATE INDEX idx_work_sessions_user_date ON work_sessions(user_id, session_date DESC);

-- RLS
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY work_sessions_select_own ON work_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY work_sessions_insert_own ON work_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY work_sessions_update_own ON work_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY work_sessions_delete_own ON work_sessions
  FOR DELETE USING (user_id = auth.uid());

-- Trigger updated_at
CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. staff_payments (NEW)

Enregistre les paiements effectués au personnel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Identifiant unique |
| user_id | UUID | FK → auth.users, NOT NULL | Propriétaire |
| staff_member_id | UUID | FK → staff_members, NOT NULL | Employé payé |
| amount_cents | INTEGER | NOT NULL, CHECK > 0 | Montant payé (centimes) |
| payment_date | DATE | NOT NULL | Date du paiement |
| payment_method | TEXT | NULL | Mode de paiement (espèces, virement, chèque...) |
| notes | TEXT | NULL | Notes optionnelles |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Date création |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Date modification |

**Indexes**:
- `idx_staff_payments_staff_member` ON (staff_member_id)
- `idx_staff_payments_user_date` ON (user_id, payment_date DESC)

**RLS Policies**:
- `staff_payments_select_own`: SELECT WHERE user_id = auth.uid()
- `staff_payments_insert_own`: INSERT WHERE user_id = auth.uid()
- `staff_payments_update_own`: UPDATE WHERE user_id = auth.uid()
- `staff_payments_delete_own`: DELETE WHERE user_id = auth.uid()

**Migration**: `20260207_007_create_staff_payments.sql`

```sql
CREATE TABLE staff_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_member_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE RESTRICT,
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_staff_payments_staff_member ON staff_payments(staff_member_id);
CREATE INDEX idx_staff_payments_user_date ON staff_payments(user_id, payment_date DESC);

-- RLS
ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY staff_payments_select_own ON staff_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY staff_payments_insert_own ON staff_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY staff_payments_update_own ON staff_payments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY staff_payments_delete_own ON staff_payments
  FOR DELETE USING (user_id = auth.uid());

-- Trigger updated_at
CREATE TRIGGER update_staff_payments_updated_at
  BEFORE UPDATE ON staff_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Calculated Fields

### Balance per Staff Member

```sql
-- Vue pour obtenir le solde de chaque employé
CREATE OR REPLACE VIEW staff_balances AS
SELECT
  sm.id AS staff_member_id,
  sm.user_id,
  sm.first_name,
  sm.last_name,
  COALESCE(ws.total_work, 0) AS total_work_cents,
  COALESCE(sp.total_paid, 0) AS total_paid_cents,
  COALESCE(ws.total_work, 0) - COALESCE(sp.total_paid, 0) AS balance_cents
FROM staff_members sm
LEFT JOIN (
  SELECT staff_member_id, SUM(amount_cents) AS total_work
  FROM work_sessions
  GROUP BY staff_member_id
) ws ON ws.staff_member_id = sm.id
LEFT JOIN (
  SELECT staff_member_id, SUM(amount_cents) AS total_paid
  FROM staff_payments
  GROUP BY staff_member_id
) sp ON sp.staff_member_id = sm.id;
```

**Note**: Cette vue est calculée à la volée pour garantir la cohérence.

## Validation Rules

### work_sessions

| Field | Rule | Error Message (FR) |
|-------|------|-------------------|
| duration_minutes | > 0 | "La durée doit être positive" |
| hourly_rate_cents | >= 0 | "Le tarif horaire ne peut pas être négatif" |
| hourly_rate_cents | == 0 | WARNING: "Tarif à 0€ - Travail bénévole ?" |
| description | non vide | "La description est requise" |
| session_date | <= today | "La date ne peut pas être dans le futur" |

### staff_payments

| Field | Rule | Error Message (FR) |
|-------|------|-------------------|
| amount_cents | > 0 | "Le montant doit être positif" |
| payment_date | <= today | "La date ne peut pas être dans le futur" |

## State Transitions

Pas d'automate d'état pour cette fonctionnalité. Les prestations et paiements sont des enregistrements immuables (créer/modifier/supprimer uniquement).
