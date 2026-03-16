# Data Model: Gestion de la facturation

**Feature**: 007-billing
**Date**: 2026-02-07
**Source**: [spec.md](./spec.md) | [research.md](./research.md)

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│     clients     │       │   schedule_entries   │       │  staff_members  │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ client_id (FK)       │───────►│ id (PK)         │
│ user_id (FK)    │       │ staff_member_id (FK) │       │ user_id (FK)    │
│ name            │       │ amount               │       │ ...             │
│ address         │       │ ...                  │       └─────────────────┘
│ email           │       └──────────────────────┘
│ phone           │                │
│ notes           │                │ (via invoice_lines)
│ created_at      │                ▼
│ updated_at      │       ┌──────────────────────┐
└─────────────────┘       │   invoice_lines      │
        │                 ├──────────────────────┤
        │                 │ id (PK)              │
        │                 │ invoice_id (FK)      │───────┐
        │                 │ schedule_entry_id(FK)│       │
        │                 │ description          │       │
        │                 │ amount               │       │
        │                 │ created_at           │       │
        │                 └──────────────────────┘       │
        │                                                │
        │                 ┌──────────────────────┐       │
        └────────────────►│      invoices        │◄──────┘
                          ├──────────────────────┤
                          │ id (PK)              │
                          │ user_id (FK)         │
                          │ client_id (FK)       │
                          │ invoice_number       │
                          │ client_name          │ (snapshot)
                          │ client_address       │ (snapshot)
                          │ client_email         │ (snapshot)
                          │ status               │
                          │ total_amount         │
                          │ invoice_date         │
                          │ payment_date         │
                          │ notes                │
                          │ created_at           │
                          │ updated_at           │
                          └──────────────────────┘
```

---

## Tables

### clients

Customer information for billing purposes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → auth.users, NOT NULL | Owner (RLS) |
| name | TEXT | NOT NULL | Client name (required) |
| address | TEXT | | Full postal address |
| email | TEXT | | Contact email |
| phone | TEXT | | Contact phone |
| notes | TEXT | | Internal notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Indexes**:
- `idx_clients_user_id` ON (user_id)
- `idx_clients_name` ON (user_id, name) - for search

**RLS Policies**:
- `clients_select_own`: SELECT WHERE auth.uid() = user_id
- `clients_insert_own`: INSERT WITH CHECK auth.uid() = user_id
- `clients_update_own`: UPDATE USING auth.uid() = user_id
- `clients_delete_own`: DELETE USING auth.uid() = user_id

---

### invoices

Invoice headers with client snapshot.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| user_id | UUID | FK → auth.users, NOT NULL | Owner (RLS) |
| client_id | UUID | FK → clients ON DELETE SET NULL | Reference to client |
| invoice_number | TEXT | NOT NULL, UNIQUE per user_id | Format: FACT-YYYY-NNNN |
| client_name | TEXT | NOT NULL | Snapshot of client name |
| client_address | TEXT | | Snapshot of client address |
| client_email | TEXT | | Snapshot of client email |
| status | TEXT | NOT NULL, DEFAULT 'draft' | draft/sent/paid/cancelled |
| total_amount | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Calculated total |
| invoice_date | DATE | NOT NULL, DEFAULT CURRENT_DATE | Invoice issue date |
| payment_date | DATE | | Date payment received |
| notes | TEXT | | Invoice notes |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update |

**Constraints**:
- CHECK (status IN ('draft', 'sent', 'paid', 'cancelled'))
- UNIQUE (user_id, invoice_number)

**Indexes**:
- `idx_invoices_user_id` ON (user_id)
- `idx_invoices_client_id` ON (client_id)
- `idx_invoices_status` ON (user_id, status)
- `idx_invoices_invoice_date` ON (user_id, invoice_date DESC)

**RLS Policies**:
- `invoices_select_own`: SELECT WHERE auth.uid() = user_id
- `invoices_insert_own`: INSERT WITH CHECK auth.uid() = user_id
- `invoices_update_own`: UPDATE USING auth.uid() = user_id (with status check in app)
- `invoices_delete_own`: DELETE USING auth.uid() = user_id AND status = 'draft'

---

### invoice_lines

Line items linking invoices to schedule entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| invoice_id | UUID | FK → invoices ON DELETE CASCADE, NOT NULL | Parent invoice |
| schedule_entry_id | UUID | FK → schedule_entries ON DELETE SET NULL | Source intervention |
| description | TEXT | NOT NULL | Line item description |
| amount | DECIMAL(10,2) | NOT NULL | Line amount in EUR |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_invoice_lines_invoice_id` ON (invoice_id)
- `idx_invoice_lines_schedule_entry_id` ON (schedule_entry_id)

**RLS Policies**:
- Lines inherit access through parent invoice
- `invoice_lines_select_own`: SELECT WHERE EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
- `invoice_lines_insert_own`: INSERT WITH CHECK EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
- `invoice_lines_update_own`: UPDATE USING EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())
- `invoice_lines_delete_own`: DELETE USING EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid())

---

### schedule_entries (modifications)

Add columns to existing table for client association and pricing.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| client_id | UUID | FK → clients ON DELETE SET NULL | Associated client |
| amount | DECIMAL(10,2) | DEFAULT NULL | Intervention rate in EUR |

**New Indexes**:
- `idx_schedule_entries_client_id` ON (client_id)

**Migration Note**: Both columns are nullable to maintain backward compatibility with existing data.

---

## Enums and Constants

### Invoice Status

```typescript
export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled'] as const
export type InvoiceStatus = typeof INVOICE_STATUSES[number]

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyée',
  paid: 'Payée',
  cancelled: 'Annulée'
}
```

### Status Transitions

| From | Allowed To |
|------|------------|
| draft | sent, cancelled, (delete) |
| sent | paid, cancelled |
| paid | (none - final) |
| cancelled | (none - final) |

---

## Validation Rules

### Client

| Field | Rules |
|-------|-------|
| name | Required, non-empty, max 200 chars |
| email | Optional, valid email format if provided |
| phone | Optional, max 20 chars |
| address | Optional, max 500 chars |

### Invoice

| Field | Rules |
|-------|-------|
| invoice_number | Auto-generated, format FACT-YYYY-NNNN |
| invoice_date | Required, valid date |
| payment_date | Required when status = 'paid', must be >= invoice_date |
| total_amount | Auto-calculated from lines |

### Invoice Line

| Field | Rules |
|-------|-------|
| description | Required, non-empty |
| amount | Required, >= 0 |

### Schedule Entry (amount)

| Field | Rules |
|-------|-------|
| amount | Optional, >= 0 if provided |

---

## Queries

### Generate Next Invoice Number

```sql
SELECT 'FACT-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' ||
       LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1)::TEXT, 4, '0')
FROM invoices
WHERE user_id = auth.uid()
  AND invoice_number LIKE 'FACT-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-%';
```

### Get Unbilled Interventions for Client

```sql
SELECT se.*, sm.first_name, sm.last_name
FROM schedule_entries se
LEFT JOIN staff_members sm ON se.staff_member_id = sm.id
WHERE se.user_id = auth.uid()
  AND se.client_id = $1
  AND se.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM invoice_lines il
    JOIN invoices i ON il.invoice_id = i.id
    WHERE il.schedule_entry_id = se.id
      AND i.status != 'cancelled'
  )
ORDER BY se.scheduled_date DESC;
```

### Calculate Invoice Total

```sql
UPDATE invoices
SET total_amount = (
  SELECT COALESCE(SUM(amount), 0)
  FROM invoice_lines
  WHERE invoice_id = $1
)
WHERE id = $1;
```

---

## Migration Scripts

### 20260207_001_create_clients.sql

```sql
-- Migration: Create clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name ON clients(user_id, name);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_own" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert_own" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update_own" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete_own" ON clients FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 20260207_002_create_invoices.sql

```sql
-- Migration: Create invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_address TEXT,
  client_email TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, invoice_number)
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_invoice_date ON invoices(user_id, invoice_date DESC);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_own" ON invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "invoices_insert_own" ON invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "invoices_update_own" ON invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "invoices_delete_own" ON invoices FOR DELETE USING (auth.uid() = user_id AND status = 'draft');

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 20260207_003_create_invoice_lines.sql

```sql
-- Migration: Create invoice_lines table
CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_schedule_entry_id ON invoice_lines(schedule_entry_id);

ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_lines_select_own" ON invoice_lines
  FOR SELECT USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_insert_own" ON invoice_lines
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_update_own" ON invoice_lines
  FOR UPDATE USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_delete_own" ON invoice_lines
  FOR DELETE USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
```

### 20260207_004_alter_schedule_entries.sql

```sql
-- Migration: Add client_id and amount to schedule_entries
ALTER TABLE schedule_entries
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL;

CREATE INDEX idx_schedule_entries_client_id ON schedule_entries(client_id);
```
