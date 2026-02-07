import { NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST() {
  try {
    const result = database.syncMerchantsFromTransactions();
    return NextResponse.json({
      success: true,
      created: result.created,
      updated: result.updated,
    });
  } catch (error) {
    console.error("Error syncing merchants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to sync merchants" },
      { status: 500 }
    );
  }
}
