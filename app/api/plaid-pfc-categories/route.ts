import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// DEPRECATED: This endpoint is deprecated. Plaid categories are now stored directly in the categories table.
// GET /api/plaid-pfc-categories
export async function GET() {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Plaid categories are now stored directly in the categories table.",
      categories: []
    },
    { status: 410 } // 410 Gone
  );
}
