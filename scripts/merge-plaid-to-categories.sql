-- Migration: Merge plaid_pfc_categories data into categories table
-- This will populate the plaid fields in the categories table using the existing mappings

-- Update categories with data from plaid_pfc_categories
UPDATE categories 
SET 
  plaid_detailed_category_id = (
    SELECT p.detailed_category 
    FROM plaid_pfc_categories p 
    WHERE p.default_merchant_category_id = categories.id
  ),
  plaid_description = (
    SELECT p.description 
    FROM plaid_pfc_categories p 
    WHERE p.default_merchant_category_id = categories.id
  ),
  plaid_primary_category = (
    SELECT p.primary_category 
    FROM plaid_pfc_categories p 
    WHERE p.default_merchant_category_id = categories.id
  ),
  updated_at = datetime('now')
WHERE id IN (
  SELECT default_merchant_category_id 
  FROM plaid_pfc_categories 
  WHERE default_merchant_category_id IS NOT NULL
);
