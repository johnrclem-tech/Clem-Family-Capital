import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = database.getMerchant(id);
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ merchant });
  } catch (error) {
    console.error("Error fetching merchant:", error);
    return NextResponse.json(
      { error: "Failed to fetch merchant" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      default_category_id,
      default_tag_id,
      default_entity_id,
      notes,
      logo_url,
      confidence_level,
      is_confirmed
    } = body;

    let merchant = database.getMerchant(id);
    
    // If merchant doesn't exist by ID, try to find by name or create it
    if (!merchant) {
      // Try to find merchant by name if name is provided
      if (name) {
        merchant = database.getMerchantByName(name.trim());
      }
      
      // If still not found, create the merchant
      if (!merchant) {
        if (!name) {
          return NextResponse.json(
            { error: "Merchant name is required to create merchant" },
            { status: 400 }
          );
        }
        merchant = database.createMerchant({
          name: name.trim(),
          default_category_id: default_category_id !== undefined ? default_category_id : null,
          default_tag_id: default_tag_id !== undefined ? default_tag_id : (default_entity_id !== undefined ? default_entity_id : null),
          notes: notes !== undefined ? notes : null,
          logo_url: logo_url !== undefined ? logo_url : null,
          confidence_level: confidence_level !== undefined ? confidence_level : null,
        });
      }
    }

    // If name is being updated, check for duplicates
    if (name !== undefined && name !== merchant.name) {
      const existing = database.getMerchantByName(name.trim());
      if (existing && existing.id !== merchant.id) {
        return NextResponse.json(
          { error: "Merchant with this name already exists" },
          { status: 409 }
        );
      }
    }

    const updated = database.updateMerchant(merchant.id, {
      name: name !== undefined ? name.trim() : undefined,
      default_category_id: default_category_id !== undefined ? default_category_id : undefined,
      default_tag_id: default_tag_id !== undefined ? default_tag_id : (default_entity_id !== undefined ? default_entity_id : undefined),
      notes: notes !== undefined ? notes : undefined,
      logo_url: logo_url !== undefined ? logo_url : undefined,
      confidence_level: confidence_level !== undefined ? confidence_level : undefined,
      is_confirmed: is_confirmed !== undefined ? is_confirmed : undefined,
    });

    return NextResponse.json({ merchant: updated });
  } catch (error) {
    console.error("Error updating merchant:", error);
    return NextResponse.json(
      { error: "Failed to update merchant" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const merchant = database.getMerchant(id);
    if (!merchant) {
      return NextResponse.json(
        { error: "Merchant not found" },
        { status: 404 }
      );
    }

    database.deleteMerchant(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting merchant:", error);
    return NextResponse.json(
      { error: "Failed to delete merchant" },
      { status: 500 }
    );
  }
}
