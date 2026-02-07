-- Migration: Add table_preferences table for storing per-account/category table state
-- Run this with: sqlite3 finance.db < scripts/migrate-table-preferences.sql

-- ============================================
-- TABLE PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS table_preferences (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  context_type TEXT NOT NULL CHECK(context_type IN ('account', 'category', 'all')),
  context_id TEXT, -- account_id or category_id, NULL for 'all'
  column_visibility TEXT NOT NULL, -- JSON object: { "column_id": true/false }
  column_order TEXT NOT NULL, -- JSON array: ["date", "merchant_name", ...]
  column_sizing TEXT NOT NULL, -- JSON object: { "column_id": width }
  sorting TEXT NOT NULL, -- JSON array: [{ "id": "date", "desc": true }]
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(context_type, context_id)
);

CREATE INDEX idx_table_preferences_context ON table_preferences(context_type, context_id);
