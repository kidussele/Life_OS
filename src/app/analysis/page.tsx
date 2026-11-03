"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { useTimeEngine } from "@/hooks/useTimeEngine";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Flame,
  Wallet,
  GraduationCap,
  Sparkles,
  BarChart3,
  FileText,
  AlertCircle,
  HelpCircle,
  CandlestickChart,
  Layers,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AnalysisPage() {
  const { timezone, timeState } = useTimeEngine();
  const [filter, setFilter] = useState("Last 30 Days");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [forexTab, setForexTab] = useState<"backtest" | "demo" | "propFirm" | "live">("backtest");

  const loadAnalytics = async (selectedFilter = filter, start = customStart, end = customEnd) => {
    setLoading(true);
    try {
      let url = `/api/analysis?range=${encodeURIComponent(selectedFilter)}&timezone=${encodeURIComponent(
        timezone || "Africa/Addis_Ababa"
      )}`;
      if (selectedFilter === "Custom" && start && end) {
        url += `&startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(filter);
  }, [filter, timezone]);

  const handleCustomFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      setFilter("Custom");
      loadAnalytics("Custom", customStart, customEnd);
    }
  };

  const trendPoints =
    data?.completionTrend && data.completionTrend.length > 0
      ? data.completionTrend.map((d: any, idx: number) => {
          const count = data.completionTrend.length;
          const spacing = count > 1 ? 280 / (count - 1) : 140;
          return {
            x: 20 + idx * spacing,
            y: 110 - Math.round(((d.percent || 0) / 100) * 85),
            label: d.dayLabel || d.date.slice(5),
            percent: d.percent || 0,
            date: d.date,
            completed: d.completed,
            total: d.total,
          };
        })
      : [];

  const polylinePoints = trendPoints.map((p: any) => `${p.x},${p.y}`).join(" ");
  const polygonPoints =
    trendPoints.length > 0
      ? `20,110 20,${trendPoints[0].y} ` + polylinePoints + ` ${trendPoints[trendPoints.length - 1].x},110`
      : "";

  const activeForex = data?.forex ? data.forex[forexTab] : null;

  return (
    <AppLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP HEADER & SWITCHER                                   */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
              <Activity size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D3823] tracking-tight">
                  Holistic Life Analytics
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F8F0] text-[#165B33] border border-[#C8E6C9]">
                  Live System
                </span>
              </div>
              <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-0.5">
                Real-time performance metrics computed directly from your schedule, habits, finances, trading, and goals.
              </p>
            </div>
          </div>

          {/* Navigation View Switcher (Analytics vs Reports) */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#E2E8F0]">
              <span className="px-3 py-1.5 rounded-lg text-[12px] font-bold bg-white text-[#165B33] shadow-xs">
                Analytics & Trends
              </span>
              <Link
                href="/reports"
                className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                Structured Reports
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. DATE FILTER CONTROLS                                    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-3.5 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {["Today", "This Week", "This Month", "Last 30 Days", "Custom"].map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setFilter(tab);
                    if (tab !== "Custom") loadAnalytics(tab);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#165B33] text-white shadow-xs"
                      : "text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Picker */}
          {filter === "Custom" && (
            <form onSubmit={handleCustomFilterSubmit} className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                required
                className="text-[12px] font-mono font-medium px-2.5 py-1 border border-[#CBD5E1] rounded-lg"
              />
              <span className="text-[12px] text-[#94A3B8]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                required
                className="text-[12px] font-mono font-medium px-2.5 py-1 border border-[#CBD5E1] rounded-lg"
              />
              <button
                type="submit"
                className="px-3 py-1 bg-[#165B33] hover:bg-[#124B2C] text-white rounded-lg text-[12px] font-bold cursor-pointer transition-colors"
              >
                Apply
              </button>
            </form>
          )}

          <div className="text-[11.5px] font-medium text-[#64748B] flex items-center gap-1.5 ml-auto">
            <Clock size={13} className="text-[#165B33]" />
            <span>Timezone: {timezone || "Africa/Addis_Ababa"}</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FOUR HIGH-LEVEL METRIC KPI CARDS                        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Task Execution */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8FAFC]">
              <span className="text-[11px] font-bold text-[#64748B]">Task Completion</span>
              <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center">
                <CheckCircle2 size={15} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                {data?.summary?.completionPct ?? 0}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {data?.summary?.completedTasks ?? 0} of {data?.summary?.plannedTasks ?? 0} scheduled tasks
              </div>
              <div className="text-[10px] font-semibold text-[#16A34A] mt-1 flex items-center gap-1">
                {data?.summary?.completionChange >= 0 ? "+" : ""}
                {data?.summary?.completionChange ?? 0}% vs previous period
              </div>
            </div>
          </div>

          {/* Card 2: Habit Adherence */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8FAFC]">
              <span className="text-[11px] font-bold text-[#64748B]">Habit Consistency</span>
              <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Flame size={15} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                {data?.habits?.overallAdherence ?? 0}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {data?.habits?.totalCompletedOccurrences ?? 0} / {data?.habits?.totalEligibleOccurrences ?? 0} occurrences
              </div>
              <div className="text-[10px] font-semibold text-[#64748B] mt-1">
                {data?.habits?.totalHabits ?? 0} active daily habits tracked
              </div>
            </div>
          </div>

          {/* Card 3: Total Learning & Focus Hours */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8FAFC]">
              <span className="text-[11px] font-bold text-[#64748B]">Learning & Dev Hours</span>
              <div className="w-7 h-7 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <GraduationCap size={15} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                {data?.learning?.totalHours ?? 0} hrs
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {data?.learning?.softwareEngineeringHours ?? 0}h Software • {data?.learning?.englishHours ?? 0}h English
              </div>
              <div className="text-[10px] font-semibold text-[#2563EB] mt-1">
                {data?.learning?.masteredVocab ?? 0} vocabulary mastered
              </div>
            </div>
          </div>

          {/* Card 4: Net Savings & Financial Health */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8FAFC]">
              <span className="text-[11px] font-bold text-[#64748B]">Savings Rate</span>
              <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                <Wallet size={15} />
              </div>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-extrabold text-[#0F172A] font-mono">
                {data?.finances?.savingsRate ?? 0}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-0.5">
                {(data?.finances?.netSavings ?? 0).toLocaleString()} ETB net saved
              </div>
              <div className="text-[10px] font-semibold text-[#64748B] mt-1">
                Income: {(data?.finances?.totalIncome ?? 0).toLocaleString()} ETB
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. MAIN TREND GRAPH & EXECUTION BREAKDOWN                  */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Trend Curve (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center space-x-2">
                <TrendingUp size={18} className="text-[#165B33]" />
                <h2 className="text-[15px] font-bold text-[#0F172A]">
                  Execution Trend Across Selected Period
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-[#64748B]">
                {data?.bounds?.label || filter}
              </span>
            </div>

            {/* SVG Trend Graph */}
            <div className="py-4">
              {trendPoints.length > 0 ? (
                <div className="h-44 w-full relative">
                  <svg viewBox="0 0 320 130" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="anaTrendArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Gradient Fill */}
                    <polygon points={polygonPoints} fill="url(#anaTrendArea)" />

                    {/* Polyline */}
                    <polyline
                      fill="none"
                      stroke="#16A34A"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={polylinePoints}
                    />

                    {/* Nodes */}
                    {trendPoints.map((pt: any, i: number) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r="3.5"
                        fill="#FFFFFF"
                        stroke="#16A34A"
                        strokeWidth="2"
                      />
                    ))}

                    {/* Labels */}
                    {trendPoints.map((d: any, i: number) => (
                      <text
                        key={i}
                        x={d.x}
                        y="125"
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="#94A3B8"
                        fontWeight="500"
                      >
                        {d.label}
                      </text>
                    ))}
                  </svg>
                </div>
              ) : (
                <div className="p-8 text-center text-[#64748B] text-[12px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                  No tasks scheduled in this reporting period.
                </div>
              )}
            </div>

            {/* Footer Summary Pills */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[#F1F5F9] text-center">
              <div className="bg-[#F8FAFC] p-2 rounded-xl">
                <div className="text-[10px] text-[#64748B] font-semibold">Planned</div>
                <div className="text-[14px] font-bold text-[#0F172A]">{data?.summary?.plannedTasks ?? 0}</div>
              </div>
              <div className="bg-[#F0FDF4] p-2 rounded-xl">
                <div className="text-[10px] text-[#16A34A] font-semibold">Completed</div>
                <div className="text-[14px] font-bold text-[#16A34A]">{data?.summary?.completedTasks ?? 0}</div>
              </div>
              <div className="bg-[#FEF2F2] p-2 rounded-xl">
                <div className="text-[10px] text-[#DC2626] font-semibold">Missed</div>
                <div className="text-[14px] font-bold text-[#DC2626]">{data?.summary?.missedTasks ?? 0}</div>
              </div>
              <div className="bg-[#F1F5F9] p-2 rounded-xl">
                <div className="text-[10px] text-[#475569] font-semibold">Skipped</div>
                <div className="text-[14px] font-bold text-[#475569]">{data?.summary?.skippedTasks ?? 0}</div>
              </div>
            </div>
          </div>

          {/* Planned vs Completed Activities & Categories (col-span-4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center space-x-2 pb-3 border-b border-[#F1F5F9]">
              <Layers size={18} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">Time & Domain Allocation</h2>
            </div>

            <div className="space-y-3 py-2">
              {data?.categoryMinutes && Object.keys(data.categoryMinutes).length > 0 ? (
                Object.entries(data.categoryMinutes).map(([cat, mins]: [string, any]) => {
                  const hours = (mins / 60).toFixed(1);
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-[11.5px]">
                        <span className="font-bold text-[#334155] capitalize">{cat}</span>
                        <span className="font-mono text-[#64748B]">{hours} hrs ({mins}m)</span>
                      </div>
                      <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#165B33] h-1.5 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round((mins / Math.max(1, data.summary.plannedTasks * 45)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-[#64748B] text-[12px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                  Not enough data yet for category allocation.
                </div>
              )}
            </div>

            <div className="p-3 bg-[#EBF5EE]/50 rounded-xl border border-[#D5E2D9] text-[11px] text-[#165B33]">
              <strong>Single Source of Truth:</strong> Hours reflect actual completed focus blocks and verified daily tasks.
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. HABIT ADHERENCE & TRUE STREAKS TABLE                   */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center space-x-2">
              <Flame size={18} className="text-[#D97706]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                Habit Consistency & Real Consecutive Streaks
              </h2>
            </div>
            <span className="text-[11px] text-[#64748B]">
              Streaks calculate from actual calendar occurrences, never from definitions.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B]">
                  <th className="pb-2.5 font-bold">Habit</th>
                  <th className="pb-2.5 font-bold">Domain</th>
                  <th className="pb-2.5 font-bold text-center">Completed / Eligible</th>
                  <th className="pb-2.5 font-bold text-center">Adherence</th>
                  <th className="pb-2.5 font-bold text-right">Active Streak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {data?.habits?.habits && data.habits.habits.length > 0 ? (
                  data.habits.habits.map((h: any) => (
                    <tr key={h.id} className="hover:bg-[#F8FAFC]">
                      <td className="py-2.5 font-bold text-[#0F172A]">{h.name}</td>
                      <td className="py-2.5 text-[#64748B] capitalize">{h.category}</td>
                      <td className="py-2.5 text-center font-mono">
                        {h.completedCount} / {h.eligibleCount}
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            h.adherence >= 80
                              ? "bg-[#DCFCE7] text-[#16A34A]"
                              : h.adherence >= 50
                              ? "bg-[#FEF3C7] text-[#D97706]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {h.adherence}%
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-[#D97706]">
                        {h.currentStreak > 0 ? `🔥 ${h.currentStreak} days` : "0 days"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#64748B]">
                      Not enough data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. FOREX JOURNAL: SEGREGATED TRADING STATISTICS           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center space-x-2">
              <CandlestickChart size={18} className="text-[#165B33]" />
              <div>
                <h2 className="text-[15px] font-bold text-[#0F172A]">
                  Forex Trading Statistics (Strictly Segregated)
                </h2>
                <p className="text-[11px] text-[#64748B]">
                  Backtest testing is tracked independently from demo, prop firm, and live trading.
                </p>
              </div>
            </div>

            {/* Trading Account Tabs */}
            <div className="flex items-center p-1 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              {(
                [
                  { id: "backtest", label: "Backtesting" },
                  { id: "demo", label: "Demo" },
                  { id: "propFirm", label: "Prop Firm" },
                  { id: "live", label: "Live Trading" },
                ] as const
              ).map((tab) => {
                const isActive = forexTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setForexTab(tab.id)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#165B33] text-white shadow-xs"
                        : "text-[#64748B] hover:text-[#0F172A]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Trading Account Stats */}
          {activeForex ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Total Trades</div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono mt-0.5">
                  {activeForex.totalTrades}
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">{activeForex.closedTrades} closed</div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Win Rate</div>
                <div className="text-xl font-extrabold text-[#16A34A] font-mono mt-0.5">
                  {activeForex.winRate}%
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">
                  {activeForex.wins}W / {activeForex.losses}L / {activeForex.breakevens}BE
                </div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Accumulated R</div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono mt-0.5">
                  {activeForex.totalR >= 0 ? "+" : ""}
                  {activeForex.totalR}R
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">Closed trades net</div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Average R</div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono mt-0.5">
                  {activeForex.avgR >= 0 ? "+" : ""}
                  {activeForex.avgR}R
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">Per closed trade</div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Rule Adherence</div>
                <div className="text-xl font-extrabold text-[#165B33] font-mono mt-0.5">
                  {activeForex.ruleAdherenceRate}%
                </div>
                <div className="text-[10px] text-[#64748B] mt-0.5">Plan executed</div>
              </div>

              <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                <div className="text-[10px] font-bold text-[#64748B] uppercase">Environment</div>
                <div className="text-base font-extrabold text-[#0F172A] capitalize mt-1">
                  {forexTab === "propFirm" ? "Prop Firm" : forexTab}
                </div>
                <div className="text-[10px] text-[#64748B]">Risk Model ICT</div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-[#64748B] text-[12px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
              Not enough data yet for {forexTab}. Log trades in the Forex Journal.
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 7. STRATEGIC GOALS & DOMAIN STATUS                         */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Goals & Milestones */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#F1F5F9]">
              <Target size={18} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">Goal & Milestone Trajectory</h2>
            </div>

            <div className="space-y-3">
              {data?.goals?.goals && data.goals.goals.length > 0 ? (
                data.goals.goals.slice(0, 5).map((g: any) => (
                  <div key={g.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-bold text-[#0F172A] truncate max-w-[240px]">{g.title}</span>
                      <span className="font-mono text-[#165B33] font-extrabold">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#165B33] h-1.5 rounded-full" style={{ width: `${g.progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>{g.category}</span>
                      <span>
                        {g.completedMilestonesCount} / {g.milestonesCount} milestones
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[#64748B] text-[12px]">Not enough data yet.</div>
              )}
            </div>
          </div>

          {/* Spiritual, Health, and Business Pulse */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#F1F5F9]">
              <ShieldCheck size={18} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">Domain Pulse & Health</h2>
            </div>

            <div className="space-y-2.5">
              {/* Spiritual */}
              <div className="p-3 bg-[#FFFDF5] rounded-xl border border-[#FEF3C7] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-[#92400E]">Spiritual Devotion</div>
                  <div className="text-[11px] text-[#B45309]">
                    {data?.spiritual?.completedPrayers ?? 0} of {data?.spiritual?.eligiblePrayers ?? 0} prayers completed
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#92400E] font-mono">
                  {data?.spiritual?.devotionPct ?? 0}%
                </div>
              </div>

              {/* Health */}
              <div className="p-3 bg-[#F0FDF4] rounded-xl border border-[#DCFCE7] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-[#166534]">Physical Health & Workouts</div>
                  <div className="text-[11px] text-[#15803D]">
                    {data?.health?.completedWorkouts ?? 0} workouts logged • {data?.health?.avgSleep ?? 7.5}h sleep avg
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#166534] font-mono">
                  {data?.health?.exerciseHours ?? 0}h
                </div>
              </div>

              {/* Suku Marketplace */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-bold text-[#0F172A]">Suku Marketplace (MVP)</div>
                  <div className="text-[11px] text-[#64748B]">
                    {data?.projects?.suku?.completed ?? 0} / {data?.projects?.suku?.total ?? 0} tasks done
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#0F172A] font-mono">
                  {data?.projects?.suku?.progressPct ?? 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

