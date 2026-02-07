-- Migration: Add tags table and tag_id columns
-- Run this to update existing database: sqlite3 finance.db < scripts/migrate-add-tags.sql

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- Add tag_id column to transactions table if it doesn't exist
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN, so we check pragma first
-- This will fail silently if column already exists (which is fine)
ALTER TABLE transactions ADD COLUMN tag_id TEXT REFERENCES tags(id) ON DELETE SET NULL;

-- Add default_tag_id column to merchants table if it doesn't exist
ALTER TABLE merchants ADD COLUMN default_tag_id TEXT REFERENCES tags(id) ON DELETE SET NULL;

-- Create index for tag_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_transactions_tag_id ON transactions(tag_id);

-- Create index for default_tag_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_merchants_default_tag_id ON merchants(default_tag_id);

-- Create trigger for tags updated_at if it doesn't exist
CREATE TRIGGER IF NOT EXISTS update_tags_updated_at 
AFTER UPDATE ON tags
BEGIN
  UPDATE tags SET updated_at = datetime('now') WHERE id = NEW.id;
END;
