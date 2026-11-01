import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getNowInTimezone, parseTimeToMinutes } from "@/lib/timeEngine";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const tz = searchParams.get("timezone") || "Africa/Addis_Ababa";

    const now = getNowInTimezone(tz);
    const curMins = parseTimeToMinutes(now.time24);

    // 1. Fetch DB stored notifications
    const dbRes = await db.execute({
      sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
      args: [userId],
    });

    const items: any[] = [...dbRes.rows];

    // 2. Fetch today's tasks to generate real-time live alerts
    const tasksRes = await db.execute({
      sql: "SELECT * FROM daily_tasks WHERE user_id = ? AND date = ? AND status != 'completed' AND status != 'skipped'",
      args: [userId, now.dateStr],
    });

    for (const t of tasksRes.rows) {
      const sMins = parseTimeToMinutes(t.start_time as string);
      const eMins = parseTimeToMinutes(t.end_time as string);

      // Starting Soon (within 15 minutes)
      if (sMins > curMins && sMins - curMins <= 15) {
        items.unshift({
          id: `alert_soon_${t.id}`,
          title: "Starting Soon",
          message: `"${t.title}" starts in ${sMins - curMins} minutes (${t.start_time}).`,
          category: "task_soon",
          time: t.start_time,
          is_read: 0,
        });
      }

      // Overdue
      if (curMins > eMins) {
        items.unshift({
          id: `alert_overdue_${t.id}`,
          title: "Overdue Task",
          message: `"${t.title}" was scheduled until ${t.end_time}. Action needed.`,
          category: "task_overdue",
          time: t.end_time,
          is_read: 0,
        });
      }
    }

    // 3. Sleep Preparation Alert (after 21:30)
    if (curMins >= parseTimeToMinutes("21:30") && curMins < parseTimeToMinutes("22:15")) {
      items.unshift({
        id: `alert_sleep_${now.dateStr}`,
        title: "Sleep Preparation",
        message: "Bedtime target is 22:00. Dim blue light and begin nighttime wind-down.",
        category: "health",
        time: "21:30",
        is_read: 0,
      });
    }

    return NextResponse.json({
      notifications: items,
      unreadCount: items.filter((i) => !i.is_read).length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = body.userId || "user_kidus_01";

    if (body.action === "mark_all_read") {
      await db.execute({
        sql: "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
        args: [userId],
      });
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      await db.execute({
        sql: "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
        args: [body.id, userId],
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
