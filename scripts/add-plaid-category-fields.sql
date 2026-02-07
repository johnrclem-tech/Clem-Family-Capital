-- Migration: Add Plaid category fields to categories table
-- Run this to update existing database: sqlite3 finance.db < scripts/add-plaid-category-fields.sql

-- Add plaid category fields
ALTER TABLE categories ADD COLUMN plaid_detailed_category_id TEXT;
ALTER TABLE categories ADD COLUMN plaid_primary_category TEXT;
ALTER TABLE categories ADD COLUMN plaid_description TEXT;

-- Create unique index for plaid_detailed_category_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_plaid_detailed_category_id ON categories(plaid_detailed_category_id);
