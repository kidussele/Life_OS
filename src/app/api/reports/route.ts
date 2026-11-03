import { NextResponse } from "next/server";
import { getReportsOverview } from "@/lib/repository";
import { getStructuredReports, getComprehensiveAnalysis } from "@/lib/analyticsService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const range = searchParams.get("range") || "Last 30 Days";
    const timezone = searchParams.get("timezone") || "Africa/Addis_Ababa";
    const customStart = searchParams.get("startDate") || undefined;
    const customEnd = searchParams.get("endDate") || undefined;

    // 1. Shared structured reports and analytics
    const structuredReports = await getStructuredReports(
      userId,
      range,
      timezone,
      customStart,
      customEnd
    );

    // 2. Overview data (for backward compatibility with legacy chart widgets)
    const legacyOverview = await getReportsOverview(userId, range);

    return NextResponse.json({
      ...legacyOverview,
      ...structuredReports,
      range,
      timezone,
      userId,
    });
  } catch (error: any) {
    console.error("API /api/reports error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
