-- Migration: Add new Plaid transaction fields (v2)
-- Run this to update existing database: sqlite3 finance.db < scripts/migrate-plaid-fields-v2.sql
-- This migration adds the new non-deprecated Plaid fields

-- Add counterparties field (stored as JSON array)
ALTER TABLE transactions ADD COLUMN counterparties TEXT; -- JSON array: [{name, entity_id, type, website, logo_url, confidence_level, account_numbers}]

-- Add personal finance category icon URL
ALTER TABLE transactions ADD COLUMN personal_finance_category_icon_url TEXT;

-- Add personal finance category version
ALTER TABLE transactions ADD COLUMN personal_finance_category_version TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_transactions_personal_finance_category_version ON transactions(personal_finance_category_version);

-- Note: Deprecated fields (name, transaction_type, plaid_category, plaid_category_id) remain in the database
-- but are no longer used in the application code. They can be manually removed later if needed.
