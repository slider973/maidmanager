-- Migration: Create staff_payments table
-- Feature: 008-staff-payments
-- Date: 2026-02-07

-- Create staff_payments table
CREATE TABLE IF NOT EXISTS staff_payments (
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_payments_staff_member ON staff_payments(staff_member_id);
CREATE INDEX IF NOT EXISTS idx_staff_payments_user_date ON staff_payments(user_id, payment_date DESC);

-- Enable Row Level Security
ALTER TABLE staff_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own payments
CREATE POLICY staff_payments_select_own ON staff_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY staff_payments_insert_own ON staff_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY staff_payments_update_own ON staff_payments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY staff_payments_delete_own ON staff_payments
  FOR DELETE USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_staff_payments_updated_at
  BEFORE UPDATE ON staff_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE staff_payments IS 'Paiements effectués au personnel';
COMMENT ON COLUMN staff_payments.amount_cents IS 'Montant payé en centimes';
COMMENT ON COLUMN staff_payments.payment_method IS 'Mode de paiement (Espèces, Virement, Chèque, etc.)';
