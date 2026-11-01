import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const res = await db.execute({
      sql: "SELECT * FROM daily_tasks WHERE user_id = 'user_kidus_01' ORDER BY date DESC, start_time ASC",
      args: [],
    });

    const headers = [
      "ID",
      "Date",
      "Title",
      "Category",
      "Start Time",
      "End Time",
      "Planned Duration (min)",
      "Actual Duration (min)",
      "Priority",
      "Status",
      "Protected",
      "Notes",
      "Completed At"
    ];

    const rows = res.rows.map((t: any) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${(t.title || "").replace(/"/g, '""')}"`,
      `"${t.category}"`,
      `"${t.start_time}"`,
      `"${t.end_time}"`,
      t.duration_minutes || 0,
      t.actual_duration_minutes || 0,
      `"${t.priority}"`,
      `"${t.status}"`,
      t.is_protected ? "Yes" : "No",
      `"${(t.notes || "").replace(/"/g, '""')}"`,
      `"${t.completed_at || ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="life_os_tasks_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
