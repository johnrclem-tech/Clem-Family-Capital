-- Migration: Add merchant_entity_id column to merchants table
-- Run this to update existing database: sqlite3 finance.db < scripts/add-merchant-entity-id.sql

-- Add merchant_entity_id column
ALTER TABLE merchants ADD COLUMN merchant_entity_id TEXT;

-- Create index for merchant_entity_id
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_entity_id ON merchants(merchant_entity_id);
