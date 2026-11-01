import { NextResponse } from "next/server";
import { getDailyReflection, saveDailyReflection } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const reflection = await getDailyReflection("user_kidus_01", dateStr);
    return NextResponse.json({ reflection, date: dateStr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, morning_intention, evening_wins, evening_improvements, energy_rating, discipline_rating } = body;

    if (!date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

    await saveDailyReflection({
      user_id: "user_kidus_01",
      date,
      morning_intention: morning_intention || "",
      evening_wins: evening_wins || "",
      evening_improvements: evening_improvements || "",
      energy_rating: energy_rating || 3,
      discipline_rating: discipline_rating || 3,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
