"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Store,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  Smartphone,
  Users,
  Server,
  Zap,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Settings,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Filter,
  ArrowUpDown,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Code2,
  CreditCard,
  Truck,
  Rocket,
  Search,
  ShoppingBag,
  Boxes,
  Circle,
  Play,
  CheckSquare,
  Flame,
  Info,
} from "lucide-react";
import { SukuTask } from "@/lib/types";

interface MilestoneStage {
  id: number;
  title: string;
  categoryKey: string;
  targetDate: string;
  defaultDescription: string;
  icon: any;
}

const MILESTONE_STAGES: MilestoneStage[] = [
  {
    id: 1,
    title: "Planning & Requirements",
    categoryKey: "product",
    targetDate: "2026-10-25",
    defaultDescription: "Market specs, local commerce taxonomy & merchant catalog requirements",
    icon: Layers,
  },
  {
    id: 2,
    title: "UI/UX Design",
    categoryKey: "ui_ux",
    targetDate: "2026-10-30",
    defaultDescription: "Mobile-first responsive storefront, filter drawer & design tokens",
    icon: Smartphone,
  },
  {
    id: 3,
    title: "Database & Backend Architecture",
    categoryKey: "backend",
    targetDate: "2026-11-05",
    defaultDescription: "PostgreSQL/SQLite relational schema, ACID orders & merchant tables",
    icon: Server,
  },
  {
    id: 4,
    title: "Authentication & Security",
    categoryKey: "security",
    targetDate: "2026-11-20",
    defaultDescription: "JWT tokens, merchant RBAC, CSRF defense & secure API middleware",
    icon: ShieldCheck,
  },
  {
    id: 5,
    title: "Product Catalog & Search",
    categoryKey: "product",
    targetDate: "2026-11-15",
    defaultDescription: "Indexed fast search, category browsing & multi-image storage",
    icon: Search,
  },
  {
    id: 6,
    title: "Shopping Cart & Checkout",
    categoryKey: "backend",
    targetDate: "2026-11-10",
    defaultDescription: "Persistent client cart, atomic checkout API & buyer invoices",
    icon: ShoppingBag,
  },
  {
    id: 7,
    title: "Payment Integration",
    categoryKey: "payment",
    targetDate: "2026-11-25",
    defaultDescription: "Telebirr & Chapa webhook listeners, signature verification & receipts",
    icon: CreditCard,
  },
  {
    id: 8,
    title: "Seller & Buyer Management",
    categoryKey: "marketing",
    targetDate: "2026-12-01",
    defaultDescription: "Merchant onboarding portal, store profiles & customer order histories",
    icon: Users,
  },
  {
    id: 9,
    title: "Delivery & Order Management",
    categoryKey: "backend",
    targetDate: "2026-12-10",
    defaultDescription: "Addis Ababa delivery zones, OTP verification pins & courier routing",
    icon: Truck,
  },
  {
    id: 10,
    title: "Testing & Deployment",
    categoryKey: "testing",
    targetDate: "2026-12-20",
    defaultDescription: "Playwright regression test suite, staging penetration tests & CI/CD",
    icon: Zap,
  },
  {
    id: 11,
    title: "MVP Launch",
    categoryKey: "launch",
    targetDate: "2026-12-31",
    defaultDescription: "Production Cloud Run deployment & pilot onboarding of 20 merchants",
    icon: Rocket,
  },
];

export default function SukuCommandCenterPage() {
  const [tasks, setTasks] = useState<SukuTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"priority" | "deadline" | "status">("deadline");

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // New Task Form
  const [taskTitle, setTaskTitle] = useState("");
  const [taskArea, setTaskArea] = useState<SukuTask["area"]>("backend");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"high" | "medium" | "low">("high");
  const [taskTargetDate, setTaskTargetDate] = useState("2026-11-15");
  const [taskStageId, setTaskStageId] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);

  // Project Settings State
  const [targetLaunchDate, setTargetLaunchDate] = useState("2026-12-31");
  const [stagingUrl, setStagingUrl] = useState("https://staging.suku.et");
  const [gitBranch, setGitBranch] = useState("main");
  const [pacingNotes, setPacingNotes] = useState(
    "Thursday evenings: 60m (API & Models). Saturday mornings: 3.5h (Deep Architecture & UI integration)."
  );

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suku");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks || []);
      }
    } catch (e) {
      console.error("Error loading Suku tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggleTaskStatus = async (task: SukuTask) => {
    const nextStatus = task.status === "completed" ? "in_progress" : "completed";
    try {
      const res = await fetch("/api/suku", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetStatus = async (taskId: string, status: "backlog" | "in_progress" | "completed") => {
    try {
      const res = await fetch("/api/suku", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status,
        }),
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Are you sure you want to delete this deliverable?")) return;
    try {
      const res = await fetch(`/api/suku?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/suku", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          area: taskArea,
          title: taskTitle,
          description: taskDescription,
          priority: taskPriority,
          status: "backlog",
          target_date: taskTargetDate,
          stage_id: Number(taskStageId),
        }),
      });

      if (res.ok) {
        setIsTaskModalOpen(false);
        setTaskTitle("");
        setTaskDescription("");
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper: map task to stage
  const getTaskStageId = (task: SukuTask): number => {
    if (task.stage_id && task.stage_id >= 1 && task.stage_id <= 11) {
      return task.stage_id;
    }
    // Fallback heuristic based on area and title
    if (task.area === "security") return 4;
    if (task.area === "payment") return 7;
    if (task.area === "marketing") return 8;
    if (task.area === "testing") return 10;
    if (task.area === "launch" || task.area === "deployment") return 11;
    if (task.area === "ui_ux") return 2;
    if (task.area === "product") {
      if (task.title.toLowerCase().includes("search") || task.title.toLowerCase().includes("catalog")) return 5;
      return 1;
    }
    if (task.area === "backend") {
      if (task.title.toLowerCase().includes("cart") || task.title.toLowerCase().includes("checkout")) return 6;
      if (task.title.toLowerCase().includes("delivery") || task.title.toLowerCase().includes("courier")) return 9;
      return 3;
    }
    return 1;
  };

  // Current system date
  const todayStr = "2026-11-01";

  // Calculate project performance stats strictly from actual tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const remainingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(
    (t) => t.status !== "completed" && t.target_date && t.target_date < todayStr
  ).length;
  const overallProgressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate milestone status & completion % from actual tasks
  const stageStats = useMemo(() => {
    return MILESTONE_STAGES.map((stage) => {
      const stageTasksList = tasks.filter((t) => getTaskStageId(t) === stage.id);
      const stageCompleted = stageTasksList.filter((t) => t.status === "completed").length;
      const stageTotal = stageTasksList.length;
      const completionPct = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;

      let status: "Completed" | "In Progress" | "Upcoming" | "Blocked" = "Upcoming";
      if (stageTotal > 0 && stageCompleted === stageTotal) {
        status = "Completed";
      } else if (stageTasksList.some((t) => t.status === "in_progress")) {
        status = "In Progress";
      } else if (
        stageTasksList.some((t) => t.status !== "completed" && t.target_date && t.target_date < todayStr)
      ) {
        status = "Blocked";
      } else if (stageTotal > 0) {
        status = "Upcoming";
      }

      return {
        ...stage,
        stageTasksList,
        stageCompleted,
        stageTotal,
        completionPct,
        status,
      };
    });
  }, [tasks]);

  // Next milestone and deadline
  const nextMilestone = useMemo(() => {
    const incomplete = stageStats.filter((s) => s.status !== "Completed");
    return incomplete.length > 0 ? incomplete[0] : stageStats[stageStats.length - 1];
  }, [stageStats]);

  // Days remaining to MVP Launch
  const daysToLaunch = useMemo(() => {
    const launch = new Date(targetLaunchDate);
    const now = new Date(todayStr);
    const diff = Math.ceil((launch.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [targetLaunchDate]);

  // Next Recommended Action (prominent incomplete high-priority task)
  const nextRecommendedTask = useMemo(() => {
    const incomplete = tasks.filter((t) => t.status !== "completed");
    if (incomplete.length === 0) return null;

    // Sort: in_progress first, then high priority, then earliest deadline
    return [...incomplete].sort((a, b) => {
      if (a.status === "in_progress" && b.status !== "in_progress") return -1;
      if (b.status === "in_progress" && a.status !== "in_progress") return 1;

      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
      if (pDiff !== 0) return pDiff;

      return (a.target_date || "9999").localeCompare(b.target_date || "9999");
    })[0];
  }, [tasks]);

  // Weekly Progress (Week of Nov 1 - Nov 7, 2026)
  const weeklyMetrics = useMemo(() => {
    const weekStart = "2026-11-01";
    const weekEnd = "2026-11-07";

    const weeklyTasks = tasks.filter((t) => {
      const stage = getTaskStageId(t);
      return (
        (t.target_date && t.target_date >= weekStart && t.target_date <= weekEnd) ||
        t.status === "in_progress" ||
        stage === 3 ||
        stage === 6
      );
    });

    const plannedCount = weeklyTasks.length || 3;
    const completedCount = weeklyTasks.filter((t) => t.status === "completed").length;
    const remainingCount = Math.max(0, plannedCount - completedCount);
    const completionRate = plannedCount > 0 ? Math.round((completedCount / plannedCount) * 100) : 0;

    return {
      plannedCount,
      completedCount,
      remainingCount,
      completionRate,
      weeklyTasks,
    };
  }, [tasks]);

  // Recent Activity Timeline items derived from actual tasks
  const recentActivities = useMemo(() => {
    const activities: Array<{
      id: string;
      title: string;
      type: "completed" | "in_progress" | "created" | "upcoming";
      date: string;
      category: string;
    }> = [];

    // Completed tasks
    tasks
      .filter((t) => t.status === "completed")
      .forEach((t) => {
        activities.push({
          id: `done_${t.id}`,
          title: `Completed: ${t.title}`,
          type: "completed",
          date: t.target_date || "Oct 30",
          category: t.area,
        });
      });

    // In-progress tasks
    tasks
      .filter((t) => t.status === "in_progress")
      .forEach((t) => {
        activities.push({
          id: `prog_${t.id}`,
          title: `Active in sprint: ${t.title}`,
          type: "in_progress",
          date: t.target_date || "Nov 05",
          category: t.area,
        });
      });

    // Upcoming deadlines
    tasks
      .filter((t) => t.status === "backlog")
      .slice(0, 3)
      .forEach((t) => {
        activities.push({
          id: `up_${t.id}`,
          title: `Scheduled milestone deliverable: ${t.title}`,
          type: "upcoming",
          date: t.target_date || "Nov 15",
          category: t.area,
        });
      });

    return activities.slice(0, 5);
  }, [tasks]);

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // Category filter
    if (selectedArea !== "all") {
      if (selectedArea === "testing_deployment") {
        result = result.filter(
          (t) => t.area === "testing" || t.area === "deployment" || t.area === "launch"
        );
      } else {
        result = result.filter((t) => t.area === selectedArea);
      }
    }

    // Milestone filter
    if (selectedMilestoneId !== null) {
      result = result.filter((t) => getTaskStageId(t) === selectedMilestoneId);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "priority") {
        const pWeight = { high: 3, medium: 2, low: 1 };
        return (pWeight[b.priority] || 2) - (pWeight[a.priority] || 2);
      }
      if (sortBy === "deadline") {
        return (a.target_date || "9999").localeCompare(b.target_date || "9999");
      }
      if (sortBy === "status") {
        const sWeight = { in_progress: 3, backlog: 2, completed: 1 };
        return (sWeight[b.status] || 2) - (sWeight[a.status] || 2);
      }
      return 0;
    });

    return result;
  }, [tasks, selectedArea, selectedMilestoneId, sortBy]);

  const activeStage = selectedMilestoneId
    ? MILESTONE_STAGES.find((s) => s.id === selectedMilestoneId)
    : null;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* SECTION 1: PROJECT HEADER                                 */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-[#E8F5E9] text-[#165B33] border border-[#C8E6C9]">
                  <span className="w-2 h-2 rounded-full bg-[#165B33] animate-pulse" />
                  <span>Suku Development Command Center</span>
                </div>
                <div className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                  <Clock size={12} className="text-[#64748B]" />
                  <span>Target MVP: {targetLaunchDate}</span>
                  <span className="font-bold text-[#165B33] ml-1">({daysToLaunch} days)</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">
                  Suku Marketplace — Ethiopian Commerce Platform
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#475569] mt-1 max-w-4xl leading-relaxed">
                  Scalable multi-vendor commerce platform connecting Addis Ababa artisans and merchants to digital
                  buyers with Telebirr, CBE Birr & Chapa payment gateways, localized inventory, and low-bandwidth mobile UX.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[12px] text-[#64748B]">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#94A3B8] font-medium">Status:</span>
                  <span className="font-semibold text-[#0F172A] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    In Active Development (Phase 2)
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#94A3B8] font-medium">Pacing:</span>
                  <span className="font-medium text-[#334155]">Thu 60m + Sat 3.5h</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[#94A3B8] font-medium">Staging:</span>
                  <a
                    href={stagingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[#165B33] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>staging.suku.et</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0 self-start lg:self-center">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="inline-flex items-center px-3.5 py-2.5 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border border-[#CBD5E1] rounded-xl text-[13px] font-semibold transition-all shadow-sm"
                title="Configure project parameters"
              >
                <Settings size={15} className="mr-1.5 text-[#64748B]" />
                <span>Project Settings</span>
              </button>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center px-4 py-2.5 bg-[#165B33] hover:bg-[#1B4332] text-white rounded-xl text-[13px] font-semibold transition-all shadow-sm hover:shadow"
              >
                <Plus size={16} className="mr-1.5" />
                <span>Add Task</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: PROJECT PERFORMANCE OVERVIEW (5 STATS)        */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                Executive Dashboard
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">
                Project Performance Overview
              </h2>
            </div>
            <div className="text-[12px] text-[#64748B] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#165B33]" />
              <span>Real-time calculated metrics from {totalTasks} deliverables</span>
            </div>
          </div>

          {/* 5 Compact Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
            {/* Stat 1: Overall Completion */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Overall Completion
              </span>
              <div className="my-1.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#165B33]">
                  {overallProgressPercent}%
                </div>
              </div>
              <span className="text-[11px] text-[#475569]">Calculated progress</span>
            </div>

            {/* Stat 2: Completed / Total */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Completed Tasks
              </span>
              <div className="my-1.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {completedTasks}
                  <span className="text-[16px] font-medium text-[#64748B]"> / {totalTasks}</span>
                </div>
              </div>
              <span className="text-[11px] text-[#165B33] font-semibold">
                {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% verified done` : "No tasks"}
              </span>
            </div>

            {/* Stat 3: Remaining Tasks */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Remaining Tasks
              </span>
              <div className="my-1.5">
                <div className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
                  {remainingTasks}
                </div>
              </div>
              <span className="text-[11px] text-[#64748B]">Active & backlog queue</span>
            </div>

            {/* Stat 4: Overdue Tasks */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Overdue Tasks
              </span>
              <div className="my-1.5">
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    overdueTasks > 0 ? "text-[#DC2626]" : "text-[#165B33]"
                  }`}
                >
                  {overdueTasks}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  overdueTasks > 0 ? "text-[#DC2626]" : "text-[#165B33]"
                }`}
              >
                {overdueTasks > 0 ? "Requires schedule adjustment" : "All deliverables on schedule"}
              </span>
            </div>

            {/* Stat 5: Next Milestone & Deadline */}
            <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 flex flex-col justify-between col-span-2 md:col-span-1">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Next Milestone
              </span>
              <div className="my-1.5">
                <div className="text-[14px] font-extrabold text-[#0F172A] line-clamp-1">
                  Stage {nextMilestone.id}: {nextMilestone.title}
                </div>
                <div className="text-[11px] text-[#165B33] font-bold mt-0.5">
                  Due {nextMilestone.targetDate}
                </div>
              </div>
              <span className="text-[10px] text-[#64748B]">{nextMilestone.stageTotal} stage deliverables</span>
            </div>
          </div>

          {/* Large Forest-Green Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-[#0F172A] flex items-center space-x-1.5">
                <TrendingUp size={14} className="text-[#165B33]" />
                <span>Overall Project Completion Pathway to MVP Launch</span>
              </span>
              <span className="font-bold text-[#165B33]">
                {overallProgressPercent}% Complete ({completedTasks} of {totalTasks} Tasks)
              </span>
            </div>

            <div className="w-full bg-[#E2E8F0] h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-[#1B4332] via-[#165B33] to-[#2D6A4F] h-full rounded-full transition-all duration-700 shadow-sm"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
              <span>Foundation & Design (Completed)</span>
              <span>Backend & Payments (Current Phase)</span>
              <span>Launch & Deployment ({targetLaunchDate})</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: VISUAL DEVELOPMENT ROADMAP (11 CONNECTED STAGES) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                <Layers size={13} />
                <span>Continuous Connected Journey</span>
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">
                Visual Development Roadmap (11 Stages)
              </h2>
              <p className="text-[12px] text-[#64748B] mt-0.5">
                Click any milestone node to filter related deliverables on the task board below.
              </p>
            </div>

            {selectedMilestoneId !== null && (
              <button
                onClick={() => setSelectedMilestoneId(null)}
                className="inline-flex items-center px-3 py-1.5 text-[12px] font-semibold text-[#165B33] bg-[#E8F5E9] border border-[#C8E6C9] rounded-lg hover:bg-[#D4EDDA] transition-colors self-start sm:self-center"
              >
                <RotateCcw size={12} className="mr-1.5" />
                <span>Clear Milestone Filter (Showing All)</span>
              </button>
            )}
          </div>

          {/* Continuous Connected Timeline (Horizontal Scrollable with continuous line) */}
          <div className="relative overflow-x-auto pb-4 pt-2 -mx-2 px-2 scrollbar-thin">
            {/* Continuous background connecting line */}
            <div className="absolute top-[28px] left-6 right-6 h-1 bg-[#CBD5E1] -z-0" />

            {/* Active completed connector overlay */}
            <div
              className="absolute top-[28px] left-6 h-1 bg-[#165B33] -z-0 transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(8, (stageStats.filter((s) => s.status === "Completed").length / 11) * 100)
                )}%`,
              }}
            />

            <div className="flex items-start gap-4 min-w-[1320px] relative z-10">
              {stageStats.map((stage) => {
                const IconComponent = stage.icon;
                const isSelected = selectedMilestoneId === stage.id;
                const isCompleted = stage.status === "Completed";
                const isInProgress = stage.status === "In Progress";
                const isBlocked = stage.status === "Blocked";

                return (
                  <div
                    key={stage.id}
                    onClick={() =>
                      setSelectedMilestoneId(selectedMilestoneId === stage.id ? null : stage.id)
                    }
                    className={`flex-1 flex flex-col items-center cursor-pointer transition-all duration-200 group p-2 rounded-xl text-center ${
                      isSelected
                        ? "bg-[#F1F8F4] ring-2 ring-[#165B33] shadow-sm"
                        : "hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {/* Milestone Node Circle */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[13px] border-2 transition-all shadow-sm ${
                        isCompleted
                          ? "bg-[#165B33] border-[#165B33] text-white"
                          : isInProgress
                          ? "bg-[#E3F2FD] border-[#2563EB] text-[#1E40AF] ring-4 ring-[#DBEAFE] animate-pulse"
                          : isBlocked
                          ? "bg-[#FEF2F2] border-[#DC2626] text-[#DC2626]"
                          : "bg-white border-[#CBD5E1] text-[#64748B] group-hover:border-[#94A3B8]"
                      }`}
                    >
                      {isCompleted ? (
                        <Check size={18} className="stroke-[2.5]" />
                      ) : (
                        <span>{stage.id}</span>
                      )}
                    </div>

                    {/* Stage Title & Details */}
                    <div className="mt-3 w-full flex flex-col items-center">
                      <div className="flex items-center space-x-1 mb-1">
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-[#E8F5E9] text-[#165B33]"
                              : isInProgress
                              ? "bg-[#EFF6FF] text-[#2563EB]"
                              : isBlocked
                              ? "bg-[#FEF2F2] text-[#DC2626]"
                              : "bg-[#F1F5F9] text-[#64748B]"
                          }`}
                        >
                          {stage.status}
                        </span>
                      </div>

                      <h4
                        className={`text-[12px] font-bold leading-snug line-clamp-2 h-8 ${
                          isSelected
                            ? "text-[#165B33]"
                            : isCompleted
                            ? "text-[#0F172A]"
                            : "text-[#334155]"
                        }`}
                      >
                        {stage.title}
                      </h4>

                      <div className="mt-1 text-[11px] font-semibold text-[#165B33]">
                        {stage.completionPct}% Done
                      </div>

                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        {stage.stageCompleted}/{stage.stageTotal} tasks
                      </div>

                      <div className="mt-1 text-[10px] font-mono text-[#94A3B8]">
                        {stage.targetDate}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Milestone Card Banner if selected */}
          {activeStage && (
            <div className="mt-4 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#165B33] text-white flex items-center justify-center font-bold text-[14px]">
                  #{activeStage.id}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase text-[#165B33]">
                      Filtered Milestone
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      • Target: {activeStage.targetDate}
                    </span>
                  </div>
                  <h3 className="text-[14px] font-bold text-[#0F172A]">
                    {activeStage.title}
                  </h3>
                  <p className="text-[12px] text-[#475569]">
                    {activeStage.defaultDescription}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => {
                    setTaskStageId(activeStage.id);
                    setIsTaskModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#165B33] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1B4332] transition-colors"
                >
                  + Add Deliverable to Stage {activeStage.id}
                </button>
                <button
                  onClick={() => setSelectedMilestoneId(null)}
                  className="px-3 py-1.5 bg-white text-[#475569] border border-[#CBD5E1] text-[12px] font-semibold rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Show All Stages
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* TWO-COLUMN GRID: WEEKLY PROGRESS & NEXT RECOMMENDED ACTION */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 5: WEEKLY PROGRESS */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                    Sprint Performance
                  </div>
                  <h3 className="text-[16px] font-bold text-[#0F172A]">
                    Weekly Progress (Sprint 44)
                  </h3>
                </div>
                <div className="text-[11px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full border border-[#E2E8F0]">
                  Nov 01 – Nov 07, 2026
                </div>
              </div>

              {/* 4 Weekly Stat Blocks */}
              <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Planned
                  </span>
                  <span className="text-xl font-extrabold text-[#0F172A]">
                    {weeklyMetrics.plannedCount}
                  </span>
                  <span className="text-[10px] text-[#94A3B8] block">tasks</span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Completed
                  </span>
                  <span className="text-xl font-extrabold text-[#165B33]">
                    {weeklyMetrics.completedCount}
                  </span>
                  <span className="text-[10px] text-[#165B33] block">done</span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Remaining
                  </span>
                  <span className="text-xl font-extrabold text-[#D97706]">
                    {weeklyMetrics.remainingCount}
                  </span>
                  <span className="text-[10px] text-[#64748B] block">active</span>
                </div>
                <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                  <span className="text-[10px] uppercase font-bold text-[#64748B] block">
                    Rate
                  </span>
                  <span className="text-xl font-extrabold text-[#165B33]">
                    {weeklyMetrics.completionRate}%
                  </span>
                  <span className="text-[10px] text-[#64748B] block">velocity</span>
                </div>
              </div>

              {/* Graphical Visualization of Sprint Week */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-[11px] text-[#475569]">
                  <span className="font-semibold">Weekly Execution Velocity</span>
                  <span className="font-mono font-bold text-[#165B33]">
                    {weeklyMetrics.completedCount} / {weeklyMetrics.plannedCount} Tasks Delivered
                  </span>
                </div>
                <div className="w-full bg-[#E2E8F0] h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-[#165B33] h-full rounded-full transition-all duration-500"
                    style={{ width: `${weeklyMetrics.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Day-by-Day Sprint Cadence */}
              <div className="grid grid-cols-7 gap-1 text-center pt-1 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, idx) => {
                  const isFocusDay = day === "Thu" || day === "Sat";
                  return (
                    <div
                      key={day}
                      className={`p-2 rounded-lg border text-[11px] ${
                        isFocusDay
                          ? "bg-[#F0FDF4] border-[#86EFAC] font-bold text-[#165B33]"
                          : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]"
                      }`}
                    >
                      <div className="text-[10px] uppercase">{day}</div>
                      <div className="text-[12px] mt-0.5">{idx + 1}</div>
                      {isFocusDay && (
                        <div className="text-[9px] font-semibold text-[#165B33]">
                          {day === "Thu" ? "60m" : "3.5h"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Weekly Target */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[12px]">
              <span className="font-bold text-[#0F172A]">Upcoming Weekly Target: </span>
              <span className="text-[#475569]">
                Finalize Cart Order API atomic rollback transactions & relational schema indexing
                before Saturday 12:00 PM milestone review.
              </span>
            </div>
          </div>

          {/* SECTION 6: NEXT RECOMMENDED ACTION */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-[#FEF3C7] text-[#D97706]">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      AI Priority Recommendation
                    </div>
                    <h3 className="text-[16px] font-bold text-[#0F172A]">
                      Next Recommended Action
                    </h3>
                  </div>
                </div>

                {nextRecommendedTask && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      nextRecommendedTask.priority === "high"
                        ? "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                        : "bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]"
                    }`}
                  >
                    {nextRecommendedTask.priority} Priority
                  </span>
                )}
              </div>

              {nextRecommendedTask ? (
                <div className="space-y-4">
                  {/* Task Card Box */}
                  <div className="p-4 rounded-xl bg-[#FAFDFB] border border-[#B7E4C7]">
                    <div className="flex items-center space-x-2 text-[11px] text-[#165B33] font-bold uppercase mb-1">
                      <span>Stage {getTaskStageId(nextRecommendedTask)}:</span>
                      <span>
                        {
                          MILESTONE_STAGES.find((s) => s.id === getTaskStageId(nextRecommendedTask))
                            ?.title
                        }
                      </span>
                    </div>

                    <h4 className="text-[15px] font-extrabold text-[#0F172A]">
                      {nextRecommendedTask.title}
                    </h4>

                    <p className="text-[13px] text-[#475569] mt-1.5 leading-relaxed">
                      {nextRecommendedTask.description ||
                        "Core technical deliverable required for proceeding to next milestone stage."}
                    </p>
                  </div>

                  {/* Context: Why It Matters & Estimated Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                      <span className="font-bold text-[#0F172A] block mb-0.5">
                        Why It Matters:
                      </span>
                      <span className="text-[#475569]">
                        Critical prerequisite deliverable. Unblocks transaction integrity and protects
                        escrow state prior to Telebirr webhook connection.
                      </span>
                    </div>

                    <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                      <span className="font-bold text-[#0F172A] block mb-0.5">
                        Estimated Effort:
                      </span>
                      <span className="text-[#475569] font-medium">
                        3.5 Hours (Saturday Deep Focus Session)
                      </span>
                      <div className="text-[11px] text-[#94A3B8] mt-1 font-mono">
                        Target: {nextRecommendedTask.target_date || "2026-11-10"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-[#64748B]">
                  <CheckCircle2 size={36} className="text-[#165B33] mx-auto mb-2" />
                  <p className="font-bold text-[14px]">All Tasks Completed!</p>
                  <p className="text-[12px]">Congratulations. Suku Marketplace is ready for deployment.</p>
                </div>
              )}
            </div>

            {/* Action Button */}
            {nextRecommendedTask && (
              <div className="pt-4 flex items-center justify-between border-t border-[#F1F5F9] mt-4">
                <span className="text-[12px] text-[#64748B]">
                  Current status:{" "}
                  <strong className="text-[#0F172A] capitalize">
                    {nextRecommendedTask.status.replace("_", " ")}
                  </strong>
                </span>

                <div className="flex items-center gap-2">
                  {nextRecommendedTask.status !== "in_progress" && (
                    <button
                      onClick={() => handleSetStatus(nextRecommendedTask.id, "in_progress")}
                      className="inline-flex items-center px-3 py-1.5 bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE] rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      <Play size={13} className="mr-1" />
                      Mark In Progress
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleTaskStatus(nextRecommendedTask)}
                    className="inline-flex items-center px-3.5 py-1.5 bg-[#165B33] text-white hover:bg-[#1B4332] rounded-lg text-[12px] font-semibold transition-colors shadow-sm"
                  >
                    <CheckSquare size={14} className="mr-1.5" />
                    Complete Deliverable
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 4: DEVELOPMENT TASK BOARD                         */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                Execution Tracker
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A]">
                Development Task Board ({filteredTasks.length} Deliverables)
              </h2>
            </div>

            {/* Sorting & Filter Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center space-x-1.5 text-[12px] text-[#64748B]">
                <ArrowUpDown size={13} />
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[12px] font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="deadline">Due Date (Earliest)</option>
                  <option value="priority">Priority (High to Low)</option>
                  <option value="status">Status (Active First)</option>
                </select>
              </div>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="inline-flex items-center px-3 py-1.5 bg-[#165B33] hover:bg-[#1B4332] text-white rounded-lg text-[12px] font-semibold transition-colors shadow-sm"
              >
                <Plus size={14} className="mr-1" />
                Add Deliverable
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Section 4 Requirement) */}
          <div className="flex flex-wrap items-center gap-1.5 mb-5 pb-3 border-b border-[#F1F5F9]">
            {[
              { key: "all", label: "All Tasks" },
              { key: "backend", label: "Backend & APIs" },
              { key: "ui_ux", label: "UI/UX & Mobile" },
              { key: "product", label: "Product & Database" },
              { key: "security", label: "Security & Authentication" },
              { key: "payment", label: "Payment Integration" },
              { key: "marketing", label: "Merchant Acquisition" },
              { key: "testing_deployment", label: "Testing & Deployment" },
            ].map((tab) => {
              const isActive = selectedArea === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedArea(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    isActive
                      ? "bg-[#165B33] text-white shadow-sm"
                      : "bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] border border-[#E2E8F0]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active Milestone Filter Alert Banner if active */}
          {selectedMilestoneId !== null && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between text-[12px]">
              <div className="flex items-center space-x-2 text-[#165B33] font-semibold">
                <Filter size={13} />
                <span>
                  Filtering by Milestone: <strong>Stage {selectedMilestoneId} — {activeStage?.title}</strong>
                </span>
              </div>
              <button
                onClick={() => setSelectedMilestoneId(null)}
                className="text-[11px] font-bold text-[#165B33] hover:underline"
              >
                Show All Tasks
              </button>
            </div>
          )}

          {/* Task Board List */}
          {loading ? (
            <div className="py-12 text-center text-[#64748B] text-[13px]">
              Loading Suku engineering tasks from database...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-[#64748B] text-[13px] bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
              <p className="font-semibold text-[#0F172A]">No tasks found for this filter.</p>
              <p className="text-[12px] text-[#64748B] mt-1">
                Try selecting "All Tasks" or clearing milestone filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((t) => {
                const isDone = t.status === "completed";
                const isInProgress = t.status === "in_progress";
                const isOverdue = !isDone && t.target_date && t.target_date < todayStr;
                const stageId = getTaskStageId(t);
                const stageObj = MILESTONE_STAGES.find((s) => s.id === stageId);

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDone
                        ? "bg-[#FAFDFB] border-[#B7E4C7]"
                        : isInProgress
                        ? "bg-[#F0F7FF] border-[#BFDBFE]"
                        : isOverdue
                        ? "bg-[#FEF2F2] border-[#FECACA]"
                        : "bg-[#FBFBFA] border-[#E2E8F0] hover:border-[#CBD5E1]"
                    }`}
                  >
                    {/* Left: Checkbox + Title + Description + Badges */}
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <button
                        onClick={() => handleToggleTaskStatus(t)}
                        title={isDone ? "Mark as in progress" : "Mark as completed"}
                        className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                          isDone
                            ? "bg-[#165B33] border-[#165B33] text-white shadow-sm"
                            : "border-[#94A3B8] bg-white text-transparent hover:border-[#165B33]"
                        }`}
                      >
                        <Check size={13} className={isDone ? "opacity-100" : "opacity-0"} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Related Milestone Badge */}
                          <span className="text-[10px] font-bold text-[#165B33] px-2 py-0.5 bg-[#E8F5E9] rounded-md border border-[#C8E6C9]">
                            Stage {stageId}: {stageObj?.title || t.area}
                          </span>

                          {/* Development Category Badge */}
                          <span className="text-[10px] uppercase font-bold text-[#475569] px-2 py-0.5 bg-[#F1F5F9] rounded-md border border-[#E2E8F0]">
                            {t.area.replace("_", " ")}
                          </span>

                          {/* Status Style Requirement (Green: Completed, Blue: In Progress, Neutral: Upcoming, Orange/Red: Overdue) */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${
                              isDone
                                ? "bg-[#E8F5E9] text-[#165B33] border-[#C8E6C9]"
                                : isInProgress
                                ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
                                : isOverdue
                                ? "bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]"
                                : "bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]"
                            }`}
                          >
                            {isOverdue ? "Overdue" : t.status.replace("_", " ")}
                          </span>

                          {/* Priority Badge */}
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              t.priority === "high"
                                ? "bg-[#FEF3C7] text-[#92400E]"
                                : t.priority === "medium"
                                ? "bg-[#F3F4F6] text-[#4B5563]"
                                : "bg-[#F8FAFC] text-[#94A3B8]"
                            }`}
                          >
                            {t.priority.toUpperCase()}
                          </span>
                        </div>

                        <h4
                          className={`text-[13px] font-bold leading-snug ${
                            isDone ? "text-[#64748B] line-through" : "text-[#0F172A]"
                          }`}
                        >
                          {t.title}
                        </h4>

                        {t.description && (
                          <p className="text-[12px] text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Due Date & Actions */}
                    <div className="flex items-center space-x-3 flex-shrink-0 self-end sm:self-center pl-8 sm:pl-0">
                      <div className="text-right">
                        <div
                          className={`flex items-center space-x-1 font-mono text-[11px] ${
                            isOverdue ? "text-[#DC2626] font-bold" : "text-[#64748B]"
                          }`}
                        >
                          <Calendar size={12} />
                          <span>{t.target_date || "No date"}</span>
                        </div>
                        {isOverdue && (
                          <div className="text-[10px] font-bold text-[#DC2626]">
                            Overdue deliverable
                          </div>
                        )}
                      </div>

                      {/* Status select dropdown */}
                      <select
                        value={t.status}
                        onChange={(e) => handleSetStatus(t.id, e.target.value as any)}
                        className="text-[11px] font-semibold bg-white border border-[#CBD5E1] rounded-lg px-2 py-1 text-[#334155] focus:outline-none"
                      >
                        <option value="backlog">Upcoming</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="text-[#94A3B8] hover:text-[#DC2626] p-1.5 rounded-lg hover:bg-white transition-colors"
                        title="Delete deliverable"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* SECTION 7: RECENT ACTIVITY TIMELINE                       */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                Audit Trail & History
              </div>
              <h3 className="text-[16px] font-bold text-[#0F172A]">
                Recent Engineering Activity Timeline
              </h3>
            </div>
            <span className="text-[11px] text-[#64748B]">Updated live from repository</span>
          </div>

          <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#E2E8F0] pl-2">
            {recentActivities.map((act) => (
              <div key={act.id} className="relative flex items-center space-x-3 pl-6">
                <span
                  className={`absolute left-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white flex items-center justify-center ${
                    act.type === "completed"
                      ? "border-[#165B33] bg-[#165B33]"
                      : act.type === "in_progress"
                      ? "border-[#2563EB] bg-[#2563EB]"
                      : "border-[#94A3B8]"
                  }`}
                />

                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between text-[12px] bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        act.type === "completed"
                          ? "bg-[#E8F5E9] text-[#165B33]"
                          : act.type === "in_progress"
                          ? "bg-[#EFF6FF] text-[#2563EB]"
                          : "bg-[#F1F5F9] text-[#64748B]"
                      }`}
                    >
                      {act.type.replace("_", " ")}
                    </span>
                    <span className="font-semibold text-[#0F172A]">{act.title}</span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] font-mono mt-1 sm:mt-0">
                    {act.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: ADD SUKU TASK                                      */}
        {/* ========================================================= */}
        <Modal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          title="Add Suku Marketplace Deliverable"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Implement Chapa & Telebirr webhook handlers"
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Connected Milestone Stage *
                </label>
                <select
                  value={taskStageId}
                  onChange={(e) => setTaskStageId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  {MILESTONE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      Stage {s.id}: {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Development Category *
                </label>
                <select
                  value={taskArea}
                  onChange={(e) => setTaskArea(e.target.value as any)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="backend">Backend & APIs</option>
                  <option value="ui_ux">UI/UX & Mobile</option>
                  <option value="product">Product & Database</option>
                  <option value="security">Security & Authentication</option>
                  <option value="payment">Payment Integration</option>
                  <option value="marketing">Merchant Acquisition</option>
                  <option value="testing">Testing & QA</option>
                  <option value="deployment">Deployment & CI/CD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                  Target Completion Date *
                </label>
                <input
                  type="date"
                  required
                  value={taskTargetDate}
                  onChange={(e) => setTaskTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Description & Acceptance Criteria
              </label>
              <textarea
                rows={3}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Include key technical specifications, API schemas, or test criteria..."
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#165B33]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="px-4 py-2 text-[13px] text-[#64748B] hover:bg-[#F1F5F9] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#165B33] hover:bg-[#1B4332] rounded-lg transition-colors shadow-sm"
              >
                {submitting ? "Adding..." : "Add Deliverable"}
              </button>
            </div>
          </form>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: PROJECT SETTINGS (Section 1 Requirement)          */}
        {/* ========================================================= */}
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="Suku Project Settings & Parameters"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Target MVP Launch Date
              </label>
              <input
                type="date"
                value={targetLaunchDate}
                onChange={(e) => setTargetLaunchDate(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
              <span className="text-[11px] text-[#64748B] mt-1 block">
                Official target for merchant pilot launch in Addis Ababa.
              </span>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Staging Environment URL
              </label>
              <input
                type="url"
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Active Git Branch
              </label>
              <input
                type="text"
                value={gitBranch}
                onChange={(e) => setGitBranch(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#0F172A] mb-1">
                Pacing & Focus Schedule
              </label>
              <textarea
                rows={2}
                value={pacingNotes}
                onChange={(e) => setPacingNotes(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
              />
            </div>

            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[12px] text-[#165B33]">
              <strong>Storage: </strong>All project deliverables and milestones are persisted to
              SQLite database (`suku_tasks` table) and synchronize automatically.
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-[13px] font-semibold text-white bg-[#165B33] hover:bg-[#1B4332] rounded-lg transition-colors shadow-sm"
              >
                Save & Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
