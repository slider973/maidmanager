-- Migration: Add client_id and amount to schedule_entries
-- Feature: 007-billing
-- Description: Allow associating clients and amounts with interventions

ALTER TABLE schedule_entries
ADD COLUMN client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL;

-- Index for client lookups
CREATE INDEX idx_schedule_entries_client_id ON schedule_entries(client_id);
