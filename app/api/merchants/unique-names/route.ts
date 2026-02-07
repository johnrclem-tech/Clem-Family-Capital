import { NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET() {
  try {
    // Get unique merchant names from transactions
    const uniqueNames = database.getUniqueMerchantNames();
    // Get all merchants from merchants table
    const merchants = database.getMerchants();
    const merchantNames = merchants.map(m => m.name);
    
    // Combine and deduplicate
    const allNames = Array.from(new Set([...uniqueNames, ...merchantNames])).sort();
    
    return NextResponse.json({ names: allNames });
  } catch (error) {
    console.error("Error fetching unique merchant names:", error);
    return NextResponse.json(
      { error: "Failed to fetch unique merchant names" },
      { status: 500 }
    );
  }
}
