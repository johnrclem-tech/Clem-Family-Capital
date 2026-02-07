import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const merchantNameParam = searchParams.get("merchantName");

    let merchantName: string;

    if (merchantNameParam) {
      // Merchant name provided as query parameter (for merchants from transactions)
      merchantName = merchantNameParam;
    } else {
      // Try to get merchant by ID first
      const merchant = database.getMerchant(id);
      
      if (merchant) {
        // Merchant exists in merchants table
        merchantName = merchant.name;
      } else {
        // Merchant might not exist in merchants table yet (auto-populated from transactions)
        // Use the ID as merchant name (fallback)
        merchantName = id;
      }
    }
    
    const transactions = database.getTransactionsByMerchant(merchantName);
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching merchant transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchant transactions" },
      { status: 500 }
    );
  }
}
