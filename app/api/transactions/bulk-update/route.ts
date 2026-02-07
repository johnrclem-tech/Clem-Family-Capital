import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionIds, updates } = body;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json(
        { error: "transactionIds array is required" },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "updates object is required" },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Update each transaction
    for (const id of transactionIds) {
      try {
        const updateData: {
          category_id?: string | null;
          tag_id?: string | null;
          merchant_name?: string | null;
        } = {};

        if (updates.category_id !== undefined) {
          updateData.category_id = updates.category_id;
        }
        if (updates.tag_id !== undefined) {
          updateData.tag_id = updates.tag_id;
        }
        if (updates.merchant_name !== undefined) {
          updateData.merchant_name = updates.merchant_name;
        }

        if (Object.keys(updateData).length > 0) {
          database.updateTransactionById(id, updateData);
          updatedCount++;
        }
      } catch (error) {
        errors.push(`Failed to update transaction ${id}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalRequested: transactionIds.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error bulk updating transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
