import { NextResponse } from "next/server";
import { database, db } from "@/lib/database";

export const dynamic = "force-dynamic";

// POST /api/migrate/merge-plaid-categories
// This endpoint will merge plaid_pfc_categories data into the categories table
export async function POST() {
  try {
    // Get count before merge
    const beforeCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM categories 
      WHERE plaid_detailed_category_id IS NOT NULL
    `).get() as { count: number };
    
    console.log(`Categories with plaid data before merge: ${beforeCount.count}`);
    
    // Perform the merge
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
    
    // Get count after merge
    const afterCount = db.prepare(`
      SELECT COUNT(*) as count 
      FROM categories 
      WHERE plaid_detailed_category_id IS NOT NULL
    `).get() as { count: number };
    
    console.log(`Categories with plaid data after merge: ${afterCount.count}`);
    
    // Get some examples
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
    
    return NextResponse.json({
      success: true,
      message: `Merge completed: ${result.changes} categories updated`,
      before: beforeCount.count,
      after: afterCount.count,
      updated: result.changes,
      examples,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
