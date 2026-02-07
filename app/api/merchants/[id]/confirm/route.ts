import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchant = database.getMerchant(params.id);
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    database.confirmMerchant(params.id);
    const updated = database.getMerchant(params.id);

    return NextResponse.json({ merchant: updated });
  } catch (error) {
    console.error("Error confirming merchant:", error);
    return NextResponse.json(
      { error: "Failed to confirm merchant" },
      { status: 500 }
    );
  }
}
