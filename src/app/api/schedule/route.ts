import { NextResponse } from "next/server";
import { getScheduleBlocks, updateScheduleBlock, getUserProfile } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dayType = searchParams.get("dayType") || undefined;
    const blocks = await getScheduleBlocks("user_kidus_01", dayType);
    const profile = await getUserProfile("user_kidus_01");

    // Calculate sleep duration from user wake_time and bed_time
    // e.g. bed_time: 22:00, wake_time: 04:00 -> 6.0 hours
    let sleepHours = 6.0;
    if (profile?.bed_time && profile?.wake_time) {
      const [bedH, bedM] = profile.bed_time.split(":").map(Number);
      const [wakeH, wakeM] = profile.wake_time.split(":").map(Number);
      let bedMinutes = bedH * 60 + bedM;
      let wakeMinutes = wakeH * 60 + wakeM;
      if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60; // next day
      }
      sleepHours = Number(((wakeMinutes - bedMinutes) / 60).toFixed(1));
    }

    const hasSleepWarning = sleepHours < 7.0;
    const sleepWarning = hasSleepWarning
      ? {
          hours: sleepHours,
          message: `Your current schedule (Wake: ${profile?.wake_time}, Bed: ${profile?.bed_time}) provides only ${sleepHours} hours of sleep. Health science indicates that chronic <7 hours sleep undermines memory consolidation, reaction speed, and trading discipline.`,
          recommendations: [
            "Adjust target bedtime to 21:00 for a solid 7.0 hours of recovery.",
            "Or adjust wake-up time to 05:00 while keeping morning prayer as first priority.",
            "Protect 21:45-22:00 screen-off window to maximize deep REM sleep.",
          ],
        }
      : null;

    return NextResponse.json({
      blocks,
      sleepHours,
      hasSleepWarning,
      sleepWarning,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing block id" }, { status: 400 });
    }
    await updateScheduleBlock(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
