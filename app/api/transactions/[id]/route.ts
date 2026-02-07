import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // Update transaction
    const updates: {
      category_id?: string | null;
      tag_id?: string | null;
      notes?: string | null;
      merchant_name?: string | null;
    } = {};
    
    if (body.category_id !== undefined) {
      updates.category_id = body.category_id;
    }
    // Handle tag_id: use tag_id if provided (including null)
    if (body.tag_id !== undefined) {
      updates.tag_id = body.tag_id;
    }
    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }
    if (body.merchant_name !== undefined) {
      updates.merchant_name = body.merchant_name;
    }
    
    console.log(`[API] Updating transaction ${id} with:`, JSON.stringify(updates, null, 2));
    console.log(`[API] Body received:`, JSON.stringify(body, null, 2));
    database.updateTransactionById(id, updates);
    console.log(`[API] Transaction ${id} updated successfully`);

    return NextResponse.json({
      success: true,
      message: "Transaction updated successfully",
    });

  } catch (error) {
    console.error("Error updating transaction:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
