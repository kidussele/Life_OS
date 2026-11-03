"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Wallet,
  GraduationCap,
  Activity,
  Anchor,
  Store,
  Target,
  Check,
  ShieldCheck,
  RotateCcw,
  Send,
  FileText,
  Sliders,
} from "lucide-react";

export default function PlannerPage() {
  const [loading, setLoading] = useState(true);
  const [weekStart, setWeekStart] = useState("2026-11-02");
  const [plannerData, setPlannerData] = useState<any>(null);
  const [pastReviews, setPastReviews] = useState<any[]>([]);

  // Reflection form state
  const [reflection, setReflection] = useState("");
  const [learnings, setLearnings] = useState("");
  const [improvements, setImprovements] = useState("");
  const [nextWeekPriorities, setNextWeekPriorities] = useState("");
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [savingReview, setSavingReview] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Suggestions state (track which suggestions are approved by user)
  const [approvedSuggestions, setApprovedSuggestions] = useState<{ [id: string]: boolean }>({});
  const [applyingSuggestionId, setApplyingSuggestionId] = useState<string | null>(null);

  const fetchPlannerData = async (dateStr = weekStart) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/planner?weekStartDate=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setPlannerData(data);
        setPastReviews(data.pastReviews || []);

        // Prepopulate if review exists for this week
        const existing = (data.pastReviews || []).find(
          (r: any) => r.week_start_date === dateStr
        );
        if (existing) {
          setReflection(existing.reflection || "");
          setLearnings(existing.learnings || "");
          setImprovements(existing.improvements || "");
          setNextWeekPriorities(existing.next_week_priorities || "");
          setOverallScore(existing.overall_score !== undefined && existing.overall_score !== null ? existing.overall_score : null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData(weekStart);
  }, [weekStart]);

  const handleApplySuggestion = async (suggestion: any) => {
    setApplyingSuggestionId(suggestion.id);
    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply_suggestion",
          suggestion,
        }),
      });

      if (res.ok) {
        setApprovedSuggestions((prev) => ({ ...prev, [suggestion.id]: true }));
        window.dispatchEvent(new Event("life_os_task_updated"));
        await fetchPlannerData(weekStart);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setApplyingSuggestionId(null);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingReview(true);
    try {
      const metrics = plannerData?.metrics || {};
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_review",
          review: {
            week_start_date: weekStart,
            week_end_date: plannerData?.weekEndDate || "2026-11-08",
            reflection,
            learnings,
            improvements,
            next_week_priorities: nextWeekPriorities,
            overall_score: overallScore,
            tasks_completed: metrics.tasksCompleted || 0,
            tasks_missed: metrics.tasksMissed || 0,
            goals_progressed: metrics.goalsProgressed || 0,
            actual_spending: metrics.actualSpending || 0,
            savings_progress: metrics.savingsProgress || 0,
            suggestions_json: plannerData?.suggestions || [],
            status: "reviewed",
          },
        }),
      });

      if (res.ok) {
        setSaveSuccessMessage("Weekly review and next week plan approved successfully!");
        setTimeout(() => setSaveSuccessMessage(null), 5000);
        await fetchPlannerData(weekStart);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingReview(false);
    }
  };

  const metrics = plannerData?.metrics || {};
  const suggestions = plannerData?.suggestions || [];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP HERO HEADER BANNER
            ======================================================== */}
        <div className="bg-gradient-to-r from-[#124B2C] via-[#165B33] to-[#0A2E1A] rounded-3xl p-6 sm:p-8 text-white shadow-sm border border-[#165B33] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-extrabold uppercase tracking-wide">
                Smart Weekly Planning &amp; Review System
              </span>
              <span className="text-white/70 text-[12px] font-mono">
                Sprint Phase 1
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Weekly Execution Review &amp; Load Balancing
            </h1>
            <p className="text-[13.5px] text-white/80 max-w-2xl leading-relaxed">
              At the end of every week, LIFE OS synthesizes real operational records across tasks,
              finances, health, and code development to suggest responsible adjustments for the upcoming week.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-right">
              <div className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                Target Week
              </div>
              <div className="text-[14px] font-mono font-bold text-white mt-0.5">
                {weekStart} → {plannerData?.weekEndDate || "2026-11-08"}
              </div>
            </div>

            <select
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-white text-[#124B2C] text-[12.5px] font-bold px-3.5 py-2.5 rounded-xl border border-white/40 shadow-xs focus:outline-none cursor-pointer"
            >
              <option value="2026-11-02">Week 1: Nov 2 – Nov 8, 2026</option>
              <option value="2026-11-09">Week 2: Nov 9 – Nov 15, 2026</option>
              <option value="2026-11-16">Week 3: Nov 16 – Nov 22, 2026</option>
              <option value="2026-11-23">Week 4: Nov 23 – Nov 29, 2026</option>
            </select>
          </div>
        </div>

        {/* ========================================================
            2. END-OF-WEEK VERIFIED METRICS (10 Mandatory Data Points)
            ======================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-[#D5E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
              <h2 className="text-[16px] font-extrabold text-[#14211A]">
                End-of-Week Verified Records
              </h2>
            </div>
            <span className="text-[12px] text-[#6C8176] font-medium">
              Read directly from active database records
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* 1. Tasks Completed */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#165B33]">
                <CheckCircle2 size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Tasks</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.tasksCompleted || 0}
              </div>
              <div className="text-[11px] text-[#6C8176]">Completed this week</div>
            </div>

            {/* 2. Tasks Missed */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#DC2626]">
                <AlertTriangle size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Missed</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.tasksMissed || 0}
              </div>
              <div className="text-[11px] text-[#6C8176]">Incomplete tasks</div>
            </div>

            {/* 3. Focus Time */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#B45309]">
                <Clock size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Focus</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {Math.round((metrics.totalFocusMinutes || 0) / 60)}h {(metrics.totalFocusMinutes || 0) % 60}m
              </div>
              <div className="text-[11px] text-[#6C8176]">Deep work logged</div>
            </div>

            {/* 4. Goals Progressed */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#165B33]">
                <Target size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Goals</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.goalsProgressed || 0}
              </div>
              <div className="text-[11px] text-[#6C8176]">Milestones updated</div>
            </div>

            {/* 5. Actual Spending */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#2563EB]">
                <Wallet size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Spending</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {(metrics.actualSpending || 0).toLocaleString()} ETB
              </div>
              <div className="text-[11px] text-[#6C8176]">Actual expenditures</div>
            </div>

            {/* 6. Savings Progress */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#165B33]">
                <TrendingUp size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Savings</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {(metrics.savingsProgress || 0).toLocaleString()} ETB
              </div>
              <div className="text-[11px] text-[#6C8176]">Transferred to reserve</div>
            </div>

            {/* 7. Learning Hours */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#9333EA]">
                <GraduationCap size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Learning</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.learningHours || 0}h
              </div>
              <div className="text-[11px] text-[#6C8176]">Engineering &amp; English</div>
            </div>

            {/* 8. Exercise Sessions */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#165B33]">
                <Activity size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Exercise</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.exerciseSessions || 0} / 3
              </div>
              <div className="text-[11px] text-[#6C8176]">Workouts logged</div>
            </div>

            {/* 9. Spiritual Consistency */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#D97706]">
                <Anchor size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Spiritual</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.spiritualConsistencyPercent || 0}%
              </div>
              <div className="text-[11px] text-[#6C8176]">Morning &amp; Night prayers</div>
            </div>

            {/* 10. Project Progress (Suku) */}
            <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
              <div className="flex items-center justify-between text-[#0284C7]">
                <Store size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C8176]">Suku MVP</span>
              </div>
              <div className="text-[20px] font-extrabold font-mono text-[#14211A] mt-1.5">
                {metrics.projectProgressPercent || 0}%
              </div>
              <div className="text-[11px] text-[#6C8176]">Pilot deliverables</div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. SMART SUGGESTIONS (REQUIRES USER APPROVAL)
            ======================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-[#D5E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center">
                <Sparkles size={17} />
              </div>
              <div>
                <h2 className="text-[16px] font-extrabold text-[#14211A] leading-tight">
                  Rule-Based Suggestions for Next Week
                </h2>
                <p className="text-[11.5px] text-[#6C8176]">
                  The system suggests changes transparently. No silent schedule modification without your approval.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-[#EBF5EE] text-[#165B33] text-[11px] font-extrabold rounded-full border border-[#D5E6DC]">
              Approval Required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestions.map((sug: any) => {
              const isApplied = approvedSuggestions[sug.id];
              return (
                <div
                  key={sug.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isApplied
                      ? "bg-[#F0FDF4] border-[#86EFAC]"
                      : "bg-[#F7FAF8] border-[#E2E9E4] hover:border-[#CBD7CE]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-[#165B33] border border-[#D5E2D9]">
                        {sug.type}
                      </span>
                      {isApplied && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A]">
                          <Check size={13} />
                          <span>Approved &amp; Applied</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      {sug.title}
                    </h3>
                    <p className="text-[12.5px] text-[#4F6A5B] leading-relaxed">
                      {sug.description}
                    </p>
                    <div className="p-2.5 bg-white/80 rounded-xl border border-[#E2ECE5] text-[11px] text-[#345140]">
                      <strong className="text-[#14211A]">Rationale:</strong> {sug.rationale}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#E8ECE8] flex items-center justify-end">
                    <button
                      type="button"
                      disabled={isApplied || applyingSuggestionId === sug.id}
                      onClick={() => handleApplySuggestion(sug)}
                      className={`px-4 py-2 rounded-xl text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                        isApplied
                          ? "bg-[#DCFCE7] text-[#166534] cursor-default"
                          : "bg-[#165B33] hover:bg-[#124B2C] text-white cursor-pointer"
                      }`}
                    >
                      {applyingSuggestionId === sug.id ? (
                        <span>Applying...</span>
                      ) : isApplied ? (
                        <>
                          <Check size={14} />
                          <span>Applied to Schedule</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} />
                          <span>Approve &amp; Apply Suggestion</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================
            4. WEEKLY REFLECTION & COMMITMENT FORM
            ======================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-[#D5E2D9] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
              <h2 className="text-[16px] font-extrabold text-[#14211A]">
                Weekly Reflection &amp; Operating Plan
              </h2>
            </div>
            {saveSuccessMessage && (
              <span className="text-[12px] font-bold text-[#16A34A] bg-[#DCFCE7] px-3 py-1 rounded-full border border-[#BBF7D0] animate-in fade-in">
                {saveSuccessMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSaveReview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  1. What went well this week? (Execution wins)
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="e.g. Completed all morning prayer blocks consistently; built the new Focus Mode timer..."
                  className="w-full p-3 text-[12.5px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  2. Key learnings (Technical &amp; Personal)
                </label>
                <textarea
                  rows={3}
                  value={learnings}
                  onChange={(e) => setLearnings(e.target.value)}
                  placeholder="e.g. Discovered that 40m focus blocks are more sustainable than 90m marathons without break..."
                  className="w-full p-3 text-[12.5px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  3. What friction or improvements are needed?
                </label>
                <textarea
                  rows={3}
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  placeholder="e.g. Cut phone screentime after 21:30 to eliminate sleep deficit..."
                  className="w-full p-3 text-[12.5px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  4. Top 3 Priorities for the Following Week
                </label>
                <textarea
                  rows={3}
                  value={nextWeekPriorities}
                  onChange={(e) => setNextWeekPriorities(e.target.value)}
                  placeholder="1. Complete Suku merchant onboarding schema&#10;2. Transfer 5,000 ETB to Emergency Fund&#10;3. Maintain 100% Morning Prayer consistency"
                  className="w-full p-3 text-[12.5px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>
            </div>

            {/* Score Slider */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#F7FAF8] rounded-2xl border border-[#E2E9E4]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-bold text-[#14211A]">
                    Self-Assessed Rating:{" "}
                    <span className="text-[#165B33] font-mono text-[15px]">
                      {overallScore !== null ? `${overallScore} / 10` : "Unrated"}
                    </span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7]">
                    Manual Input
                  </span>
                </div>
                <p className="text-[11px] text-[#6C8176] mt-0.5">
                  Your subjective reflection score. Automatically calculated performance:{" "}
                  <strong>
                    {(metrics?.tasksCompleted || 0) + (metrics?.tasksMissed || 0) > 0
                      ? `${Math.round(
                          ((metrics.tasksCompleted || 0) /
                            ((metrics.tasksCompleted || 0) + (metrics.tasksMissed || 0))) *
                            100
                        )}% (${metrics.tasksCompleted || 0} done)`
                      : "0% (0 tasks logged)"}
                  </strong>{" "}
                  from database.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={overallScore ?? 7.0}
                  onChange={(e) => setOverallScore(parseFloat(e.target.value))}
                  className="w-40 accent-[#165B33]"
                />
                <button
                  type="submit"
                  disabled={savingReview}
                  className="px-5 py-2.5 bg-[#165B33] hover:bg-[#124B2C] text-white font-bold text-[13px] rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send size={15} />
                  <span>{savingReview ? "Saving..." : "Save & Approve Weekly Review"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* ========================================================
            5. PAST WEEKLY REVIEWS ARCHIVE
            ======================================================== */}
        {pastReviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-[#D5E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F2]">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                <h2 className="text-[16px] font-extrabold text-[#14211A]">
                  Archived Weekly Reviews
                </h2>
              </div>
              <span className="text-[11.5px] text-[#6C8176]">
                {pastReviews.length} sprint reviews saved
              </span>
            </div>

            <div className="divide-y divide-[#F0F4F2]">
              {pastReviews.map((rev) => (
                <div key={rev.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#14211A]">
                          Week of {rev.week_start_date} → {rev.week_end_date}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33] text-[10px] font-bold font-mono">
                          Score: {rev.overall_score}/10
                        </span>
                      </div>
                      <p className="text-[12.5px] text-[#4F6A5B] mt-1.5 leading-relaxed">
                        <strong className="text-[#14211A]">Reflection:</strong> {rev.reflection || "Weekly reflection recorded."}
                      </p>
                      {rev.next_week_priorities && (
                        <p className="text-[12px] text-[#6C8176] mt-1">
                          <strong className="text-[#14211A]">Priorities:</strong> {rev.next_week_priorities}
                        </p>
                      )}
                    </div>

                    <div className="text-right text-[11px] text-[#8CA095] font-mono flex-shrink-0">
                      {rev.tasks_completed} done • {rev.tasks_missed} missed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
