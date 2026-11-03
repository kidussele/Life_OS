import { NextResponse } from "next/server";
import { getComprehensiveAnalysis } from "@/lib/analyticsService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const range = searchParams.get("range") || "Last 30 Days";
    const timezone = searchParams.get("timezone") || "Africa/Addis_Ababa";
    const customStart = searchParams.get("startDate") || undefined;
    const customEnd = searchParams.get("endDate") || undefined;

    const data = await getComprehensiveAnalysis(
      userId,
      range,
      timezone,
      customStart,
      customEnd
    );

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API /api/analysis error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

