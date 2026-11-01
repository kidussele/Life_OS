import { NextResponse } from "next/server";
import { getHabitsWithTodayStatus } from "@/lib/repository";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const habits = await getHabitsWithTodayStatus("user_kidus_01", dateStr);

    // Compute real 7-day average consistency from daily_tasks
    const taskConsistencyRes = await db.execute({
      sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done
            FROM daily_tasks
            WHERE user_id = 'user_kidus_01' AND date >= date('now', '-7 days')`,
      args: [],
    });
    const tTotal = Number(taskConsistencyRes.rows[0]?.total || 0);
    const tDone = Number(taskConsistencyRes.rows[0]?.done || 0);
    const weeklyAverage = tTotal > 0 ? Math.round((tDone / tTotal) * 100) : 0;

    // Real prayer count in last 90 days
    const prayerRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = 'user_kidus_01' AND completed = 1",
      args: [],
    });
    const prayerCount = Number(prayerRes.rows[0]?.count || 0);

    // Real workout tasks count
    const workoutRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM daily_tasks WHERE user_id = 'user_kidus_01' AND category = 'health' AND status = 'completed'",
      args: [],
    });
    const workoutCount = Number(workoutRes.rows[0]?.count || 0);

    // Real learning hours from completed tasks
    const learnRes = await db.execute({
      sql: "SELECT SUM(duration_minutes) as mins FROM daily_tasks WHERE user_id = 'user_kidus_01' AND category = 'learning' AND status = 'completed'",
      args: [],
    });
    const learnHours = Math.round(Number(learnRes.rows[0]?.mins || 0) / 60);

    // Real dev hours
    const devRes = await db.execute({
      sql: "SELECT SUM(duration_minutes) as mins FROM daily_tasks WHERE user_id = 'user_kidus_01' AND category IN ('development', 'business') AND status = 'completed'",
      args: [],
    });
    const devHours = Math.round(Number(devRes.rows[0]?.mins || 0) / 60);

    return NextResponse.json({
      habits,
      stats: {
        weeklyAverage,
        prayerCount,
        workoutCount,
        learnHours,
        devHours,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
