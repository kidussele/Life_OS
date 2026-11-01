import { NextResponse } from "next/server";
import { executeCleanDataReset } from "@/lib/resetService";
import { getUserProfile } from "@/lib/repository";

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json({
      has_performed_reset: profile?.has_performed_reset === 1,
      journey_start_date: profile?.journey_start_date || "2026-11-02",
      timezone: profile?.timezone || "Africa/Addis_Ababa",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { confirmation, timezone } = body;

    if (confirmation !== "RESET") {
      return NextResponse.json(
        { error: "Confirmation word must be exactly 'RESET'" },
        { status: 400 }
      );
    }

    const result = await executeCleanDataReset({
      confirmation,
      timezone,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
