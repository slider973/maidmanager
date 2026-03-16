# Research: Gestion de la facturation

**Feature**: 007-billing
**Date**: 2026-02-07
**Purpose**: Resolve technical unknowns and establish best practices for billing implementation

---

## Research Topics

### 1. PDF Generation in Browser

**Question**: How to generate PDF invoices client-side without a server?

**Decision**: Use browser's native print-to-PDF capability with CSS `@media print`

**Rationale**:
- Zero dependencies added (keeps bundle small per constitution)
- Native browser functionality, well-supported
- Users can save as PDF via print dialog
- Consistent with "Ship Fast, Iterate Often" principle

**Alternatives Considered**:
1. **jsPDF** - Adds ~200KB to bundle, violates bundle size constraint
2. **html2pdf.js** - Same bundle size concern, dependency on html2canvas
3. **Server-side PDF** - Requires Edge Function, adds complexity beyond MVP
4. **React-PDF** - Wrong framework (SolidJS), heavy dependency

**Implementation Approach**:
```typescript
function printInvoice(invoiceId: string) {
  // Open dedicated print view
  window.open(`/invoices/${invoiceId}/print`, '_blank')
  // Page has @media print styles for PDF formatting
}
```

---

### 2. Invoice Number Generation

**Question**: How to generate unique sequential invoice numbers (FACT-AAAA-NNNN)?

**Decision**: Generate client-side with year prefix and Supabase counter

**Rationale**:
- Format: `FACT-2026-0001` (human-readable, sortable)
- Sequential within year using database sequence or max+1 query
- Client-side generation with conflict handling

**Alternatives Considered**:
1. **Database sequence** - Requires custom PostgreSQL function, more robust but complex
2. **UUID only** - Not human-readable, poor for invoice identification
3. **Timestamp-based** - Not sequential, hard to communicate to clients

**Implementation Approach**:
```sql
-- Option A: Max+1 with lock (simpler, sufficient for low volume)
SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 10) AS INTEGER)), 0) + 1
FROM invoices
WHERE invoice_number LIKE 'FACT-2026-%' AND user_id = auth.uid();

-- Option B: Separate counter table (more robust)
-- counter_table: user_id, year, last_number
```

**Decision**: Use Max+1 approach for MVP. Low volume (single user) makes conflicts rare.

---

### 3. Client-Intervention Association

**Question**: How to modify schedule_entries table to support client association?

**Decision**: Add `client_id` foreign key and `amount` field to schedule_entries

**Rationale**:
- Minimal schema change to existing table
- Maintains backward compatibility (nullable client_id)
- Amount per intervention enables flexible pricing

**Implementation**:
```sql
ALTER TABLE schedule_entries
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL;

CREATE INDEX idx_schedule_entries_client_id ON schedule_entries(client_id);
```

---

### 4. Invoice Status State Machine

**Question**: What are valid status transitions for invoices?

**Decision**: Simple linear flow with optional cancellation

**State Transitions**:
```
draft -> sent -> paid
  |        |
  v        v
cancelled cancelled
```

**Rules**:
- Draft: Can be modified, deleted, sent, or cancelled
- Sent: Cannot be modified (except to mark paid or cancelled)
- Paid: Final state, read-only
- Cancelled: Final state, read-only

**Rationale**: Matches spec requirements (FR-013) and prevents accidental modification of finalized invoices.

---

### 5. Handling Deleted Clients

**Question**: What happens to invoices when a client is deleted?

**Decision**: Soft reference with ON DELETE SET NULL, store snapshot of client info

**Rationale**:
- Legal/tax requirements: invoices must be preserved
- Client data at invoice time may differ from current data
- Use snapshot approach: store client name/address in invoice record

**Implementation**:
```sql
-- invoices table includes denormalized client snapshot
client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
client_name TEXT NOT NULL,        -- Snapshot at invoice creation
client_address TEXT,              -- Snapshot at invoice creation
client_email TEXT                 -- Snapshot at invoice creation
```

---

### 6. Currency and Tax Handling

**Question**: How to handle EUR currency and future TVA support?

**Decision**: Store amounts as DECIMAL, display-only formatting, no TVA for MVP

**Rationale**:
- DECIMAL(10,2) for accurate monetary calculations
- Format in UI layer: `new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`
- Defer TVA: spec says "HT only for now, TVA to be defined later"

**Future-proofing**:
- Add `tax_rate` and `tax_amount` columns later
- Or add separate `invoice_taxes` table for complex scenarios

---

## Summary of Decisions

| Topic | Decision | Dependencies Added |
|-------|----------|-------------------|
| PDF Generation | Browser print + CSS @media print | None |
| Invoice Numbers | FACT-YYYY-NNNN with max+1 query | None |
| Client Association | FK on schedule_entries | Migration |
| Status Transitions | draft→sent→paid/cancelled | None |
| Deleted Clients | Snapshot in invoice + SET NULL | None |
| Currency | DECIMAL(10,2) + Intl.NumberFormat | None |

**Total New Dependencies**: 0 (aligned with constitution's minimal dependency approach)
