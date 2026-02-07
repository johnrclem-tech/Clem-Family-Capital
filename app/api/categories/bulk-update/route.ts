import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

// POST /api/categories/bulk-update
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const categoryIds = Array.isArray(body?.categoryIds) ? body.categoryIds : [];
    const updates = body?.updates ?? {};

    if (categoryIds.length === 0) {
      return NextResponse.json(
        { error: "categoryIds is required" },
        { status: 400 }
      );
    }

    // Normalize empty string to null for parent_id
    if (updates.parent_id === "") {
      updates.parent_id = null;
    }

    // Handle is_parent_category if provided
    if (updates.is_parent_category !== undefined) {
      // If setting as parent category, clear parent_id
      if (updates.is_parent_category === true) {
        updates.parent_id = null;
      }
    }

    // Prevent obvious bad inputs
    for (const id of categoryIds) {
      if (updates.parent_id && updates.parent_id === id) {
        return NextResponse.json(
          { error: "A category cannot be its own parent" },
          { status: 400 }
        );
      }
    }

    // Apply updates (simple loop, matches transactions-style bulk endpoint)
    const results = [];
    for (const id of categoryIds) {
      const updated = database.updateCategory(id, updates);
      results.push(updated);
    }

    return NextResponse.json({ success: true, updatedCount: results.length });
  } catch (error) {
    console.error("Error bulk updating categories:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const sqliteCode = (error as any)?.code as string | undefined;
    if (sqliteCode?.startsWith("SQLITE_CONSTRAINT")) {
      return NextResponse.json(
        { error: "Constraint violation bulk updating categories", details: errorMessage, code: sqliteCode },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to bulk update categories", details: errorMessage },
      { status: 500 }
    );
  }
}

