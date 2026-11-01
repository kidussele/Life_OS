import { NextRequest, NextResponse } from "next/server";
import {
  createFocusSession,
  getFocusSessions,
  getTodayFocusMinutes,
  updateDailyTask,
} from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const limit = Number(searchParams.get("limit") || 20);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [sessions, todayMinutes] = await Promise.all([
      getFocusSessions(userId, limit),
      getTodayFocusMinutes(userId, dateStr),
    ]);

    return NextResponse.json({
      success: true,
      sessions,
      todayMinutes,
    });
  } catch (error: any) {
    console.error("GET /api/focus error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load focus sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || "user_kidus_01";
    const now = new Date().toISOString();
    const targetMins = Number(body.duration_minutes || body.target_duration_minutes || 25);
    const actualMins = Number(body.actual_minutes || targetMins);
    const actualSec = Number(body.actual_duration_seconds || actualMins * 60);

    const session = await createFocusSession({
      user_id: userId,
      task_id: body.task_id || null,
      goal_id: body.goal_id || null,
      title: body.title || "Focused Deep Work",
      target_duration_minutes: targetMins,
      actual_duration_seconds: actualSec,
      interrupted: body.interrupted ? 1 : 0,
      interruption_reason: body.interruption_reason || null,
      status: body.interrupted ? "interrupted" : "completed",
      started_at: body.started_at || now,
      completed_at: now,
      notes: body.notes || null,
    });

    // If user elected to mark the linked task complete upon finishing focus session
    if (body.completed_task && body.task_id) {
      await updateDailyTask(body.task_id, { status: "completed" });
    }

    const todayDate = now.split("T")[0];
    const todayMinutes = await getTodayFocusMinutes(userId, todayDate);

    return NextResponse.json({
      success: true,
      session,
      todayMinutes,
    });
  } catch (error: any) {
    console.error("POST /api/focus error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record focus session" },
      { status: 500 }
    );
  }
}
