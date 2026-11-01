import { NextResponse } from "next/server";
import { getHabitsWithTodayStatus, toggleHabitLog } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const habits = await getHabitsWithTodayStatus("user_kidus_01", dateStr);
    return NextResponse.json({ habits, date: dateStr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { habitId, date, completed } = body;
    if (!habitId || !date) {
      return NextResponse.json({ error: "Missing habitId or date" }, { status: 400 });
    }
    await toggleHabitLog(habitId, date, completed);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
