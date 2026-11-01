import { NextResponse } from "next/server";
import { getEnglishVocab, createEnglishVocab } from "@/lib/repository";

export async function GET() {
  try {
    const vocab = await getEnglishVocab("user_kidus_01");
    return NextResponse.json({ vocab });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createEnglishVocab({
      user_id: "user_kidus_01",
      ...body,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
