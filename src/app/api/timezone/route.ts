import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/repository";
import { getTimezoneInfo } from "@/lib/timeEngine";

export async function GET() {
  try {
    const profile = await getUserProfile();
    const tz = profile?.timezone || "Africa/Addis_Ababa";
    const info = getTimezoneInfo(tz);
    return NextResponse.json({
      timezone: tz,
      ...info,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { timezone } = body;

    if (!timezone) {
      return NextResponse.json({ error: "Missing timezone" }, { status: 400 });
    }

    await updateUserProfile("user_kidus_01", { timezone });
    const info = getTimezoneInfo(timezone);

    return NextResponse.json({
      success: true,
      timezone,
      ...info,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
