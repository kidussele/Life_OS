import { NextRequest, NextResponse } from "next/server";
import {
  getWeeklyPlannerData,
  saveWeeklyReview,
  applyPlannerSuggestion,
  getWeeklyReviews,
} from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const weekStartDate = searchParams.get("weekStartDate") || "2026-11-02";

    const [plannerData, reviews] = await Promise.all([
      getWeeklyPlannerData(userId, weekStartDate),
      getWeeklyReviews(userId),
    ]);

    return NextResponse.json({
      success: true,
      ...plannerData,
      pastReviews: reviews,
    });
  } catch (error: any) {
    console.error("GET /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load weekly planner data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.userId || "user_kidus_01";
    const action = body.action || "save_review";

    if (action === "apply_suggestion") {
      const result = await applyPlannerSuggestion(userId, body.suggestion);
      return NextResponse.json(result);
    }

    if (action === "save_review") {
      await saveWeeklyReview(userId, body.review);
      return NextResponse.json({
        success: true,
        message: "Weekly reflection and plan approved successfully.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action specified" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/planner error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process weekly planner request" },
      { status: 500 }
    );
  }
}
