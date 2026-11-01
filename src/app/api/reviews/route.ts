import { NextResponse } from "next/server";
import { getWeeklyReviews, saveWeeklyReview } from "@/lib/repository";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const reviews = await getWeeklyReviews(userId);

    // Calculate current week auto-stats for reflection helper
    const statsRes = await db.execute({
      sql: `SELECT
              COUNT(*) as total_tasks,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
              SUM(CASE WHEN status = 'missed' THEN 1 ELSE 0 END) as missed_tasks,
              SUM(actual_duration_minutes) as focus_minutes
            FROM daily_tasks
            WHERE user_id = ?`,
      args: [userId],
    });

    const stats = statsRes.rows[0] || {};

    return NextResponse.json({
      reviews,
      currentStats: {
        totalTasks: Number(stats.total_tasks || 0),
        completedTasks: Number(stats.completed_tasks || 0),
        missedTasks: Number(stats.missed_tasks || 0),
        focusMinutes: Number(stats.focus_minutes || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.userId || "user_kidus_01";
    await saveWeeklyReview(userId, body);
    return NextResponse.json({ success: true, message: "Weekly review saved." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
