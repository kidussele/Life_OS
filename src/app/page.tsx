"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import { formatTo12H } from "@/lib/formatTime";
import { useTimeEngine } from "@/hooks/useTimeEngine";
import {
  Sun,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  ArrowRight,
  Target,
  Sparkles,
  Heart,
  Anchor,
  GraduationCap,
  TrendingUp,
  Store,
  CandlestickChart,
  Wallet,
  Users,
  Moon,
  Flame,
  BarChart3,
  Dumbbell,
  Coffee,
  BookOpen,
  Laptop,
  Briefcase,
  Bus,
  Utensils,
  Home,
  FileText,
  Bed,
  Plus,
  ChevronRight,
  Sprout,
  Check,
  AlertCircle,
  RotateCcw,
  X,
  ShieldCheck,
} from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  duration: string;
  title: string;
  desc: string;
  category: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  section: "morning" | "daytime" | "evening" | "night";
  status: "upcoming" | "in_progress" | "completed" | "missed" | "rescheduled" | "skipped";
  completed: boolean;
  notes?: string;
  instructions?: string;
  is_protected?: boolean;
  reschedule_reason?: string;
  new_time?: string;
}

const initialSchedule: ScheduleItem[] = [
  // MORNING (4:00 AM – 7:00 AM)
  {
    id: "m1",
    time: "4:00 AM – 4:30 AM",
    duration: "30 min",
    title: "Morning Prayer",
    desc: "Gratitude, spiritual reflection, and day preparation.",
    instructions: "Begin with gratitude for the gift of life and health. Pray for clarity, protection, and wisdom to execute daily responsibilities with excellence. Non-negotiable anchor.",
    category: "spiritual",
    icon: Sun,
    iconBg: "bg-[#FEF3D6]",
    iconColor: "text-[#B47805]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
  {
    id: "m2",
    time: "4:30 AM – 5:00 AM",
    duration: "30 min",
    title: "Exercise & Mobility",
    desc: "Home workout, mobility, and stretching.",
    instructions: "Activate physical energy: 10 min mobility & dynamic stretching, 15 min core & pushup circuit, 5 min cooldown.",
    category: "health",
    icon: Dumbbell,
    iconBg: "bg-[#EBF5EE]",
    iconColor: "text-[#165B33]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "m3",
    time: "5:00 AM – 5:30 AM",
    duration: "30 min",
    title: "Shower & Breakfast",
    desc: "Personal hygiene and wholesome nutrition.",
    instructions: "Cold/lukewarm shower, high-protein breakfast, hydration (500ml water). Prepare physical readiness for the day.",
    category: "health",
    icon: Coffee,
    iconBg: "bg-[#EBF5EE]",
    iconColor: "text-[#165B33]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "m4",
    time: "5:30 AM – 6:00 AM",
    duration: "30 min",
    title: "English Learning",
    desc: "Speaking, listening, and technical vocabulary.",
    instructions: "Practice 15 min shadowing/speaking, 10 min listening comprehension, 5 min recording new technical idioms.",
    category: "learning",
    icon: BookOpen,
    iconBg: "bg-[#EBF5EE]",
    iconColor: "text-[#165B33]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "m5",
    time: "6:00 AM – 6:40 AM",
    duration: "40 min",
    title: "Professional Learning",
    desc: "React, Next.js, TypeScript, and architecture.",
    instructions: "Deep dive into frontend engineering: Server Components, state architecture, database query optimization.",
    category: "learning",
    icon: Laptop,
    iconBg: "bg-[#E8F1FC]",
    iconColor: "text-[#1E40AF]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "m6",
    time: "6:40 AM – 7:00 AM",
    duration: "20 min",
    title: "Work Preparation",
    desc: "Review daily priorities and mental transition.",
    instructions: "Pack essentials, review high-impact priorities, check commute route, set calm focused mindset.",
    category: "preparation",
    icon: FileText,
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-[#4B5563]",
    section: "morning",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },

  // DAYTIME (7:00 AM – 6:00 PM)
  {
    id: "d1",
    time: "7:00 AM – 8:00 AM",
    duration: "60 min",
    title: "Morning Commute",
    desc: "Travel to workplace. Educational audio.",
    instructions: "Listen to English podcast or software architecture audio. Zero screen hazard while in transit.",
    category: "commute",
    icon: Bus,
    iconBg: "bg-[#E8F1FC]",
    iconColor: "text-[#1E40AF]",
    section: "daytime",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "d2",
    time: "8:00 AM – 12:00 PM",
    duration: "4 hrs",
    title: "Employment (Morning Focus)",
    desc: "Core employment responsibilities with excellence.",
    instructions: "Execute assigned job deliverables with high standards. Complete highest-leverage tasks before lunch. Zero personal distractions.",
    category: "work",
    icon: Briefcase,
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-[#374151]",
    section: "daytime",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
  {
    id: "d3",
    time: "12:00 PM – 1:00 PM",
    duration: "1 hr",
    title: "Lunch & Recovery",
    desc: "Wholesome meal, mental rest, short walk.",
    instructions: "Nutritious meal, step away from computer screen, 15 min fresh air walk, mental recharge.",
    category: "health",
    icon: Utensils,
    iconBg: "bg-[#FEF3D6]",
    iconColor: "text-[#B47805]",
    section: "daytime",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "d4",
    time: "1:00 PM – 5:00 PM",
    duration: "4 hrs",
    title: "Employment (Afternoon Focus)",
    desc: "Execution, team alignment, and daily closeout.",
    instructions: "Afternoon work sprint. Wrap up documentation, coordinate with team, clear inbox, log tomorrow's handoff.",
    category: "work",
    icon: Briefcase,
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-[#374151]",
    section: "daytime",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
  {
    id: "d5",
    time: "5:00 PM – 6:00 PM",
    duration: "60 min",
    title: "Evening Commute",
    desc: "Travel home and decompress.",
    instructions: "Transition mentally from work to personal development. Relax breathing, listen to audio or light music.",
    category: "commute",
    icon: Bus,
    iconBg: "bg-[#E8F1FC]",
    iconColor: "text-[#1E40AF]",
    section: "daytime",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },

  // EVENING (6:00 PM – 9:15 PM)
  {
    id: "e1",
    time: "6:00 PM – 6:30 PM",
    duration: "30 min",
    title: "Arrival & Recovery",
    desc: "Change clothes, wash up, and refresh.",
    instructions: "Change into comfortable home clothes, wash up, hydrate, transition peacefully into evening routine.",
    category: "rest",
    icon: Home,
    iconBg: "bg-[#EBF5EE]",
    iconColor: "text-[#165B33]",
    section: "evening",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "e2",
    time: "6:30 PM – 7:15 PM",
    duration: "45 min",
    title: "Family & Dinner",
    desc: "Dinner with family and shared connection.",
    instructions: "Engage in positive conversation, be fully present with family, support household responsibilities.",
    category: "family",
    icon: Users,
    iconBg: "bg-[#FEE8E8]",
    iconColor: "text-[#D93838]",
    section: "evening",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
  {
    id: "e3",
    time: "7:15 PM – 8:15 PM",
    duration: "1 hr",
    title: "Main Development Session",
    desc: "Freelance portfolio, Suku business, or Forex study.",
    instructions: "Focused building block: Freelance client projects, Suku marketplace code, or Forex ICT backtesting.",
    category: "development",
    icon: Laptop,
    iconBg: "bg-[#E8F1FC]",
    iconColor: "text-[#1E40AF]",
    section: "evening",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "e4",
    time: "8:15 PM – 8:45 PM",
    duration: "30 min",
    title: "Light Responsibilities & Planning",
    desc: "Financial tracking, project review, tomorrow's plan.",
    instructions: "Log daily expenses into finance tracker, review tomorrow's timeline, clear desktop for morning.",
    category: "planning",
    icon: FileText,
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-[#4B5563]",
    section: "evening",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "e5",
    time: "8:45 PM – 9:15 PM",
    duration: "30 min",
    title: "Family Time & Wind-down",
    desc: "Relaxation with family and digital disconnect.",
    instructions: "Spend quality time with family. Dim room lighting, disconnect from high-stimulus screens.",
    category: "family",
    icon: Heart,
    iconBg: "bg-[#FEE8E8]",
    iconColor: "text-[#D93838]",
    section: "evening",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },

  // NIGHT (9:15 PM – 10:00 PM)
  {
    id: "n1",
    time: "9:15 PM – 9:45 PM",
    duration: "30 min",
    title: "Night Prayer & Gratitude",
    desc: "Spiritual reflection, daily review, gratitude.",
    instructions: "Review daily actions with honesty. Give thanks for accomplishments, confess shortcomings, ask for peace. Non-negotiable anchor.",
    category: "spiritual",
    icon: Moon,
    iconBg: "bg-[#EDE9FE]",
    iconColor: "text-[#6D28D9]",
    section: "night",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
  {
    id: "n2",
    time: "9:45 PM – 10:00 PM",
    duration: "15 min",
    title: "Sleep Preparation",
    desc: "Prepare clothes for tomorrow, screens completely off.",
    instructions: "Lay out clothes for 4:00 AM prayer and exercise, set phone on Do Not Disturb across the room, dim lights.",
    category: "rest",
    icon: Bed,
    iconBg: "bg-[#F3F4F6]",
    iconColor: "text-[#4B5563]",
    section: "night",
    status: "upcoming",
    completed: false,
    is_protected: false,
  },
  {
    id: "n3",
    time: "10:00 PM",
    duration: "6 hrs",
    title: "Quality Sleep & Rest",
    desc: "Target 10:00 PM – 4:00 AM deep physical recovery.",
    instructions: "Deep restorative sleep. Wake refreshed at 4:00 AM sharp for next day execution.",
    category: "rest",
    icon: Moon,
    iconBg: "bg-[#EDE9FE]",
    iconColor: "text-[#6D28D9]",
    section: "night",
    status: "upcoming",
    completed: false,
    is_protected: true,
  },
];

const getCategoryIconMeta = (category: string) => {
  switch (category) {
    case "spiritual": return { icon: Sun, bg: "bg-[#FEF3D6]", color: "text-[#B47805]" };
    case "health": return { icon: Dumbbell, bg: "bg-[#EBF5EE]", color: "text-[#165B33]" };
    case "learning": return { icon: GraduationCap, bg: "bg-[#EBF5EE]", color: "text-[#165B33]" };
    case "work": return { icon: Briefcase, bg: "bg-[#F7FAF8]", color: "text-[#165B33]" };
    case "freelancing": return { icon: Laptop, bg: "bg-[#E0F2FE]", color: "text-[#0284C7]" };
    case "business":
    case "development": return { icon: Store, bg: "bg-[#EBF5EE]", color: "text-[#165B33]" };
    case "forex": return { icon: CandlestickChart, bg: "bg-[#EBF5EE]", color: "text-[#165B33]" };
    case "family": return { icon: Users, bg: "bg-[#FEE8E8]", color: "text-[#D93838]" };
    case "finance": return { icon: Wallet, bg: "bg-[#FEE8E8]", color: "text-[#D93838]" };
    default: return { icon: CheckCircle2, bg: "bg-[#F7FAF8]", color: "text-[#165B33]" };
  }
};

export default function DashboardPage() {
  const {
    timezone,
    timezoneInfo,
    timeState,
    journeyInfo,
    getTaskStatus,
  } = useTimeEngine();

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [dbGoals, setDbGoals] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [finances, setFinances] = useState<any>(null);
  const [forexStats, setForexStats] = useState<any>(null);
  const [sleepHours, setSleepHours] = useState(6.0);
  const [statusSummary, setStatusSummary] = useState({
    completed: 0,
    inProgress: 0,
    upcoming: 0,
    overdue: 0,
    missed: 0,
    total: 0,
  });

  // Interactive task detail modal state
  const [selectedTask, setSelectedTask] = useState<ScheduleItem | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editStatus, setEditStatus] = useState<ScheduleItem["status"]>("upcoming");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [newTime, setNewTime] = useState("");
  const [skipReason, setSkipReason] = useState("");

  // Sync with selected task when modal opens
  useEffect(() => {
    if (selectedTask) {
      setEditNotes(selectedTask.notes || "");
      setEditStatus(selectedTask.status);
      setRescheduleReason(selectedTask.reschedule_reason || "");
      setNewTime(selectedTask.time);
      setSkipReason("");
    }
  }, [selectedTask]);

  // Load today's tasks and live data from database API
  const loadDashboardData = async () => {
    try {
      const res = await fetch(`/api/dashboard?date=${timeState.dateStr}&timezone=${encodeURIComponent(timezone)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.statusSummary) {
          setStatusSummary(data.statusSummary);
        }
        if (data.tasks) {
          const mapped: ScheduleItem[] = data.tasks.map((t: any) => {
            const catMeta = getCategoryIconMeta(t.category);
            let sec: "morning" | "daytime" | "evening" | "night" = "morning";
            const h = parseInt(t.start_time?.split(":")[0] || "0", 10);
            if (h >= 12 && h < 17) sec = "daytime";
            else if (h >= 17 && h < 21) sec = "evening";
            else if (h >= 21 || h < 4) sec = "night";

            const dynamicStatus = getTaskStatus(t);

            return {
              id: t.id,
              time: `${t.start_time} – ${t.end_time}`,
              duration: `${t.duration_minutes} min`,
              title: t.title,
              desc: t.instructions || t.description || "",
              instructions: t.instructions,
              category: t.category,
              icon: catMeta.icon,
              iconBg: catMeta.bg,
              iconColor: catMeta.color,
              section: sec,
              status: dynamicStatus,
              completed: dynamicStatus === "completed",
              notes: t.notes,
              is_protected: Boolean(t.is_protected),
              reschedule_reason: t.reschedule_reason,
            };
          });
          setSchedule(mapped);
        }
        if (data.categories) setCategories(data.categories);
        if (data.upcomingGoals) setDbGoals(data.upcomingGoals);
        if (data.finances) setFinances(data.finances);
        if (data.forex) setForexStats(data.forex);
        if (data.profile?.bed_time && data.profile?.wake_time) {
          const [bedH, bedM] = data.profile.bed_time.split(":").map(Number);
          const [wakeH, wakeM] = data.profile.wake_time.split(":").map(Number);
          let bedMins = bedH * 60 + bedM;
          let wakeMins = wakeH * 60 + wakeM;
          if (wakeMins < bedMins) wakeMins += 24 * 60;
          setSleepHours(Number(((wakeMins - bedMins) / 60).toFixed(1)));
        }
      }
    } catch (e) {
      console.warn("Could not fetch dashboard data from API:", e);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [timeState.dateStr, timezone]);

  useEffect(() => {
    const handleUpdate = () => loadDashboardData();
    window.addEventListener("life_os_task_updated", handleUpdate);
    return () => window.removeEventListener("life_os_task_updated", handleUpdate);
  }, [timeState.dateStr, timezone]);

  const toggleTask = async (id: string) => {
    let updatedItem: ScheduleItem | undefined;
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === "completed" ? "upcoming" : "completed";
          updatedItem = {
            ...item,
            status: nextStatus,
            completed: nextStatus === "completed",
          };
          return updatedItem;
        }
        return item;
      })
    );

    if (updatedItem) {
      try {
        await fetch("/api/tasks", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: updatedItem.status,
            completed_at: updatedItem.status === "completed" ? new Date().toISOString() : null,
          }),
        });
        loadDashboardData();
      } catch (e) {
        console.warn("Could not sync task toggle to API:", e);
      }
    }
  };

  const handleUpdateTask = async (updated: Partial<ScheduleItem> & { id: string }) => {
    setSchedule((prev) =>
      prev.map((item) => {
        if (item.id === updated.id) {
          const nextStatus = updated.status || item.status;
          return {
            ...item,
            ...updated,
            completed: nextStatus === "completed",
          };
        }
        return item;
      })
    );

    setSelectedTask(null);

    try {
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          status: updated.status,
          notes: updated.notes,
          action: updated.status === "rescheduled" ? "reschedule" : undefined,
          reason: updated.reschedule_reason,
          newStartTime: updated.time?.split("–")[0]?.trim(),
          newEndTime: updated.time?.split("–")[1]?.trim(),
        }),
      });
      loadDashboardData();
    } catch (e) {
      console.warn("Could not sync task update to API:", e);
    }
  };

  const completedCount = schedule.filter((s) => s.completed).length;
  const totalTasks = schedule.length;
  const completionPercent = Math.round((completedCount / totalTasks) * 100);

  // Active / current task
  const activeTask =
    schedule.find((s) => s.status === "in_progress") ||
    schedule.find((s) => s.status === "upcoming");
  const activeTaskId = activeTask?.id;

  // Dynamic upcoming priority tasks for the Right Sidebar
  const upcomingPriorities = schedule
    .filter((s) => s.status === "in_progress" || s.status === "upcoming")
    .slice(0, 4);

  // The 4 Canonical Schedule Sections
  const sections = [
    {
      key: "morning" as const,
      title: "MORNING",
      timeRange: "4:00 AM – 7:00 AM",
      badgeText: "Personal Growth",
      badgeClass: "bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7]/60",
      color: "#165B33",
    },
    {
      key: "daytime" as const,
      title: "DAYTIME",
      timeRange: "7:00 AM – 6:00 PM",
      badgeText: "Work & Commute",
      badgeClass: "bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]/60",
      color: "#0369A1",
    },
    {
      key: "evening" as const,
      title: "EVENING",
      timeRange: "6:00 PM – 9:15 PM",
      badgeText: "Development & Family",
      badgeClass: "bg-[#FEF3D6] text-[#B47805] border border-[#FDE68A]/60",
      color: "#B47805",
    },
    {
      key: "night" as const,
      title: "NIGHT",
      timeRange: "9:15 PM – 10:00 PM",
      badgeText: "Spiritual & Rest",
      badgeClass: "bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]/60",
      color: "#6D28D9",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* EXECUTIVE PERSONAL HERO BANNER WITH USER PORTRAIT AS BACKGROUND */}
        <div className="relative rounded-2xl overflow-hidden shadow-xs border border-[#E2E9E4] bg-[#0A2617] min-h-[195px] lg:min-h-[215px] flex items-center">
          {/* User Portrait Background on Right Side with Smooth Gradient Blending */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[320px] md:w-[380px] lg:w-[440px] xl:w-[490px] h-full overflow-hidden pointer-events-none">
            <Image
              src="/kidus.jpg"
              alt="Kidus Seleshi"
              fill
              priority
              className="object-cover object-[center_36%] opacity-85 sm:opacity-100 filter contrast-105"
            />
            {/* Horizontal gradient to smoothly blend portrait into the deep forest green banner on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A2617] via-[#0A2617]/55 via-25% to-transparent" />
            {/* Soft vertical gradient to blend top and bottom edges */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A2617]/70 via-transparent to-[#0A2617]/30" />
          </div>

          {/* Left-side solid base gradient for guaranteed 100% text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A2617] via-[#0A2617]/95 to-transparent w-full sm:w-[65%] lg:w-[58%] pointer-events-none" />

          <div className="relative z-10 w-full py-5 sm:py-6 px-5 sm:px-8 flex flex-col justify-between h-full gap-4 text-white">
            {/* Top: Journey Sprint Badge & Local Date */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                {journeyInfo.label}
              </span>
              <span className="text-[12px] text-emerald-100 font-medium hidden sm:inline">
                {timeState.displayDateStr} • {timeState.displayTimeStr} ({timezoneInfo.shortName})
              </span>
            </div>

            {/* Middle: Welcome & Philosophy */}
            <div className="space-y-1.5 max-w-xl">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm flex items-center gap-2">
                <span>{timeState.greeting}, Kidus!</span>
                <span className="text-amber-300">☀️</span>
              </h1>
              <p className="text-[12.5px] sm:text-[13px] text-emerald-50/90 font-medium drop-shadow-sm leading-relaxed">
                "Discipline today, freedom tomorrow." Clean slate initialized — executing Day 1 starting Monday, Nov 2.
              </p>
            </div>

            {/* Bottom Row: Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Primary Start My Day Button */}
              <Link
                href="/my-day"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-[#165B33] text-[13px] font-bold shadow-sm hover:shadow transition-all flex-shrink-0 cursor-pointer"
              >
                <Play size={13} className="fill-[#165B33]" />
                <span>Start My Day</span>
                <ArrowRight size={14} />
              </Link>

              {/* Active Priority Tag */}
              <div className="bg-black/40 backdrop-blur-md rounded-xl py-2 px-3.5 border border-white/20 text-white flex items-center gap-2.5 shadow-xs">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/25 text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <Target size={15} />
                </div>
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 block">
                    Current Focus
                  </span>
                  <span className="text-[12.5px] font-bold text-white block truncate max-w-[180px] sm:max-w-[240px]">
                    {activeTask ? activeTask.title : "Ready for Day 1 Execution"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 9: REAL-TIME DAILY TASK STATUS SUMMARY */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Completed */}
          <div className="bg-white border border-[#E2E9E4] rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold text-[#6B7280] tracking-wider">Completed</p>
              <p className="text-[18px] font-extrabold text-[#111827] leading-tight font-mono">{statusSummary.completed}</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white border border-[#A7F3D0] rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECFDF5] text-[#047857] flex items-center justify-center flex-shrink-0 relative">
              <Play size={16} className="fill-[#047857]" />
              {statusSummary.inProgress > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold text-[#047857] tracking-wider">In Progress</p>
              <p className="text-[18px] font-extrabold text-[#111827] leading-tight font-mono">{statusSummary.inProgress}</p>
            </div>
          </div>

          {/* Upcoming */}
          <div className="bg-white border border-[#E2E9E4] rounded-2xl p-3.5 shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] flex items-center justify-center flex-shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold text-[#6B7280] tracking-wider">Upcoming</p>
              <p className="text-[18px] font-extrabold text-[#111827] leading-tight font-mono">{statusSummary.upcoming}</p>
            </div>
          </div>

          {/* Overdue */}
          <div className={`bg-white border rounded-2xl p-3.5 shadow-2xs flex items-center gap-3 ${statusSummary.overdue > 0 ? "border-[#FDE68A] bg-[#FFFBEB]" : "border-[#E2E9E4]"}`}>
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center flex-shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold text-[#B45309] tracking-wider">Overdue</p>
              <p className="text-[18px] font-extrabold text-[#111827] leading-tight font-mono">{statusSummary.overdue}</p>
            </div>
          </div>

          {/* Missed */}
          <div className={`bg-white border rounded-2xl p-3.5 shadow-2xs flex items-center gap-3 ${statusSummary.missed > 0 ? "border-[#FECACA] bg-[#FEF2F2]" : "border-[#E2E9E4]"}`}>
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center flex-shrink-0">
              <X size={18} />
            </div>
            <div>
              <p className="text-[10.5px] uppercase font-bold text-[#B91C1C] tracking-wider">Missed</p>
              <p className="text-[18px] font-extrabold text-[#111827] leading-tight font-mono">{statusSummary.missed}</p>
            </div>
          </div>
        </div>

        {/* 3-COLUMN MASTER DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* ========================================================
              LEFT COLUMN (COL 1-8): TODAY'S SCHEDULE & CATEGORIES
              ======================================================== */}
          <div className="lg:col-span-8 space-y-5">
            {/* TODAY'S SCHEDULE CARD (Visual Centerpiece) */}
            <div className="os-card p-6 sm:p-7 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E9E4] mb-5">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center shadow-2xs">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-[#14211A] leading-tight">
                      Today's Schedule
                    </h2>
                    <span className="text-[12px] text-[#6C8176] font-medium">
                      {timeState.displayDateStr} • {totalTasks} Structured Activities
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[12px] font-bold text-[#165B33] bg-[#EBF5EE] px-3 py-1 rounded-full border border-[#B7E4C7]/60 hidden sm:inline-flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    {completedCount} of {totalTasks} Completed
                  </span>
                  <button
                    onClick={() => {
                      const firstIncomplete = schedule.find((s) => !s.completed);
                      if (firstIncomplete) setSelectedTask(firstIncomplete);
                    }}
                    className="w-8 h-8 rounded-full bg-[#EBF5EE] text-[#165B33] flex items-center justify-center hover:bg-[#DCEEE3] transition-colors"
                    title="Inspect Next Activity"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* 5-COLUMN HORIZONTAL GRID TIMELINE WITH CONTINUOUS CONNECTOR SPINE */}
              <div>
                {sections.map((sec, secIndex) => {
                  const isFirstSection = secIndex === 0;
                  const secItems = schedule.filter((s) => s.section === sec.key);

                  // Calculate if the previous section was completed
                  const prevSecKey = secIndex > 0 ? sections[secIndex - 1].key : null;
                  const prevSecItems = prevSecKey ? schedule.filter((s) => s.section === prevSecKey) : [];
                  const isPrevSectionCompleted = prevSecItems.length > 0 && prevSecItems.every((s) => s.completed);

                  // All items in current section completed?
                  const isThisSectionCompleted = secItems.length > 0 && secItems.every((s) => s.completed);

                  return (
                    <div key={`sec-group-${sec.key}`} className="relative">
                      {/* SECTION HEADER ROW WITH CONTINUOUS CONNECTOR RAIL */}
                      <div className="relative flex items-center py-2 px-1 group">
                        {/* Column 1: Continuous Rail */}
                        <div className="w-12 sm:w-14 flex-shrink-0 flex flex-col items-center justify-center relative self-stretch">
                          {/* Top Connector from previous section's last activity */}
                          {!isFirstSection && (
                            <div
                              className={`absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 transition-colors duration-200 pointer-events-none w-[2px] ${
                                isPrevSectionCompleted
                                  ? "bg-[#165B33]"
                                  : "bg-[#D2DDD6]"
                              }`}
                            />
                          )}

                          {/* Bottom Connector down to this section's first activity */}
                          <div
                            className={`absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 transition-colors duration-200 pointer-events-none w-[2px] ${
                              isPrevSectionCompleted
                                ? "bg-[#165B33]"
                                : "bg-[#D2DDD6]"
                            }`}
                          />

                          {/* Section Milestone Node */}
                          <div
                            className={`relative z-10 w-3.5 h-3.5 rounded-full border-2 border-white shadow-xs transition-colors ${
                              isThisSectionCompleted
                                ? "bg-[#165B33] ring-2 ring-[#165B33]/30"
                                : isPrevSectionCompleted
                                ? "bg-[#165B33] ring-2 ring-[#B7E4C7]"
                                : "bg-[#8FA89B] ring-2 ring-[#EBF5EE]"
                            }`}
                          />
                        </div>

                        {/* Section Header Content Bar */}
                        <div className="flex-1 min-w-0 flex items-center justify-between py-2 px-3 sm:px-4 rounded-xl bg-[#F6F9F7] border border-[#E2EAE5] my-1">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="text-[12.5px] sm:text-[13px] font-extrabold uppercase tracking-wider text-[#165B33]">
                              {sec.title}
                            </span>
                            <span className="font-mono text-[12px] sm:text-[12.5px] font-bold text-[#486053] bg-white px-2.5 py-0.5 rounded-md border border-[#D5E2D9] shadow-2xs">
                              {sec.timeRange}
                            </span>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${sec.badgeClass}`}>
                              {sec.badgeText}
                            </span>
                          </div>
                          <span className="text-[12px] font-bold text-[#165B33] bg-[#EBF5EE] px-2.5 py-0.5 rounded-md border border-[#B7E4C7]/60">
                            {secItems.filter((s) => s.completed).length} / {secItems.length} Done
                          </span>
                        </div>
                      </div>

                      {/* SECTION ACTIVITIES (5-COLUMN HORIZONTAL GRID) */}
                      <div className="space-y-0.5">
                        {secItems.map((item) => {
                          const globalIndex = schedule.findIndex((s) => s.id === item.id);
                          const isLastItemOfDay = globalIndex === schedule.length - 1;
                          const isPrevCompleted = globalIndex > 0 ? schedule[globalIndex - 1].completed : false;
                          const isCurrent = item.id === activeTaskId;

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedTask(item)}
                              className={`group relative flex items-center py-2.5 sm:py-3 px-1 sm:px-2 rounded-xl transition-all cursor-pointer ${
                                isCurrent
                                  ? "bg-[#F0F7F3] border border-[#BDE0C8] shadow-xs"
                                  : item.status === "completed"
                                  ? "bg-transparent hover:bg-[#F5F8F6]"
                                  : item.status === "missed"
                                  ? "bg-[#FEF2F2]/60 hover:bg-[#FEF2F2]"
                                  : item.status === "rescheduled"
                                  ? "bg-[#FFFBEB]/60 hover:bg-[#FFFBEB]"
                                  : "hover:bg-[#F8FAF9]"
                              }`}
                            >
                              {/* COLUMN 1: TIMELINE NODE & CONTINUOUS CONNECTOR LINE */}
                              <div
                                className="w-12 sm:w-14 flex-shrink-0 flex items-center justify-center relative self-stretch cursor-pointer group/node"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTask(item.id);
                                }}
                                title={item.status === "completed" ? "Click to mark incomplete" : "Click to mark complete"}
                              >
                                {/* Top Connector Line */}
                                <div
                                  className={`absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 transition-colors duration-200 pointer-events-none w-[2px] ${
                                    isPrevCompleted
                                      ? "bg-[#165B33]"
                                      : "bg-[#D2DDD6]"
                                  }`}
                                />

                                {/* Bottom Connector Line */}
                                {!isLastItemOfDay && (
                                  <div
                                    className={`absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 transition-colors duration-200 pointer-events-none w-[2px] ${
                                      item.status === "completed"
                                        ? "bg-[#165B33]"
                                        : "bg-[#D2DDD6]"
                                    }`}
                                  />
                                )}

                                {/* Timeline Circular Node */}
                                <div className="relative z-10 flex items-center justify-center">
                                  {item.status === "completed" ? (
                                    <div className="w-5 h-5 rounded-full bg-[#165B33] border-2 border-white shadow-xs flex items-center justify-center text-white scale-105 transition-all">
                                      <Check size={11} strokeWidth={3.5} className="text-white drop-shadow-xs" />
                                    </div>
                                  ) : isCurrent ? (
                                    <div className="w-5 h-5 rounded-full bg-[#165B33] border-2 border-white ring-4 ring-[#165B33]/25 shadow-xs flex items-center justify-center text-white">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    </div>
                                  ) : item.status === "missed" ? (
                                    <div className="w-5 h-5 rounded-full bg-white border-2 border-red-500 ring-2 ring-red-100 flex items-center justify-center text-red-500 shadow-2xs">
                                      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    </div>
                                  ) : item.status === "rescheduled" ? (
                                    <div className="w-5 h-5 rounded-full bg-white border-2 border-amber-500 ring-2 ring-amber-100 flex items-center justify-center text-amber-500 shadow-2xs">
                                      <RotateCcw size={10} strokeWidth={2.5} className="text-amber-500" />
                                    </div>
                                  ) : item.status === "skipped" ? (
                                    <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-400 ring-2 ring-gray-100 flex items-center justify-center text-gray-400 shadow-2xs">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-white border-2 border-[#CBD7CE] ring-2 ring-[#EBF5EE] hover:border-[#165B33] hover:ring-3 hover:ring-[#165B33]/20 transition-all flex items-center justify-center shadow-2xs group-hover/node:scale-110">
                                      <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover/node:bg-[#165B33]/30 transition-colors" />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* COLUMN 2: ACTIVITY ICON */}
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mr-3.5 sm:mr-4 shadow-2xs">
                                <div className={`w-10 h-10 rounded-xl ${item.iconBg} ${item.iconColor} flex items-center justify-center`}>
                                  <item.icon size={18} />
                                </div>
                              </div>

                              {/* COLUMN 3: START AND END TIME (12H) */}
                              <div className="w-36 sm:w-44 flex-shrink-0 font-mono text-[12.5px] sm:text-[13px] font-semibold text-[#486053] tracking-tight tabular-nums mr-3 sm:mr-4 hidden sm:flex items-center whitespace-nowrap">
                                {formatTo12H(item.time)}
                              </div>

                              {/* COLUMN 4: TASK INFORMATION */}
                              <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2.5 truncate">
                                  <span
                                    className={`text-[14.5px] sm:text-[15px] font-bold block truncate ${
                                      item.status === "completed"
                                        ? "text-[#6C8176] line-through"
                                        : isCurrent
                                        ? "text-[#14211A] font-extrabold"
                                        : "text-[#14211A]"
                                    }`}
                                  >
                                    {item.title}
                                  </span>
                                  <span className="text-[11px] font-semibold text-[#165B33] bg-[#EBF5EE] px-2 py-0.5 rounded-md flex-shrink-0 border border-[#B7E4C7]/50">
                                    {item.duration}
                                  </span>
                                  {item.is_protected && (
                                    <span className="text-[11px] font-bold text-[#4F46E5] bg-[#EEF2FF] px-2 py-0.5 rounded-md flex-shrink-0 border border-[#C7D2FE] flex items-center gap-1">
                                      <ShieldCheck size={12} />
                                      Protected
                                    </span>
                                  )}
                                </div>

                                {/* On mobile, show time here */}
                                <div className="flex items-center gap-2 mt-1 sm:hidden">
                                  <span className="font-mono text-[11px] font-semibold text-[#486053] tracking-tight tabular-nums">
                                    {formatTo12H(item.time)}
                                  </span>
                                  <span className="text-[12px] text-[#5A6E63] truncate">• {item.desc}</span>
                                </div>
                                <p className="hidden sm:block text-[12.5px] sm:text-[13px] text-[#5A6E63] truncate mt-0.5 leading-normal">
                                  {item.desc}
                                </p>
                              </div>

                              {/* COLUMN 5: COMPLETION STATUS OR ACTION */}
                              <div className="w-28 sm:w-32 flex-shrink-0 flex items-center justify-end">
                                {item.status === "completed" ? (
                                  <div className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] shadow-xs flex items-center gap-1.5">
                                    <Check size={12} strokeWidth={3} className="text-[#165B33]" />
                                    <span>Completed</span>
                                  </div>
                                ) : isCurrent ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(item);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[#165B33] text-white shadow-xs flex items-center gap-1.5 hover:bg-[#123D26] transition-colors cursor-pointer"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                    <span>In Progress</span>
                                  </button>
                                ) : item.status === "missed" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(item);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[#FEE2E2] text-[#DC2626] border border-red-200 shadow-xs flex items-center gap-1 hover:bg-red-100 transition-colors cursor-pointer"
                                  >
                                    <AlertCircle size={12} />
                                    <span>Missed</span>
                                  </button>
                                ) : item.status === "rescheduled" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(item);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[#FEF3C7] text-[#D97706] border border-amber-200 shadow-xs flex items-center gap-1 hover:bg-amber-100 transition-colors cursor-pointer"
                                  >
                                    <RotateCcw size={12} />
                                    <span>Rescheduled</span>
                                  </button>
                                ) : item.status === "skipped" ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTask(item);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[11.5px] font-bold bg-[#F3F4F6] text-[#4B5563] border border-gray-300 shadow-xs flex items-center gap-1 hover:bg-gray-200 transition-colors cursor-pointer"
                                  >
                                    <span>Skipped</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleTask(item.id);
                                    }}
                                    className="px-3 py-1.5 rounded-full text-[11.5px] font-semibold bg-[#F5F8F6] hover:bg-[#EBF5EE] text-[#5A6E63] hover:text-[#165B33] border border-[#DCE6DF] transition-colors cursor-pointer"
                                  >
                                    Upcoming
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM ROW: LIFE CATEGORIES & WEEKLY OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Life Categories */}
              <div className="os-card p-5 bg-white">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#14211A]">
                      Life Categories
                    </span>
                  </div>
                  <Link
                    href="/categories"
                    className="text-[11px] font-semibold text-[#165B33] hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: "Health", href: "/health", pct: `${categories.health ?? 0}%`, icon: Heart, color: "text-[#16A34A]" },
                    { label: "Spiritual", href: "/spiritual", pct: `${categories.spiritual ?? 0}%`, icon: Anchor, color: "text-[#D97706]" },
                    { label: "Career", href: "/learning", pct: `${categories.career ?? 0}%`, icon: GraduationCap, color: "text-[#165B33]" },
                    { label: "Freelancing", href: "/freelancing", pct: `${categories.freelancing ?? 0}%`, icon: TrendingUp, color: "text-[#0284C7]" },
                    { label: "Business", href: "/suku", pct: `${categories.suku ?? 0}%`, icon: Store, color: "text-[#165B33]" },
                    { label: "Forex", href: "/forex", pct: `${categories.forex ?? 0}%`, icon: CandlestickChart, color: "text-[#165B33]" },
                    { label: "Finance", href: "/finances", pct: `${categories.finance ?? 0}%`, icon: Wallet, color: "text-[#D97706]" },
                    { label: "Family", href: "/family", pct: `${categories.family ?? 0}%`, icon: Users, color: "text-[#165B33]" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="p-2 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] hover:border-[#165B33] hover:bg-[#EBF5EE] transition-all block group cursor-pointer"
                    >
                      <cat.icon size={15} className={`mx-auto mb-1 ${cat.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-[10px] text-[#6C8176] group-hover:text-[#165B33] block truncate font-medium">
                        {cat.label}
                      </span>
                      <span className="text-[11px] font-bold text-[#14211A] block">
                        {cat.pct}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Weekly Overview */}
              <div className="os-card p-5 bg-white">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={15} className="text-[#165B33]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#14211A]">
                      Weekly Overview
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6C8176]">
                    This Week • Oct 27 – Nov 2
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  {[
                    { day: "Mon", pct: "0%" },
                    { day: "Tue", pct: "0%" },
                    { day: "Wed", pct: "0%" },
                    { day: "Thu", pct: "0%" },
                    { day: "Fri", pct: "0%" },
                    { day: "Sat", pct: "0%" },
                    { day: "Sun", pct: "0%", active: true },
                  ].map((d) => (
                    <div key={d.day} className="text-center">
                      <span
                        className={`text-[11px] font-medium block mb-1.5 ${d.active ? "text-[#165B33] font-bold" : "text-[#6C8176]"
                          }`}
                      >
                        {d.day}
                      </span>
                      <div
                        className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[10px] font-bold ${d.active
                            ? "bg-[#EBF5EE] text-[#165B33] border border-[#C6E7D2]"
                            : "bg-[#F7FAF8] text-[#8CA095] border border-[#E2E9E4]"
                          }`}
                      >
                        {d.pct}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN (COL 9-12):
              1. Upcoming Priorities (Today's Key Actions)
              2. Quick Summary
              3. Daily Progress
              4. Upcoming Deadlines
              5. My Goals
              ======================================================== */}
          <div className="lg:col-span-4 space-y-5">
            {/* 1. UPCOMING PRIORITIES (Today's Immediate Next Actions) */}
            <div className="os-card p-5 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E9E4] mb-3.5">
                <div className="flex items-center space-x-2">
                  <Clock size={17} className="text-[#165B33]" />
                  <h3 className="text-[14.5px] font-bold text-[#14211A]">
                    Upcoming Priorities
                  </h3>
                </div>
                <Link
                  href="/my-day"
                  className="text-[11.5px] font-semibold text-[#165B33] hover:underline"
                >
                  View Day →
                </Link>
              </div>

              {upcomingPriorities.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F0F7F3] border border-[#BDE0C8] text-center">
                  <CheckCircle2 size={24} className="mx-auto text-[#165B33] mb-1.5" />
                  <p className="text-[13px] font-bold text-[#14211A]">
                    All Today's Tasks Completed!
                  </p>
                  <span className="text-[11.5px] text-[#6C8176]">
                    100% daily discipline achieved. Excellent execution.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcomingPriorities.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        task.id === activeTaskId
                          ? "bg-[#F0F7F3] border-[#BDE0C8] shadow-xs"
                          : "bg-[#F7FAF8] hover:bg-[#F2F7F4] border-[#E2E9E4]"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[11.5px] font-bold text-[#165B33] bg-white px-2 py-0.5 rounded border border-[#CBD7CE]">
                            {formatTo12H(task.time)}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6C8176] uppercase tracking-wide">
                            {task.category}
                          </span>
                          {task.is_protected && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]">
                              Protected
                            </span>
                          )}
                        </div>
                        <span className="text-[13.5px] font-bold text-[#14211A] block truncate">
                          {task.title}
                        </span>
                      </div>
                      <ChevronRight size={15} className="text-[#8CA095] flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. QUICK SUMMARY CARD (4 Sub-Cards) */}
            <div className="os-card p-5 bg-white">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E9E4] mb-3.5">
                <Calendar size={17} className="text-[#165B33]" />
                <h3 className="text-[14.5px] font-bold text-[#14211A]">
                  Quick Summary
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <div className="flex items-center space-x-1.5 text-[#165B33] mb-1">
                    <Calendar size={15} />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      Day 1
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#6C8176]">of 90-Day Sprint</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <div className="flex items-center space-x-1.5 text-[#165B33] mb-1">
                    <CheckCircle2 size={15} />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      {completedCount} / {totalTasks}
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#6C8176]">Tasks Executed</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <div className="flex items-center space-x-1.5 text-[#165B33] mb-1">
                    <Sparkles size={15} />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      {completionPercent}%
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#6C8176]">Daily Completion</span>
                </div>

                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <div className="flex items-center space-x-1.5 text-[#165B33] mb-1">
                    <Moon size={15} />
                    <span className="text-[13px] font-bold text-[#14211A]">{sleepHours}h</span>
                  </div>
                  <span className="text-[11px] text-[#B47805] font-semibold leading-tight">
                    Sleep ({sleepHours >= 7 ? "Optimal" : "Target 7.5h"})
                  </span>
                </div>
              </div>
            </div>

            {/* 3. DAILY PRIORITY PROGRESS (Ring + Key Metrics) */}
            <div className="os-card p-5 bg-white">
              <div className="flex items-center space-x-2 pb-3 border-b border-[#E2E9E4] mb-4">
                <BarChart3 size={17} className="text-[#165B33]" />
                <h3 className="text-[14.5px] font-bold text-[#14211A]">
                  Daily Priority Progress
                </h3>
              </div>

              <div className="flex items-center gap-5 mb-2">
                {/* SVG Progress Circle */}
                <div className="relative w-22 h-22 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E2E9E4]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#165B33] transition-all duration-500"
                      strokeDasharray={`${completionPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-lg font-extrabold text-[#14211A]">
                    {completionPercent}%
                  </span>
                </div>

                <div className="space-y-2 text-[12.5px] flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176] flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-[#165B33]" />
                      Tasks Completed
                    </span>
                    <span className="font-bold text-[#14211A]">
                      {completedCount} / {totalTasks}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176] flex items-center gap-1.5">
                      <Clock size={14} className="text-[#165B33]" />
                      Focus Hours
                    </span>
                    <span className="font-bold text-[#14211A]">16 Hours</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176] flex items-center gap-1.5">
                      <Anchor size={14} className="text-[#165B33]" />
                      Prayer Anchors
                    </span>
                    <span className="font-bold text-[#14211A]">2 / 2 Protected</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176] flex items-center gap-1.5">
                      <Flame size={14} className="text-[#B47805]" />
                      Habit Discipline
                    </span>
                    <span className="font-bold text-[#14211A]">100% on Track</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. UPCOMING STRATEGIC DEADLINES */}
            <div className="os-card p-5 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E9E4] mb-3.5">
                <div className="flex items-center space-x-2">
                  <Target size={17} className="text-[#165B33]" />
                  <h3 className="text-[14.5px] font-bold text-[#14211A]">
                    Upcoming Deadlines
                  </h3>
                </div>
                <Link
                  href="/calendar"
                  className="text-[11.5px] font-semibold text-[#165B33] hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-2.5">
                {(dbGoals.length > 0
                  ? dbGoals.slice(0, 4).map((g: any) => ({
                      title: g.title,
                      cat: g.category,
                      date: g.deadline || "Upcoming",
                      remaining: g.deadline
                        ? `${Math.max(1, Math.round((new Date(g.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days left`
                        : "Active",
                      priority: g.priority === "high" ? "High" : "Medium",
                      pBg:
                        g.priority === "high"
                          ? "bg-[#FEE8E8] text-[#D93838] border border-red-200"
                          : "bg-[#FEF3D6] text-[#B47805] border border-amber-200",
                    }))
                  : [
                      {
                        title: "Build freelancing portfolio",
                        cat: "Freelancing",
                        date: "Nov 15, 2026",
                        remaining: "14 days left",
                        priority: "High",
                        pBg: "bg-[#FEE8E8] text-[#D93838] border border-red-200",
                      },
                      {
                        title: "Master React & TS architecture",
                        cat: "Career & Learning",
                        date: "Nov 20, 2026",
                        remaining: "19 days left",
                        priority: "Medium",
                        pBg: "bg-[#FEF3D6] text-[#B47805] border border-amber-200",
                      },
                      {
                        title: "Suku merchant MVP testing",
                        cat: "Business (Suku)",
                        date: "Dec 5, 2026",
                        remaining: "34 days left",
                        priority: "High",
                        pBg: "bg-[#FEE8E8] text-[#D93838] border border-red-200",
                      },
                      {
                        title: "Emergency reserve (50,000 ETB)",
                        cat: "Financial",
                        date: "Dec 31, 2026",
                        remaining: "60 days left",
                        priority: "Target",
                        pBg: "bg-[#E7F6ED] text-[#198754] border border-[#B7E4C7]",
                      },
                    ]
                ).map((dl: any) => {
                  const href = dl.cat.toLowerCase().includes("free")
                    ? "/freelancing"
                    : dl.cat.toLowerCase().includes("suku") || dl.cat.toLowerCase().includes("business")
                    ? "/suku"
                    : dl.cat.toLowerCase().includes("fin")
                    ? "/finances"
                    : dl.cat.toLowerCase().includes("learn") || dl.cat.toLowerCase().includes("career")
                    ? "/learning"
                    : "/goals";

                  return (
                    <Link
                      key={dl.title}
                      href={href}
                      className="p-3 rounded-xl bg-[#F7FAF8] hover:bg-[#EBF5EE] border border-[#E2E9E4] hover:border-[#B7E4C7] flex items-center justify-between gap-3 transition-colors block group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-[13px] font-bold text-[#14211A] group-hover:text-[#165B33] block truncate transition-colors">
                          {dl.title}
                        </span>
                        <span className="text-[11.5px] text-[#6C8176]">
                          {dl.cat} • {dl.date} ({dl.remaining})
                        </span>
                      </div>
                      <span
                        className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${dl.pBg}`}
                      >
                        {dl.priority}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 5. MY GOALS (With Clean Progress Bars) */}
            <div className="os-card p-5 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E9E4] mb-3.5">
                <div className="flex items-center space-x-2">
                  <Target size={17} className="text-[#165B33]" />
                  <h3 className="text-[14.5px] font-bold text-[#14211A]">
                    My Goals
                  </h3>
                </div>
                <Link
                  href="/goals"
                  className="text-[11.5px] font-semibold text-[#165B33] hover:underline"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {(dbGoals.length > 0
                  ? dbGoals.slice(0, 5).map((g: any) => ({
                      title: g.title,
                      pct: g.progress || 0,
                    }))
                  : [
                      { title: "Additional freelance income stream", pct: 15 },
                      { title: "Improve software architecture skills", pct: 20 },
                      { title: "Validate ICT trading edge (demo)", pct: 10 },
                      { title: "Build emergency reserve fund", pct: 26 },
                      { title: "Fluent English communication", pct: 25 },
                    ]
                ).map((g: any) => (
                  <div
                    key={g.title}
                    className="p-2.5 rounded-xl hover:bg-[#F7FAF8] transition-colors border border-transparent hover:border-[#E2E9E4]"
                  >
                    <div className="flex items-center justify-between text-[12.5px] font-medium text-[#14211A] mb-1.5">
                      <span className="truncate pr-2 font-semibold">{g.title}</span>
                      <span className="font-bold text-[#165B33] font-mono text-[12px]">
                        {g.pct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                        style={{ width: `${g.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MOTIVATIONAL FOOTER CARD */}
            <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#F3F9F5] border border-[#DCEEE3]">
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center space-x-2 text-[#165B33]">
                  <Sprout size={18} />
                </div>
                <p className="text-[12.5px] text-[#14211A] font-medium italic leading-relaxed">
                  "You don't need to be perfect. You just need to be consistent."
                </p>
                <span className="text-[11px] text-[#6C8176] block">— LIFE OS Principle</span>
              </div>

              {/* Aesthetic Mountain Contour Graphic in Corner */}
              <div className="absolute -right-4 -bottom-4 w-28 h-20 opacity-20 text-[#165B33] pointer-events-none">
                <svg viewBox="0 0 100 60" fill="currentColor">
                  <path d="M0 60 L30 20 L50 40 L75 10 L100 60 Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* TASK DETAILS & EXECUTION MODAL */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title="Activity Details & Execution"
            maxWidth="max-w-lg"
          >
            <div className="space-y-5">
              {/* Task Summary Banner */}
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                <div className={`w-10 h-10 rounded-lg ${selectedTask.iconBg} ${selectedTask.iconColor} flex items-center justify-center flex-shrink-0`}>
                  <selectedTask.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-[12px] font-bold text-[#165B33] bg-white px-2 py-0.5 rounded border border-[#CBD7CE]">
                      {formatTo12H(selectedTask.time)}
                    </span>
                    <span className="text-[11px] font-semibold text-[#6C8176] uppercase tracking-wide">
                      {selectedTask.category}
                    </span>
                    {selectedTask.is_protected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] flex items-center gap-1">
                        <ShieldCheck size={11} /> Protected Priority
                      </span>
                    )}
                  </div>
                  <h4 className="text-[15px] font-bold text-[#14211A]">
                    {selectedTask.title}
                  </h4>
                  <p className="text-[12px] text-[#6C8176] mt-1 leading-relaxed">
                    {selectedTask.instructions || selectedTask.desc}
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-[#E2E9E4] flex items-center justify-between">
                    <span className="text-[11px] text-[#6C8176]">
                      Life Pillar: <strong className="text-[#14211A] capitalize">{selectedTask.category}</strong>
                    </span>
                    <Link
                      href={
                        selectedTask.category === "spiritual"
                          ? "/spiritual"
                          : selectedTask.category === "health"
                          ? "/health"
                          : selectedTask.category === "learning"
                          ? "/learning"
                          : selectedTask.category === "freelancing"
                          ? "/freelancing"
                          : selectedTask.category === "business" || selectedTask.category === "development"
                          ? "/suku"
                          : selectedTask.category === "forex"
                          ? "/forex"
                          : selectedTask.category === "finance" || selectedTask.category === "financial"
                          ? "/finances"
                          : selectedTask.category === "family"
                          ? "/family"
                          : "/categories"
                      }
                      className="text-[11.5px] font-bold text-[#165B33] hover:underline inline-flex items-center gap-1 group"
                    >
                      <span>Open {selectedTask.category} Module</span>
                      <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Status Selection Buttons */}
              <div>
                <label className="text-[12px] font-bold text-[#14211A] block mb-2">
                  Update Execution Status
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus("completed")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "completed"
                        ? "bg-[#165B33] text-white border-[#165B33] shadow-xs"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <Check size={14} />
                    <span>Completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("in_progress")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "in_progress"
                        ? "bg-[#EBF5EE] text-[#165B33] border-[#165B33] ring-1 ring-[#165B33]"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <Play size={13} className="fill-current" />
                    <span>In Progress</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("upcoming")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "upcoming"
                        ? "bg-[#F3F4F6] text-[#374151] border-[#9CA3AF]"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <Clock size={14} />
                    <span>Upcoming</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("rescheduled")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "rescheduled"
                        ? "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <RotateCcw size={13} />
                    <span>Reschedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("skipped")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "skipped"
                        ? "bg-[#F3F4F6] text-[#4B5563] border-gray-400"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <X size={14} />
                    <span>Skip Task</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus("missed")}
                    className={`p-2.5 rounded-lg border text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      editStatus === "missed"
                        ? "bg-[#FEE2E2] text-[#DC2626] border-red-400"
                        : "bg-white text-[#14211A] border-[#E2E9E4] hover:bg-[#F7FAF8]"
                    }`}
                  >
                    <AlertCircle size={14} />
                    <span>Missed</span>
                  </button>
                </div>
              </div>

              {/* Reschedule Details if selected */}
              {editStatus === "rescheduled" && (
                <div className="p-3.5 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A] space-y-3">
                  <span className="text-[12px] font-bold text-[#92400E] block">
                    Rescheduling Information
                  </span>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[11px] font-medium text-[#78350F] block mb-1">
                        New Target Time Window:
                      </span>
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        placeholder="e.g. 7:30 PM – 8:15 PM"
                        className="w-full px-3 py-1.5 text-[13px] bg-white border border-[#E8E6DF] rounded-lg text-[#181E1B]"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-[#78350F] block mb-1">
                        Reason for Rescheduling:
                      </span>
                      <input
                        type="text"
                        value={rescheduleReason}
                        onChange={(e) => setRescheduleReason(e.target.value)}
                        placeholder="Accountability reason for changing the plan..."
                        className="w-full px-3 py-1.5 text-[13px] bg-white border border-[#E8E6DF] rounded-lg text-[#181E1B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Skip Reason if selected */}
              {editStatus === "skipped" && (
                <div className="p-3.5 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] space-y-2">
                  <span className="text-[12px] font-bold text-[#374151] block">
                    Reason for Skipping
                  </span>
                  <input
                    type="text"
                    value={skipReason}
                    onChange={(e) => setSkipReason(e.target.value)}
                    placeholder="Explain why this task was skipped..."
                    className="w-full px-3 py-1.5 text-[13px] bg-white border border-[#CBD5E1] rounded-lg text-[#181E1B]"
                  />
                </div>
              )}

              {/* Notes Field */}
              <div>
                <label className="text-[12px] font-bold text-[#14211A] flex items-center justify-between mb-1.5">
                  <span>Execution Notes & Reflections</span>
                  <span className="text-[11px] text-[#6C8176] font-normal">Optional</span>
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Record execution details, insights, or thoughts on this block..."
                  className="w-full p-3 text-[13px] bg-white border border-[#E2E9E4] rounded-lg text-[#14211A] focus:outline-none focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E9E4]">
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#6C8176] hover:text-[#14211A] hover:bg-[#F7FAF8] rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateTask({
                      id: selectedTask.id,
                      status: editStatus,
                      notes: editNotes,
                      reschedule_reason:
                        editStatus === "rescheduled"
                          ? rescheduleReason
                          : editStatus === "skipped"
                          ? skipReason
                          : undefined,
                      time:
                        editStatus === "rescheduled" && newTime.trim()
                          ? newTime.trim()
                          : selectedTask.time,
                    });
                  }}
                  className="px-5 py-2 text-[12px] font-bold text-white bg-[#165B33] hover:bg-[#123D26] rounded-lg shadow-xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
