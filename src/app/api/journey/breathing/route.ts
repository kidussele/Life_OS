import { NextResponse } from "next/server";
import { logBreathingSession } from "@/lib/journeyRepository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await logBreathingSession(body);
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("Error in POST /api/journey/breathing:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
