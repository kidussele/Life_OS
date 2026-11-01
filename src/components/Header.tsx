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
} from "lucide-react";
import { useTimeEngine } from "@/hooks/useTimeEngine";
import { DailyTask } from "@/lib/types";

export function Header() {
  const {
    timezone,
    timezoneInfo,
    timeState,
    journeyInfo,
    summarizeTasks,
  } = useTimeEngine();

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
      <div className="flex items-center flex-wrap gap-4 sm:gap-6">
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
        {/* Search Bar */}
        <div className="relative hidden md:block w-52 lg:w-60">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8CA095]"
          />
          <input
            type="text"
            placeholder="Search tasks, goals..."
            className="w-full pl-9 pr-3.5 py-1.5 text-[12px] bg-[#F7FAF8] border border-[#E2E9E4] rounded-full focus:outline-none focus:border-[#165B33] text-[#14211A] placeholder-[#8CA095]"
          />
        </div>

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
    </header>
  );
}
