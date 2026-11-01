import { NextResponse } from "next/server";
import {
  getFreelanceData,
  createFreelanceClient,
  createFreelanceProject,
  updateFreelanceClient,
  updateFreelanceProject,
} from "@/lib/repository";

export async function GET() {
  try {
    const data = await getFreelanceData("user_kidus_01");
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...data } = body;

    if (type === "project") {
      await createFreelanceProject({
        user_id: "user_kidus_01",
        ...data,
      });
    } else {
      await createFreelanceClient({
        user_id: "user_kidus_01",
        ...data,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type, id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (type === "project") {
      await updateFreelanceProject(id, data);
    } else {
      await updateFreelanceClient(id, data);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
