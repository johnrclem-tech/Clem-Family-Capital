// Script to backfill categories from existing transaction Plaid data
// Run with: node scripts/backfill-plaid-categories.js

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'finance.db');
const db = new Database(dbPath);

console.log('Starting Plaid category backfill...');

// Get all unique Plaid categories from transactions
const transactions = db.prepare(`
  SELECT DISTINCT personal_finance_category_detailed
  FROM transactions
  WHERE personal_finance_category_detailed IS NOT NULL
`).all();

console.log(`Found ${transactions.length} unique Plaid categories in transactions`);

let created = 0;
let skipped = 0;
let errors = 0;

for (const txn of transactions) {
  try {
    const pfc = typeof txn.personal_finance_category_detailed === 'string'
      ? JSON.parse(txn.personal_finance_category_detailed)
      : txn.personal_finance_category_detailed;

    if (!pfc?.detailed) continue;

    const detailedCategory = pfc.detailed;
    const primaryCategory = pfc.primary || "";

    // Check if category already exists with this plaid_detailed_category_id
    const existing = db.prepare(`
      SELECT id FROM categories WHERE plaid_detailed_category_id = ?
    `).get(detailedCategory);

    if (existing) {
      skipped++;
      continue;
    }

    // Format category name
    let categoryName = detailedCategory;
    if (detailedCategory.startsWith(primaryCategory + "_")) {
      categoryName = detailedCategory.substring(primaryCategory.length + 1);
    }
    categoryName = categoryName.replace(/_/g, " ");
    categoryName = categoryName.split(" ").map(word =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");

    // Create category
    const stmt = db.prepare(`
      INSERT INTO categories (name, parent_id, description, color, icon, is_parent_category, plaid_detailed_category_id, plaid_primary_category, plaid_description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      categoryName,
      null, // parent_id
      null, // description
      null, // color
      null, // icon
      0,    // is_parent_category
      detailedCategory,
      primaryCategory,
      null  // plaid_description
    );

    created++;
    console.log(`Created category: ${categoryName} (${detailedCategory})`);
  } catch (error) {
    errors++;
    console.error(`Error processing category:`, error.message);
  }
}

console.log(`\nBackfill completed:`);
console.log(`  Created: ${created}`);
console.log(`  Skipped: ${skipped}`);
console.log(`  Errors: ${errors}`);

db.close();
