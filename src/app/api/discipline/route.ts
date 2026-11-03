import { NextResponse } from "next/server";
import { getHabitsWithTodayStatus } from "@/lib/repository";
import { getHabitAnalytics } from "@/lib/analyticsService";
import { getNowInTimezone } from "@/lib/timeEngine";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const tz = searchParams.get("timezone") || "Africa/Addis_Ababa";
    const now = getNowInTimezone(tz);
    const dateStr = searchParams.get("date") || now.dateStr;

    // 1. Fetch habits with real occurrence status for this date and real streak
    const habits = await getHabitsWithTodayStatus(userId, dateStr);

    // 2. Compute current week bounds (Mon - Sun) in local timezone
    const curDate = new Date(`${dateStr}T12:00:00Z`);
    const dayOfWeek = curDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curDate);
    monday.setDate(curDate.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const weekStartStr = monday.toISOString().split("T")[0];
    const weekEndStr = sunday.toISOString().split("T")[0];

    // Real weekly habit analytics
    const weeklyHabitStats = await getHabitAnalytics(userId, weekStartStr, weekEndStr);

    // Real daily adherence: completed habits on dateStr / total habits
    const totalHabitsCount = habits.length;
    const completedTodayCount = habits.filter((h) => h.completed_today).length;
    const dailyAdherence = totalHabitsCount > 0
      ? Math.round((completedTodayCount / totalHabitsCount) * 100)
      : 0;

    // Real prayer count in last 90 days
    const prayerRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND completed = 1",
      args: [userId],
    });
    const prayerCount = Number(prayerRes.rows[0]?.count || 0);

    // Real workout tasks count
    const workoutRes = await db.execute({
      sql: "SELECT COUNT(*) as count FROM daily_tasks WHERE user_id = ? AND category = 'health' AND status = 'completed'",
      args: [userId],
    });
    const workoutCount = Number(workoutRes.rows[0]?.count || 0);

    // Real learning hours from completed tasks
    const learnRes = await db.execute({
      sql: "SELECT SUM(actual_duration_minutes) as actualMins, SUM(duration_minutes) as planMins FROM daily_tasks WHERE user_id = ? AND category = 'learning' AND status = 'completed'",
      args: [userId],
    });
    const learnMins = Number(learnRes.rows[0]?.actualMins || learnRes.rows[0]?.planMins || 0);
    const learnHours = Math.round(learnMins / 60);

    // Real dev hours
    const devRes = await db.execute({
      sql: "SELECT SUM(actual_duration_minutes) as actualMins, SUM(duration_minutes) as planMins FROM daily_tasks WHERE user_id = ? AND category IN ('development', 'business') AND status = 'completed'",
      args: [userId],
    });
    const devMins = Number(devRes.rows[0]?.actualMins || devRes.rows[0]?.planMins || 0);
    const devHours = Math.round(devMins / 60);

    // Compute real 7-day overview for current week (Mon-Sun)
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyOverview: { day: string; date: string; percent: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = d.toISOString().split("T")[0];
      const dayRes = await db.execute({
        sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done
              FROM daily_tasks WHERE user_id = ? AND date = ?`,
        args: [userId, dStr],
      });
      const dayTotal = Number(dayRes.rows[0]?.total || 0);
      const dayDone = Number(dayRes.rows[0]?.done || 0);
      const pct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;
      weeklyOverview.push({ day: weekDays[i], date: dStr, percent: pct });
    }

    return NextResponse.json({
      habits,
      stats: {
        dailyAdherence,
        weeklyAverage: weeklyHabitStats.overallAdherence,
        weeklyAdherence: weeklyHabitStats.overallAdherence,
        prayerCount,
        workoutCount,
        learnHours,
        devHours,
        totalEligibleOccurrences: weeklyHabitStats.totalEligibleOccurrences,
        totalCompletedOccurrences: weeklyHabitStats.totalCompletedOccurrences,
      },
      weeklyOverview,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
