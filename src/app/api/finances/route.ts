import { NextResponse } from "next/server";
import {
  getFinancialTransactions,
  createFinancialTransaction,
  deleteFinancialTransaction,
  getFinancialSummary,
} from "@/lib/repository";

export async function GET() {
  try {
    const transactions = await getFinancialTransactions("user_kidus_01");
    const summary = await getFinancialSummary("user_kidus_01");
    return NextResponse.json({ transactions, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, type, category, amount, description, bucket } = body;

    if (!type || !category || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await createFinancialTransaction({
      user_id: "user_kidus_01",
      date: date || new Date().toISOString().split("T")[0],
      type,
      category,
      amount: Number(amount),
      currency: "ETB",
      description: description || "",
      bucket: bucket || "personal",
    });

    const summary = await getFinancialSummary("user_kidus_01");
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing transaction id" }, { status: 400 });
    }
    await deleteFinancialTransaction(id);
    const summary = await getFinancialSummary("user_kidus_01");
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
