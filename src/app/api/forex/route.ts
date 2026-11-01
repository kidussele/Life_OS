import { NextResponse } from "next/server";
import { getForexTrades, createForexTrade, deleteForexTrade } from "@/lib/repository";

export async function GET() {
  try {
    const trades = await getForexTrades("user_kidus_01");

    // Compute key statistics
    const closedTrades = trades.filter((t) => t.outcome !== "open");
    const wins = closedTrades.filter((t) => t.outcome === "win");
    const losses = closedTrades.filter((t) => t.outcome === "loss");
    const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;

    let totalR = 0;
    let grossProfitR = 0;
    let grossLossR = 0;

    for (const t of closedTrades) {
      const r = Number(t.result_r || 0);
      totalR += r;
      if (r > 0) grossProfitR += r;
      if (r < 0) grossLossR += Math.abs(r);
    }

    const profitFactor = grossLossR > 0 ? grossProfitR / grossLossR : grossProfitR > 0 ? grossProfitR : 0;

    return NextResponse.json({
      trades,
      stats: {
        totalTrades: trades.length,
        closedTrades: closedTrades.length,
        wins: wins.length,
        losses: losses.length,
        winRate: Number(winRate.toFixed(1)),
        totalR: Number(totalR.toFixed(2)),
        profitFactor: Number(profitFactor.toFixed(2)),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createForexTrade({
      user_id: "user_kidus_01",
      ...body,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing trade id" }, { status: 400 });
    }
    await deleteForexTrade(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing trade id" }, { status: 400 });
    }
    const { updateForexTrade } = await import("@/lib/repository");
    await updateForexTrade(id, data);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
