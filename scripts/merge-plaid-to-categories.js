// Script to merge plaid_pfc_categories data into categories table
// Run with: node scripts/merge-plaid-to-categories.js

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'finance.db');
const db = new Database(dbPath);

console.log('Starting merge of plaid_pfc_categories data into categories table...\n');

try {
  // Get count before merge
  const beforeCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM categories 
    WHERE plaid_detailed_category_id IS NOT NULL
  `).get();
  
  console.log(`Categories with plaid data before merge: ${beforeCount.count}`);
  
  // Step 1: Find categories that were auto-created from transactions but have a mapped category
  console.log('\nStep 1: Checking for duplicate categories...');
  const duplicates = db.prepare(`
    SELECT 
      c1.id as auto_created_id,
      c1.name as auto_created_name,
      c2.id as mapped_id,
      c2.name as mapped_name,
      c1.plaid_detailed_category_id
    FROM categories c1
    JOIN plaid_pfc_categories p ON c1.plaid_detailed_category_id = p.detailed_category
    JOIN categories c2 ON p.default_merchant_category_id = c2.id
    WHERE c1.id != c2.id
  `).all();
  
  if (duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate categories to consolidate:`);
    
    for (const dup of duplicates) {
      console.log(`\n  "${dup.auto_created_name}" → "${dup.mapped_name}"`);
      
      // Update transactions to use the mapped category instead of auto-created
      const txnUpdate = db.prepare(`
        UPDATE transactions 
        SET category_id = ?, updated_at = datetime('now')
        WHERE category_id = ?
      `).run(dup.mapped_id, dup.auto_created_id);
      
      console.log(`    Updated ${txnUpdate.changes} transactions`);
      
      // Update merchants to use the mapped category
      const merchantUpdate = db.prepare(`
        UPDATE merchants 
        SET default_category_id = ?, updated_at = datetime('now')
        WHERE default_category_id = ?
      `).run(dup.mapped_id, dup.auto_created_id);
      
      console.log(`    Updated ${merchantUpdate.changes} merchants`);
      
      // Delete the auto-created duplicate category
      db.prepare(`DELETE FROM categories WHERE id = ?`).run(dup.auto_created_id);
      console.log(`    Deleted duplicate category`);
    }
  } else {
    console.log('No duplicate categories found.');
  }
  
  // Step 2: Perform the merge
  console.log('\nStep 2: Merging plaid data into categories...');
  const result = db.prepare(`
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
    )
  `).run();
  
  console.log(`\n✅ Merge completed: ${result.changes} categories updated`);
  
  // Get count after merge
  const afterCount = db.prepare(`
    SELECT COUNT(*) as count 
    FROM categories 
    WHERE plaid_detailed_category_id IS NOT NULL
  `).get();
  
  console.log(`Categories with plaid data after merge: ${afterCount.count}`);
  
  // Show some examples
  console.log('\nExample merged categories:');
  const examples = db.prepare(`
    SELECT 
      name, 
      plaid_detailed_category_id, 
      plaid_primary_category,
      plaid_description 
    FROM categories 
    WHERE plaid_detailed_category_id IS NOT NULL 
    ORDER BY name 
    LIMIT 5
  `).all();
  
  examples.forEach(cat => {
    console.log(`\n  ${cat.name}`);
    console.log(`    Plaid ID: ${cat.plaid_detailed_category_id}`);
    console.log(`    Primary: ${cat.plaid_primary_category}`);
    console.log(`    Description: ${cat.plaid_description}`);
  });
  
  console.log('\n✨ Migration completed successfully!');
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
} finally {
  db.close();
}
