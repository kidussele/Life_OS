"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar as CalendarIcon,
  ShieldCheck,
  Check,
  Trophy,
  Star,
  Quote,
  TrendingUp,
  ArrowRight,
  Sprout,
  Flame,
  Clock,
  Sparkles,
} from "lucide-react";

import { useTimeEngine } from "@/hooks/useTimeEngine";

interface HabitItem {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  status: "Completed" | "In Progress" | "Pending";
  completed: boolean;
  currentStreak?: number;
}

export default function DisciplinePage() {
  const { now } = useTimeEngine();
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-02");
  const [loading, setLoading] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);

  useEffect(() => {
    if (now?.dateStr) {
      setSelectedDate(now.dateStr);
    }
  }, [now?.dateStr]);

  // New Habit form fields
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitSubtitle, setNewHabitSubtitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("Health & Energy");

  // Initial Habits list - cleanly initialized to pending for fresh start
  const initialLeftHabits: HabitItem[] = [
    {
      id: "h_wake",
      name: "04:00 AM Wake-up",
      subtitle: "Health & Energy",
      category: "health",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_m_prayer",
      name: "Morning Prayer (30 min)",
      subtitle: "Spiritual Growth",
      category: "spiritual",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_exercise",
      name: "Daily Exercise & Stretching",
      subtitle: "Fitness & Health",
      category: "health",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_prof_learn",
      name: "Professional Code Study (40 min)",
      subtitle: "Skills Development",
      category: "learning",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_dev_session",
      name: "Evening Development Session (60 min)",
      subtitle: "Development",
      category: "development",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_family",
      name: "Meaningful Family Time",
      subtitle: "Family",
      category: "family",
      status: "Pending",
      completed: false,
    },
  ];

  const initialRightHabits: HabitItem[] = [
    {
      id: "h_sleep",
      name: "Sleep Preparation by 22:00",
      subtitle: "Rest & Recovery",
      category: "health",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_fin_track",
      name: "Daily Financial Expense Tracking",
      subtitle: "Financial",
      category: "financial",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_n_prayer",
      name: "Night Prayer (30 min)",
      subtitle: "Spiritual",
      category: "spiritual",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_english",
      name: "English Learning & Speaking",
      subtitle: "Skills Development",
      category: "learning",
      status: "Pending",
      completed: false,
    },
    {
      id: "h_work",
      name: "Employment Focus & Attendance",
      subtitle: "Career & Work",
      category: "work",
      status: "Pending",
      completed: false,
    },
  ];

  const [leftHabits, setLeftHabits] = useState<HabitItem[]>(initialLeftHabits);
  const [rightHabits, setRightHabits] = useState<HabitItem[]>(initialRightHabits);
  const [stats, setStats] = useState({
    weeklyAverage: 0,
    prayerCount: 0,
    workoutCount: 0,
    learnHours: 0,
    devHours: 0,
  });
  const [weeklyOverview, setWeeklyOverview] = useState<{ day: string; date?: string; percent: number }[]>([]);

  // Sync with DB
  const fetchHabits = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/discipline?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.weeklyOverview) {
          setWeeklyOverview(data.weeklyOverview);
        }
        const dbHabits = data.habits || [];
        if (dbHabits.length > 0) {
          const habitMap = new Map<string, any>();
          for (const h of dbHabits) {
            habitMap.set(h.id, h);
          }

          setLeftHabits((prev) =>
            prev.map((item) => {
              const dbItem = habitMap.get(item.id);
              if (dbItem) {
                const isCompleted = !!dbItem.completed_today;
                return {
                  ...item,
                  completed: isCompleted,
                  currentStreak: Number(dbItem.current_streak || 0),
                  status: isCompleted ? "Completed" : item.status === "In Progress" ? "In Progress" : "Pending",
                };
              }
              return item;
            })
          );

          setRightHabits((prev) =>
            prev.map((item) => {
              const dbItem = habitMap.get(item.id);
              if (dbItem) {
                const isCompleted = !!dbItem.completed_today;
                return {
                  ...item,
                  completed: isCompleted,
                  currentStreak: Number(dbItem.current_streak || 0),
                  status: isCompleted ? "Completed" : item.status === "In Progress" ? "In Progress" : "Pending",
                };
              }
              return item;
            })
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(selectedDate);

    const handleHabitRefresh = () => {
      fetchHabits(selectedDate);
    };

    window.addEventListener("life_os_habit_updated", handleHabitRefresh);
    window.addEventListener("life_os_task_updated", handleHabitRefresh);

    return () => {
      window.removeEventListener("life_os_habit_updated", handleHabitRefresh);
      window.removeEventListener("life_os_task_updated", handleHabitRefresh);
    };
  }, [selectedDate]);

  // Toggle habit status
  const handleToggleHabit = async (id: string, isLeft: boolean) => {
    const target = isLeft
      ? leftHabits.find((h) => h.id === id)
      : rightHabits.find((h) => h.id === id);

    if (!target) return;

    let nextStatus: "Completed" | "In Progress" | "Pending";
    let nextCompleted = false;

    if (target.status === "Pending") {
      nextStatus = "In Progress";
      nextCompleted = false;
    } else if (target.status === "In Progress") {
      nextStatus = "Completed";
      nextCompleted = true;
    } else {
      nextStatus = "Pending";
      nextCompleted = false;
    }

    if (isLeft) {
      setLeftHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: nextStatus, completed: nextCompleted } : h))
      );
    } else {
      setRightHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status: nextStatus, completed: nextCompleted } : h))
      );
    }

    try {
      await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: id,
          date: selectedDate,
          completed: nextCompleted,
        }),
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("life_os_habit_updated"));
        window.dispatchEvent(new CustomEvent("life_os_task_updated"));
        window.dispatchEvent(new CustomEvent("life_os_goal_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all as complete
  const handleMarkAllComplete = () => {
    setLeftHabits((prev) => prev.map((h) => ({ ...h, status: "Completed", completed: true })));
    setRightHabits((prev) => prev.map((h) => ({ ...h, status: "Completed", completed: true })));
  };

  // Add new habit
  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName) return;
    const newHabit: HabitItem = {
      id: `custom_${Date.now()}`,
      name: newHabitName,
      subtitle: newHabitSubtitle || newHabitCategory,
      category: "custom",
      status: "Pending",
      completed: false,
    };
    setRightHabits((prev) => [...prev, newHabit]);
    setIsAddHabitModalOpen(false);
    setNewHabitName("");
    setNewHabitSubtitle("");
  };

  const allHabits = [...leftHabits, ...rightHabits];
  const completedCount = allHabits.filter((h) => h.completed).length;
  const totalCount = allHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Status badge styling
  const getStatusBadge = (status: "Completed" | "In Progress" | "Pending") => {
    switch (status) {
      case "Completed":
        return "bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7]";
      case "In Progress":
        return "bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]";
      case "Pending":
        return "bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC MOUNTAIN HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[145px] sm:min-h-[160px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Majestic Alpine Mountains & Lake"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[60%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title with Target/Leaf icon */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/95 border border-[#B7E4C7] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Target size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  Discipline &amp; Habit Tracker
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-[#284534] font-medium leading-relaxed">
                  Small daily actions create extraordinary results.
                </p>
              </div>
            </div>

            {/* Right Side: Quote Pill + "+ Add Habit" Button */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {/* Glassmorphic Motivational Quote Pill */}
              <div className="hidden lg:flex items-center space-x-2 bg-black/40 backdrop-blur-md text-white/95 text-[11.5px] font-medium px-4 py-2 rounded-2xl border border-white/20 shadow-xs">
                <Quote size={13} className="text-[#86EFAC] rotate-180 flex-shrink-0" />
                <span className="italic">
                  &ldquo;Discipline is the bridge between your goals and success.&rdquo;
                </span>
              </div>

              {/* Add Habit Button */}
              <button
                type="button"
                onClick={() => setIsAddHabitModalOpen(true)}
                className="bg-[#165B33] hover:bg-[#123D26] text-white text-[12.5px] font-bold py-2.5 px-4.5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Habit</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. TOP METRIC CARDS ROW (4 CARDS)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Progress with SVG Ring Gauge */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-4">
            <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#E8EEEA"
                  strokeWidth="3.5"
                  fill="none"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  stroke="#165B33"
                  strokeWidth="3.5"
                  strokeDasharray={`${progressPercent}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[14.5px] font-extrabold text-[#112318] font-mono">
                {progressPercent}%
              </span>
            </div>
            <div>
              <h3 className="text-[14px] font-extrabold text-[#112318]">Today's Progress</h3>
              <p className="text-[12px] text-[#5A6E63] font-medium mt-0.5">
                {completedCount} of {totalCount} habits
              </p>
            </div>
          </div>

          {/* Card 2: Weekly Average */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Trophy size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-baseline space-x-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-[#112318] font-mono">
                  {stats.weeklyAverage}%
                </span>
                <span className="text-[11px] font-bold text-[#165B33] flex items-center">
                  {stats.weeklyAverage > 0 ? "+Active" : "Baseline"}
                </span>
              </div>
              <p className="text-[12px] text-[#5A6E63] font-medium mt-0.5">
                Weekly Average
              </p>
            </div>
          </div>

          {/* Card 3: Prayer Devotion Streak */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <CalendarIcon size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] font-mono block">
                {stats.prayerCount} Days
              </span>
              <p className="text-[12px] text-[#5A6E63] font-medium mt-0.5">
                Prayer Devotion Streak
              </p>
            </div>
          </div>

          {/* Card 4: High Discipline Level */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Star size={22} className="stroke-[2.2] fill-[#EA580C]" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] block">
                High
              </span>
              <p className="text-[12px] text-[#5A6E63] font-medium mt-0.5">
                Discipline Level
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. MAIN CONTENT: CHECKLIST (LEFT) + OVERVIEW & INSIGHTS (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN (col-span-8): Daily Discipline Checklist
              ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-5">
            {/* Header: Title + "Mark All Complete" button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                  <CalendarIcon size={16} />
                </div>
                <h3 className="text-[15px] font-extrabold text-[#112318]">
                  Daily Discipline Checklist ({selectedDate})
                </h3>
              </div>

              <button
                type="button"
                onClick={handleMarkAllComplete}
                className="bg-[#EBF5EE] hover:bg-[#D8EEDF] text-[#165B33] text-[11.5px] font-bold px-3 py-1 rounded-full border border-[#B7E4C7] flex items-center gap-1 transition-colors"
              >
                <Check size={13} strokeWidth={2.5} />
                <span>Mark All Complete</span>
              </button>
            </div>

            {/* 2-Column Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-start">
              {/* Left Sub-Column */}
              <div className="space-y-3">
                {leftHabits.map((item) => {
                  const isDone = item.completed;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleHabit(item.id, true)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isDone
                          ? "bg-[#F7FAF8] border-[#E2EAE5] hover:border-[#B7E4C7]"
                          : "bg-white border-[#E2EAE5] hover:border-[#CBD7CE] hover:bg-[#F9FBFA]"
                      }`}
                    >
                      {/* Checkbox Icon + Name & Subtitle */}
                      <div className="flex items-center space-x-3 min-w-0">
                        {isDone ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-[#165B33] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-lg border-2 border-[#CBD7CE] bg-white group-hover:border-[#165B33] flex-shrink-0 transition-colors" />
                        )}

                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold text-[#14211A] truncate leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-[#6C8176] font-normal block mt-0.5 truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill on Right */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {Boolean(item.currentStreak && item.currentStreak > 0) && (
                          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            🔥 {item.currentStreak}d
                          </span>
                        )}
                        <span
                          className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Sub-Column */}
              <div className="space-y-3">
                {rightHabits.map((item) => {
                  const isDone = item.completed;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleHabit(item.id, false)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isDone
                          ? "bg-[#F7FAF8] border-[#E2EAE5] hover:border-[#B7E4C7]"
                          : "bg-white border-[#E2EAE5] hover:border-[#CBD7CE] hover:bg-[#F9FBFA]"
                      }`}
                    >
                      {/* Checkbox Icon + Name & Subtitle */}
                      <div className="flex items-center space-x-3 min-w-0">
                        {isDone ? (
                          <div className="w-5.5 h-5.5 rounded-full bg-[#165B33] text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5.5 h-5.5 rounded-lg border-2 border-[#CBD7CE] bg-white group-hover:border-[#165B33] flex-shrink-0 transition-colors" />
                        )}

                        <div className="min-w-0">
                          <h4 className="text-[13px] font-bold text-[#14211A] truncate leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-[#6C8176] font-normal block mt-0.5 truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>

                      {/* Status Pill on Right */}
                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {Boolean(item.currentStreak && item.currentStreak > 0) && (
                          <span className="text-[10px] font-bold text-[#D97706] bg-[#FEF3C7] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                            🔥 {item.currentStreak}d
                          </span>
                        )}
                        <span
                          className={`text-[10.5px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN (col-span-4): Habit Overview Bar Chart & Key Insights
              ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-6 relative overflow-hidden">
            <div>
              <h3 className="text-[15px] font-extrabold text-[#112318] mb-4">
                Habit Overview
              </h3>

              {/* 7-Day Vertical Bar Chart */}
              <div className="pt-2 pb-1 flex items-end justify-between gap-2 h-44 border-b border-[#F0F4F1]">
                {(weeklyOverview.length === 7 ? weeklyOverview : [
                  { day: "Mon", percent: 0 },
                  { day: "Tue", percent: 0 },
                  { day: "Wed", percent: 0 },
                  { day: "Thu", percent: 0 },
                  { day: "Fri", percent: 0 },
                  { day: "Sat", percent: 0 },
                  { day: "Sun", percent: 0 },
                ]).map((col, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    {/* Percentage Label on Top */}
                    <span className="text-[10.5px] font-bold text-[#165B33] mb-1 font-mono">
                      {col.percent}%
                    </span>

                    {/* Bar */}
                    <div className="w-full max-w-[28px] bg-[#E8EEEA] rounded-t-lg h-32 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${col.percent}%` }}
                        className="w-full bg-[#165B33] rounded-t-lg transition-all duration-700"
                      />
                    </div>

                    {/* Day Name */}
                    <span className="text-[11px] font-bold text-[#6C8176] mt-2">
                      {col.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights List */}
            <div className="space-y-2.5">
              <h4 className="text-[13px] font-extrabold text-[#112318]">Key Insights</h4>
              <div className="space-y-2 text-[12px] font-semibold text-[#14211A]">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-[#165B33] flex-shrink-0" />
                  <span>7-day average: <strong>{stats.weeklyAverage}%</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-[#165B33] flex-shrink-0" />
                  <span>Prayer devotion: <strong>{stats.prayerCount} completed</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 size={16} className="text-[#165B33] flex-shrink-0" />
                  <span>Consistency rate: <strong>{stats.weeklyAverage}%</strong></span>
                </div>
              </div>
            </div>

            {/* Decorative Subtle Foliage Accent in Bottom Right */}
            <div className="absolute -bottom-4 -right-4 w-28 h-28 pointer-events-none opacity-20">
              <svg viewBox="0 0 100 100" fill="#165B33">
                <path d="M50 0 C70 30 90 40 100 70 C70 70 50 90 20 100 C20 70 30 40 50 0 Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. BOTTOM ROW: YOUR DISCIPLINE GOALS (LEFT) + STAY DISCIPLINED (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: YOUR DISCIPLINE GOALS (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2 text-[#112318]">
                <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                  <Target size={17} className="stroke-[2.5]" />
                </div>
                <h3 className="text-[15px] font-extrabold">Your Discipline Goals</h3>
              </div>

              <div className="text-[11.5px] font-bold text-[#165B33] flex items-center gap-1">
                <Check size={13} strokeWidth={3} />
                <span>90-Day Targets</span>
              </div>
            </div>

            {/* 5 Circular Ring Gauges in a Row */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2 text-center">
              {/* Gauge 1: Workouts */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray={`${Math.min(stats.workoutCount, 100)}, 100`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[15px] font-extrabold text-[#112318] font-mono">
                    {stats.workoutCount}
                  </span>
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-1.5 block">Workouts</span>
                <span className="text-[10px] text-[#6C8176]">(4/week)</span>
              </div>

              {/* Gauge 2: Prayer Sessions */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray={`${Math.min(stats.prayerCount, 100)}, 100`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[15px] font-extrabold text-[#112318] font-mono">
                    {stats.prayerCount}
                  </span>
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-1.5 block leading-tight">
                  Prayer Sessions
                </span>
                <span className="text-[10px] text-[#6C8176]">(AM + PM)</span>
              </div>

              {/* Gauge 3: English Study */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray={`${Math.min(stats.learnHours, 100)}, 100`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[15px] font-extrabold text-[#112318] font-mono">
                    {stats.learnHours}h
                  </span>
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-1.5 block">English Study</span>
              </div>

              {/* Gauge 4: Dev Skills */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray={`${Math.min(stats.devHours, 100)}, 100`}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[15px] font-extrabold text-[#112318] font-mono">
                    {stats.devHours}h
                  </span>
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-1.5 block">Dev Skills</span>
              </div>

              {/* Gauge 5: Client Outreach */}
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray="40, 100"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute text-[15px] font-extrabold text-[#112318] font-mono">
                    60
                  </span>
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-1.5 block">Client Outreach</span>
              </div>
            </div>
          </div>

          {/* CARD 2: STAY DISCIPLINED (col-span-5) */}
          <div className="lg:col-span-5 rounded-3xl overflow-hidden relative min-h-[190px] border border-[#D5E2D9] shadow-xs flex items-center p-6 sm:p-7">
            <Image
              src="/journey/mountain_viewpoint.jpg"
              alt="Person standing on mountain peak at sunrise"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-transparent" />

            <div className="relative z-10 space-y-2 max-w-sm">
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Stay Disciplined!
              </h3>
              <p className="text-[12.5px] text-white/90 font-medium leading-relaxed">
                Consistency today builds the successful you tomorrow.
              </p>
              <div className="pt-2">
                <Link
                  href="/journey"
                  className="inline-flex items-center gap-1.5 bg-[#165B33] hover:bg-[#123D26] text-white text-[12px] font-bold px-4.5 py-2 rounded-full shadow-md transition-all"
                >
                  <span>View Progress</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL: ADD HABIT
            ======================================================== */}
        {isAddHabitModalOpen && (
          <Modal
            isOpen={isAddHabitModalOpen}
            onClose={() => setIsAddHabitModalOpen(false)}
            title="Add New Daily Discipline"
          >
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Habit Title
                </label>
                <input
                  type="text"
                  required
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. 15-Minute Technical Reading"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Subtitle / Pillar
                </label>
                <input
                  type="text"
                  value={newHabitSubtitle}
                  onChange={(e) => setNewHabitSubtitle(e.target.value)}
                  placeholder="e.g. Skills Development"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Category
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                >
                  <option value="Health & Energy">Health &amp; Energy</option>
                  <option value="Spiritual Growth">Spiritual Growth</option>
                  <option value="Fitness & Health">Fitness &amp; Health</option>
                  <option value="Skills Development">Skills Development</option>
                  <option value="Development">Development</option>
                  <option value="Rest & Recovery">Rest &amp; Recovery</option>
                  <option value="Financial">Financial</option>
                  <option value="Family">Family</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsAddHabitModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#5A6E63] hover:bg-black/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#165B33] hover:bg-[#123D26] text-white rounded-xl text-[12.5px] font-bold shadow-xs transition-colors"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
