# Quickstart: Gestion de la facturation

**Feature**: 007-billing
**Date**: 2026-02-07

---

## Overview

This feature adds billing/invoicing capabilities to MaidManager:
- **Clients**: Manage customer information
- **Invoices**: Create invoices from completed interventions
- **Payments**: Track invoice status and payments
- **PDF Export**: Print/save invoices as PDF

---

## Prerequisites

1. Existing MaidManager setup with:
   - SolidJS frontend running
   - Supabase project configured
   - Staff and schedule features working

2. Access to Supabase dashboard for running migrations

---

## Quick Setup

### Step 1: Run Database Migrations

Apply the four migrations in order via Supabase SQL Editor:

```bash
# In order:
1. 20260207_001_create_clients.sql
2. 20260207_002_create_invoices.sql
3. 20260207_003_create_invoice_lines.sql
4. 20260207_004_alter_schedule_entries.sql
```

Or copy the SQL from `data-model.md` and run in Supabase dashboard.

### Step 2: Copy Type Definitions

```bash
cp specs/007-billing/contracts/billing.types.ts src/lib/types/billing.types.ts
```

Then update `src/lib/types/database.ts` to include the new tables.

### Step 3: Add Routes

In `src/App.tsx`, add:

```tsx
import { lazy } from 'solid-js'

const Clients = lazy(() => import('./pages/Clients'))
const Invoices = lazy(() => import('./pages/Invoices'))

// In router:
<Route path="/clients" component={() => <ProtectedRoute><Clients /></ProtectedRoute>} />
<Route path="/invoices" component={() => <ProtectedRoute><Invoices /></ProtectedRoute>} />
<Route path="/invoices/:id/print" component={() => <ProtectedRoute><InvoicePrint /></ProtectedRoute>} />
```

---

## Key Implementation Notes

### Invoice Number Generation

Invoice numbers follow format `FACT-YYYY-NNNN`:
- Auto-generated on invoice creation
- Sequential within calendar year
- Unique per user

```typescript
// In invoice.service.ts
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear()
  const { data } = await supabase
    .from('invoices')
    .select('invoice_number')
    .like('invoice_number', `FACT-${year}-%`)
    .order('invoice_number', { ascending: false })
    .limit(1)

  const lastNum = data?.[0]
    ? parseInt(data[0].invoice_number.slice(-4))
    : 0

  return `FACT-${year}-${String(lastNum + 1).padStart(4, '0')}`
}
```

### Status Transitions

Invoices have a strict status flow:

```
draft → sent → paid
  ↓       ↓
cancelled  cancelled
```

Enforce in service layer:
```typescript
function canTransition(from: InvoiceStatus, to: InvoiceStatus): boolean {
  return INVOICE_STATUS_TRANSITIONS[from].includes(to)
}
```

### Client Snapshot

When creating an invoice, snapshot client info:
```typescript
const invoice = await supabase
  .from('invoices')
  .insert({
    client_id: client.id,
    client_name: client.name,        // Snapshot
    client_address: client.address,   // Snapshot
    client_email: client.email,       // Snapshot
    invoice_number: await generateInvoiceNumber(),
    // ...
  })
```

### PDF Export

Use browser print with CSS:
```typescript
function printInvoice(id: string) {
  window.open(`/invoices/${id}/print`, '_blank')
}
```

The print page has `@media print` styles for clean PDF output.

---

## Testing Checklist

- [ ] Create a client with all fields
- [ ] Edit client information
- [ ] Delete a client (verify invoices preserved)
- [ ] Associate client with schedule entry
- [ ] Set amount on schedule entry
- [ ] Create invoice from completed interventions
- [ ] Verify invoice number is sequential
- [ ] Mark invoice as sent
- [ ] Mark invoice as paid with date
- [ ] Cancel a draft invoice
- [ ] Cancel a sent invoice
- [ ] Print/export invoice as PDF
- [ ] Filter invoices by status
- [ ] Filter invoices by client
- [ ] Verify totals calculate correctly

---

## Common Issues

### "No interventions to invoice"

- Ensure interventions are marked as `completed`
- Ensure interventions have a `client_id` assigned
- Check interventions aren't already invoiced

### Invoice number conflict

- Rare with single user, but if it happens:
- Retry the insert (number generation will pick next)

### PDF looks wrong

- Check `@media print` styles are loading
- Ensure print page has no navigation/chrome
- Test in Chrome for best PDF support

---

## File Structure

After implementation:

```
src/
├── components/billing/
│   ├── ClientForm.tsx
│   ├── ClientList.tsx
│   ├── InvoiceForm.tsx
│   ├── InvoiceList.tsx
│   ├── InvoiceCard.tsx
│   └── InvoiceDetail.tsx
├── lib/types/
│   └── billing.types.ts
├── pages/
│   ├── Clients.tsx
│   ├── Invoices.tsx
│   └── InvoicePrint.tsx
├── services/
│   ├── client.service.ts
│   └── invoice.service.ts
└── stores/
    ├── clientStore.ts
    └── invoiceStore.ts
```

---

## Next Steps

1. Run `/speckit.tasks` to generate implementation tasks
2. Follow TDD: write tests before implementation
3. Implement in priority order: P1 (clients, association, invoices) → P2 (list, payments) → P3 (PDF)
