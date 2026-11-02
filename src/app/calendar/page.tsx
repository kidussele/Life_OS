"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import { formatTo12H } from "@/lib/formatTime";
import {
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  TrendingUp,
  Lightbulb,
  Wind,
  Sprout,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  Check,
  RotateCw,
} from "lucide-react";
import { DailyTask } from "@/lib/types";

import { useTimeEngine } from "@/hooks/useTimeEngine";

interface ScheduleRow {
  id: string;
  time: string;
  duration: string;
  title: string;
  desc: string;
  category: "Spiritual" | "Health" | "Learning" | "Development" | "Work" | "Family" | "Finance";
  status: "completed" | "in_progress" | "upcoming";
  thumbnail: string;
  isNow?: boolean;
}

export default function CalendarPage() {
  const { timezone, now } = useTimeEngine();
  const [view, setView] = useState<"day" | "week">("day");
  const [currentDate, setCurrentDate] = useState<string>("2026-11-02");
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [upcomingMilestone, setUpcomingMilestone] = useState<{ title: string; targetDate: string; progress: number }>({
    title: "Suku Planning & Requirements",
    targetDate: "Nov 8, 2026",
    progress: 0,
  });

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<any>(null);

  // Breathing mini-modal
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathSeconds, setBreathSeconds] = useState(4);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("development");
  const [newTaskStartTime, setNewTaskStartTime] = useState("18:00");
  const [newTaskEndTime, setNewTaskEndTime] = useState("19:00");

  // Rhythmic breathing timer
  useEffect(() => {
    let interval: any = null;
    if (isBreathingModalOpen) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            setBreathPhase((curr) => {
              if (curr === "inhale") return "hold";
              if (curr === "hold") return "exhale";
              return "inhale";
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingModalOpen]);

  // Load schedule data
  const loadData = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?date=${dateStr}&timezone=${encodeURIComponent(timezone || "Africa/Addis_Ababa")}`);
      if (res.ok) {
        const data = await res.json();
        const dbTasks = data.tasks || [];
        setTasks(dbTasks);

        if (dbTasks.length > 0) {
          const mappedRows: ScheduleRow[] = dbTasks.map((t: any) => {
            const catCap = t.category.charAt(0).toUpperCase() + t.category.slice(1);
            let thumb = "/journey/coding_mastery.jpg";
            if (t.category === "spiritual") thumb = "/journey/prayer_spiritual.jpg";
            else if (t.category === "health") thumb = "/journey/fitness_health.jpg";
            else if (t.category === "learning") thumb = "/journey/english_mastery.jpg";
            else if (t.category === "work") thumb = "/journey/workspace.jpg";
            else if (t.category === "family") thumb = "/journey/family_harmony.jpg";
            else if (t.category === "finance") thumb = "/journey/financial_growth.jpg";
            else if (t.category === "business" || t.category === "development") thumb = "/journey/suku_mvp.jpg";

            return {
              id: t.id,
              time: `${t.start_time} – ${t.end_time}`,
              duration: `${t.duration_minutes} min`,
              title: t.title,
              desc: t.instructions || t.description || "",
              category: catCap as any,
              status: t.status === "completed" ? "completed" : t.status === "in_progress" ? "in_progress" : "upcoming",
              thumbnail: thumb,
              isNow: t.status === "in_progress",
            };
          });
          setScheduleList(mappedRows);
        } else {
          setScheduleList([]);
        }

        // Fetch upcoming Suku milestone dynamically
        fetch("/api/goals")
          .then((r) => (r.ok ? r.json() : null))
          .then((gData) => {
            if (gData?.goals) {
              const sukuGoal = gData.goals.find((g: any) => g.id === "goal_suku");
              if (sukuGoal && sukuGoal.milestones?.length > 0) {
                const pendingMilestone =
                  sukuGoal.milestones.find((m: any) => m.status !== "completed") ||
                  sukuGoal.milestones[0];
                setUpcomingMilestone({
                  title: pendingMilestone.title,
                  targetDate: pendingMilestone.target_date,
                  progress: sukuGoal.progress || 0,
                });
              }
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(currentDate);

    const handleTaskRefresh = () => {
      loadData(currentDate);
    };

    window.addEventListener("life_os_task_updated", handleTaskRefresh);
    return () => {
      window.removeEventListener("life_os_task_updated", handleTaskRefresh);
    };
  }, [currentDate, timezone]);

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    const dateStr = d.toISOString().split("T")[0];
    setCurrentDate(dateStr);
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    const dateStr = d.toISOString().split("T")[0];
    setCurrentDate(dateStr);
  };

  // Dynamic formatted date string for header
  const dObj = new Date(currentDate + "T12:00:00Z");
  const formattedDateTitle = dObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const [scheduleList, setScheduleList] = useState<ScheduleRow[]>([]);

  // Category pill badge styling matching reference screenshot
  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Spiritual":
        return "bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]";
      case "Health":
        return "bg-[#FEF3D6] text-[#B45309] border border-[#FDE68A]";
      case "Learning":
        return "bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]";
      case "Development":
        return "bg-[#FAF5FF] text-[#9333EA] border border-[#E9D5FF]";
      case "Work":
        return "bg-[#F0F7FF] text-[#0369A1] border border-[#BAE6FD]";
      case "Family":
        return "bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5]";
      case "Finance":
        return "bg-[#FEFCE8] text-[#A16207] border border-[#FEF08A]";
      default:
        return "bg-[#F7FAF8] text-[#486053] border border-[#D5E2D9]";
    }
  };

  // Toggle status on click with DB persistence
  const handleToggleRowStatus = async (id: string) => {
    const currentItem = scheduleList.find((r) => r.id === id);
    if (!currentItem) return;
    const nextStatus = currentItem.status === "completed" ? "upcoming" : "completed";

    setScheduleList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: nextStatus,
          completed_at: nextStatus === "completed" ? new Date().toISOString() : null,
        }),
      });
      loadData(currentDate);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("life_os_task_updated"));
        window.dispatchEvent(new CustomEvent("life_os_habit_updated"));
        window.dispatchEvent(new CustomEvent("life_os_goal_updated"));
      }
    } catch (e) {
      console.error("Could not sync task status:", e);
    }
  };

  const completedCount = scheduleList.filter((r) => r.status === "completed").length;
  const totalCount = scheduleList.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC MOUNTAIN HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[140px] sm:min-h-[155px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Majestic Alpine Mountains & Lake"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[60%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/95 border border-[#B7E4C7] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs">
                <CalendarIcon size={22} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  Calendar &amp; Master Schedule
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-[#284534] font-medium leading-relaxed">
                  Your complete schedule with timeline, priorities and smart organization.
                </p>
              </div>
            </div>

            {/* Right Controls: View Switcher (Day View / Weekly Overview) + Date Stepper */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              {/* Day / Week Pill Switcher */}
              <div className="bg-white/95 border border-white/80 rounded-full p-1 flex items-center shadow-2xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setView("day")}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                    view === "day"
                      ? "bg-[#165B33] text-white shadow-xs"
                      : "text-[#14211A] hover:bg-black/5"
                  }`}
                >
                  Day View
                </button>
                <button
                  type="button"
                  onClick={() => setView("week")}
                  className={`px-4 py-1.5 text-[12px] font-bold rounded-full transition-all ${
                    view === "week"
                      ? "bg-[#165B33] text-white shadow-xs"
                      : "text-[#14211A] hover:bg-black/5"
                  }`}
                >
                  Weekly Overview
                </button>
              </div>

              {/* Date Navigation Stepper (< Nov 1, 2026 >) */}
              <div className="bg-white/95 border border-white/80 rounded-full px-3 py-1.5 flex items-center space-x-2 text-[12.5px] font-bold text-[#14211A] shadow-2xs backdrop-blur-md">
                <button
                  type="button"
                  onClick={handlePrevDay}
                  className="p-0.5 hover:text-[#165B33] transition-colors"
                  title="Previous Day"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-mono px-1">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(new Date(`${currentDate}T12:00:00Z`))}
                </span>
                <button
                  type="button"
                  onClick={handleNextDay}
                  className="p-0.5 hover:text-[#165B33] transition-colors"
                  title="Next Day"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. MAIN CONTENT (Day View vs Weekly Overview)
            ======================================================== */}
        {view === "day" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ──────────────────────────────────────────────────────────
                LEFT COLUMN (col-span-8): Today's Schedule Card
                ────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-5">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                    <CalendarIcon size={16} />
                  </div>
                  <h3 className="text-[15px] font-extrabold text-[#14211A]">
                    Today's Schedule — {formattedDateTitle}
                  </h3>
                </div>

                <div className="bg-[#EBF5EE] text-[#165B33] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#B7E4C7] flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>{scheduleList.length} Time Blocks</span>
                </div>
              </div>

              {/* Connected Vertical Timeline */}
              <div className="relative pl-12 space-y-3 pt-1">
                {scheduleList.length === 0 ? (
                  <div className="py-12 text-center text-[#6C8176]">
                    <Clock size={28} className="mx-auto mb-2 text-[#CBD5E1]" />
                    <span className="font-semibold text-[#14211A] block">No schedule blocks found for {currentDate}</span>
                    <p className="text-[12px] max-w-sm mx-auto mt-1">
                      The fresh 90-day daily schedule is generated starting Monday, November 2, 2026.
                    </p>
                    <button
                      onClick={() => setCurrentDate("2026-11-02")}
                      className="mt-3 px-4 py-2 bg-[#165B33] text-white text-[12px] font-bold rounded-xl shadow-xs hover:bg-[#123D26] transition-all"
                    >
                      Go to Day 1 (Nov 2)
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Continuous Vertical Green Connector Line */}
                    <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-[#B7E4C7]" />

                    {scheduleList.map((item) => {
                  const isCompleted = item.status === "completed";
                  const isInProgress = item.status === "in_progress";
                  const isNow = item.isNow;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleRowStatus(item.id)}
                      className={`relative flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer group ${
                        isNow
                          ? "bg-[#F2FBF5] border-[#BDE0C8] shadow-2xs"
                          : "bg-white hover:bg-[#F9FBFA] border-[#EAEFEA]"
                      }`}
                    >
                      {/* Left "Now" Indicator Pill for the active task */}
                      {isNow && (
                        <div className="absolute -left-[54px] top-1/2 -translate-y-1/2 z-20">
                          <span className="bg-[#165B33] text-white text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                            Now
                          </span>
                        </div>
                      )}

                      {/* Timeline Node Dot (Centered on line at left-[20px], which is -28px relative to row) */}
                      <div
                        className={`absolute -left-[35px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 transition-colors z-10 ${
                          isCompleted
                            ? "bg-[#165B33] border-white ring-2 ring-[#B7E4C7]/60"
                            : isInProgress
                            ? "bg-[#165B33] border-white ring-2 ring-[#B7E4C7]/60"
                            : isNow
                            ? "bg-[#165B33] border-white ring-2 ring-[#B7E4C7]/80"
                            : "bg-[#165B33] border-white ring-2 ring-[#B7E4C7]/50"
                        }`}
                      />

                      {/* Content Row: [Time] [Avatar] [Title & Subtitle] */}
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                        {/* Time Range */}
                        <span className="font-mono text-[12px] font-bold text-[#486053] w-28 flex-shrink-0">
                          {item.time}
                        </span>

                        {/* Image Thumbnail Avatar */}
                        <div className="w-11 h-11 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9]">
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        {/* Title & Short Description */}
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-[13.5px] font-bold truncate ${
                              isCompleted ? "text-[#6C8176] line-through" : "text-[#14211A]"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p className="text-[12px] text-[#5A6E63] font-normal truncate mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Right Elements: [Category Badge] [Status Pill or Duration] */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {/* Category Pill */}
                        <span
                          className={`text-[11px] font-bold px-3 py-0.5 rounded-full ${getCategoryBadgeClass(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>

                        {/* Status or Duration Indicator */}
                        {isCompleted ? (
                          <span className="bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] text-[11px] font-semibold px-3 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={12} strokeWidth={3} />
                            <span>Completed</span>
                          </span>
                        ) : isInProgress ? (
                          <span className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-semibold px-3 py-0.5 rounded-full flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] animate-ping" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className="text-[11.5px] font-bold text-[#6C8176] flex items-center gap-1 font-mono min-w-[55px] justify-end">
                            <Clock size={12} className="text-[#B47805]" />
                            <span>{item.duration}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
              </div>
            </div>

            {/* ──────────────────────────────────────────────────────────
                RIGHT COLUMN (col-span-4): Progress + Actions + Milestones + Tips
                ────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">
              {/* CARD 1: SCHEDULE PROGRESS */}
              <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-5">
                <div className="flex items-center space-x-2 text-[#14211A]">
                  <CalendarIcon size={17} className="text-[#165B33]" />
                  <h3 className="text-[15px] font-extrabold">Schedule Progress</h3>
                </div>

                {/* Circular Gauge on Left + Status Rows on Right */}
                <div className="flex items-center justify-between gap-5">
                  {/* Gauge */}
                  <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke="#E2EAE5"
                        strokeWidth="3.5"
                        fill="none"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        stroke="#165B33"
                        strokeWidth="4"
                        strokeDasharray={`${progressPercent}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute text-[19px] font-extrabold text-[#14211A] font-mono">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* 3 Status Rows */}
                  <div className="space-y-2 flex-1 text-[12.5px] font-semibold text-[#14211A]">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                      <span>{completedCount} / {totalCount} Completed</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                      <span>{totalCount - completedCount} Remaining</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${totalCount === 0 ? "bg-[#94A3B8]" : progressPercent >= 70 ? "bg-[#165B33]" : "bg-[#3B82F6]"}`} />
                      <span>
                        {totalCount === 0
                          ? "No Scheduled Tasks"
                          : completedCount === 0
                          ? "Day 1 Starting"
                          : progressPercent >= 70
                          ? "On Track"
                          : "In Progress"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar with 73% label */}
                <div className="flex items-center space-x-3 pt-1">
                  <div className="flex-1 h-2.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[13px] font-extrabold text-[#14211A] font-mono">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* CARD 2: QUICK ACTIONS */}
              <div className="bg-white rounded-3xl p-5 border border-[#E2EAE5] shadow-xs space-y-3.5">
                <div className="flex items-center space-x-2 text-[#14211A]">
                  <CalendarIcon size={16} className="text-[#165B33]" />
                  <h3 className="text-[14.5px] font-extrabold">Quick Actions</h3>
                </div>

                {/* 3 Action Buttons in 3-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
                  {/* Action 1: Add Task */}
                  <button
                    type="button"
                    onClick={() => setIsAddTaskOpen(true)}
                    className="py-3.5 px-2 rounded-2xl bg-[#F5FAF6] hover:bg-[#EBF5EE] border border-[#E2EBE5] flex flex-col items-center justify-center transition-all group shadow-2xs"
                  >
                    <div className="text-[#165B33] mb-1.5 group-hover:scale-110 transition-transform">
                      <CalendarPlus size={22} strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-bold text-[#14211A]">Add Task</span>
                  </button>

                  {/* Action 2: Reschedule */}
                  <button
                    type="button"
                    onClick={() => setIsRescheduleOpen(true)}
                    className="py-3.5 px-2 rounded-2xl bg-[#F5FAF6] hover:bg-[#EBF5EE] border border-[#E2EBE5] flex flex-col items-center justify-center transition-all group shadow-2xs"
                  >
                    <div className="text-[#165B33] mb-1.5 group-hover:scale-110 transition-transform">
                      <Clock size={22} strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-bold text-[#14211A]">Reschedule</span>
                  </button>

                  {/* Action 3: View Details */}
                  <button
                    type="button"
                    onClick={() => setIsDetailsOpen(true)}
                    className="py-3.5 px-2 rounded-2xl bg-[#F5FAF6] hover:bg-[#EBF5EE] border border-[#E2EBE5] flex flex-col items-center justify-center transition-all group shadow-2xs"
                  >
                    <div className="text-[#165B33] mb-1.5 group-hover:scale-110 transition-transform">
                      <Eye size={22} strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-bold text-[#14211A]">View Details</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: UPCOMING MILESTONES */}
              <div className="bg-white rounded-3xl p-5 border border-[#E2EAE5] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#14211A]">
                    <CalendarIcon size={16} className="text-[#165B33]" />
                    <h3 className="text-[14.5px] font-extrabold">Upcoming Milestones</h3>
                  </div>
                  <Link
                    href="/journey"
                    className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-0.5"
                  >
                    <span>View All</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                {/* Milestone Item with thumbnail & progress */}
                <div className="flex items-center space-x-3.5 p-2 rounded-2xl border border-[#EAEFEA] hover:border-[#165B33]/40 transition-colors">
                  <div className="w-16 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9]">
                    <Image
                      src="/journey/suku_mvp.jpg"
                      alt="Suku Marketplace Launch"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-bold text-[#14211A] truncate">
                      {upcomingMilestone.title}
                    </h4>
                    <span className="text-[11px] text-[#6C8176] block mt-0.5">
                      {upcomingMilestone.targetDate}
                    </span>

                    {/* Progress Bar */}
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                          style={{ width: `${upcomingMilestone.progress}%` }}
                        />
                      </div>
                      <span className="text-[10.5px] font-bold text-[#14211A] font-mono">
                        {upcomingMilestone.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 4: SMART TIPS (Bottom banner with Start Breathing button) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <Lightbulb size={20} className="text-[#EAB308] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[13px] font-bold text-[#14211A]">Smart Tips</h4>
                    <p className="text-[11.5px] text-[#5A6E63] leading-relaxed">
                      Take a 2-minute breathing break during your next work session.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsBreathingModalOpen(true)}
                  className="bg-[#165B33] hover:bg-[#123D26] text-white text-[11.5px] font-bold py-2 px-3.5 rounded-full flex items-center gap-1.5 flex-shrink-0 shadow-xs transition-colors"
                >
                  <Sprout size={13} />
                  <span>Start Breathing</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================
              WEEKLY OVERVIEW GRID
              ======================================================== */
          <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2.5">
                <CalendarIcon size={18} className="text-[#165B33]" />
                <h3 className="text-[15px] font-extrabold text-[#14211A]">
                  Weekly Master Schedule &amp; Evening Focus Rotation
                </h3>
              </div>
              <span className="text-[12px] text-[#6C8176]">November 2 – November 8, 2026</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
              {[
                { day: "Monday", focus: "Freelance Portfolio & Services", cat: "Freelancing", color: "border-[#BAE6FD] bg-[#F0F7FF]" },
                { day: "Tuesday", focus: "Forex ICT Backtesting & Study", cat: "Forex", color: "border-[#B7E4C7] bg-[#EBF5EE]" },
                { day: "Wednesday", focus: "Client Outreach & Proposals", cat: "Freelancing", color: "border-[#BAE6FD] bg-[#F0F7FF]" },
                { day: "Thursday", focus: "Suku Business Development", cat: "Business", color: "border-[#DDD6FE] bg-[#F5F3FF]" },
                { day: "Friday", focus: "Forex Journal & Weekly Review", cat: "Forex", color: "border-[#B7E4C7] bg-[#EBF5EE]" },
                { day: "Saturday", focus: "Deep Work (Code & Suku MVP)", cat: "Development", color: "border-[#DDD6FE] bg-[#F5F3FF]" },
                { day: "Sunday", focus: "Family, Prayer & Financial Audit", cat: "Planning", color: "border-[#FDE68A] bg-[#FEFCE8]" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-[#E2EAE5] bg-white hover:border-[#165B33] transition-colors shadow-2xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-[#14211A]">{item.day}</span>
                    <span className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border bg-white text-[#165B33]">
                      {item.cat}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#5A6E63] leading-relaxed">
                    {item.focus}
                  </p>
                  <div className="text-[10px] text-[#6C8176] font-mono pt-1 border-t border-[#F0F4F1]">
                    19:15 – 20:15
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            MODAL 1: ADD TASK
            ======================================================== */}
        {isAddTaskOpen && (
          <Modal
            isOpen={isAddTaskOpen}
            onClose={() => setIsAddTaskOpen(false)}
            title="Add Schedule Time Block"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTaskTitle) return;
                const newRow: ScheduleRow = {
                  id: `custom_${Date.now()}`,
                  time: `${formatTo12H(newTaskStartTime)} – ${formatTo12H(newTaskEndTime)}`,
                  duration: "60 min",
                  title: newTaskTitle,
                  desc: "Custom priority block.",
                  category: "Development",
                  status: "upcoming",
                  thumbnail: "/journey/coding_mastery.jpg",
                };
                setScheduleList((prev) => [...prev, newRow]);
                setIsAddTaskOpen(false);
                setNewTaskTitle("");
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Suku API Refactoring"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTaskStartTime}
                    onChange={(e) => setNewTaskStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newTaskEndTime}
                    onChange={(e) => setNewTaskEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#5A6E63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12.5px] font-bold shadow-xs"
                >
                  Add Block
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ========================================================
            MODAL 2: RESCHEDULE QUICK ACTION
            ======================================================== */}
        {isRescheduleOpen && (
          <Modal
            isOpen={isRescheduleOpen}
            onClose={() => setIsRescheduleOpen(false)}
            title="Reschedule Priority Time Block"
          >
            <div className="space-y-4">
              <p className="text-[12.5px] text-[#5A6E63] leading-relaxed">
                Select any scheduled task from today's timeline to adjust its timing or postpone responsibly.
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {scheduleList.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => {
                      alert(`Selected "${row.title}" for timing adjustment.`);
                      setIsRescheduleOpen(false);
                    }}
                    className="p-3 rounded-xl border border-[#E2E9E4] hover:border-[#165B33] hover:bg-[#F0F7F3] cursor-pointer flex items-center justify-between text-[12.5px] font-bold text-[#14211A]"
                  >
                    <span>{row.title}</span>
                    <span className="font-mono text-[11.5px] text-[#486053]">{row.time}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold bg-[#F7FAF8] text-[#5A6E63]"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 3: VIEW DETAILS
            ======================================================== */}
        {isDetailsOpen && (
          <Modal
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            title="Schedule Details & Full Execution Log"
            maxWidth="max-w-xl"
          >
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#6C8176] font-bold block">Execution Standard</span>
                  <strong className="text-[13px] text-[#14211A]">11 Scheduled Blocks • ~13h 30m Active</strong>
                </div>
                <span className="bg-[#EBF5EE] text-[#165B33] text-[12px] font-bold font-mono px-3 py-1 rounded-full border border-[#B7E4C7]">
                  {progressPercent}% Complete
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {scheduleList.map((row) => (
                  <div
                    key={row.id}
                    className="p-2.5 rounded-xl border border-[#EAEFEA] flex items-center justify-between text-[12px]"
                  >
                    <div>
                      <span className="font-bold text-[#14211A] block">{row.title}</span>
                      <span className="text-[#6C8176] text-[11px] font-mono">{row.time}</span>
                    </div>
                    <span className="text-[10.5px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#F7FAF8] text-[#486053]">
                      {row.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12px] font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 4: 2-MINUTE BOX BREATHING TIMER
            ======================================================== */}
        {isBreathingModalOpen && (
          <Modal
            isOpen={isBreathingModalOpen}
            onClose={() => setIsBreathingModalOpen(false)}
            title="2-Minute Focused Breathing Break"
            maxWidth="max-w-sm"
          >
            <div className="flex flex-col items-center justify-center p-4 space-y-5 text-center">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#E2EAE5"
                    strokeWidth="3"
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="#165B33"
                    strokeWidth="3.5"
                    strokeDasharray="65, 100"
                    strokeLinecap="round"
                    fill="none"
                    className="animate-spin"
                    style={{ animationDuration: "12s" }}
                  />
                </svg>

                <div className="absolute flex flex-col items-center">
                  <Wind size={26} className="text-[#165B33] mb-1" />
                  <span className="text-[15px] font-extrabold text-[#14211A] leading-tight uppercase font-mono">
                    {breathPhase}
                  </span>
                  <span className="text-[18px] font-extrabold text-[#165B33] font-mono">
                    {breathSeconds}s
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-[14px] font-bold text-[#14211A]">Breathe Calmly</h4>
                <p className="text-[12px] text-[#5A6E63]">
                  4s Inhale • 4s Hold • 4s Exhale box breathing
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsBreathingModalOpen(false)}
                className="w-full bg-[#165B33] hover:bg-[#123D26] text-white text-[12.5px] font-bold py-2.5 rounded-xl shadow-xs transition-colors"
              >
                Finished &amp; Refocused
              </button>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
