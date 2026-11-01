import { NextResponse } from "next/server";
import { getDashboardOverview } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date") || undefined;
    const timezone = searchParams.get("timezone") || undefined;
    const overview = await getDashboardOverview("user_kidus_01", dateStr, timezone);
    return NextResponse.json(overview);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
