import { NextRequest, NextResponse } from "next/server";
import { createLinkToken } from "@/lib/plaid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/auth
    const userId = "user_123"; // Placeholder
    
    const linkToken = await createLinkToken(userId);

    return NextResponse.json({
      success: true,
      link_token: linkToken.link_token,
      expiration: linkToken.expiration,
    });

  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
