"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import { PrayerTimer } from "@/components/PrayerTimer";
import { formatTo12H } from "@/lib/formatTime";
import {
  Sun,
  Moon,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Sparkles,
  Wind,
  Target,
  Hourglass,
  TrendingUp,
  ListTodo,
  Check,
  Sprout,
  Activity,
  Plus,
  Timer,
  Zap,
  Star,
  Edit3,
  StickyNote,
} from "lucide-react";
import { DailyTask, DailyReflection } from "@/lib/types";
import { useTimeEngine } from "@/hooks/useTimeEngine";

export default function MyDayPage() {
  const {
    timezone,
    timezoneInfo,
    timeState,
    journeyInfo,
    getTaskStatus,
    summarizeTasks,
    getActionGuidance,
  } = useTimeEngine();

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-02");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);

  // Daily Priorities and Notes/Edit Modal State
  const [priorityWarning, setPriorityWarning] = useState<string | null>(null);
  const [editTaskModal, setEditTaskModal] = useState<DailyTask | null>(null);
  const [taskNotesModal, setTaskNotesModal] = useState<DailyTask | null>(null);
  const [taskNotesContent, setTaskNotesContent] = useState("");

  // Sleep Advisory Dismiss
  const [isSleepDismissed, setIsSleepDismissed] = useState(false);

  // Section Accordion States (Morning expanded by default as in screenshot)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    morning: true,
    daytime: false,
    evening: false,
    night: false,
  });

  // Prayer Timer Modal state
  const [prayerModalOpen, setPrayerModalOpen] = useState(false);
  const [activePrayerType, setActivePrayerType] = useState<"morning" | "night">("morning");

  // Breathing Box Exercise state
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [breathTimer, setBreathTimer] = useState(120); // 2 minutes countdown
  const [phaseSeconds, setPhaseSeconds] = useState(4); // 4s in, 4s hold, 4s out

  // Task Note / Reschedule state
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<DailyTask | null>(null);
  const [rescheduleTask, setRescheduleTask] = useState<DailyTask | null>(null);
  const [skipTaskModal, setSkipTaskModal] = useState<DailyTask | null>(null);
  const [skipReasonText, setSkipReasonText] = useState("");
  const [skipping, setSkipping] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  // Task Timer State (Start/Pause time tracking)
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Add Personal Task Modal State
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState("development");
  const [newTaskStartTime, setNewTaskStartTime] = useState("18:30");
  const [newTaskEndTime, setNewTaskEndTime] = useState("19:30");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium");
  const [newTaskInstructions, setNewTaskInstructions] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Fetch Day Data with timezone awareness and actual focus minutes
  const fetchDayData = async (dateStr?: string) => {
    setLoading(true);
    const date = dateStr || selectedDate || timeState.dateStr || "2026-11-02";
    setSelectedDate(date);
    try {
      const [resTasks, resFocus] = await Promise.all([
        fetch(`/api/tasks?date=${date}&timezone=${encodeURIComponent(timezone)}`),
        fetch(`/api/focus`),
      ]);
      if (resTasks.ok) {
        const data = await resTasks.json();
        setTasks(data.tasks || []);
      }
      if (resFocus.ok) {
        const fData = await resFocus.json();
        setTodayFocusMinutes(fData.todayMinutes || 0);
      }
    } catch (e) {
      console.error("Error loading tasks:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDayData();
  }, [timeState.dateStr, timezone]);

  useEffect(() => {
    const handleUpdate = () => fetchDayData(selectedDate);
    window.addEventListener("life_os_task_updated", handleUpdate);
    return () => window.removeEventListener("life_os_task_updated", handleUpdate);
  }, [selectedDate, timezone]);

  // Launch Focus Mode for a task
  const handleLaunchFocus = (task: DailyTask) => {
    window.dispatchEvent(
      new CustomEvent("open_focus_mode", {
        detail: { taskId: task.id, taskTitle: task.title },
      })
    );
  };

  // Toggle Daily Priority (Max 3)
  const handleToggleDailyPriority = async (task: DailyTask) => {
    const currentCount = tasks.filter((t) => t.is_daily_priority === 1).length;
    const isEnabling = !task.is_daily_priority;

    if (isEnabling && currentCount >= 3) {
      setPriorityWarning("Maximum 3 daily priorities allowed. Unstar an existing priority first.");
      setTimeout(() => setPriorityWarning(null), 4000);
      return;
    }

    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          is_daily_priority: isEnabling ? 1 : 0,
        }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, is_daily_priority: isEnabling ? 1 : 0 } : t))
        );
        window.dispatchEvent(new Event("life_os_task_updated"));
      }
    } catch (err) {
      console.error("Failed to toggle daily priority:", err);
    }
  };

  // Save Task Notes
  const handleSaveTaskNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNotesModal) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskNotesModal.id,
          instructions: taskNotesContent,
        }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskNotesModal.id ? { ...t, instructions: taskNotesContent } : t))
        );
        setTaskNotesModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Edit Task
  const handleSaveEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTaskModal) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editTaskModal.id,
          title: editTaskModal.title,
          start_time: editTaskModal.start_time,
          end_time: editTaskModal.end_time,
          category: editTaskModal.category,
          priority: editTaskModal.priority,
          instructions: editTaskModal.instructions,
        }),
      });
      if (res.ok) {
        await fetchDayData(selectedDate);
        setEditTaskModal(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSkip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skipTaskModal) return;
    setSkipping(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: skipTaskModal.id,
          action: "skip",
          reason: skipReasonText || "User skipped task",
        }),
      });

      if (res.ok) {
        setSkipTaskModal(null);
        setSkipReasonText("");
        await fetchDayData(selectedDate);
        window.dispatchEvent(new CustomEvent("life_os_task_updated"));
      }
    } catch (e) {
      console.error("Error skipping task:", e);
    } finally {
      setSkipping(false);
    }
  };

  // Breathing cycle interval
  useEffect(() => {
    let interval: any = null;
    if (isBreathing && breathTimer > 0) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          if (prev <= 1) {
            setIsBreathing(false);
            return 120;
          }
          return prev - 1;
        });

        setPhaseSeconds((prev) => {
          if (prev <= 1) {
            // Cycle: inhale -> hold -> exhale -> inhale
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
  }, [isBreathing, breathTimer]);

  // Toggle single task completed
  const handleToggleTask = async (task: DailyTask) => {
    const newStatus = task.status === "completed" ? "upcoming" : "completed";
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          status: newStatus,
        }),
      });

      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Reschedule save handler
  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTask) return;
    setRescheduling(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleTask.id,
          action: "reschedule",
          newDate,
          newStartTime,
          newEndTime,
          reason: rescheduleReason,
        }),
      });

      if (res.ok) {
        setRescheduleTask(null);
        await fetchDayData(selectedDate);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRescheduling(false);
    }
  };

  // Live Timer Ticker
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const toggleTaskTimer = async (task: DailyTask) => {
    if (activeTimerTaskId === task.id && isTimerRunning) {
      setIsTimerRunning(false);
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          action: "update_timer",
          accumulatedSeconds: timerSeconds,
          actualDurationMinutes: Math.round(timerSeconds / 60),
          isRunning: false,
        }),
      });
    } else {
      setActiveTimerTaskId(task.id);
      setIsTimerRunning(true);
      await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: task.id,
          action: "update_timer",
          accumulatedSeconds: timerSeconds,
          actualDurationMinutes: Math.round(timerSeconds / 60),
          isRunning: true,
        }),
      });
    }
  };

  const handleQuickComplete = async (taskId: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        if (activeTimerTaskId === taskId) {
          setIsTimerRunning(false);
          setActiveTimerTaskId(null);
        }
        await fetchDayData(selectedDate);
        window.dispatchEvent(new CustomEvent("life_os_task_updated"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoSuggestSlot = async () => {
    if (!rescheduleTask) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: rescheduleTask.id,
          action: "suggest_slot",
          durationMinutes: rescheduleTask.duration_minutes || 45,
          preferredDate: selectedDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.slot) {
          setNewDate(data.slot.date);
          setNewStartTime(data.slot.start_time);
          setNewEndTime(data.slot.end_time);
          setRescheduleReason(data.slot.reason);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePersonalTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const [sh, sm] = newTaskStartTime.split(":").map(Number);
      const [eh, em] = newTaskEndTime.split(":").map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          category: newTaskCategory,
          date: selectedDate,
          start_time: newTaskStartTime,
          end_time: newTaskEndTime,
          duration_minutes: dur,
          priority: newTaskPriority,
          instructions: newTaskInstructions || "Personal commitment added directly to daily schedule.",
          status: "upcoming",
          is_protected: 0,
        }),
      });

      if (res.ok) {
        setIsAddTaskModalOpen(false);
        setNewTaskTitle("");
        setNewTaskInstructions("");
        await fetchDayData(selectedDate);
        window.dispatchEvent(new CustomEvent("life_os_task_updated"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Section grouping logic
  const getTaskSection = (task: DailyTask): "morning" | "daytime" | "evening" | "night" => {
    const time = task.start_time;
    if (time >= "04:00" && time < "07:00") return "morning";
    if (time >= "07:00" && time < "18:00") return "daytime";
    if (time >= "18:00" && time < "21:15") return "evening";
    return "night";
  };

  // Grouped tasks
  const morningTasks = tasks.filter((t) => getTaskSection(t) === "morning");
  const daytimeTasks = tasks.filter((t) => getTaskSection(t) === "daytime");
  const eveningTasks = tasks.filter((t) => getTaskSection(t) === "evening");
  const nightTasks = tasks.filter((t) => getTaskSection(t) === "night");

  // Fallback defaults matching screenshot if tasks are loading
  const morningList = morningTasks.length > 0 ? morningTasks : [
    {
      id: "t_m1",
      user_id: "user_kidus_01",
      title: "Morning Prayer",
      instructions: "Gratitude and spiritual preparation.",
      category: "spiritual",
      date: "2026-11-01",
      start_time: "04:00",
      end_time: "04:30",
      duration_minutes: 30,
      priority: "high",
      status: "upcoming" as const,
      is_protected: 1,
    },
    {
      id: "t_m2",
      user_id: "user_kidus_01",
      title: "Exercise",
      instructions: "Workout, mobility and stretching.",
      category: "health",
      date: "2026-11-01",
      start_time: "04:30",
      end_time: "05:00",
      duration_minutes: 30,
      priority: "medium",
      status: "upcoming" as const,
      is_protected: 0,
    },
    {
      id: "t_m3",
      user_id: "user_kidus_01",
      title: "Shower & Breakfast",
      instructions: "Personal hygiene and healthy breakfast.",
      category: "health",
      date: "2026-11-01",
      start_time: "05:00",
      end_time: "05:30",
      duration_minutes: 30,
      priority: "medium",
      status: "upcoming" as const,
      is_protected: 0,
    },
    {
      id: "t_m4",
      user_id: "user_kidus_01",
      title: "English Learning",
      instructions: "Speaking, listening and vocabulary.",
      category: "learning",
      date: "2026-11-01",
      start_time: "05:30",
      end_time: "06:00",
      duration_minutes: 30,
      priority: "medium",
      status: "upcoming" as const,
      is_protected: 0,
    },
  ];

  // Image lookup for each task
  const getTaskImage = (title: string, category?: string) => {
    const text = (title + " " + (category || "")).toLowerCase();
    if (text.includes("prayer") || text.includes("spiritual")) return "/journey/prayer_spiritual.jpg";
    if (text.includes("exercise") || text.includes("workout") || text.includes("mobility")) return "/journey/fitness_health.jpg";
    if (text.includes("breakfast") || text.includes("shower") || text.includes("hygiene")) return "/journey/foundation_planner.jpg";
    if (text.includes("english") || text.includes("vocab") || text.includes("speak")) return "/journey/english_mastery.jpg";
    if (text.includes("code") || text.includes("study") || text.includes("next.js")) return "/journey/coding_mastery.jpg";
    if (text.includes("employ") || text.includes("work") || text.includes("commute")) return "/journey/workspace.jpg";
    if (text.includes("family") || text.includes("dinner")) return "/journey/family_harmony.jpg";
    if (text.includes("suku") || text.includes("marketplace")) return "/journey/suku_mvp.jpg";
    if (text.includes("financ") || text.includes("expense") || text.includes("saving")) return "/journey/financial_growth.jpg";
    return "/journey/foundation_planner.jpg";
  };

  // Calculations (Zero fabrication)
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const overdueTasksCount = tasks.filter((t) => getTaskStatus(t) === "overdue").length;
  const remainingTasksCount = tasks.filter((t) => t.status !== "completed" && t.status !== "skipped").length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Executive Action Guidance
  const actionGuidance = useMemo(() => {
    return getActionGuidance(tasks);
  }, [tasks, getActionGuidance, timeState.time24, timeState.dateStr]);

  // Toggle all sections
  const allCollapsed = Object.values(expandedSections).every((v) => !v);
  const toggleCollapseAll = () => {
    const nextState = allCollapsed;
    setExpandedSections({
      morning: nextState,
      daytime: nextState,
      evening: nextState,
      night: nextState,
    });
  };

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sec]: !prev[sec],
    }));
  };

  // Intelligent Real-Time Task Row Renderer
  const renderTaskRow = (task: DailyTask) => {
    const status = getTaskStatus(task);
    const isCompleted = status === "completed";
    const isInProgress = status === "in_progress";
    const isOverdue = status === "overdue";
    const isMissed = status === "missed";
    const isSkipped = status === "skipped";

    return (
      <div
        key={task.id}
        className={`relative flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all group ${
          isInProgress
            ? "bg-[#F0FDF4] border-[#86EFAC] shadow-xs"
            : isOverdue
            ? "bg-[#FFFBEB] border-[#FDE68A]"
            : isMissed
            ? "bg-[#FEF2F2]/60 border-[#FECACA]"
            : isCompleted
            ? "bg-[#F9FBFA] border-[#E5EBE7]"
            : "bg-white hover:bg-[#F9FBFA] border-[#EAEFEA]"
        }`}
      >
        {/* Node / Checkbox */}
        <button
          type="button"
          onClick={() => handleToggleTask(task)}
          className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all flex-shrink-0 ${
            isCompleted
              ? "bg-[#165B33] border-[#165B33] text-white"
              : isInProgress
              ? "border-[#165B33] bg-white ring-2 ring-[#86EFAC]"
              : "border-[#C5D6CC] bg-white hover:border-[#165B33]"
          }`}
          title={isCompleted ? "Mark incomplete" : "Mark completed"}
        >
          {isCompleted && <Check size={13} strokeWidth={3} />}
        </button>

        {/* Left: Thumbnail + Time + Title */}
        <div className="flex items-center space-x-3.5 min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9]">
            <Image
              src={getTaskImage(task.title, task.category)}
              alt={task.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
            />
          </div>

          <span className="font-mono text-[12px] font-bold text-[#486053] w-24 sm:w-28 flex-shrink-0">
            {task.start_time} – {task.end_time}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[13.5px] font-bold truncate ${
                  isCompleted ? "text-[#6C8176] line-through" : "text-[#14211A]"
                }`}
              >
                {task.title}
              </span>
              {task.is_protected ? (
                <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-[#BBF7D0]">
                  Protected
                </span>
              ) : null}
            </div>
            {task.instructions && (
              <span className="text-[12px] text-[#5A6E63] font-normal truncate block mt-0.5">
                • {task.instructions}
              </span>
            )}
            {task.completed_at && (
              <span className="text-[10.5px] text-[#16A34A] font-semibold block mt-0.5">
                Completed at {new Date(task.completed_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </span>
            )}
          </div>
        </div>

        {/* Right: Live Status Badge + Action Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Status Badge */}
          {isCompleted && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] flex items-center gap-1">
              <CheckCircle2 size={12} />
              <span>Completed</span>
            </span>
          )}
          {isInProgress && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1.5 animate-pulse">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>In Progress</span>
            </span>
          )}
          {isOverdue && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] flex items-center gap-1 animate-pulse">
              <AlertTriangle size={12} className="text-[#D97706]" />
              <span>Overdue</span>
            </span>
          )}
          {isMissed && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-center gap-1">
              <X size={12} className="text-[#DC2626]" />
              <span>Missed</span>
            </span>
          )}
          {isSkipped && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]" title={task.skip_reason || "Skipped"}>
              Skipped
            </span>
          )}
          {status === "upcoming" && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]">
              Upcoming
            </span>
          )}

          {/* Launch Focus Mode */}
          {!isCompleted && !isSkipped && (
            <button
              type="button"
              onClick={() => handleLaunchFocus(task)}
              className="p-1.5 text-[#165B33] hover:bg-[#EBF5EE] rounded-lg transition-colors cursor-pointer"
              title="Launch Distraction-Free Focus Mode"
            >
              <Sparkles size={14} />
            </button>
          )}

          {/* Daily Priority Star */}
          <button
            type="button"
            onClick={() => handleToggleDailyPriority(task)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              task.is_daily_priority
                ? "text-amber-500 hover:bg-amber-50"
                : "text-[#B7C7BD] hover:text-amber-500 hover:bg-amber-50"
            }`}
            title={task.is_daily_priority ? "Remove from Top 3 Daily Priorities" : "Star as Daily Priority (Max 3)"}
          >
            <Star size={14} fill={task.is_daily_priority ? "currentColor" : "none"} />
          </button>

          {/* Add / View Note */}
          <button
            type="button"
            onClick={() => {
              setTaskNotesModal(task);
              setTaskNotesContent(task.instructions || "");
            }}
            className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Add execution note / instructions"
          >
            <FileText size={14} />
          </button>

          {/* Edit Task */}
          <button
            type="button"
            onClick={() => setEditTaskModal({ ...task })}
            className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
            title="Edit task parameters"
          >
            <Edit3 size={14} />
          </button>

          {/* Reschedule Button */}
          {!isCompleted && !isSkipped && (
            <button
              type="button"
              onClick={() => {
                setRescheduleTask(task);
                setNewDate(task.date);
                setNewStartTime(task.start_time);
                setNewEndTime(task.end_time);
                setRescheduleReason("");
              }}
              className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F4F6] rounded-lg transition-colors cursor-pointer"
              title="Reschedule task"
            >
              <Clock size={14} />
            </button>
          )}

          {/* Skip Button */}
          {!isCompleted && !isSkipped && (
            <button
              type="button"
              onClick={() => {
                setSkipTaskModal(task);
                setSkipReasonText("");
              }}
              className="p-1.5 text-[#6C8176] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 rounded-lg transition-colors cursor-pointer"
              title="Skip task"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. SLEEP DURATION ADVISORY BANNER (Exact screenshot amber alert)
            ======================================================== */}
        {!isSleepDismissed && (
          <div className="bg-[#FEF7EC] border border-[#FDE68A] rounded-2xl p-3.5 sm:px-5 sm:py-3.5 text-[#92400E] shadow-2xs transition-all relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-1 bg-[#FEF3C7] rounded-lg text-[#B45309] flex-shrink-0 mt-0.5">
                  <AlertTriangle size={17} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-[13.5px] font-bold text-[#78350F]">
                      Sleep Duration Advisory (6 hrs / night)
                    </h4>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-[#FDE68A] text-[#92400E] rounded-md tracking-wider">
                      INSUFFICIENT RECOVERY
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[#92400E] leading-relaxed">
                    Your fixed preferences set bedtime at 22:00 and wake-up at 04:00, resulting in exactly 6 hours of sleep. Chronic sub-7h sleep impairs cognitive endurance.
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-2 text-[11.5px]">
                    <span className="text-[#78350F] font-bold">Recommended:</span>
                    <button
                      type="button"
                      className="px-2.5 py-0.5 bg-white/90 hover:bg-white rounded-full border border-amber-300 text-[#92400E] font-medium transition-colors shadow-2xs"
                    >
                      Shift bed to 21:00 (7.0h)
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-0.5 bg-white/90 hover:bg-white rounded-full border border-amber-300 text-[#92400E] font-medium transition-colors shadow-2xs"
                    >
                      Or adjust wake to 05:00 (7.0h)
                    </button>
                    <Link
                      href="/settings#schedule"
                      className="inline-flex items-center font-bold text-[#B45309] hover:text-[#78350F] underline ml-1.5"
                    >
                      <span>Customize in Settings</span>
                      <ArrowRight size={12} className="ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSleepDismissed(true)}
                className="text-[#B45309] hover:text-[#78350F] p-1 rounded-md transition-colors"
                title="Dismiss advisory"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            2. PANORAMIC MOUNTAIN HERO BANNER (Exact screenshot design)
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
              <div className="w-11 h-11 rounded-2xl bg-white/95 border border-[#B7E4C7] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  My Day — {selectedDate}
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-[#284534] font-medium leading-relaxed">
                  Follow the schedule with excellence. Do not spend time debating what to do , execute the assigned blocks.
                </p>
              </div>
            </div>

            {/* Right Buttons: Date Picker + Morning/Night Prayer Pills */}
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {/* Date Button with inline picker popover */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="bg-white/95 hover:bg-white text-[#14211A] text-[12.5px] font-bold px-3.5 py-2 rounded-xl border border-[#D5E2D9] shadow-2xs flex items-center gap-2 transition-colors"
                >
                  <span className="font-mono">{selectedDate}</span>
                  <CalendarIcon size={14} className="text-[#6C8176]" />
                </button>
                {showDatePicker && (
                  <div className="absolute right-0 top-12 bg-white rounded-xl shadow-lg border border-[#D5E2D9] p-3 z-30">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        fetchDayData(e.target.value);
                        setShowDatePicker(false);
                      }}
                      className="text-[13px] font-bold border border-[#CBD7CE] rounded-lg p-1.5 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Morning Prayer Pill */}
              <button
                type="button"
                onClick={() => {
                  setActivePrayerType("morning");
                  setPrayerModalOpen(true);
                }}
                className="bg-white/95 hover:bg-white text-[#165B33] text-[12px] font-bold px-3.5 py-2 rounded-xl border border-[#B7E4C7] shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Sprout size={14} className="text-[#165B33]" />
                <span>Morning Prayer (4:00 AM)</span>
              </button>

              {/* Night Prayer Pill */}
              <button
                type="button"
                onClick={() => {
                  setActivePrayerType("night");
                  setPrayerModalOpen(true);
                }}
                className="bg-white/95 hover:bg-white text-[#165B33] text-[12px] font-bold px-3.5 py-2 rounded-xl border border-[#B7E4C7] shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Moon size={14} className="text-[#165B33]" />
                <span>Night Prayer (9:15 PM)</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            EXECUTIVE ASSISTANT BAR (Section 2 Requirement)
            ======================================================== */}
        <div className="bg-white rounded-2xl border border-[#D5E2D9] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#C8E6C9]">
              <Sun size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[17px] font-extrabold text-[#112318] tracking-tight">
                  {timeState.greeting}, Kidus
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] text-[10px] font-extrabold font-mono">
                  LIVE CLOCK
                </span>
              </div>
              <p className="text-[12.5px] text-[#526B5D] font-medium flex items-center gap-2 mt-0.5">
                <span>{timeState.displayDateStr}</span>
                <span>•</span>
                <span className="font-mono font-bold text-[#165B33]">{timeState.displayTimeStr}</span>
                <span>•</span>
                <span className="text-[#789082] text-[11.5px]">{timezoneInfo.iana}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Completion Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center gap-2 text-[12px]">
              <CheckCircle2 size={15} className="text-[#16A34A]" />
              <span className="font-extrabold text-[#14211A] font-mono">{progressPercent}%</span>
              <span className="text-[#6C8176]">Completed ({completedTasksCount}/{totalTasksCount})</span>
            </div>

            {/* Remaining Tasks */}
            <div className="px-3 py-1.5 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center gap-1.5 text-[12px]">
              <Clock size={14} className="text-[#6C8176]" />
              <span className="font-bold text-[#14211A]">{remainingTasksCount}</span>
              <span className="text-[#6C8176]">remaining</span>
            </div>

            {/* Overdue Badge if any */}
            {overdueTasksCount > 0 && (
              <div className="px-3 py-1.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] flex items-center gap-1.5 text-[12px] font-bold animate-pulse">
                <AlertTriangle size={14} className="text-[#D97706]" />
                <span>{overdueTasksCount} overdue</span>
              </div>
            )}

            {/* + Add Personal Task Button */}
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#165B33] hover:bg-[#124B2C] text-white text-[12px] font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={14} />
              <span>Add Personal Task</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            PROMINENT "WHAT SHOULD I DO NOW?" EXECUTIVE CARD
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#1B5E39] bg-gradient-to-br from-[#124B2C] via-[#165B33] to-[#0A2E1A] text-white p-5 sm:p-7">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Header with Live Status Tag */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/15">
              <div className="flex items-center space-x-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400"></span>
                </span>
                <h3 className="text-xs sm:text-[13px] font-black uppercase tracking-widest text-[#B7E4C7]">
                  WHAT SHOULD I DO NOW?
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-white/70">Current local time:</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-white/10 font-bold border border-white/20">
                  {timeState.time24} ({timeState.displayTimeStr})
                </span>
              </div>
            </div>

            {/* Dynamic Decision Guidance Content */}
            {actionGuidance.state === "in_progress" && actionGuidance.currentActivity ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                      CURRENT ACTIVITY: {actionGuidance.currentActivity.category}
                    </span>
                    <span className="text-xs text-white/70 font-mono">
                      {actionGuidance.currentActivity.start_time} – {actionGuidance.currentActivity.end_time}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                    {actionGuidance.currentActivity.title}
                  </h2>

                  <p className="text-[13.5px] text-white/90 leading-relaxed font-medium">
                    {actionGuidance.currentActivity.instructions || "Focus exclusively on executing this block with zero context-switching."}
                  </p>

                  {/* Next Up Preview */}
                  {actionGuidance.nextActivity && (
                    <div className="pt-2 text-xs text-emerald-200/80 flex items-center gap-1.5">
                      <ArrowRight size={13} className="text-emerald-300" />
                      <span>Next activity: <strong>{actionGuidance.nextActivity.title}</strong> at {actionGuidance.nextActivity.start_time} ({actionGuidance.nextActivity.duration_minutes}m)</span>
                    </div>
                  )}
                </div>

                {/* Right Action & Timer Box */}
                <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-white/80">
                    <span className="flex items-center gap-1.5">
                      <Timer size={14} className="text-emerald-300" />
                      <span>Active Focus Timer</span>
                    </span>
                    <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-emerald-300 font-bold">
                      {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTaskTimer(actionGuidance.currentActivity)}
                      className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                        activeTimerTaskId === actionGuidance.currentActivity.id && isTimerRunning
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-emerald-500 hover:bg-emerald-400 text-slate-900"
                      }`}
                    >
                      {activeTimerTaskId === actionGuidance.currentActivity.id && isTimerRunning ? (
                        <>
                          <Pause size={14} />
                          <span>Pause Timer</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} />
                          <span>Start Timer</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickComplete(actionGuidance.currentActivity.id)}
                      className="py-2.5 px-4 bg-white hover:bg-emerald-50 text-[#124B2C] rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Check size={15} />
                      <span>Mark Complete</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-white/70">
                    <span>{actionGuidance.minutesRemainingInCurrent}m remaining in block</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleTask(actionGuidance.currentActivity);
                          setNewDate(selectedDate);
                          setNewStartTime(actionGuidance.currentActivity.start_time);
                          setNewEndTime(actionGuidance.currentActivity.end_time);
                        }}
                        className="hover:text-white underline"
                      >
                        Reschedule
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setSkipTaskModal(actionGuidance.currentActivity)}
                        className="hover:text-red-300 underline"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : actionGuidance.state === "starting_soon" && actionGuidance.nextActivity ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900">
                      STARTING SOON (IN {actionGuidance.minutesUntilNext} MINS)
                    </span>
                    <span className="text-xs text-white/80 font-mono">
                      Starts at {actionGuidance.nextActivity.start_time}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {actionGuidance.nextActivity.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed max-w-2xl">
                    {actionGuidance.guidanceText}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleTaskTimer(actionGuidance.nextActivity)}
                    className="py-2.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-900 rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Play size={14} />
                    <span>Start Early</span>
                  </button>
                </div>
              </div>
            ) : actionGuidance.state === "free_period" && actionGuidance.nextActivity ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-white/20 text-white border border-white/30">
                      TRANSITION & RECOVERY PERIOD
                    </span>
                    <span className="text-xs text-white/80 font-mono">
                      No active task scheduled right now
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Next commitment: {actionGuidance.nextActivity.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed max-w-2xl">
                    Starts at {actionGuidance.nextActivity.start_time} (in {actionGuidance.minutesUntilNext} minutes) • Duration: {actionGuidance.nextActivity.duration_minutes} minutes. Use this window for hydration, movement, or preparing workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="py-2.5 px-4 bg-white/20 hover:bg-white/30 text-white rounded-xl font-bold text-xs flex items-center gap-2 border border-white/30 transition-all"
                  >
                    <Plus size={14} />
                    <span>Add Task Here</span>
                  </button>
                </div>
              </div>
            ) : actionGuidance.state === "overdue" ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-amber-500/20 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-amber-400/40">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide bg-amber-400 text-slate-900">
                    OVERDUE COMMITMENT DETECTED
                  </span>
                  <p className="text-xs sm:text-[13px] text-white leading-relaxed">
                    {actionGuidance.guidanceText}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span className="text-[13px] font-extrabold text-white">Daily Schedule Fulfilled</span>
                  </div>
                  <p className="text-xs text-white/80">
                    {actionGuidance.guidanceText}
                  </p>
                </div>
                <Link
                  href="/reports"
                  className="px-4 py-2 bg-white text-[#165B33] rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors flex-shrink-0"
                >
                  Review Daily Performance →
                </Link>
              </div>
            )}

            {/* Next 3 Scheduled Activities Preview Bar */}
            <div className="pt-3 border-t border-white/15">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 mb-2 flex items-center gap-1.5">
                <ArrowRight size={13} />
                <span>Next 3 Scheduled Activities</span>
              </div>
              {tasks.filter((t) => t.status !== "completed" && t.status !== "skipped" && t.id !== actionGuidance.currentActivity?.id).slice(0, 3).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {tasks
                    .filter((t) => t.status !== "completed" && t.status !== "skipped" && t.id !== actionGuidance.currentActivity?.id)
                    .slice(0, 3)
                    .map((nextT, idx) => (
                      <div
                        key={nextT.id}
                        className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-xl p-2.5 border border-white/15 transition-all group"
                      >
                        <div className="flex items-center justify-between text-[10px] text-white/70 font-mono">
                          <span className="font-bold text-emerald-300">#{idx + 1} {nextT.start_time}–{nextT.end_time}</span>
                          <span className="uppercase text-[9px] bg-white/10 px-1.5 py-0.2 rounded font-sans">{nextT.category}</span>
                        </div>
                        <div className="text-[12.5px] font-bold text-white truncate mt-1 group-hover:text-emerald-200">
                          {nextT.title}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[10px]">
                          <span className="text-white/60">{nextT.duration_minutes}m duration</span>
                          <button
                            type="button"
                            onClick={() => handleLaunchFocus(nextT)}
                            className="text-emerald-300 hover:text-white font-bold flex items-center gap-0.5"
                          >
                            <Sparkles size={11} />
                            <span>Focus</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-[12px] text-white/70 italic">
                  No further scheduled commitments for today. All daily tasks completed!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================
            3. TWO-COLUMN MAIN WORKFLOW LAYOUT
            Left Column: Progress Card + Full Daily Timeline
            Right Column: Breathing & Recovery + Today's Focus + Quick Summary
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ──────────────────────────────────────────────────────────
              LEFT COLUMN (col-span-8)
              ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6">
            {/* CARD 1: DAILY SCHEDULE PROGRESS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                <h3 className="text-[15px] font-extrabold text-[#14211A]">
                  Daily Schedule Progress
                </h3>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Circular Gauge on Left */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-[#E2E9E4]"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-[#165B33] transition-all duration-700"
                      strokeDasharray={`${progressPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[16px] font-extrabold text-[#14211A] font-mono leading-none">
                      {progressPercent}%
                    </span>
                    <span className="text-[9.5px] text-[#6C8176] font-medium mt-0.5">
                      Completed
                    </span>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 flex-1 w-full">
                  {/* Completed */}
                  <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[#14211A] font-mono leading-tight">
                        {completedTasksCount} / {totalTasksCount}
                      </div>
                      <div className="text-[11px] text-[#6C8176] font-medium leading-tight">
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Total Tasks */}
                  <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FEF3D6] text-[#B47805] flex items-center justify-center flex-shrink-0">
                      <Clock size={18} />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[#14211A] font-mono leading-tight">
                        {totalTasksCount}
                      </div>
                      <div className="text-[11px] text-[#6C8176] font-medium leading-tight">
                        Total Tasks
                      </div>
                    </div>
                  </div>

                  {/* Total Duration */}
                  <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#FEE2E2]/60 text-[#D97706] flex items-center justify-center flex-shrink-0">
                      <Hourglass size={18} />
                    </div>
                    <div>
                      <div className="text-[15px] font-extrabold text-[#14211A] font-mono leading-tight">
                        ~ 13h 30m
                      </div>
                      <div className="text-[11px] text-[#6C8176] font-medium leading-tight">
                        Total Duration
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thin Bottom Progress Line */}
              <div className="h-1.5 w-full bg-[#EBF5EE] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* CARD 2: FULL DAILY TIMELINE (4:00 AM – 10:00 PM) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
                <div className="flex items-center space-x-2 text-[#14211A]">
                  <Sun size={18} className="text-[#165B33]" />
                  <h3 className="text-[15px] font-extrabold">
                    Full Daily Timeline (4:00 AM – 10:00 PM)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={toggleCollapseAll}
                  className="text-[12px] font-bold text-[#165B33] hover:underline flex items-center gap-1 transition-colors"
                >
                  {allCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  <span>{allCollapsed ? "Expand All" : "Collapse All"}</span>
                </button>
              </div>

              {/* TIMELINE SECTION 1: MORNING 4:00 AM – 7:00 AM */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-[#EBF5EE] text-[#165B33] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#B7E4C7]">
                    Morning 4:00 AM – 7:00 AM
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSection("morning")}
                    className="text-[11px] text-[#6C8176] hover:text-[#165B33] font-semibold"
                  >
                    {expandedSections.morning ? "Hide Tasks" : `${morningTasks.length} Tasks`}
                  </button>
                </div>

                {expandedSections.morning && (
                  <div className="relative pl-6 space-y-3.5 pt-1">
                    <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-[#D5E2D9]" />
                    {morningTasks.length > 0 ? (
                      morningTasks.map(renderTaskRow)
                    ) : (
                      <p className="text-[12px] text-[#6C8176] py-2 italic pl-2">
                        No morning tasks scheduled for this day.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* TIMELINE SECTION 2: DAYTIME 7:00 AM – 6:00 PM */}
              <div className="space-y-2">
                <div
                  onClick={() => toggleSection("daytime")}
                  className="p-3.5 rounded-2xl bg-[#F7FAF8] hover:bg-[#F0F7F3] border border-[#E2EAE5] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Sun size={16} className="text-[#B47805]" />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      Daytime 7:00 AM – 6:00 PM
                    </span>
                  </div>

                  <span className="bg-white text-[#2D6A4F] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#CBD7CE] shadow-2xs">
                    {daytimeTasks.length} Tasks
                  </span>
                </div>

                {expandedSections.daytime && (
                  <div className="relative pl-6 space-y-3 pt-2">
                    <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-[#D5E2D9]" />
                    {daytimeTasks.length > 0 ? (
                      daytimeTasks.map(renderTaskRow)
                    ) : (
                      <p className="text-[12px] text-[#6C8176] py-2 italic pl-2">
                        No daytime tasks scheduled for this day.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* TIMELINE SECTION 3: EVENING 6:00 PM – 10:00 PM */}
              <div className="space-y-2">
                <div
                  onClick={() => toggleSection("evening")}
                  className="p-3.5 rounded-2xl bg-[#F7FAF8] hover:bg-[#F0F7F3] border border-[#E2EAE5] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Moon size={16} className="text-[#165B33]" />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      Evening 6:00 PM – 10:00 PM
                    </span>
                  </div>

                  <span className="bg-white text-[#2D6A4F] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#CBD7CE] shadow-2xs">
                    {eveningTasks.length} Tasks
                  </span>
                </div>

                {expandedSections.evening && (
                  <div className="relative pl-6 space-y-3 pt-2">
                    <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-[#D5E2D9]" />
                    {eveningTasks.length > 0 ? (
                      eveningTasks.map(renderTaskRow)
                    ) : (
                      <p className="text-[12px] text-[#6C8176] py-2 italic pl-2">
                        No evening tasks scheduled for this day.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* TIMELINE SECTION 4: NIGHT 9:15 PM – 10:00 PM */}
              <div className="space-y-2">
                <div
                  onClick={() => toggleSection("night")}
                  className="p-3.5 rounded-2xl bg-[#F7FAF8] hover:bg-[#F0F7F3] border border-[#E2EAE5] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <Moon size={16} className="text-[#4F46E5]" />
                    <span className="text-[13px] font-bold text-[#14211A]">
                      Night 9:15 PM – 10:00 PM
                    </span>
                  </div>

                  <span className="bg-white text-[#2D6A4F] text-[11px] font-extrabold px-3 py-1 rounded-full border border-[#CBD7CE] shadow-2xs">
                    {nightTasks.length} Tasks
                  </span>
                </div>

                {expandedSections.night && (
                  <div className="relative pl-6 space-y-3 pt-2">
                    <div className="absolute left-[7px] top-3 bottom-3 w-[2px] bg-[#D5E2D9]" />
                    {nightTasks.length > 0 ? (
                      nightTasks.map(renderTaskRow)
                    ) : (
                      <p className="text-[12px] text-[#6C8176] py-2 italic pl-2">
                        No night tasks scheduled for this day.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────────
              RIGHT COLUMN (col-span-4)
              1. Breathing & Recovery
              2. Today's Focus
              3. Quick Summary
              ────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 space-y-6">
            {/* CARD 1: BREATHING & RECOVERY */}
            <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#14211A]">
                  <Activity size={18} className="text-[#165B33]" />
                  <h3 className="text-[15px] font-extrabold">Breathing &amp; Recovery</h3>
                </div>
                <Link
                  href="/health"
                  className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-0.5"
                >
                  <span>Take a Break</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Circular Breathing Visual & Checklist */}
              <div className="flex items-center justify-around gap-4 py-2">
                {/* Visual Ring */}
                <div className="relative w-28 h-28 flex items-center justify-center">
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
                      className={isBreathing ? "animate-spin" : ""}
                      style={{ animationDuration: "12s" }}
                    />
                  </svg>

                  <div className="absolute flex flex-col items-center text-center">
                    <Wind size={22} className="text-[#165B33] mb-0.5" />
                    <span className="text-[12px] font-extrabold text-[#14211A] leading-tight">
                      {isBreathing ? `${breathPhase.toUpperCase()} (${phaseSeconds}s)` : "Breathe Calmly"}
                    </span>
                    <span className="text-[9.5px] text-[#6C8176]">
                      {isBreathing ? "Rhythmic 4-4-4" : "Feel Focused"}
                    </span>
                  </div>
                </div>

                {/* Steps Checklist */}
                <div className="space-y-2 text-[12.5px] font-medium text-[#486053]">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        breathPhase === "inhale" && isBreathing
                          ? "bg-[#165B33] border-[#165B33] text-white"
                          : "border-[#CBD7CE] bg-white"
                      }`}
                    >
                      {breathPhase === "inhale" && isBreathing && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span>Inhale...</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        breathPhase === "hold" && isBreathing
                          ? "bg-[#165B33] border-[#165B33] text-white"
                          : "border-[#CBD7CE] bg-white"
                      }`}
                    >
                      {breathPhase === "hold" && isBreathing && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span>Hold...</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        breathPhase === "exhale" && isBreathing
                          ? "bg-[#165B33] border-[#165B33] text-white"
                          : "border-[#CBD7CE] bg-white"
                      }`}
                    >
                      {breathPhase === "exhale" && isBreathing && <Check size={10} strokeWidth={3} />}
                    </div>
                    <span>Exhale...</span>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsBreathing(!isBreathing)}
                  className="flex-1 bg-[#165B33] hover:bg-[#123D26] text-white font-bold py-2.5 px-4 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 text-[12.5px]"
                >
                  {isBreathing ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isBreathing ? "Pause Breathing" : "Start Breathing"}</span>
                </button>

                <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#486053] bg-[#F7FAF8] px-3 py-2 rounded-xl border border-[#E2EAE5]">
                  <Clock size={13} />
                  <span>2 min</span>
                </div>
              </div>
            </div>

            {/* CARD 2: TOP 3 DAILY PRIORITIES */}
            <div className="bg-white rounded-3xl p-5 border border-[#E2EAE5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-[#14211A]">
                  <Star size={17} className="text-amber-500 fill-amber-500" />
                  <h3 className="text-[14px] font-extrabold">Top 3 Daily Priorities</h3>
                </div>
                <span className="text-[11px] font-bold text-[#6C8176]">
                  {tasks.filter((t) => t.is_daily_priority === 1).length} / 3 Selected
                </span>
              </div>
              <p className="text-[11.5px] text-[#5A6E63]">
                Elevate up to 3 non-negotiable milestones for today.
              </p>

              {priorityWarning && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold rounded-xl animate-in fade-in">
                  {priorityWarning}
                </div>
              )}

              {tasks.filter((t) => t.is_daily_priority === 1).length > 0 ? (
                <div className="space-y-2 pt-1">
                  {tasks
                    .filter((t) => t.is_daily_priority === 1)
                    .map((pTask, idx) => {
                      const isDone = pTask.status === "completed";
                      return (
                        <div
                          key={pTask.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 ${
                            isDone
                              ? "bg-[#F7FAF8] border-[#D5E6DC] opacity-75"
                              : "bg-[#FFFBEB] border-amber-200"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleTask(pTask)}
                              className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 cursor-pointer ${
                                isDone
                                  ? "bg-[#165B33] border-[#165B33] text-white"
                                  : "border-amber-400 bg-white hover:bg-amber-50"
                              }`}
                            >
                              {isDone && <Check size={12} strokeWidth={3} />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-extrabold font-mono text-amber-800">
                                  #{idx + 1}
                                </span>
                                <h4
                                  className={`text-[12.5px] font-bold truncate ${
                                    isDone ? "line-through text-[#6C8176]" : "text-[#14211A]"
                                  }`}
                                >
                                  {pTask.title}
                                </h4>
                              </div>
                              <span className="text-[10.5px] text-[#6C8176] font-mono block mt-0.5">
                                {pTask.start_time} – {pTask.end_time} • {pTask.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleLaunchFocus(pTask)}
                              className="p-1.5 text-[#165B33] hover:bg-white rounded-lg transition-colors cursor-pointer"
                              title="Launch Focus Session"
                            >
                              <Sparkles size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleDailyPriority(pTask)}
                              className="p-1.5 text-amber-500 hover:text-amber-700 rounded-lg cursor-pointer"
                              title="Remove from priorities"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#F9FBFA] border border-dashed border-[#CBD7CE] text-center">
                  <Star size={20} className="text-[#CBD7CE] mx-auto mb-1.5" />
                  <p className="text-[12px] font-bold text-[#486053]">No Daily Priorities Set</p>
                  <p className="text-[11px] text-[#6C8176] mt-0.5">
                    Click the star icon next to any task on your timeline to mark it as one of your top 3 daily priorities.
                  </p>
                </div>
              )}
            </div>

            {/* CARD 3: QUICK SUMMARY */}
            <div className="bg-white rounded-3xl p-5 border border-[#E2EAE5] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[#14211A]">
                  <span className="w-2 h-2 rounded-xs bg-[#165B33]" />
                  <h3 className="text-[13.5px] font-extrabold">Quick Summary</h3>
                </div>
                <Link
                  href="/reports"
                  className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-0.5"
                >
                  <span>View Details</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* 4 Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                {/* 1. Done */}
                <div className="p-2.5 rounded-2xl bg-[#F0F7F3] border border-[#D5EEDD] flex flex-col items-center">
                  <CheckCircle2 size={16} className="text-[#165B33]" />
                  <span className="text-[15px] font-extrabold text-[#14211A] font-mono mt-1">
                    {completedTasksCount}
                  </span>
                  <span className="text-[10.5px] text-[#6C8176] font-medium">Done</span>
                </div>

                {/* 2. Remaining */}
                <div className="p-2.5 rounded-2xl bg-[#F0F7FF] border border-[#BAE6FD] flex flex-col items-center">
                  <Clock size={16} className="text-[#0284C7]" />
                  <span className="text-[15px] font-extrabold text-[#14211A] font-mono mt-1">
                    {remainingTasksCount}
                  </span>
                  <span className="text-[10.5px] text-[#6C8176] font-medium">Rem</span>
                </div>

                {/* 3. Focus Minutes */}
                <div className="p-2.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col items-center" title="Recorded focus session duration today">
                  <Hourglass size={16} className="text-[#D97706]" />
                  <span className="text-[14.5px] font-extrabold text-[#14211A] font-mono mt-1">
                    {todayFocusMinutes}m
                  </span>
                  <span className="text-[10.5px] text-[#6C8176] font-medium">Focus</span>
                </div>

                {/* 4. Progress */}
                <div className="p-2.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col items-center">
                  <TrendingUp size={16} className="text-[#165B33]" />
                  <span className="text-[15px] font-extrabold text-[#14211A] font-mono mt-1">
                    {progressPercent}%
                  </span>
                  <span className="text-[10.5px] text-[#6C8176] font-medium">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL: PRAYER TIMER (Morning & Night)
            ======================================================== */}
        {prayerModalOpen && (
          <Modal
            isOpen={prayerModalOpen}
            onClose={() => setPrayerModalOpen(false)}
            title={`${activePrayerType === "morning" ? "Morning Prayer (04:00 AM)" : "Night Prayer (09:15 PM)"}`}
          >
            <PrayerTimer
              prayerType={activePrayerType}
              scheduledTime={activePrayerType === "morning" ? "04:00" : "21:15"}
              defaultDuration={30}
              onComplete={async () => {
                setPrayerModalOpen(false);
                await fetchDayData(selectedDate);
              }}
            />
          </Modal>
        )}

        {/* ========================================================
            MODAL: RESCHEDULE TASK
            ======================================================== */}
        {rescheduleTask && (
          <Modal
            isOpen={!!rescheduleTask}
            onClose={() => setRescheduleTask(null)}
            title="Reschedule Task Responsibly"
          >
            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <span className="text-[12px] text-[#6B7280]">Rescheduling:</span>
                <h4 className="text-[14px] font-bold text-[#181E1B]">{rescheduleTask.title}</h4>
              </div>

              {/* Smart Slot Recommendation Button */}
              <button
                type="button"
                onClick={handleAutoSuggestSlot}
                className="w-full py-2 px-3 bg-[#EBF5EE] hover:bg-[#D4EDDA] text-[#165B33] border border-[#B7E4C7] rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <Zap size={14} className="text-[#165B33]" />
                <span>Auto-Find Next Slot (Protects Sleep & Work)</span>
              </button>

              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Reason for Rescheduling
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="Explain why this task is being moved..."
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setRescheduleTask(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:text-[#181E1B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="px-4 py-2 bg-[#165B33] text-white rounded-lg text-[12px] font-semibold shadow-xs"
                >
                  {rescheduling ? "Saving..." : "Confirm Reschedule"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Skip Task Modal */}
        {skipTaskModal && (
          <Modal
            isOpen={!!skipTaskModal}
            onClose={() => setSkipTaskModal(null)}
            title={`Skip Task: ${skipTaskModal.title}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSaveSkip} className="p-4 space-y-4">
              <p className="text-[12.5px] text-[#4B5563]">
                Skipping this task preserves your schedule flow while recording your reason for operational accountability.
              </p>

              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Reason for Skipping (Optional)
                </label>
                <textarea
                  value={skipReasonText}
                  onChange={(e) => setSkipReasonText(e.target.value)}
                  placeholder="e.g., Unplanned family emergency, urgent production bug..."
                  rows={3}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setSkipTaskModal(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:text-[#181E1B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={skipping}
                  className="px-4 py-2 bg-[#DC2626] text-white rounded-lg text-[12px] font-semibold shadow-xs hover:bg-[#B91C1C]"
                >
                  {skipping ? "Skipping..." : "Confirm Skip"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Add Personal Task Modal */}
        {isAddTaskModalOpen && (
          <Modal
            isOpen={isAddTaskModalOpen}
            onClose={() => setIsAddTaskModalOpen(false)}
            title="Add Personal Task"
            maxWidth="max-w-md"
          >
            <form onSubmit={handleCreatePersonalTask} className="p-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Read Next.js architecture docs..."
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  >
                    <option value="development">Development</option>
                    <option value="health">Health & Fitness</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="learning">Learning</option>
                    <option value="freelancing">Freelancing</option>
                    <option value="business">Business (Suku)</option>
                    <option value="forex">Forex</option>
                    <option value="financial">Financial</option>
                    <option value="family">Family</option>
                    <option value="planning">Planning / Rest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newTaskStartTime}
                    onChange={(e) => setNewTaskStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newTaskEndTime}
                    onChange={(e) => setNewTaskEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Instructions / Execution Notes
                </label>
                <textarea
                  value={newTaskInstructions}
                  onChange={(e) => setNewTaskInstructions(e.target.value)}
                  placeholder="Clear outcome-focused instruction for this block..."
                  rows={2}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setIsAddTaskModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:text-[#181E1B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingTask}
                  className="px-4 py-2 bg-[#165B33] text-white rounded-lg text-[12px] font-bold shadow-xs hover:bg-[#124B2C]"
                >
                  {isAddingTask ? "Adding..." : "Add to Schedule"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: Edit Task */}
        {editTaskModal && (
          <Modal
            isOpen={!!editTaskModal}
            onClose={() => setEditTaskModal(null)}
            title={`Edit Task: ${editTaskModal.title}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSaveEditTask} className="p-4 space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editTaskModal.title}
                  onChange={(e) => setEditTaskModal({ ...editTaskModal, title: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={editTaskModal.start_time}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, start_time: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={editTaskModal.end_time}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, end_time: e.target.value })}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Category
                  </label>
                  <select
                    value={editTaskModal.category}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  >
                    <option value="development">Development</option>
                    <option value="health">Health & Fitness</option>
                    <option value="spiritual">Spiritual</option>
                    <option value="learning">Learning</option>
                    <option value="freelancing">Freelancing</option>
                    <option value="business">Business (Suku)</option>
                    <option value="forex">Forex</option>
                    <option value="financial">Financial</option>
                    <option value="family">Family</option>
                    <option value="planning">Planning / Rest</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                    Priority
                  </label>
                  <select
                    value={editTaskModal.priority}
                    onChange={(e) => setEditTaskModal({ ...editTaskModal, priority: e.target.value as any })}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                  Instructions & Action Steps
                </label>
                <textarea
                  rows={2}
                  value={editTaskModal.instructions || ""}
                  onChange={(e) => setEditTaskModal({ ...editTaskModal, instructions: e.target.value })}
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setEditTaskModal(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:text-[#181E1B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#165B33] text-white rounded-lg text-[12px] font-bold shadow-xs hover:bg-[#124B2C]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Modal: Task Notes */}
        {taskNotesModal && (
          <Modal
            isOpen={!!taskNotesModal}
            onClose={() => setTaskNotesModal(null)}
            title={`Execution Notes: ${taskNotesModal.title}`}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSaveTaskNotes} className="p-4 space-y-4">
              <p className="text-[12px] text-[#6C8176]">
                Add specific checklists, API endpoints, or execution guidelines for this scheduled block.
              </p>
              <div>
                <textarea
                  rows={4}
                  value={taskNotesContent}
                  onChange={(e) => setTaskNotesContent(e.target.value)}
                  placeholder="e.g. Test auth bearer token header with Postman; verify 200 OK status..."
                  className="w-full px-3 py-2 text-[13px] bg-white border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#165B33]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#E8E6DF]">
                <button
                  type="button"
                  onClick={() => setTaskNotesModal(null)}
                  className="px-4 py-2 text-[12px] font-semibold text-[#4B5563] hover:text-[#181E1B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#165B33] text-white rounded-lg text-[12px] font-bold shadow-xs hover:bg-[#124B2C]"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
