import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const entities = database.getEntities();

    return NextResponse.json({
      success: true,
      entities: entities || [],
      count: entities?.length || 0,
    });

  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        entities: [],
      },
      { status: 500 }
    );
  }
}
