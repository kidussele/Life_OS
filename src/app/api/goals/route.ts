import { NextResponse } from "next/server";
import { getGoals, createGoal, updateGoal, createMilestone, updateMilestoneStatus } from "@/lib/repository";

export async function GET() {
  try {
    const goals = await getGoals("user_kidus_01");
    return NextResponse.json({ goals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === "create_milestone") {
      await createMilestone(data);
      return NextResponse.json({ success: true });
    }

    const goalId = await createGoal({
      user_id: "user_kidus_01",
      ...data,
    });
    return NextResponse.json({ success: true, goalId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, id, ...data } = body;

    if (action === "toggle_milestone") {
      const res = await updateMilestoneStatus(id, data.status);
      return NextResponse.json({ success: true, ...res });
    }

    await updateGoal(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
