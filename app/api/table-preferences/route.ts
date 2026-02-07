import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

// GET /api/table-preferences?contextType=account&contextId=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contextType = searchParams.get("contextType") as 'account' | 'category' | 'all' | 'merchants' | null;
    const contextId = searchParams.get("contextId") || null;

    if (!contextType) {
      return NextResponse.json(
        { error: "contextType is required" },
        { status: 400 }
      );
    }

    if (!['account', 'category', 'all', 'merchants'].includes(contextType)) {
      return NextResponse.json(
        { error: "contextType must be 'account', 'category', 'all', or 'merchants'" },
        { status: 400 }
      );
    }

    const preferences = database.getTablePreferences(
      contextType,
      contextId
    );

    return NextResponse.json({
      success: true,
      preferences: preferences || null,
    });
  } catch (error) {
    console.error("Error fetching table preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/table-preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      context_type,
      context_id,
      column_visibility,
      column_order,
      column_sizing,
      sorting,
    } = body;

    if (!context_type || !['account', 'category', 'all', 'merchants', 'merchant_categories'].includes(context_type)) {
      return NextResponse.json(
        { error: "context_type is required and must be 'account', 'category', 'all', 'merchants', or 'merchant_categories'" },
        { status: 400 }
      );
    }

    if (!column_visibility || !column_order || !column_sizing || !sorting) {
      return NextResponse.json(
        { error: "All preference fields are required" },
        { status: 400 }
      );
    }

    const preferences = database.upsertTablePreferences({
      context_type,
      context_id: context_id || null,
      column_visibility,
      column_order,
      column_sizing,
      sorting,
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Error saving table preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/table-preferences?contextType=account&contextId=xxx
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contextType = searchParams.get("contextType") as 'account' | 'category' | 'all' | 'merchants' | null;
    const contextId = searchParams.get("contextId") || null;

    if (!contextType) {
      return NextResponse.json(
        { error: "contextType is required" },
        { status: 400 }
      );
    }

    if (!['account', 'category', 'all', 'merchants'].includes(contextType)) {
      return NextResponse.json(
        { error: "contextType must be 'account', 'category', 'all', or 'merchants'" },
        { status: 400 }
      );
    }

    database.deleteTablePreferences(contextType, contextId);

    return NextResponse.json({
      success: true,
      message: "Preferences deleted",
    });
  } catch (error) {
    console.error("Error deleting table preferences:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
