import { NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/repository";

export async function GET() {
  try {
    const profile = await getUserProfile();
    return NextResponse.json({ profile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await updateUserProfile("user_kidus_01", body);
    const updated = await getUserProfile();
    return NextResponse.json({ profile: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
