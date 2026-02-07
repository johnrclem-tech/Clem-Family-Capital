import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { category_id, tag_id, entity_id, update_existing, merchant_name } = body;

    // Merchant name is the stable identifier (passed from frontend)
    if (!merchant_name) {
      return NextResponse.json(
        { error: "Merchant name is required" },
        { status: 400 }
      );
    }

    // Try to find merchant by name (stable identifier)
    let merchant = database.getMerchantByName(merchant_name);
    
    if (!merchant) {
      // Merchant doesn't exist in merchants table yet - create it
      merchant = database.createMerchant({
        name: merchant_name,
        default_category_id: category_id || null,
        default_tag_id: tag_id !== undefined ? tag_id : entity_id || null,
      });
    }

    let updatedCount = 0;

    // Update existing transactions if requested
    if (update_existing) {
      const updates: { category_id?: string | null; tag_id?: string | null } = {};
      
      if (category_id !== undefined) {
        updates.category_id = category_id;
      }
      const tagIdValue = tag_id !== undefined ? tag_id : entity_id;
      if (tagIdValue !== undefined) {
        updates.tag_id = tagIdValue;
      }

      updatedCount = database.bulkUpdateMerchantTransactions(merchant.name, updates);
    }

    // Update merchant defaults
    const merchantUpdates: any = {};
    if (category_id !== undefined) {
      merchantUpdates.default_category_id = category_id;
    }
    const tagIdValue = tag_id !== undefined ? tag_id : entity_id;
    if (tagIdValue !== undefined) {
      merchantUpdates.default_tag_id = tagIdValue;
    }

    if (Object.keys(merchantUpdates).length > 0) {
      database.updateMerchant(merchant.id, merchantUpdates);
    }

    const updated = database.getMerchant(merchant.id);

    return NextResponse.json({ 
      merchant: updated,
      transactions_updated: updatedCount
    });
  } catch (error) {
    console.error("Error bulk updating merchant:", error);
    return NextResponse.json(
      { error: "Failed to bulk update merchant" },
      { status: 500 }
    );
  }
}
