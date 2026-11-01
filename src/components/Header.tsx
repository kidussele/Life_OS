"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  Bell,
  ChevronDown,
  Globe,
  CheckCircle2,
  Play,
  Hourglass,
  AlertTriangle,
  XCircle,
  Menu,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { useTimeEngine } from "@/hooks/useTimeEngine";
import { DailyTask } from "@/lib/types";
import { FocusModeModal } from "@/components/FocusModeModal";
import { QuickCaptureModal } from "@/components/QuickCaptureModal";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const SEARCH_MODULES = [
  { name: "Dashboard", href: "/", category: "Overview", desc: "Daily schedule, priority focus & status summary" },
  { name: "My Day", href: "/my-day", category: "Execution", desc: "Active focus mode and step-by-step task flow" },
  { name: "Life Journey", href: "/journey", category: "Roadmap", desc: "90-Day transformation sprint roadmap" },
  { name: "Calendar", href: "/calendar", category: "Schedule", desc: "Weekly, monthly and daily calendar views" },
  { name: "Goals", href: "/goals", category: "Strategy", desc: "Strategic sprint goals and targets" },
  { name: "Life Categories", href: "/categories", category: "Domains", desc: "8 holistic life architecture domains" },
  { name: "Discipline", href: "/discipline", category: "Habits", desc: "Daily habit tracking and consistency streaks" },
  { name: "Spiritual Life", href: "/spiritual", category: "Spiritual", desc: "Morning & evening prayer and scripture meditation" },
  { name: "Career & Learning", href: "/learning", category: "Learning", desc: "Software engineering, React, TypeScript & English" },
  { name: "Freelancing", href: "/freelancing", category: "Work", desc: "Client CRM, proposals, and project delivery" },
  { name: "Business (Suku)", href: "/suku", category: "Business", desc: "Suku marketplace development and merchant operations" },
  { name: "Forex Journal", href: "/forex", category: "Finance", desc: "Forex trading journal, backtest stats & win-rate" },
  { name: "Financial Management", href: "/finances", category: "Finance", desc: "Income, expense ledger, savings & emergency reserve" },
  { name: "Health & Fitness", href: "/health", category: "Health", desc: "Workouts, mobility, nutrition and recovery metrics" },
  { name: "Family & Relations", href: "/family", category: "Family", desc: "Family duty, calls and meaningful relationships" },
  { name: "Reports & Stats", href: "/reports", category: "Analytics", desc: "Weekly discipline reports and domain analysis" },
  { name: "Settings", href: "/settings", category: "System", desc: "Timezone, preferences, notifications & data reset" },
];

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const {
    timezone,
    timezoneInfo,
    timeState,
    journeyInfo,
    summarizeTasks,
  } = useTimeEngine();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [taskSummary, setTaskSummary] = useState({
    completed: 0,
    inProgress: 0,
    upcoming: 0,
    overdue: 0,
    missed: 0,
    total: 0,
  });

  // Notification center state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Global Quick Capture & Focus Mode State
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<{ id?: string; title?: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput = targetTag === "input" || targetTag === "textarea" || (e.target as HTMLElement)?.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "q") {
        e.preventDefault();
        setIsQuickCaptureOpen((prev) => !prev);
      } else if (!isInput && e.key === "q") {
        setIsQuickCaptureOpen(true);
      }
    };

    const handleOpenCapture = () => setIsQuickCaptureOpen(true);
    const handleOpenFocus = (e: any) => {
      if (e?.detail) {
        setFocusTask({ id: e.detail.taskId, title: e.detail.taskTitle });
      }
      setIsFocusModeOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open_quick_capture", handleOpenCapture);
    window.addEventListener("open_focus_mode", handleOpenFocus as EventListener);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open_quick_capture", handleOpenCapture);
      window.removeEventListener("open_focus_mode", handleOpenFocus as EventListener);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`/api/notifications?timezone=${encodeURIComponent(timezone)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (_) {}
  }, [timezone]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (_) {}
  };

  // Fetch today's tasks to calculate live summary
  const fetchTasksForSummary = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?date=${timeState.dateStr}&timezone=${encodeURIComponent(timezone)}`);
      if (res.ok) {
        const data = await res.json();
        const taskList: DailyTask[] = data.tasks || [];
        setTasks(taskList);
        const summary = summarizeTasks(taskList);
        setTaskSummary(summary);
      }
    } catch (e) {
      // Silently handle offline/error
    }
  }, [timeState.dateStr, timezone, summarizeTasks]);

  // Initial load and periodic task status refresh every 10 seconds or on date change
  useEffect(() => {
    fetchTasksForSummary();
    const interval = setInterval(fetchTasksForSummary, 10000);

    const handleTaskChange = () => fetchTasksForSummary();
    window.addEventListener("life_os_task_updated", handleTaskChange);
    window.addEventListener("focus", handleTaskChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("life_os_task_updated", handleTaskChange);
      window.removeEventListener("focus", handleTaskChange);
    };
  }, [fetchTasksForSummary]);

  // Recalculate summary dynamically as seconds pass
  useEffect(() => {
    if (tasks.length > 0) {
      const summary = summarizeTasks(tasks);
      setTaskSummary(summary);
    }
  }, [timeState.time24, tasks, summarizeTasks]);

  return (
    <header className="min-h-18 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E9E4] bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Date, Journey & Live Clock */}
      <div className="flex items-center flex-wrap gap-3 sm:gap-6">
        {/* Mobile Hamburger Drawer Toggle */}
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#485A50] hover:text-[#165B33] hover:bg-[#EBF5EE] rounded-xl transition-colors cursor-pointer -ml-1"
            title="Open navigation menu"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Date & 90-Day Journey Progress Widget */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#D5E6DC]">
            <CalendarIcon size={17} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#14211A] leading-tight flex items-center gap-1.5">
              <span>{timeState.displayDateStr}</span>
            </div>
            <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
              {!journeyInfo.isStarted ? (
                <span className="text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full border border-[#FDE68A]">
                  {journeyInfo.label}
                </span>
              ) : (
                <span className="text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                  {journeyInfo.label}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Clock & Timezone Widget */}
        <div className="flex items-center space-x-2.5 pl-3 sm:pl-4 border-l border-[#E2E9E4]">
          <div className="w-9 h-9 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#D5E6DC]">
            <Clock size={17} />
          </div>
          <div>
            <div className="text-[13.5px] font-bold text-[#14211A] font-mono leading-tight tracking-tight flex items-center gap-2">
              <span>{timeState.displayTimeStr}</span>
            </div>
            <Link
              href="/settings"
              className="text-[10.5px] text-[#4F6A5B] hover:text-[#165B33] font-medium leading-tight flex items-center gap-1 mt-0.5 group transition-colors"
              title="Click to view or change timezone in Settings"
            >
              <Globe size={11} className="text-[#165B33] group-hover:rotate-12 transition-transform" />
              <span className="truncate max-w-[130px] sm:max-w-none">
                {timezoneInfo.iana} ({timezoneInfo.utcOffset})
              </span>
            </Link>
          </div>
        </div>

        {/* Real-Time Daily Task Status Counters (Section 9 Requirement) */}
        <div className="hidden xl:flex items-center gap-1.5 pl-4 border-l border-[#E2E9E4]">
          {/* Completed */}
          <div
            className="flex items-center gap-1 bg-[#F0FDF4] border border-[#DCFCE7] text-[#166534] px-2 py-0.5 rounded-full text-[11px] font-bold"
            title={`${taskSummary.completed} tasks completed today`}
          >
            <CheckCircle2 size={12} className="text-[#16A34A]" />
            <span>{taskSummary.completed} Done</span>
          </div>

          {/* In Progress */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${
              taskSummary.inProgress > 0
                ? "bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]"
                : "bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]"
            }`}
            title={`${taskSummary.inProgress} tasks currently in progress`}
          >
            {taskSummary.inProgress > 0 ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            ) : (
              <Play size={10} className="text-[#9CA3AF]" />
            )}
            <span>{taskSummary.inProgress} In Prog</span>
          </div>

          {/* Upcoming */}
          <div
            className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] px-2 py-0.5 rounded-full text-[11px] font-bold"
            title={`${taskSummary.upcoming} upcoming tasks scheduled for today`}
          >
            <Hourglass size={11} className="text-[#64748B]" />
            <span>{taskSummary.upcoming} Upc</span>
          </div>

          {/* Overdue */}
          {taskSummary.overdue > 0 && (
            <div
              className="flex items-center gap-1 bg-[#FFFBEB] border border-[#FDE68A] text-[#B45309] px-2 py-0.5 rounded-full text-[11px] font-bold animate-pulse"
              title={`${taskSummary.overdue} tasks are overdue!`}
            >
              <AlertTriangle size={12} className="text-[#D97706]" />
              <span>{taskSummary.overdue} Overdue</span>
            </div>
          )}

          {/* Missed */}
          {taskSummary.missed > 0 && (
            <div
              className="flex items-center gap-1 bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] px-2 py-0.5 rounded-full text-[11px] font-bold"
              title={`${taskSummary.missed} incomplete tasks from previous days`}
            >
              <XCircle size={12} className="text-[#DC2626]" />
              <span>{taskSummary.missed} Missed</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Search, Notification, and User Profile Pill */}
      <div className="flex items-center space-x-3 sm:space-x-3.5 ml-auto">
        {/* Search Bar with Quick-Jump Dropdown */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8CA095]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search pages, modules, goals..."
            className="w-full pl-9 pr-3.5 py-1.5 text-[12px] bg-[#F7FAF8] border border-[#E2E9E4] rounded-full focus:outline-none focus:border-[#165B33] text-[#14211A] placeholder-[#8CA095] transition-all"
          />

          {isSearchOpen && (
            <>
              {/* Invisible backdrop to dismiss on click outside */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsSearchOpen(false)}
              />

              <div className="absolute right-0 top-10 w-80 bg-white rounded-2xl shadow-xl border border-[#D5E2D9] p-3 z-40 max-h-88 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-extrabold text-[#6C8176] uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                  <span>Quick-Jump Pages</span>
                  <span className="text-[9px] font-normal lowercase bg-[#F0FDF4] text-[#165B33] px-1.5 py-0.5 rounded">
                    {searchQuery ? "filtered" : "all modules"}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {SEARCH_MODULES.filter((m) =>
                    !searchQuery ||
                    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    m.desc.toLowerCase().includes(searchQuery.toLowerCase())
                  ).slice(0, 8).map((module) => (
                    <Link
                      key={module.href}
                      href={module.href}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="p-2 rounded-xl hover:bg-[#F0FDF4] border border-transparent hover:border-[#BBF7D0] flex items-center justify-between transition-colors group block"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[12.5px] font-bold text-[#14211A] group-hover:text-[#165B33] truncate">
                            {module.name}
                          </span>
                          <span className="text-[9.5px] font-semibold text-[#6C8176] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                            {module.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6C8176] truncate mt-0.5">
                          {module.desc}
                        </p>
                      </div>
                      <ArrowRight size={13} className="text-[#9CA3AF] group-hover:text-[#165B33] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Capture Button (Ctrl+Q) */}
        <button
          type="button"
          onClick={() => setIsQuickCaptureOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF5EE] hover:bg-[#DCFCE7] text-[#165B33] text-[12px] font-bold rounded-full transition-all border border-[#D5E6DC] shadow-2xs cursor-pointer"
          title="Universal Quick Capture (Ctrl+Q or press Q)"
        >
          <Zap size={13} className="text-[#165B33]" />
          <span className="hidden sm:inline">Capture</span>
        </button>

        {/* Focus Mode Button */}
        <button
          type="button"
          onClick={() => {
            setFocusTask(null);
            setIsFocusModeOpen(true);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#165B33] hover:bg-[#124B2C] text-white text-[12px] font-bold rounded-full transition-all shadow-xs cursor-pointer"
          title="Start Distraction-Free Focus Mode Timer"
        >
          <Sparkles size={13} />
          <span className="hidden sm:inline">Focus</span>
        </button>

        {/* Notifications Icon with Dynamic Badge & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-[#485A50] hover:text-[#14211A] hover:bg-[#F7FAF8] rounded-full transition-colors"
            title="Notifications & System Reminders"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-[#D93838] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#D5E2D9] p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E9E4]">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#14211A]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-[#165B33] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-[#F0F4F2] max-h-80 overflow-y-auto mt-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-[12px] text-[#6C8176]">
                    No new alerts. All tasks on schedule.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-2.5 rounded-xl transition-colors ${
                        item.is_read ? "opacity-70 bg-transparent" : "bg-[#F7FAF8]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[12.5px] font-bold text-[#14211A]">
                          {item.title}
                        </div>
                        {item.time && (
                          <span className="text-[10px] font-mono font-semibold text-[#6C8176] bg-white px-1.5 py-0.5 rounded border border-[#E2E9E4]">
                            {item.time}
                          </span>
                        )}
                      </div>
                      <p className="text-[11.5px] text-[#4F6A5B] mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#E2E9E4] mt-2 flex items-center justify-between text-[11px]">
                <Link
                  href="/my-day"
                  onClick={() => setIsNotifOpen(false)}
                  className="font-bold text-[#165B33] hover:underline"
                >
                  View My Day Schedule →
                </Link>
                <Link
                  href="/settings#notifications"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[#6C8176] hover:text-[#14211A]"
                >
                  Configure
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          href="/settings"
          className="flex items-center space-x-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#F7FAF8] border border-transparent hover:border-[#E2E9E4] transition-all"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#CBD7CE] flex-shrink-0">
            <Image
              src="/avatar.jpg"
              alt="Kidus Seleshi"
              fill
              className="object-cover"
            />
          </div>
          <span className="hidden lg:inline text-[13px] font-semibold text-[#14211A]">
            Kidus Seleshi
          </span>
          <ChevronDown size={14} className="text-[#6C8176]" />
        </Link>
      </div>

      {/* Global Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onItemAdded={fetchTasksForSummary}
      />

      {/* Global Focus Mode Timer Modal */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        initialTaskId={focusTask?.id}
        initialTaskTitle={focusTask?.title}
        onSessionSaved={fetchTasksForSummary}
      />
    </header>
  );
}
