-- Clem Finance Tagger Database Schema - SQLite Version
-- Run this with: sqlite3 finance.db < scripts/setup-sqlite.sql

-- ============================================
-- ENTITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);

-- ============================================
-- PLAID ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS plaid_items (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  item_id TEXT NOT NULL,  -- Removed UNIQUE to allow multiple accounts per institution
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

CREATE INDEX IF NOT EXISTS idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_sync_status ON plaid_items(sync_status);
CREATE INDEX IF NOT EXISTS idx_plaid_items_plaid_account_id ON plaid_items(plaid_account_id);
CREATE INDEX IF NOT EXISTS idx_plaid_items_account_subtype ON plaid_items(account_subtype);
CREATE INDEX IF NOT EXISTS idx_plaid_items_verification_status ON plaid_items(verification_status);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  color TEXT,
  icon TEXT,
  plaid_detailed_category_id TEXT UNIQUE,
  plaid_primary_category TEXT,
  plaid_description TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(name, parent_id)
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_plaid_detailed_category_id ON categories(plaid_detailed_category_id);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  plaid_transaction_id TEXT UNIQUE,
  plaid_item_id TEXT REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  merchant_name TEXT,
  plaid_merchant_name TEXT,
  name TEXT NOT NULL,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  tag_id TEXT REFERENCES tags(id) ON DELETE SET NULL,
  plaid_category TEXT,
  plaid_category_id TEXT,
  pending INTEGER DEFAULT 0,
  notes TEXT,
  is_recurring INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_merchant_name ON transactions(plaid_merchant_name);
CREATE INDEX IF NOT EXISTS idx_transactions_entity_id ON transactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_tag_id ON transactions(tag_id);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_transaction_id ON transactions(plaid_transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_plaid_item_id ON transactions(plaid_item_id);

-- ============================================
-- INVESTMENT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS investment_transactions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  plaid_investment_transaction_id TEXT UNIQUE,
  plaid_item_id TEXT REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT,
  security_id TEXT,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  quantity REAL,
  price REAL,
  fees REAL,
  type TEXT NOT NULL,
  subtype TEXT,
  iso_currency_code TEXT,
  unofficial_currency_code TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_date ON investment_transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_account_id ON investment_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_security_id ON investment_transactions(security_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_plaid_item_id ON investment_transactions(plaid_item_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_plaid_investment_transaction_id ON investment_transactions(plaid_investment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_investment_transactions_type ON investment_transactions(type);

-- ============================================
-- SECURITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS securities (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  plaid_security_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ticker_symbol TEXT,
  isin TEXT,
  cusip TEXT,
  sedol TEXT,
  close_price REAL,
  close_price_as_of TEXT,
  type TEXT,
  iso_currency_code TEXT,
  unofficial_currency_code TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_securities_plaid_security_id ON securities(plaid_security_id);
CREATE INDEX IF NOT EXISTS idx_securities_ticker_symbol ON securities(ticker_symbol);
CREATE INDEX IF NOT EXISTS idx_securities_name ON securities(name);

-- ============================================
-- CATEGORY RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS category_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  merchant_pattern TEXT,
  plaid_category_pattern TEXT,
  amount_min REAL,
  amount_max REAL,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_category_rules_merchant ON category_rules(merchant_pattern);
CREATE INDEX IF NOT EXISTS idx_category_rules_plaid_category ON category_rules(plaid_category_pattern);
CREATE INDEX IF NOT EXISTS idx_category_rules_priority ON category_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_category_rules_active ON category_rules(is_active);

-- ============================================
-- MERCHANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL UNIQUE,
  default_category_id TEXT,
  default_entity_id TEXT,
  default_tag_id TEXT,
  merchant_entity_id TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (default_category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (default_entity_id) REFERENCES entities(id) ON DELETE SET NULL,
  FOREIGN KEY (default_tag_id) REFERENCES tags(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_merchants_name ON merchants(name);
CREATE INDEX IF NOT EXISTS idx_merchants_category ON merchants(default_category_id);
CREATE INDEX IF NOT EXISTS idx_merchants_entity ON merchants(default_entity_id);
CREATE INDEX IF NOT EXISTS idx_merchants_default_tag_id ON merchants(default_tag_id);
CREATE INDEX IF NOT EXISTS idx_merchants_merchant_entity_id ON merchants(merchant_entity_id);

-- ============================================
-- TRIGGERS: Update updated_at timestamp
-- ============================================
DROP TRIGGER IF EXISTS update_entities_updated_at;
CREATE TRIGGER update_entities_updated_at 
AFTER UPDATE ON entities
BEGIN
  UPDATE entities SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_plaid_items_updated_at;
CREATE TRIGGER update_plaid_items_updated_at 
AFTER UPDATE ON plaid_items
BEGIN
  UPDATE plaid_items SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_categories_updated_at;
CREATE TRIGGER update_categories_updated_at 
AFTER UPDATE ON categories
BEGIN
  UPDATE categories SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_transactions_updated_at;
CREATE TRIGGER update_transactions_updated_at 
AFTER UPDATE ON transactions
BEGIN
  UPDATE transactions SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_category_rules_updated_at;
CREATE TRIGGER update_category_rules_updated_at 
AFTER UPDATE ON category_rules
BEGIN
  UPDATE category_rules SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_merchants_updated_at;
CREATE TRIGGER update_merchants_updated_at 
AFTER UPDATE ON merchants
BEGIN
  UPDATE merchants SET updated_at = datetime('now') WHERE id = NEW.id;
END;

DROP TRIGGER IF EXISTS update_tags_updated_at;
CREATE TRIGGER update_tags_updated_at 
AFTER UPDATE ON tags
BEGIN
  UPDATE tags SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- VIEWS
-- ============================================
CREATE VIEW IF NOT EXISTS transactions_enriched AS
SELECT 
  t.*,
  e.name as entity_name,
  c.name as category_name,
  pi.institution_name
FROM transactions t
LEFT JOIN entities e ON t.entity_id = e.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN plaid_items pi ON t.plaid_item_id = pi.id;

CREATE VIEW IF NOT EXISTS categories_with_parent AS
SELECT 
  c.*,
  p.name as parent_name,
  p.id as parent_category_id
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id;
