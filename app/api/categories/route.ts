import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withPfcCounts = searchParams.get("withPfcCounts") === "true";

    const categories = withPfcCounts 
      ? database.getCategoriesWithPfcCounts()
      : database.getCategories();

    return NextResponse.json({
      success: true,
      categories: categories || [],
      count: categories?.length || 0,
    });

  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        categories: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, parent_id, description, color, icon, is_parent_category } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = database.createCategory({
      name,
      parent_id: parent_id || null,
      description: description || null,
      color: color || null,
      icon: icon || null,
      is_parent_category: is_parent_category || false,
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
