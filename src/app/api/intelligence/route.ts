import { NextRequest, NextResponse } from "next/server";
import { getLifeIntelligenceSummary } from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const timezone = searchParams.get("timezone") || "Africa/Addis_Ababa";

    const intelligence = await getLifeIntelligenceSummary(userId, timezone);

    return NextResponse.json({
      success: true,
      data: intelligence,
    });
  } catch (error: any) {
    console.error("GET /api/intelligence error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load life intelligence" },
      { status: 500 }
    );
  }
}
