import { NextResponse } from "next/server";
import { getPrayerLogs, savePrayerLog } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || undefined;
    const logs = await getPrayerLogs("user_kidus_01", dateStr);
    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prayer_type, date, completed, duration_minutes, reflection_notes, gratitude_notes, spiritual_focus } = body;

    if (!prayer_type || !date) {
      return NextResponse.json({ error: "Missing prayer_type or date" }, { status: 400 });
    }

    await savePrayerLog({
      user_id: "user_kidus_01",
      date,
      prayer_type,
      scheduled_time: prayer_type === "morning" ? "04:00" : "21:15",
      duration_minutes: duration_minutes || 30,
      completed: completed ? 1 : 0,
      completed_at: completed ? new Date().toISOString() : null,
      reflection_notes: reflection_notes || null,
      gratitude_notes: gratitude_notes || null,
      spiritual_focus: spiritual_focus || null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
