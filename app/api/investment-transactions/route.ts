import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Fetch investment transactions with enriched data
    console.log("[API] Fetching investment transactions...");
    const startTime = Date.now();
    const transactions = database.getInvestmentTransactionsEnriched(1000);
    const duration = Date.now() - startTime;
    console.log(`[API] Fetched ${transactions?.length || 0} investment transactions in ${duration}ms`);

    if (transactions.length === 0) {
      console.warn("[API] No investment transactions returned from database");
    }

    const response = {
      success: true,
      transactions: transactions || [],
      count: transactions?.length || 0,
    };

    console.log(`[API] Returning response with ${response.count} investment transactions`);
    return NextResponse.json(response);

  } catch (error) {
    console.error("[API] Error fetching investment transactions:", error);
    if (error instanceof Error) {
      console.error("[API] Error message:", error.message);
      console.error("[API] Error stack:", error.stack);
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        transactions: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
