import { NextResponse } from "next/server";
import { getDailyTasks, updateDailyTask, createDailyTask, rescheduleTask } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const tz = searchParams.get("timezone") || undefined;
    const tasks = await getDailyTasks("user_kidus_01", dateStr, tz);
    return NextResponse.json({ tasks, date: dateStr, timezone: tz });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = await createDailyTask({
      user_id: "user_kidus_01",
      ...body,
    });
    return NextResponse.json({ task: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing task id" }, { status: 400 });
    }

    if (action === "suggest_slot") {
      const { durationMinutes, preferredDate } = data;
      const { suggestIntelligentSlot } = await import("@/lib/repository");
      const slot = await suggestIntelligentSlot("user_kidus_01", durationMinutes || 45, preferredDate);
      return NextResponse.json({ success: true, slot });
    }

    if (action === "update_timer") {
      const { accumulatedSeconds, actualDurationMinutes, isRunning } = data;
      await updateDailyTask(id, {
        timer_accumulated_seconds: accumulatedSeconds,
        actual_duration_minutes: actualDurationMinutes,
        timer_started_at: isRunning ? new Date().toISOString() : null,
      });
      return NextResponse.json({ success: true, timerUpdated: true });
    }

    if (action === "reschedule") {
      const { newDate, newStartTime, newEndTime, reason } = data;
      await rescheduleTask(id, newDate, newStartTime, newEndTime, reason);
      return NextResponse.json({ success: true, rescheduled: true });
    }

    if (action === "skip") {
      const { reason } = data;
      await updateDailyTask(id, {
        status: "skipped",
        skip_reason: reason || "User skipped task",
      });
      return NextResponse.json({ success: true, skipped: true });
    }

    if (data.status === "completed" && !data.completed_at) {
      data.completed_at = new Date().toISOString();
    } else if (data.status === "upcoming") {
      data.completed_at = null;
    }

    await updateDailyTask(id, data);

    // Cross-system automated synchronization:
    // If completed or updated, synchronize with prayer logs, health logs, and goal progress
    try {
      const { db } = await import("@/lib/db");
      const taskRes = await db.execute({
        sql: "SELECT * FROM daily_tasks WHERE id = ? LIMIT 1",
        args: [id],
      });
      const task = taskRes.rows[0];

      if (task) {
        const isDone = data.status === "completed" || task.status === "completed";
        const dateStr = (task.date as string) || new Date().toISOString().split("T")[0];
        const titleLower = String(task.title || "").toLowerCase();

        // 1. Synchronize Prayer Devotion
        if (titleLower.includes("morning prayer")) {
          const { savePrayerLog } = await import("@/lib/repository");
          await savePrayerLog({
            user_id: "user_kidus_01",
            date: dateStr,
            prayer_type: "morning",
            scheduled_time: "04:00",
            duration_minutes: 30,
            completed: isDone ? 1 : 0,
            completed_at: isDone ? new Date().toISOString() : null,
          });
        } else if (titleLower.includes("night prayer")) {
          const { savePrayerLog } = await import("@/lib/repository");
          await savePrayerLog({
            user_id: "user_kidus_01",
            date: dateStr,
            prayer_type: "night",
            scheduled_time: "21:15",
            duration_minutes: 30,
            completed: isDone ? 1 : 0,
            completed_at: isDone ? new Date().toISOString() : null,
          });
        }

        // 2. Synchronize Health & Workout Logs
        if (task.category === "health" || titleLower.includes("workout") || titleLower.includes("exercise")) {
          const { saveHealthLog } = await import("@/lib/repository");
          await saveHealthLog({
            user_id: "user_kidus_01",
            date: dateStr,
            workout_completed: isDone ? 1 : 0,
            workout_title: String(task.title),
            workout_minutes: Number(task.duration_minutes || 30),
          });
        }

        // 3. Synchronize Goal Progress if linked
        if (task.goal_id) {
          const goalTasksRes = await db.execute({
            sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE goal_id = ?",
            args: [task.goal_id],
          });
          const totalG = Number(goalTasksRes.rows[0]?.total || 0);
          const doneG = Number(goalTasksRes.rows[0]?.done || 0);
          if (totalG > 0) {
            const newPct = Math.round((doneG / totalG) * 100);
            await db.execute({
              sql: "UPDATE goals SET progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE id = ?",
              args: [newPct, newPct, task.goal_id],
            });
          }
        }
      }
    } catch (syncErr) {
      console.warn("Cross-system task sync warning:", syncErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
