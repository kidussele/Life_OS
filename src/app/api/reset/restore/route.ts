import { NextResponse } from "next/server";
import { importDatabaseBackup } from "@/lib/resetService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await importDatabaseBackup(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
