import { NextResponse } from "next/server";
import {
  getJourneyData,
  updateJourneyProfile,
  createJourneyMilestone,
  updateJourneyMilestone,
  deleteJourneyMilestone,
} from "@/lib/journeyRepository";

export async function GET() {
  try {
    const data = await getJourneyData("user_kidus_01");
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in GET /api/journey:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create_milestone") {
      const id = await createJourneyMilestone(data, "user_kidus_01");
      return NextResponse.json({ success: true, id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in POST /api/journey:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type, id, data } = body;

    if (type === "profile") {
      await updateJourneyProfile("user_kidus_01", data);
      return NextResponse.json({ success: true });
    }

    if (type === "milestone" && id) {
      await updateJourneyMilestone(id, data);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid PATCH target" }, { status: 400 });
  } catch (error: any) {
    console.error("Error in PATCH /api/journey:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing milestone id" }, { status: 400 });
    }

    await deleteJourneyMilestone(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error in DELETE /api/journey:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
