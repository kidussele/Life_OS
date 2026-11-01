import { NextResponse } from "next/server";
import { getCategoryProgressOverview } from "@/lib/repository";

export async function GET() {
  try {
    const categories = await getCategoryProgressOverview("user_kidus_01");
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
