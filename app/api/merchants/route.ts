import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET() {
  try {
    const merchants = database.getMerchants();
    return NextResponse.json({ merchants });
  } catch (error) {
    console.error("Error fetching merchants:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchants" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, default_category_id, default_entity_id, notes } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Merchant name is required" },
        { status: 400 }
      );
    }

    // Check if merchant already exists
    const existing = database.getMerchantByName(name.trim());
    if (existing) {
      return NextResponse.json(
        { error: "Merchant with this name already exists" },
        { status: 409 }
      );
    }

    const merchant = database.createMerchant({
      name: name.trim(),
      default_category_id: default_category_id || null,
      default_entity_id: default_entity_id || null,
      notes: notes || null,
    });

    return NextResponse.json({ merchant }, { status: 201 });
  } catch (error) {
    console.error("Error creating merchant:", error);
    return NextResponse.json(
      { error: "Failed to create merchant" },
      { status: 500 }
    );
  }
}
