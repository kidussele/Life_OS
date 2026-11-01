import { NextResponse } from "next/server";
import { getReportsOverview } from "@/lib/repository";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "Last 30 Days";
    const data = await getReportsOverview("user_kidus_01", range);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
