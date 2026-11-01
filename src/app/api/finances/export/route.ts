import { NextResponse } from "next/server";
import { getFinancialTransactions } from "@/lib/repository";

export async function GET() {
  try {
    const transactions = await getFinancialTransactions("user_kidus_01");
    const headers = ["ID", "Date", "Type", "Category", "Amount", "Currency", "Bucket", "Description", "Created At"];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.currency || "ETB"}"`,
      `"${t.bucket || "personal"}"`,
      `"${(t.description || "").replace(/"/g, '""')}"`,
      `"${t.created_at}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="life_os_transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
