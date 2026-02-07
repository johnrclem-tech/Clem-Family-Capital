import { NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET() {
  try {
    const merchants = database.getMerchantsWithStats();
    return NextResponse.json({ merchants });
  } catch (error) {
    console.error("Error fetching merchant statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchant statistics" },
      { status: 500 }
    );
  }
}
