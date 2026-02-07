-- Clem Finance Tagger Database Schema
-- Supports Supabase PostgreSQL or can be adapted for SQLite

-- Enable UUID extension (PostgreSQL/Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENTITIES TABLE
-- Represents different financial entities (Personal, Properties, Business entities, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_entities_name ON entities(name);

-- ============================================
-- PLAID ITEMS TABLE
-- Stores Plaid access tokens and sync status for each connected institution
-- ============================================
CREATE TABLE IF NOT EXISTS plaid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  institution_id TEXT,
  institution_name TEXT,
  cursor TEXT, -- For incremental sync
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'active', -- active, error, disconnected
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plaid_items_item_id ON plaid_items(item_id);
CREATE INDEX idx_plaid_items_sync_status ON plaid_items(sync_status);

-- ============================================
-- CATEGORIES TABLE
-- Hierarchical category structure with parent_id for nesting
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  description TEXT,
  color TEXT, -- For UI visualization
  icon TEXT, -- Icon name or emoji
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, parent_id) -- Unique within same parent level
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_name ON categories(name);

-- ============================================
-- TRANSACTIONS TABLE
-- Main transaction data linked to entity and category
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Plaid identifiers
  plaid_transaction_id TEXT UNIQUE,
  plaid_item_id UUID REFERENCES plaid_items(id) ON DELETE CASCADE,
  account_id TEXT,
  
  -- Transaction details
  date DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  merchant_name TEXT,
  name TEXT NOT NULL, -- Original transaction name from bank
  
  -- Categorization
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  
  -- Plaid category information (for mapping)
  plaid_category JSONB, -- Array of category hierarchy from Plaid
  plaid_category_id TEXT,
  
  -- Additional metadata
  pending BOOLEAN DEFAULT FALSE,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_merchant ON transactions(merchant_name);
CREATE INDEX idx_transactions_entity_id ON transactions(entity_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_plaid_transaction_id ON transactions(plaid_transaction_id);
CREATE INDEX idx_transactions_plaid_item_id ON transactions(plaid_item_id);

-- ============================================
-- CATEGORY RULES TABLE
-- Auto-mapping rules for merchant names and bank categories to user categories
-- ============================================
CREATE TABLE IF NOT EXISTS category_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Rule conditions
  merchant_pattern TEXT, -- Pattern to match merchant name (supports wildcards)
  plaid_category_pattern TEXT, -- Pattern to match Plaid category
  amount_min DECIMAL(12, 2), -- Optional amount range
  amount_max DECIMAL(12, 2),
  
  -- Rule target
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  
  -- Rule metadata
  priority INTEGER DEFAULT 0, -- Higher priority rules apply first
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_category_rules_merchant ON category_rules(merchant_pattern);
CREATE INDEX idx_category_rules_plaid_category ON category_rules(plaid_category_pattern);
CREATE INDEX idx_category_rules_priority ON category_rules(priority DESC);
CREATE INDEX idx_category_rules_active ON category_rules(is_active);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plaid_items_updated_at BEFORE UPDATE ON plaid_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_rules_updated_at BEFORE UPDATE ON category_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for transactions with enriched data
CREATE OR REPLACE VIEW transactions_enriched AS
SELECT 
  t.*,
  e.name as entity_name,
  c.name as category_name,
  pi.institution_name
FROM transactions t
LEFT JOIN entities e ON t.entity_id = e.id
LEFT JOIN categories c ON t.category_id = c.id
LEFT JOIN plaid_items pi ON t.plaid_item_id = pi.id;

-- View for category hierarchy (useful for building tree structures)
CREATE OR REPLACE VIEW categories_with_parent AS
SELECT 
  c.*,
  p.name as parent_name,
  p.id as parent_category_id
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id;
