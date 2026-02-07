import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { target_merchant_id } = body;

    if (!target_merchant_id) {
      return NextResponse.json(
        { error: "Target merchant ID is required" },
        { status: 400 }
      );
    }

    const sourceMerchant = database.getMerchant(id);
    const targetMerchant = database.getMerchant(target_merchant_id);

    if (!sourceMerchant || !targetMerchant) {
      return NextResponse.json(
        { error: "Source or target merchant not found" },
        { status: 404 }
      );
    }

    database.mergeMerchants(id, target_merchant_id);

    return NextResponse.json({ 
      success: true,
      message: `Merged "${sourceMerchant.name}" into "${targetMerchant.name}"`
    });
  } catch (error) {
    console.error("Error merging merchants:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to merge merchants" },
      { status: 500 }
    );
  }
}
