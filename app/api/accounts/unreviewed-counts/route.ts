import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const accounts = database.getPlaidItems();
    const counts: Record<string, number> = {};

    // Get unreviewed count for each account
    for (const account of accounts) {
      counts[account.id] = database.getUnreviewedTransactionCount(account.id);
    }

    return NextResponse.json({
      success: true,
      counts,
    });

  } catch (error) {
    console.error("Error fetching unreviewed counts:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        counts: {},
      },
      { status: 500 }
    );
  }
}
