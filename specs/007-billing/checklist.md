# Specification Checklist: Gestion de la facturation

**Purpose**: Verification checklist for spec.md completeness and quality
**Created**: 2026-02-07
**Feature**: [spec.md](./spec.md)

## User Stories

- [x] CHK001 User Story 1 (Gestion des clients) has clear acceptance scenarios (4 scenarios)
- [x] CHK002 User Story 2 (Association client-intervention) has clear acceptance scenarios (3 scenarios)
- [x] CHK003 User Story 3 (Création de facture) has clear acceptance scenarios (4 scenarios)
- [x] CHK004 User Story 4 (Consultation des factures) has clear acceptance scenarios (3 scenarios)
- [x] CHK005 User Story 5 (Marquer comme payée) has clear acceptance scenarios (3 scenarios)
- [x] CHK006 User Story 6 (Export PDF) has clear acceptance scenarios (2 scenarios)
- [x] CHK007 All user stories have priority assignments (P1: US1-3, P2: US4-5, P3: US6)
- [x] CHK008 Each user story has an independent test defined

## Requirements

- [x] CHK009 All functional requirements have unique identifiers (FR-001 to FR-018)
- [x] CHK010 Requirements use MUST/DOIT language appropriately
- [x] CHK011 Key entities are documented (Client, Invoice, InvoiceLine)
- [x] CHK012 Client entity attributes are complete (nom, adresse, email, téléphone, notes)
- [x] CHK013 Invoice entity attributes are complete (numéro, date, client, statut, total, date paiement)
- [x] CHK014 Invoice number format is specified (FACT-AAAA-NNNN)
- [x] CHK015 Invoice statuses are defined (Brouillon, Envoyée, Payée, Annulée)

## Success Criteria

- [x] CHK016 Success criteria are measurable (SC-001 to SC-006)
- [x] CHK017 User experience metrics included (< 3 minutes, < 10 seconds)
- [x] CHK018 Data integrity requirements included (unique invoice numbers, correct totals)
- [x] CHK019 PDF content requirements specified

## Edge Cases

- [x] CHK020 Client deletion with existing invoices documented
- [x] CHK021 Modifying already-invoiced intervention documented
- [x] CHK022 Intervention without tariff handling documented
- [x] CHK023 No interventions to invoice handling documented

## Technical Considerations

- [x] CHK024 New database tables required (clients, invoices, invoice_lines) - documented in context
- [x] CHK025 Currency specified (EUR, HT only for now)
- [x] CHK026 TVA handling noted (to be defined later)
- [x] CHK027 Relationship constraints documented (1 client = N invoices, 1 invoice = 1 client)
- [x] CHK028 Intervention can only be in one invoice (documented in assumptions)

## Data Model Dependencies

- [x] CHK029 Existing tables referenced (staff_members, schedule_entries, tasks)
- [x] CHK030 New client_id foreign key needed on schedule_entries
- [x] CHK031 New amount field needed on schedule_entries (tarif)

## Notes

- Feature requires new database tables: clients, invoices, invoice_lines
- Requires modification to schedule_entries table (add client_id, amount)
- PDF generation will use browser-native or library solution
- All amounts in EUR, HT only (TVA to be defined later)
