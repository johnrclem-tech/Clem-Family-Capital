-- Migration: Add all Plaid account fields to plaid_items table
-- Run this to update existing database: sqlite3 finance.db < scripts/migrate-add-plaid-account-fields.sql

-- Add Plaid account identifier
ALTER TABLE plaid_items ADD COLUMN plaid_account_id TEXT;

-- Add account details
ALTER TABLE plaid_items ADD COLUMN mask TEXT; -- Last 2-4 digits
ALTER TABLE plaid_items ADD COLUMN official_name TEXT; -- Official account name from institution

-- Add account subtype
ALTER TABLE plaid_items ADD COLUMN account_subtype TEXT;

-- Add additional balance fields
ALTER TABLE plaid_items ADD COLUMN available_balance REAL; -- Available balance
ALTER TABLE plaid_items ADD COLUMN balance_limit REAL; -- Credit limit or overdraft limit
ALTER TABLE plaid_items ADD COLUMN unofficial_currency_code TEXT; -- Unofficial currency code
ALTER TABLE plaid_items ADD COLUMN balance_last_updated_datetime TEXT; -- Last balance update timestamp

-- Add verification fields
ALTER TABLE plaid_items ADD COLUMN verification_status TEXT;
ALTER TABLE plaid_items ADD COLUMN verification_name TEXT;
ALTER TABLE plaid_items ADD COLUMN verification_insights TEXT; -- JSON object

-- Add additional identifiers
ALTER TABLE plaid_items ADD COLUMN persistent_account_id TEXT; -- Persistent account identifier
ALTER TABLE plaid_items ADD COLUMN holder_category TEXT; -- Account holder category

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_plaid_items_plaid_account_id ON plaid_items(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_account_subtype ON plaid_items(account_subtype);
CREATE INDEX IF NOT EXISTS idx_plaid_items_verification_status ON plaid_items(verification_status);
