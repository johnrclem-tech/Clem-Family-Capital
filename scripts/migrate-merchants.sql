-- Create merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  default_category_id TEXT,
  default_entity_id TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (default_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (default_entity_id) REFERENCES entities(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(default_category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_entity ON merchants(default_entity_id);
