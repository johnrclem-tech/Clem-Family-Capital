-- Migration: Add all Plaid transaction fields to transactions table
-- Run this to update existing database: sqlite3 finance.db < scripts/add-plaid-fields.sql

-- Add payment channel and transaction type fields
ALTER TABLE transactions ADD COLUMN payment_channel TEXT;
ALTER TABLE transactions ADD COLUMN transaction_type TEXT;
ALTER TABLE transactions ADD COLUMN transaction_code TEXT;

-- Add currency fields
ALTER TABLE transactions ADD COLUMN iso_currency_code TEXT DEFAULT 'USD';
ALTER TABLE transactions ADD COLUMN unofficial_currency_code TEXT;

-- Add datetime fields
ALTER TABLE transactions ADD COLUMN authorized_date TEXT;
ALTER TABLE transactions ADD COLUMN authorized_datetime TEXT;
ALTER TABLE transactions ADD COLUMN datetime TEXT;

-- Add check number
ALTER TABLE transactions ADD COLUMN check_number TEXT;

-- Add merchant details
ALTER TABLE transactions ADD COLUMN merchant_entity_id TEXT;
ALTER TABLE transactions ADD COLUMN logo_url TEXT;
ALTER TABLE transactions ADD COLUMN website TEXT;

-- Add account owner
ALTER TABLE transactions ADD COLUMN account_owner TEXT;

-- Add pending transaction linking
ALTER TABLE transactions ADD COLUMN pending_transaction_id TEXT;

-- Add location data (stored as JSON)
ALTER TABLE transactions ADD COLUMN location TEXT; -- JSON: {address, city, region, postal_code, country, lat, lon, store_number}

-- Add payment metadata (stored as JSON)
ALTER TABLE transactions ADD COLUMN payment_meta TEXT; -- JSON: {by_order_of, payee, payer, payment_method, payment_processor, ppd_id, reason, reference_number}

-- Add personal finance category details (stored as JSON) 
ALTER TABLE transactions ADD COLUMN personal_finance_category_detailed TEXT; -- JSON: {primary, detailed, confidence_level}

-- Add original amount (before any adjustments)
ALTER TABLE transactions ADD COLUMN original_description TEXT;

-- Create indexes for commonly queried new fields
CREATE INDEX IF NOT EXISTS idx_transactions_payment_channel ON transactions(payment_channel);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_entity_id ON transactions(merchant_entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_authorized_date ON transactions(authorized_date);
CREATE INDEX IF NOT EXISTS idx_transactions_check_number ON transactions(check_number);
