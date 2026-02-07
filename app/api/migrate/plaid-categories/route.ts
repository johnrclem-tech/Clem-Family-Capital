import { NextResponse } from "next/server";
import { database, db } from "@/lib/database";

export const dynamic = "force-dynamic";

// POST /api/migrate/plaid-categories
// This endpoint will:
// 1. Add plaid columns to categories table if they don't exist
// 2. Create categories from existing transaction Plaid data
export async function POST() {
  try {
    // Step 1: Add plaid columns if they don't exist
    const tableInfo = db.prepare("PRAGMA table_info(categories)").all() as Array<{ name: string }>;
    const hasPlaidFields = tableInfo.some((col) => col.name === "plaid_detailed_category_id");
    
    if (!hasPlaidFields) {
      console.log("Adding plaid category fields to categories table...");
      try {
        db.exec(`ALTER TABLE categories ADD COLUMN plaid_detailed_category_id TEXT;`);
        db.exec(`ALTER TABLE categories ADD COLUMN plaid_primary_category TEXT;`);
        db.exec(`ALTER TABLE categories ADD COLUMN plaid_description TEXT;`);
        db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_plaid_detailed_category_id ON categories(plaid_detailed_category_id);`);
        console.log("Migration completed: plaid category fields added");
      } catch (e: any) {
        if (!e.message?.includes('duplicate column')) {
          throw e;
        }
      }
    }

    // Step 2: Create categories from existing transaction Plaid data
    const transactions = db.prepare(`
      SELECT DISTINCT personal_finance_category_detailed
      FROM transactions
      WHERE personal_finance_category_detailed IS NOT NULL
    `).all() as Array<{ personal_finance_category_detailed: string }>;

    let created = 0;
    let skipped = 0;

    for (const txn of transactions) {
      try {
        const pfc = typeof txn.personal_finance_category_detailed === 'string'
          ? JSON.parse(txn.personal_finance_category_detailed)
          : txn.personal_finance_category_detailed;

        if (!pfc?.detailed) continue;

        const detailedCategory = pfc.detailed;
        const primaryCategory = pfc.primary || "";

        // Check if category already exists
        const existing = database.getCategoryByPlaidDetailedCategoryId(detailedCategory);
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
        database.createCategory({
          name: categoryName,
          description: null, // Can be updated later from plaid_pfc_categories if needed
          plaid_detailed_category_id: detailedCategory,
          plaid_primary_category: primaryCategory,
          plaid_description: null,
        });

        created++;
      } catch (error) {
        console.error("Error creating category from transaction:", error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration completed. Created ${created} categories, skipped ${skipped} existing.`,
      created,
      skipped,
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
