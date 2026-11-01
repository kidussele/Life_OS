"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  TrendingUp,
  Plus,
  Trophy,
  Scale,
  Target,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Trash2,
  Wrench,
  BookOpen,
  Check,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  X,
} from "lucide-react";
import { ForexTrade } from "@/lib/types";

export default function ForexJournalPage() {
  const [trades, setTrades] = useState<ForexTrade[]>([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    closedTrades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalR: 0,
    profitFactor: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [filterAccount, setFilterAccount] = useState<string>("all");

  // New Trade Form
  const [accountType, setAccountType] = useState<"demo" | "backtest" | "live" | "prop_firm">("backtest");
  const [pair, setPair] = useState("EURUSD");
  const [direction, setDirection] = useState<"BUY" | "SELL">("BUY");
  const [setupModel, setSetupModel] = useState("ICT Silver Bullet (NY AM FVG + Liquidity Sweep)");
  const [session, setSession] = useState("NY AM");
  const [entryPrice, setEntryPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [riskReward, setRiskReward] = useState("2.5");
  const [resultR, setResultR] = useState("");
  const [outcome, setOutcome] = useState<"win" | "loss" | "breakeven" | "open">("open");
  const [emotionalState, setEmotionalState] = useState("Disciplined");
  const [notes, setNotes] = useState("");
  const [dateStr, setDateStr] = useState("2026-11-02");
  const [submitting, setSubmitting] = useState(false);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/forex");
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/forex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_type: accountType,
          pair,
          direction,
          setup_model: setupModel,
          session,
          entry_price: parseFloat(entryPrice) || 0,
          stop_loss: parseFloat(stopLoss) || 0,
          take_profit: parseFloat(takeProfit) || 0,
          exit_price: exitPrice ? parseFloat(exitPrice) : null,
          risk_reward_ratio: parseFloat(riskReward) || 2.0,
          result_r:
            resultR !== ""
              ? parseFloat(resultR)
              : outcome === "win"
              ? parseFloat(riskReward)
              : outcome === "loss"
              ? -1.0
              : 0,
          outcome,
          emotional_state: emotionalState,
          rules_followed: 1,
          notes,
          date: dateStr,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNotes("");
        fetchTrades();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!confirm("Are you sure you want to remove this trade log?")) return;
    try {
      const res = await fetch(`/api/forex?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTrades();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTrades =
    filterAccount === "all"
      ? trades
      : filterAccount === "demo"
      ? trades.filter((t) => t.account_type === "demo")
      : filterAccount === "backtest"
      ? trades.filter((t) => t.account_type === "backtest")
      : filterAccount === "prop_firm"
      ? trades.filter((t) => t.account_type === "prop_firm")
      : filterAccount === "live"
      ? trades.filter((t) => t.account_type === "live")
      : trades;

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP HERO BANNER (Pixel-matching Reference Image)       */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C8E6C9] shadow-sm bg-[#0E2C1B] p-4 sm:p-5 min-h-[145px] flex items-center">
          {/* Subtle candlestick background overlay on right side (Clean, text-free) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-right pointer-events-none opacity-90"
            style={{
              backgroundImage: "url('/forex/forex_hero_banner.png')",
            }}
          />
          {/* Left soft mint gradient for 100% crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EBF8F1]/95 via-[#EBF8F1]/85 to-transparent sm:w-[65%] pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {/* Rounded Mint Green Square Icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#C8F0DC] border border-[#A1E3C0] flex items-center justify-center flex-shrink-0 shadow-sm text-[#165B33]">
                <TrendingUp size={28} className="stroke-[2.5]" />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0D3823] tracking-tight">
                  Forex Trading Journal
                </h1>
                <p className="text-[12px] sm:text-[13px] text-[#24523A] font-medium mt-0.5">
                  Track MSS, order blocks, fair value gaps, and your trading performance.
                </p>
              </div>
            </div>

            {/* + Log Trade Setup Button */}
            <div className="flex-shrink-0 self-start sm:self-center">
              <button
                onClick={() => {
                  setDateStr(new Date().toISOString().split("T")[0]);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#124B2C] hover:bg-[#0D3823] text-white rounded-xl text-[13px] font-semibold border border-[#236840] shadow-sm transition-all"
              >
                <Plus size={15} className="mr-0.5" />
                <span>Log Trade Setup</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPLIANCE & RISK ADVISORY BANNER                         */}
        {/* ========================================================= */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4 text-[#92400E] shadow-2xs flex items-start space-x-3">
          <div className="p-1.5 bg-[#FEF3C7] rounded-xl text-[#B45309] flex-shrink-0 mt-0.5">
            <ShieldAlert size={18} />
          </div>
          <div className="space-y-1 text-[12.5px] leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#78350F] uppercase tracking-wider text-[11px]">
                Risk Discipline & Capital Protection Notice
              </span>
            </div>
            <p className="text-[#92400E]">
              <strong>Notice:</strong> Demo, backtesting, and prop challenge performance does <em>not</em> guarantee live profitability. Forex trading involves substantial risk of capital loss. Never risk funds allocated to family contributions, emergency savings, or essential living expenses. Analysis and journaling are strictly restricted to scheduled development blocks and <strong>never during employment hours</strong> (08:00 – 17:00).
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FOUR STAT CARDS ROW                                    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Stat 1: Win Rate */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#FFF8E7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] flex-shrink-0 shadow-sm">
              <Trophy size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block">Win Rate</span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {stats.winRate}%
              </div>
              <span className="text-[10px] text-[#64748B] font-medium block truncate">
                ({stats.wins}W - {stats.losses}L) ({stats.wins}W - {stats.losses}L)
              </span>
            </div>
          </div>

          {/* Stat 2: Total Net R */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
              <TrendingUp size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block">Total Net R</span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                +{stats.totalR}R
              </div>
              <span className="text-[10px] text-[#64748B] font-medium block truncate">
                Multiples of Risk Handled
              </span>
            </div>
          </div>

          {/* Stat 3: Profit Factor */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#E8F8F5] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] flex-shrink-0 shadow-sm">
              <Scale size={20} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block">Profit Factor</span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {stats.profitFactor}
              </div>
              <span className="text-[10px] text-[#64748B] font-medium block truncate">
                Gross Wins / Gross Losses
              </span>
            </div>
          </div>

          {/* Stat 4: 100 Backtest Sprint */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            {/* Subtle soft green right background watermark */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#F0FDF4] to-transparent pointer-events-none" />

            <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm relative z-10">
              <Target size={20} />
            </div>
            <div className="min-w-0 relative z-10">
              <span className="text-[11px] font-bold text-[#64748B] block">100 Backtest Sprint</span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {stats.totalTrades} / 100
              </div>
              <span className="text-[10px] text-[#64748B] font-medium block truncate">
                Demo consistency proof
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. ACCOUNT FILTER PILLS                                   */}
        {/* ========================================================= */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {[
            { key: "all", label: "All Accounts" },
            { key: "demo", label: "Demo Practice" },
            { key: "backtest", label: "Backtesting" },
            { key: "prop_firm", label: "Prop Challenges" },
            { key: "live", label: "Live Trading" },
          ].map((tab) => {
            const isActive = filterAccount === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterAccount(tab.key)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all shadow-sm ${
                  isActive
                    ? "bg-[#1B4332] text-white"
                    : "bg-white text-[#475569] hover:bg-[#F8FAFC] border border-[#E2E8F0]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 4. RECORDED TRADE LOGS TABLE CARD                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3.5 mb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp size={16} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">Recorded Trade Logs</h2>
            </div>
            <span className="text-[11px] font-semibold text-[#64748B]">
              {filteredTrades.length} Trade Records
            </span>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F5F9] text-[10px] uppercase font-bold tracking-wider text-[#94A3B8]">
                  <th className="py-2.5 pr-4 pl-1 font-bold">DATE & PAIR</th>
                  <th className="py-2.5 px-4 font-bold min-w-[280px]">SETUP MODEL</th>
                  <th className="py-2.5 px-3 font-bold">SESSION</th>
                  <th className="py-2.5 px-3 font-bold">ACCOUNT</th>
                  <th className="py-2.5 px-4 font-bold min-w-[150px]">ENTRY / SL / TP</th>
                  <th className="py-2.5 px-3 font-bold">EMOTION</th>
                  <th className="py-2.5 pl-3 pr-1 font-bold text-right">OUTCOME (R)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748B] text-[13px]">
                      Loading trade journals...
                    </td>
                  </tr>
                ) : filteredTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[#64748B] text-[13px]">
                      No recorded trades match the selected account filter.
                    </td>
                  </tr>
                ) : (
                  filteredTrades.map((t) => {
                    const isWin = t.outcome === "win";
                    const isLoss = t.outcome === "loss";
                    const isBuy = t.direction === "BUY";

                    return (
                      <tr key={t.id} className="hover:bg-[#FBFBFA] transition-colors group">
                        {/* 1. DATE & PAIR */}
                        <td className="py-3.5 pr-4 pl-1 align-top">
                          <div className="flex items-start space-x-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide flex-shrink-0 ${
                                isBuy
                                  ? "bg-[#DCFCE7] text-[#16A34A]"
                                  : "bg-[#FEE2E2] text-[#DC2626]"
                              }`}
                            >
                              {t.direction}
                            </span>
                            <div>
                              <div className="text-[13px] font-bold text-[#0F172A] leading-tight">
                                {t.pair}
                              </div>
                              <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                                {t.date}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. SETUP MODEL */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="text-[13px] font-bold text-[#0F172A] leading-tight">
                            {t.setup_model}
                          </div>
                          {t.notes && (
                            <div className="text-[11px] text-[#64748B] mt-1 leading-snug line-clamp-2">
                              {t.notes}
                            </div>
                          )}
                        </td>

                        {/* 3. SESSION */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span className="inline-block text-[11px] font-bold text-[#475569] bg-[#F1F5F9] px-2.5 py-1 rounded-md">
                            {t.session}
                          </span>
                        </td>

                        {/* 4. ACCOUNT */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span className="text-[11px] font-bold text-[#475569] uppercase">
                            {t.account_type === "prop_firm" ? "PROP" : t.account_type}
                          </span>
                        </td>

                        {/* 5. ENTRY / SL / TP */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          <div className="text-[12px] font-semibold text-[#0F172A]">
                            In: {t.entry_price}
                          </div>
                          <div className="text-[11px] text-[#94A3B8] font-mono mt-0.5">
                            SL: {t.stop_loss} | TP: {t.take_profit}
                          </div>
                        </td>

                        {/* 6. EMOTION */}
                        <td className="py-3.5 px-3 align-top whitespace-nowrap">
                          <span className="text-[12px] text-[#334155] font-medium capitalize">
                            {t.emotional_state || "Disciplined"}
                          </span>
                        </td>

                        {/* 7. OUTCOME (R) */}
                        <td className="py-3.5 pl-3 pr-1 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            <span
                              className={`inline-block text-[12px] font-bold px-2.5 py-1 rounded-md ${
                                isWin
                                  ? "bg-[#DCFCE7] text-[#16A34A]"
                                  : isLoss
                                  ? "bg-[#FEE2E2] text-[#DC2626]"
                                  : "bg-[#F1F5F9] text-[#64748B]"
                              }`}
                            >
                              {t.result_r !== null && t.result_r !== undefined
                                ? t.result_r > 0
                                  ? `+${t.result_r}R`
                                  : `${t.result_r}R`
                                : isWin
                                ? `+${t.risk_reward_ratio}R`
                                : `-1R`}
                            </span>

                            <button
                              onClick={() => handleDeleteTrade(t.id)}
                              className="opacity-0 group-hover:opacity-100 text-[#CBD5E1] hover:text-[#DC2626] transition-all p-1"
                              title="Delete trade"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. BOTTOM 3-CARD ROW                                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Trading Performance This Month */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#165B33]" />
                  <h3 className="text-[13px] font-bold text-[#0F172A]">
                    Trading Performance This Month
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#E8F8F0] px-2 py-0.5 rounded-full">
                  +{stats.winRate}% Win Rate
                </span>
              </div>

              {/* Bar Chart Visualization */}
              {trades.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 text-center px-2">
                  <span className="text-[12px] font-semibold text-[#0F172A]">0 Recorded Trades</span>
                  <p className="text-[10.5px] text-[#64748B] mt-0.5">
                    Fresh 90-day backtest log initialized. Starting Monday, Nov 2, 2026.
                  </p>
                </div>
              ) : (
                <div className="flex items-end justify-between h-24 pt-2 pb-1 px-1">
                  {/* Y Axis Labels */}
                  <div className="flex flex-col justify-between h-full text-[9px] font-mono text-[#94A3B8] pr-1.5 py-0.5">
                    <span>30</span>
                    <span>20</span>
                    <span>0</span>
                  </div>

                  {/* Daily Distribution Bars from real trades */}
                  <div className="flex-1 flex items-end justify-between gap-1 h-full pl-1">
                    {trades.slice(-14).map((t, idx) => {
                      const isWin = t.outcome === "win";
                      const r = Number(t.result_r || 1);
                      const barH = Math.min(100, Math.max(25, Math.abs(r) * 25));
                      return (
                        <div
                          key={idx}
                          title={`${t.pair} (${t.date}): ${isWin ? "WIN" : "LOSS"}`}
                          className={`flex-1 rounded-t-sm transition-all ${
                            isWin ? "bg-[#16A34A]" : "bg-[#86EFAC]"
                          }`}
                          style={{ height: `${barH}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chart Footer */}
            <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-2 border-t border-[#F1F5F9] mt-2">
              <span className="font-medium">{trades.length > 0 ? "Last 14 Trades" : "Nov 2 – Jan 31"}</span>
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                  <span>Wins</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-[#86EFAC]" />
                  <span>Losses</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Quick Insights */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between">
            {/* Background green upward arrow graphic from reference */}
            <div
              className="absolute right-0 bottom-0 w-28 h-28 bg-no-repeat bg-contain bg-right-bottom opacity-80 pointer-events-none"
              style={{
                backgroundImage: "url('/forex/growth_arrow.png')",
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-[14px]">💡</span>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Quick Insights</h3>
              </div>

              {/* Tip highlight box with wrench icon */}
              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] mb-3">
                <div className="w-5 h-5 rounded-md bg-[#DCFCE7] flex items-center justify-center text-[#165B33] flex-shrink-0 mt-0.5">
                  <Wrench size={12} />
                </div>
                <p className="text-[11px] text-[#1E3A2B] font-semibold leading-snug">
                  Your win rate is strong! Keep managing emotion and follow your setup rules.
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-1.5">
                {[
                  "Focus on high-probability setups",
                  "Avoid overtrading",
                  "Stick to your plan",
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-2 text-[12px] text-[#334155] font-medium">
                    <CheckCircle2 size={14} className="text-[#16A34A] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Next Action */}
          <div className="relative overflow-hidden bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between">
            {/* 3D Green Target Graphic positioned on the right */}
            <div
              className="absolute right-2 bottom-2 w-28 h-28 bg-no-repeat bg-contain bg-right-bottom pointer-events-none"
              style={{
                backgroundImage: "url('/forex/target_3d.png')",
              }}
            />

            <div className="relative z-10 max-w-[210px]">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <span className="text-[14px]">🚀</span>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Next Action</h3>
              </div>

              <p className="text-[12px] text-[#334155] font-medium leading-relaxed mb-3">
                Review London session setups and prepare for next trading day.
              </p>

              <button
                onClick={() => setIsGuideModalOpen(true)}
                className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-[#1B4332] hover:bg-[#124B2C] text-white rounded-lg text-[12px] font-semibold transition-colors shadow-sm"
              >
                <span>View Setup Guide</span>
                <ArrowRight size={13} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: LOG TRADE SETUP                                    */}
        {/* ========================================================= */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Log Forex Trade Setup"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTrade} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as any)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="demo">Demo Practice</option>
                  <option value="backtest">Backtesting</option>
                  <option value="prop_firm">Prop Challenge</option>
                  <option value="live">Live Trading</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Currency Pair
                </label>
                <select
                  value={pair}
                  onChange={(e) => setPair(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="EURUSD">EURUSD</option>
                  <option value="GBPUSD">GBPUSD</option>
                  <option value="USDJPY">USDJPY</option>
                  <option value="AUDUSD">AUDUSD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Trade Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection("BUY")}
                    className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                      direction === "BUY"
                        ? "bg-[#16A34A] text-white shadow-sm"
                        : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                    }`}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("SELL")}
                    className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                      direction === "SELL"
                        ? "bg-[#DC2626] text-white shadow-sm"
                        : "bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]"
                    }`}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Session
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="NY AM">NY AM (08:30–11:00)</option>
                  <option value="London">London Open (03:00–06:00)</option>
                  <option value="Asian">Asian (20:00–00:00)</option>
                  <option value="NY PM">NY PM (13:30–16:00)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Setup Model
              </label>
              <select
                value={setupModel}
                onChange={(e) => setSetupModel(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
              >
                <option value="ICT OTE (Optimal Trade Entry 62-79% Fib)">
                  ICT OTE (Optimal Trade Entry 62-79% Fib)
                </option>
                <option value="ICT Bearish Order Block + MSS">
                  ICT Bearish Order Block + MSS
                </option>
                <option value="ICT Silver Bullet (NY AM FVG + Liquidity Sweep)">
                  ICT Silver Bullet (NY AM FVG + Liquidity Sweep)
                </option>
                <option value="ICT London Killzone Liquidity Sweep">
                  ICT London Killzone Liquidity Sweep
                </option>
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Entry Price
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="1.0840"
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Stop Loss (SL)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="1.0852"
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Take Profit (TP)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="1.0810"
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Outcome
                </label>
                <select
                  value={outcome}
                  onChange={(e) => {
                    const next = e.target.value as any;
                    setOutcome(next);
                    if (next === "win") setResultR(riskReward);
                    if (next === "loss") setResultR("-1");
                    if (next === "breakeven") setResultR("0");
                  }}
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                >
                  <option value="win">Win</option>
                  <option value="loss">Loss</option>
                  <option value="breakeven">Breakeven</option>
                  <option value="open">Open</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Result (R)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={resultR}
                  onChange={(e) => setResultR(e.target.value)}
                  placeholder="+2.3 or -1"
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#0F172A] mb-1">
                  Emotion
                </label>
                <select
                  value={emotionalState}
                  onChange={(e) => setEmotionalState(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                >
                  <option value="Disciplined">Disciplined</option>
                  <option value="Calm">Calm</option>
                  <option value="Confident">Confident</option>
                  <option value="Impulsive">Impulsive</option>
                  <option value="Hesitant">Hesitant</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Execution Notes & Confluence
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Market structure shift, FVG retest, liquidity sweep observations..."
                className="w-full px-3 py-2 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-[13px] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1B4332] hover:bg-[#124B2C] rounded-lg transition-colors shadow-sm"
              >
                {submitting ? "Saving..." : "Log Trade"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: SETUP GUIDE (Next Action Modal)                     */}
        {/* ========================================================= */}
        <Modal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          title="ICT Forex Setup Guide & Rules"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl">
              <span className="font-bold text-[#165B33] block mb-1">
                Core Rules for London & NY Sessions:
              </span>
              <ul className="space-y-1 text-[12px] text-[#1E3A2B]">
                <li>• <strong>Never risk &gt; 1%</strong> of capital per trade setup.</li>
                <li>• Wait for <strong>Liquidity Sweep</strong> of Asian High/Low before looking for MSS.</li>
                <li>• Entry strictly on <strong>Fair Value Gap (FVG)</strong> or <strong>Optimal Trade Entry (OTE 62-79%)</strong>.</li>
                <li>• Set hard Stop Loss immediately upon execution. Never widen an active stop loss.</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] mb-1">1. ICT Silver Bullet (NY AM)</h4>
              <p className="text-[12px] text-[#64748B]">
                Window: 10:00 AM – 11:00 AM NY. Wait for 5-minute displacement creating an FVG towards daily draw on liquidity. Minimum 1:2 R:R.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] mb-1">2. London Open Sweep + Bearish OB</h4>
              <p className="text-[12px] text-[#64748B]">
                Window: 02:00 AM – 05:00 AM NY (London Open). Previous day high swept, 15m candle closes below swing low, retest of bearish OB confirms entry.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] mb-1">3. 100 Backtest Sprint Milestone</h4>
              <p className="text-[12px] text-[#64748B]">
                Log 100 demo trades with strict emotional discipline and positive R-expectancy before deploying real capital or taking prop challenges.
              </p>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsGuideModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1B4332] hover:bg-[#124B2C] rounded-lg transition-colors shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
