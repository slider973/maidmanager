-- Migration: Create invoice_lines table
-- Feature: 007-billing
-- Description: Line items linking invoices to schedule entries

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  schedule_entry_id UUID REFERENCES schedule_entries(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_schedule_entry_id ON invoice_lines(schedule_entry_id);

-- RLS
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;

-- Lines inherit access through parent invoice
CREATE POLICY "invoice_lines_select_own" ON invoice_lines
  FOR SELECT USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_insert_own" ON invoice_lines
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_update_own" ON invoice_lines
  FOR UPDATE USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
CREATE POLICY "invoice_lines_delete_own" ON invoice_lines
  FOR DELETE USING (EXISTS (SELECT 1 FROM invoices WHERE id = invoice_id AND user_id = auth.uid()));
