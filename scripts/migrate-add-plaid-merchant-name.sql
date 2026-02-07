-- Migration: Add plaid_merchant_name column to preserve original Plaid merchant name
-- Run this to update existing database: sqlite3 data.db < scripts/migrate-add-plaid-merchant-name.sql

-- Add plaid_merchant_name column to preserve original Plaid merchant name
ALTER TABLE transactions ADD COLUMN plaid_merchant_name TEXT;

-- Create index for plaid_merchant_name
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_merchant_name ON transactions(plaid_merchant_name);

-- Backfill existing data: copy merchant_name to plaid_merchant_name for existing transactions
-- This preserves the current merchant_name as the original Plaid value
UPDATE transactions 
SET plaid_merchant_name = merchant_name 
WHERE plaid_merchant_name IS NULL AND merchant_name IS NOT NULL;
