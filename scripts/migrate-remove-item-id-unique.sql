-- Migration: Remove UNIQUE constraint from plaid_items.item_id
-- This allows multiple accounts per institution (item_id)
-- Run this to update existing database

-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table
-- Step 0: Drop new table if it exists from a previous failed migration
DROP TABLE IF EXISTS plaid_items_new;

-- Step 1: Create new table without UNIQUE constraint
CREATE TABLE plaid_items_new (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL,  -- Removed UNIQUE constraint
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  account_type TEXT DEFAULT 'Cash',
  account_name TEXT,
  custom_name TEXT,
  is_hidden INTEGER DEFAULT 0,
  current_balance REAL DEFAULT 0,
  balance_currency_code TEXT DEFAULT 'USD',
  cursor TEXT,
  last_sync_at TEXT,
  sync_status TEXT DEFAULT 'active',
  error_message TEXT,
  plaid_account_id TEXT,
  mask TEXT,
  official_name TEXT,
  account_subtype TEXT,
  available_balance REAL,
  balance_limit REAL,
  unofficial_currency_code TEXT,
  balance_last_updated_datetime TEXT,
  verification_status TEXT,
  verification_name TEXT,
  verification_insights TEXT,
  persistent_account_id TEXT,
  holder_category TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Step 2: Copy all data from old table to new table
-- Only copy columns that exist in the old table (base schema columns)
-- New columns will be NULL/default in the new table
INSERT INTO plaid_items_new (
  id, item_id, access_token, institution_id, institution_name,
  cursor, last_sync_at, sync_status, error_message,
  created_at, updated_at
)
SELECT 
  id, item_id, access_token, institution_id, institution_name,
  cursor, last_sync_at, sync_status, error_message,
  COALESCE(created_at, datetime('now')), COALESCE(updated_at, datetime('now'))
FROM plaid_items;

-- Step 3: Drop old table
DROP TABLE plaid_items;

-- Step 4: Rename new table to original name
ALTER TABLE plaid_items_new RENAME TO plaid_items;

-- Step 5: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_sync_status ON plaid_items(sync_status);
CREATE INDEX IF NOT EXISTS idx_plaid_items_plaid_account_id ON plaid_items(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_account_subtype ON plaid_items(account_subtype);
CREATE INDEX IF NOT EXISTS idx_plaid_items_verification_status ON plaid_items(verification_status);
