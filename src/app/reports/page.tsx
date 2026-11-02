"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  BarChart3,
  Download,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Wallet,
  FileText,
  Trophy,
  Star,
  Sparkles,
  PieChart,
  Activity,
  Check,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";

export default function ReportsPage() {
  const [timeFilter, setTimeFilter] = useState("Last 30 Days");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Dynamic metrics state with clean initial values for fresh start
  const [metrics, setMetrics] = useState({
    prayerDevotion: 0,
    prayerChange: "Day 1 Baseline",
    scheduleExecution: 0,
    scheduleChange: "Day 1 Baseline",
    forexPerformance: "0.0R",
    forexChange: "0 trades logged",
    emergencySavings: "0 ETB",
    emergencyChange: "Target 15,000 ETB",
    weeklyConsistency: 0,
    weeklyChange: "Day 1 Baseline",
    totalCapital: "0",
  });
  const [reportData, setReportData] = useState<any>(null);

  // Weekly Review State
  const [reviews, setReviews] = useState<any[]>([]);
  const [currentWeekStats, setCurrentWeekStats] = useState<any>({ totalTasks: 0, completedTasks: 0, missedTasks: 0, focusMinutes: 0 });
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState("2026-11-02");
  const [weekEndDate, setWeekEndDate] = useState("2026-11-08");
  const [winsReflection, setWinsReflection] = useState("");
  const [challengesReflection, setChallengesReflection] = useState("");
  const [adjustmentsPlan, setAdjustmentsPlan] = useState("");
  const [proposedSchedule, setProposedSchedule] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        if (data.currentStats) setCurrentWeekStats(data.currentStats);
      }
    } catch (_) {}
  };

  useEffect(() => {
    // Fetch active reports analytics, finance and forex stats
    const loadRealData = async () => {
      try {
        const [finRes, fxRes, repRes] = await Promise.all([
          fetch("/api/finances").catch(() => null),
          fetch("/api/forex").catch(() => null),
          fetch(`/api/reports?range=${encodeURIComponent(timeFilter)}`).catch(() => null),
        ]);

        if (finRes && finRes.ok) {
          const finData = await finRes.json();
          if (finData.summary) {
            setMetrics((prev) => ({
              ...prev,
              emergencySavings: `${(finData.summary.emergencyFund || 0).toLocaleString()} ETB`,
              totalCapital: `${(finData.summary.totalIncome || 0).toLocaleString()}`,
            }));
          }
        }

        if (fxRes && fxRes.ok) {
          const fxData = await fxRes.json();
          if (fxData.stats) {
            setMetrics((prev) => ({
              ...prev,
              forexPerformance: `${(fxData.stats.totalR || 0) >= 0 ? "+" : ""}${fxData.stats.totalR || 0}R`,
            }));
          }
        }

        if (repRes && repRes.ok) {
          const rep = await repRes.json();
          setReportData(rep);
          if (rep.weeklyTrend && rep.weeklyTrend.length > 0) {
            const daysWithTasks = rep.weeklyTrend.filter((d: any) => d.total > 0);
            const avg = daysWithTasks.length > 0
              ? Math.round(daysWithTasks.reduce((acc: number, d: any) => acc + d.percent, 0) / daysWithTasks.length)
              : 0;
            setMetrics((prev) => ({
              ...prev,
              weeklyConsistency: avg,
              weeklyChange: avg > 0 ? `${avg}% executed` : "Day 1 Baseline",
            }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadRealData();
    fetchReviews();
  }, [timeFilter]);

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start_date: weekStartDate,
          week_end_date: weekEndDate,
          completed_tasks_count: currentWeekStats.completedTasks,
          missed_tasks_count: currentWeekStats.missedTasks,
          total_focus_minutes: currentWeekStats.focusMinutes,
          wins_reflection: winsReflection,
          challenges_reflection: challengesReflection,
          adjustments_plan: adjustmentsPlan,
          proposed_schedule: proposedSchedule,
        }),
      });

      if (res.ok) {
        setIsReviewFormOpen(false);
        setWinsReflection("");
        setChallengesReflection("");
        setAdjustmentsPlan("");
        setProposedSchedule("");
        fetchReviews();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingReview(false);
    }
  };

  const trendPoints = (reportData?.weeklyTrend && reportData.weeklyTrend.length === 7)
    ? reportData.weeklyTrend.map((d: any, idx: number) => ({
        x: 20 + idx * 45,
        y: 110 - Math.round(((d.percent || 0) / 100) * 80),
        label: d.day,
        percent: d.percent || 0,
      }))
    : [
        { x: 20, y: 110, label: "Mon", percent: 0 },
        { x: 65, y: 110, label: "Tue", percent: 0 },
        { x: 110, y: 110, label: "Wed", percent: 0 },
        { x: 155, y: 110, label: "Thu", percent: 0 },
        { x: 200, y: 110, label: "Fri", percent: 0 },
        { x: 245, y: 110, label: "Sat", percent: 0 },
        { x: 290, y: 110, label: "Sun", percent: 0 },
      ];

  const polylinePoints = trendPoints.map((p: any) => `${p.x},${p.y}`).join(" ");
  const polygonPoints = `20,110 20,${trendPoints[0].y} ` + polylinePoints + ` 290,110`;

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP HEADER & FILTER ROW                                */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          {/* Left: Icon + Title + Subtitle */}
          <div className="flex items-start space-x-3">
            <div className="text-[#165B33] flex-shrink-0 mt-0.5">
              <BarChart3 size={32} className="stroke-[2.5]" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0D3823] tracking-tight">
                Reports & Analytical Review
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#64748B] mt-0.5">
                Track your progress with detailed insights and analytics.
              </p>
            </div>
          </div>

          {/* Right: Time Filter Tabs + Export Button */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-transparent">
              {["Last 30 Days", "Last 90 Days", "Last 6 Months", "Last Year"].map((tab) => {
                const isActive = timeFilter === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setTimeFilter(tab)}
                    className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                      isActive
                        ? "bg-[#165B33] text-white shadow-sm"
                        : "text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Export Report Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#165B33] border border-[#CBD5E1] rounded-lg text-[12px] font-semibold shadow-sm transition-all"
            >
              <Download size={13} />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. FOUR METRIC OVERVIEW CARDS                             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Prayer Devotion */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FFF8E7] border border-[#FEF3C7] flex items-center justify-center text-[22px] flex-shrink-0 shadow-sm">
              🙏
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Prayer Devotion
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {metrics.prayerDevotion}%
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                {metrics.prayerChange} from last period
              </span>
            </div>
          </div>

          {/* Card 2: Schedule Execution */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
              <Calendar size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Schedule Execution
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {metrics.scheduleExecution}%
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                {metrics.scheduleChange} from last period
              </span>
            </div>
          </div>

          {/* Card 3: Forex Performance */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
              <TrendingUp size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Forex Performance
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {metrics.forexPerformance}
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                {metrics.forexChange} from last period
              </span>
            </div>
          </div>

          {/* Card 4: Emergency Savings */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[22px] flex-shrink-0 shadow-sm">
              🪙
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Emergency Savings
              </span>
              <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                {metrics.emergencySavings}
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                {metrics.emergencyChange} this month
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MIDDLE SECTION: 2 LARGE ANALYTICAL CARDS               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Left Card: Weekly Execution Consistency (approx 62% width -> col-span-7 or 8) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center space-x-2 pb-3 mb-2 border-b border-[#F1F5F9]">
              <Activity size={17} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                Weekly Execution Consistency
              </h2>
            </div>

            {/* Content: Left Ring + Habits, Right 7-Day Curve */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Left Part: Circular Progress + Habit Checkmarks (col-span-5) */}
              <div className="md:col-span-5 flex items-center space-x-4">
                {/* Donut Progress Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#DCFCE7"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#16A34A"
                      strokeWidth="10"
                      strokeDasharray="251.2"
                      strokeDashoffset={251.2 * (1 - (metrics.weeklyConsistency || 0) / 100)}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold text-[#0F172A] leading-tight">
                      {metrics.weeklyConsistency}%
                    </span>
                    <span className="text-[10px] font-semibold text-[#64748B]">
                      This Week
                    </span>
                    <span className="text-[9px] font-bold text-[#16A34A]">
                      ({metrics.weeklyChange})
                    </span>
                  </div>
                </div>

                {/* Habit Checklist */}
                <div className="space-y-1.5 min-w-0">
                  {[
                    "Morning Prayer",
                    "Night Prayer",
                    "Daily Study",
                    "Physical Exercise",
                    "Healthy Nutrition",
                  ].map((habit, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#334155]">
                      <CheckCircle2 size={13} className="text-[#16A34A] flex-shrink-0" />
                      <span className="truncate">{habit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Part: 7-Day Trend Curve (col-span-7) */}
              <div className="md:col-span-7 h-36 relative">
                <svg viewBox="0 0 320 130" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="consistencyArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16A34A" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#16A34A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area Fill */}
                  <polygon
                    points={polygonPoints}
                    fill="url(#consistencyArea)"
                  />

                  {/* Green Trend Curve Line */}
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

                  {/* Days of Week Labels */}
                  {trendPoints.map((d: any, i: number) => (
                    <text
                      key={i}
                      x={d.x}
                      y="125"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94A3B8"
                      fontWeight="500"
                    >
                      {d.label}
                    </text>
                  ))}
                </svg>

                {/* Consistency Badge top right */}
                <div className="absolute right-0 top-1 bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                  {metrics.weeklyConsistency}%
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Monthly Capital Allocation (ETB) (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center space-x-2 pb-3 mb-2 border-b border-[#F1F5F9]">
              <PieChart size={17} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                Monthly Capital Allocation (ETB)
              </h2>
            </div>

            {/* Donut Chart + Legend */}
            <div className="flex items-center justify-between gap-4">
              {/* Donut Chart */}
              <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Segment 1: Family Support (33.3%) - Forest Green */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#165B33"
                    strokeWidth="14"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - 0.333)}
                    fill="transparent"
                  />
                  {/* Segment 2: Commute (6.7%) - Slate Blue */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#2563EB"
                    strokeWidth="14"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - 0.067)}
                    transform="rotate(120 50 50)"
                    fill="transparent"
                  />
                  {/* Segment 3: Food (11.7%) - Amber Orange */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - 0.117)}
                    transform="rotate(144 50 50)"
                    fill="transparent"
                  />
                  {/* Segment 4: Emergency Fund (10.0%) - Purple */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#7C3AED"
                    strokeWidth="14"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - 0.1)}
                    transform="rotate(186 50 50)"
                    fill="transparent"
                  />
                  {/* Segment 5: Others (38.3%) - Light Gray */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#CBD5E1"
                    strokeWidth="14"
                    strokeDasharray="238.7"
                    strokeDashoffset={238.7 * (1 - 0.383)}
                    transform="rotate(222 50 50)"
                    fill="transparent"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[17px] font-extrabold text-[#0F172A] leading-tight">
                    {metrics.totalCapital}
                  </span>
                  <span className="text-[10px] text-[#64748B] font-semibold">Total</span>
                </div>
              </div>

              {/* Category Legend with exact amounts & percentages */}
              <div className="space-y-1.5 min-w-0 flex-1 text-[11px]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#165B33] flex-shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#0F172A]">Family Support</span>
                    <span className="text-[#64748B] block text-[10px]">10,000 (33.3%)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] flex-shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#0F172A]">Commute & Transportation</span>
                    <span className="text-[#64748B] block text-[10px]">2,000 (6.7%)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#0F172A]">Food & Daily Living</span>
                    <span className="text-[#64748B] block text-[10px]">3,500 (11.7%)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] flex-shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#0F172A]">Emergency Fund</span>
                    <span className="text-[#64748B] block text-[10px]">3,000 (10.0%)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] flex-shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#0F172A]">Others</span>
                    <span className="text-[#64748B] block text-[10px]">11,500 (38.3%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. BOTTOM SECTION: 3 CARDS ROW                            */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Top Achievements */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 mb-3 pb-2 border-b border-[#F1F5F9]">
                <span className="text-[14px]">🏆</span>
                <h3 className="text-[13px] font-bold text-[#0F172A]">Top Achievements</h3>
              </div>

              <div className="space-y-3">
                {reportData?.achievements && reportData.achievements.length > 0 ? (
                  reportData.achievements.map((ach: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between text-[12px]">
                      <div className="flex items-start space-x-2 min-w-0">
                        <Star size={14} className="text-[#F59E0B] fill-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[#0F172A] leading-tight">
                            {ach.title}
                          </div>
                          <div className="text-[11px] text-[#64748B]">{ach.subtitle}</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#94A3B8] font-mono whitespace-nowrap pl-2">
                        {ach.date}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-3.5 text-center text-[#64748B] text-[11px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                    <div className="font-bold text-[#0F172A] mb-1">No completed achievements yet</div>
                    <div>Execute scheduled tasks and attain milestones to unlock verified achievements.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Recent Activity */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-1.5 mb-3 pb-2 border-b border-[#F1F5F9]">
                <FileText size={15} className="text-[#165B33]" />
                <h3 className="text-[13px] font-bold text-[#0F172A]">Recent Activity</h3>
              </div>

              {/* Connected Vertical Timeline */}
              {reportData?.recentActivity && reportData.recentActivity.length > 0 ? (
                <div className="relative pl-4 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2E8F0]">
                  {reportData.recentActivity.map((act: any, idx: number) => (
                    <div key={idx} className="relative text-[12px]">
                      <span className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
                      <div className="font-bold text-[#0F172A] leading-tight truncate">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">{act.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 text-center text-[#64748B] text-[11px] bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0]">
                  <div className="font-bold text-[#0F172A] mb-1">No recent activity logged</div>
                  <div>Tasks completed in My Day and active modules will populate this timeline.</div>
                </div>
              )}
            </div>
          </div>

          {/* Card 3: Key Insights (Dark Green Card with Ascending Bars Graphic) */}
          <div className="relative overflow-hidden bg-[#124B2C] rounded-2xl p-4 sm:p-5 text-white shadow-sm flex flex-col justify-between">
            {/* Background 3D Ascending Bars Graphic on bottom right */}
            <div
              className="absolute right-0 bottom-0 w-36 h-36 bg-no-repeat bg-contain bg-right-bottom opacity-85 pointer-events-none"
              style={{
                backgroundImage: "url('/reports/growth_bars.png')",
              }}
            />

            <div className="relative z-10 max-w-[210px]">
              <div className="flex items-center space-x-1.5 mb-2.5">
                <span className="text-[14px]">💡</span>
                <h3 className="text-[13px] font-bold text-white">Key Insights</h3>
              </div>

              <div className="space-y-1.5 text-[11px] text-[#E2FBE9] font-medium leading-snug">
                <div className="flex items-start space-x-1.5">
                  <CheckCircle2 size={13} className="text-[#86EFAC] flex-shrink-0 mt-0.5" />
                  <span>Authoritative 90-day plan active: Nov 2, 2026.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <CheckCircle2 size={13} className="text-[#86EFAC] flex-shrink-0 mt-0.5" />
                  <span>30-Day Emergency Cushion target set at 15,000 ETB.</span>
                </div>
                <div className="flex items-start space-x-1.5">
                  <CheckCircle2 size={13} className="text-[#86EFAC] flex-shrink-0 mt-0.5" />
                  <span>Zero unverified historical data; reports update from real execution.</span>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(true)}
                className="mt-3.5 inline-flex items-center space-x-1 px-3 py-1.5 bg-[#F0FDF4] hover:bg-white text-[#124B2C] rounded-lg text-[11px] font-bold transition-all shadow-sm"
              >
                <span>View Detailed Report</span>
                <ArrowRight size={12} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. WEEKLY STRUCTURED REVIEW & REFLECTION (Section 11)     */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#165B33] flex items-center justify-center font-bold text-lg border border-[#C8E6C9]">
                📝
              </div>
              <div>
                <h3 className="text-[16px] font-extrabold text-[#0D3823] tracking-tight">
                  Weekly System Review & Alignment
                </h3>
                <p className="text-[12px] text-[#64748B]">
                  Conduct an intentional review of what worked, what failed, and calibrate next week's schedule.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="px-4 py-2 rounded-xl bg-[#165B33] hover:bg-[#124B2C] text-white text-[12.5px] font-bold shadow-xs transition-all self-start sm:self-center"
            >
              {isReviewFormOpen ? "Close Review Form" : "+ Log Weekly Review"}
            </button>
          </div>

          {/* Current Week Quick Snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3.5 text-xs">
            <div>
              <span className="text-[#64748B] block font-medium">Tasks Executed</span>
              <span className="text-base font-bold text-[#0F172A]">{currentWeekStats.completedTasks} / {currentWeekStats.totalTasks}</span>
            </div>
            <div>
              <span className="text-[#64748B] block font-medium">Tasks Missed</span>
              <span className="text-base font-bold text-[#DC2626]">{currentWeekStats.missedTasks}</span>
            </div>
            <div>
              <span className="text-[#64748B] block font-medium">Total Deep Work</span>
              <span className="text-base font-bold text-[#165B33]">{Math.round(currentWeekStats.focusMinutes / 60)} hrs</span>
            </div>
            <div>
              <span className="text-[#64748B] block font-medium">Next Week Cadence</span>
              <span className="text-base font-bold text-[#0D3823]">Protected</span>
            </div>
          </div>

          {/* Review Form */}
          {isReviewFormOpen && (
            <form onSubmit={handleSaveReview} className="space-y-4 bg-[#F8FAFC] p-4 sm:p-5 rounded-2xl border border-[#E2E8F0]">
              <h4 className="text-[13.5px] font-bold text-[#0F172A]">Weekly Reflection & Schedule Recalibration</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Week Start Date</label>
                  <input
                    type="date"
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Week End Date</label>
                  <input
                    type="date"
                    value={weekEndDate}
                    onChange={(e) => setWeekEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                  1. What Worked Well? (Wins, discipline, habit streaks)
                </label>
                <textarea
                  value={winsReflection}
                  onChange={(e) => setWinsReflection(e.target.value)}
                  placeholder="e.g. 4:00 AM wake up maintained 5 days straight; completed Suku merchant schema..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                  2. Main Challenges & Bottlenecks (Where did friction or missed tasks occur?)
                </label>
                <textarea
                  value={challengesReflection}
                  onChange={(e) => setChallengesReflection(e.target.value)}
                  placeholder="e.g. Mid-day fatigue due to late bed-time on Thursday; freelance scope creep..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                  3. Adjustments & Proposed Next Week's Schedule (What to protect or shift?)
                </label>
                <textarea
                  value={adjustmentsPlan}
                  onChange={(e) => setAdjustmentsPlan(e.target.value)}
                  placeholder="e.g. Enforce 21:30 screen shutdown; shift Forex backtesting to Wednesday evening..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReviewFormOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="px-4 py-1.5 bg-[#165B33] text-white rounded-lg text-xs font-bold hover:bg-[#124B2C] shadow-xs"
                >
                  {savingReview ? "Saving..." : "Save Weekly Review"}
                </button>
              </div>
            </form>
          )}

          {/* Past Reviews List */}
          {reviews.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">Recorded Weekly Reviews</h4>
              <div className="space-y-2.5">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FAFDFB] space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-[#0D3823]">
                      <span>Week of {rev.week_start_date} to {rev.week_end_date}</span>
                      <span className="text-[11px] text-[#64748B] font-normal">{rev.completed_tasks_count} completed</span>
                    </div>
                    {rev.wins_reflection && (
                      <p className="text-[#334155] leading-relaxed"><strong>Wins:</strong> {rev.wins_reflection}</p>
                    )}
                    {rev.challenges_reflection && (
                      <p className="text-[#475569] leading-relaxed"><strong>Challenges:</strong> {rev.challenges_reflection}</p>
                    )}
                    {rev.adjustments_plan && (
                      <p className="text-[#166534] leading-relaxed"><strong>Adjustments:</strong> {rev.adjustments_plan}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL: EXPORT REPORT                                      */}
        {/* ========================================================= */}
        <Modal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          title="Export Analytical Report"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <p>
              Generate an official executive report for <strong>{timeFilter}</strong> covering Prayer Devotion, Schedule Execution, Forex Risk Expectancy, and Capital Allocations.
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Time Period:</span>
                <span className="font-bold text-[#0F172A]">{timeFilter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Weekly Consistency:</span>
                <span className="font-bold text-[#16A34A]">{metrics.weeklyConsistency}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Forex R-Multiple:</span>
                <span className="font-bold text-[#0F172A]">{metrics.forexPerformance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Emergency Reserve:</span>
                <span className="font-bold text-[#0F172A]">{metrics.emergencySavings}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 text-[12px] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  window.print();
                  setIsExportModalOpen(false);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 text-[12px] font-semibold text-white bg-[#165B33] hover:bg-[#124B2C] rounded-lg shadow-sm"
              >
                <Printer size={13} />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: DETAILED REPORT VIEW                               */}
        {/* ========================================================= */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Analytical Breakdown & Discipline Policy"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#165B33]">
              <strong>Review Protocol: </strong>Every Sunday at 15:00, audit execution integrity, analyze missed time blocks, adjust weekly capacity, and reinforce non-negotiable spiritual and financial foundations.
            </div>

            <div>
              <h4 className="font-bold text-[#0F172A] mb-1">Key Consistency Drivers</h4>
              <ul className="space-y-1 text-[12px] text-[#475569]">
                <li>• 04:00 AM sacred morning prayer routine maintained unbroken.</li>
                <li>• 21:15 PM night reflection protecting restful 7.5-hour sleep rhythm.</li>
                <li>• Strict zero-capital deployment in Forex until 100 demo trades are logged.</li>
                <li>• Monthly family contribution of 10,000 ETB honored without delay.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#165B33] hover:bg-[#124B2C] rounded-lg shadow-sm"
              >
                Close Insights
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
