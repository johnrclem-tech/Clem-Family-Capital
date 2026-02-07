import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

// PATCH /api/categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log(`[API] Updating category ${id} with:`, body);
    
    // Convert empty string to null for parent_id
    if (body.parent_id === "") {
      body.parent_id = null;
    }
    
    // Prevent a category from being its own parent
    if (body.parent_id === id) {
      return NextResponse.json(
        { error: "A category cannot be its own parent" },
        { status: 400 }
      );
    }
    
    // Get all categories to check for circular references
    const allCategories = database.getCategories();
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat]));
    
    // Check for circular references (prevent setting parent to a descendant)
    if (body.parent_id) {
      let currentParentId = body.parent_id;
      const visited = new Set<string>();
      
      while (currentParentId) {
        if (visited.has(currentParentId)) {
          break; // Prevent infinite loop
        }
        if (currentParentId === id) {
          return NextResponse.json(
            { error: "Cannot set parent: would create a circular reference" },
            { status: 400 }
          );
        }
        visited.add(currentParentId);
        const parentCategory = categoryMap.get(currentParentId);
        currentParentId = parentCategory?.parent_id || null;
      }
    }
    
    // Handle is_parent_category if provided
    const updateData: any = { ...body };
    if (updateData.is_parent_category !== undefined) {
      // If setting as parent category, clear parent_id
      if (updateData.is_parent_category === true) {
        updateData.parent_id = null;
      }
    }
    
    const updated = database.updateCategory(id, updateData);
    
    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Error updating category:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error stack:", errorStack);

    // better-sqlite3 throws SqliteError with a `code` like SQLITE_CONSTRAINT
    const sqliteCode = (error as any)?.code as string | undefined;
    if (sqliteCode?.startsWith("SQLITE_CONSTRAINT")) {
      return NextResponse.json(
        { error: "Constraint violation updating category", details: errorMessage, code: sqliteCode },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update category", details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    database.deleteCategory(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
