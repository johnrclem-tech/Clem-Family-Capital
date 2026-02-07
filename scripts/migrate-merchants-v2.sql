-- Add new columns to merchants table for advanced features
ALTER TABLE merchants ADD COLUMN is_confirmed INTEGER DEFAULT 0;
ALTER TABLE merchants ADD COLUMN merged_into_merchant_id TEXT;
ALTER TABLE merchants ADD COLUMN logo_url TEXT;
ALTER TABLE merchants ADD COLUMN confidence_level TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_merchants_confirmed ON merchants(is_confirmed);
CREATE INDEX IF NOT EXISTS idx_merchants_merged ON merchants(merged_into_merchant_id);

-- Add foreign key constraint for merged merchants
-- Note: SQLite doesn't support adding FK after table creation, so this is for documentation
-- FOREIGN KEY (merged_into_merchant_id) REFERENCES merchants(id) ON DELETE SET NULL
