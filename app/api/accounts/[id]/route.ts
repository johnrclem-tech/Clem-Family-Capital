import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // Update account settings
    database.updatePlaidItem(id, {
      custom_name: body.custom_name,
      is_hidden: body.is_hidden,
    });

    return NextResponse.json({
      success: true,
      message: "Account updated successfully",
    });

  } catch (error) {
    console.error("Error updating account:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
