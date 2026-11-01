import { NextRequest, NextResponse } from "next/server";
import {
  createQuickCaptureItem,
  getQuickCaptureItems,
  processQuickCaptureItem,
  createDailyTask,
  createFinancialTransaction,
} from "@/lib/repository";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "user_kidus_01";
    const all = searchParams.get("all") === "true";

    const items = await getQuickCaptureItems(userId, all);

    return NextResponse.json({
      success: true,
      items,
    });
  } catch (error: any) {
    console.error("GET /api/quick-capture error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load quick capture items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId = body.user_id || "user_kidus_01";

    if (!body.content || !body.type) {
      return NextResponse.json(
        { success: false, error: "Content and type are required" },
        { status: 400 }
      );
    }

    const item = await createQuickCaptureItem({
      user_id: userId,
      type: body.type, // 'task' | 'idea' | 'expense' | 'reminder' | 'note' | 'project_idea' | 'goal' | 'problem'
      content: body.content.trim(),
      category: body.category || "general",
      assigned_to: body.assigned_to || null,
      is_processed: 0,
    });

    return NextResponse.json({
      success: true,
      item,
    });
  } catch (error: any) {
    console.error("POST /api/quick-capture error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save quick capture item" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action, target_date, amount, currency } = body;
    const userId = body.user_id || "user_kidus_01";

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required id or action" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      await processQuickCaptureItem(id, "delete");
      return NextResponse.json({ success: true, message: "Item deleted" });
    }

    if (action === "convert_task") {
      const date = target_date || new Date().toISOString().split("T")[0];
      const newTask = await createDailyTask({
        user_id: userId,
        date,
        title: body.title || body.content,
        start_time: body.start_time || "14:00",
        end_time: body.end_time || "14:45",
        duration_minutes: Number(body.duration_minutes || 45),
        category: body.category || "development",
        status: "upcoming",
        priority: body.priority || "medium",
        instructions: body.instructions || `Converted from Quick Capture: ${body.content}`,
        is_daily_priority: 0,
        is_protected: 0,
      });

      await processQuickCaptureItem(id, "process", newTask.id);
      return NextResponse.json({ success: true, converted_id: newTask.id });
    }

    if (action === "convert_expense") {
      const todayStr = target_date || new Date().toISOString().split("T")[0];
      const expenseAmount = Number(amount || 0);
      await createFinancialTransaction({
        user_id: userId,
        date: todayStr,
        type: "expense",
        category: body.category || "personal",
        amount: expenseAmount,
        currency: currency || "ETB",
        description: body.content,
        bucket: "personal",
      });

      await processQuickCaptureItem(id, "process", id);
      return NextResponse.json({ success: true, converted_id: id });
    }

    // Default: mark as processed
    await processQuickCaptureItem(id, "process");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/quick-capture error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process item" },
      { status: 500 }
    );
  }
}
