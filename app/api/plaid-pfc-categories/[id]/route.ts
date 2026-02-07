import { NextRequest, NextResponse } from "next/server";

// DEPRECATED: This endpoint is deprecated. Plaid categories are now stored directly in the categories table.
// PATCH /api/plaid-pfc-categories/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Plaid categories are now stored directly in the categories table. Use the categories API instead."
    },
    { status: 410 } // 410 Gone
  );
}
