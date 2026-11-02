/**
 * LIFE OS — Real-Time Local Time & Intelligent Task Status Engine
 *
 * Provides timezone-aware date/time calculations, automatic task status transitions
 * (upcoming, in_progress, overdue, missed, completed, skipped), and 90-day journey tracking.
 */

export interface TimezoneInfo {
  iana: string;
  shortName: string;
  utcOffset: string;
}

export interface TaskTimeRecord {
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: string; // 'upcoming' | 'in_progress' | 'overdue' | 'missed' | 'completed' | 'skipped' | 'rescheduled'
  completed_at?: string | null;
  reschedule_reason?: string | null;
}

export type IntelligentTaskStatus =
  | "upcoming"
  | "starting_soon"
  | "in_progress"
  | "overdue"
  | "missed"
  | "completed"
  | "skipped"
  | "rescheduled";

export interface JourneyDayInfo {
  dayNumber: number;
  totalDays: number;
  daysRemaining: number;
  label: string;
  isStarted: boolean;
  startDateStr: string;
}

export interface DailyStatusSummary {
  completed: number;
  inProgress: number;
  startingSoon: number;
  upcoming: number;
  overdue: number;
  missed: number;
  skipped: number;
  total: number;
}

/**
 * Common IANA Timezones for user selection
 */
export const POPULAR_TIMEZONES = [
  { iana: "Africa/Addis_Ababa", label: "Addis Ababa, East Africa (UTC+3)" },
  { iana: "Africa/Nairobi", label: "Nairobi (UTC+3)" },
  { iana: "Africa/Cairo", label: "Cairo (UTC+2)" },
  { iana: "Africa/Johannesburg", label: "Johannesburg (UTC+2)" },
  { iana: "Africa/Lagos", label: "Lagos, West Africa (UTC+1)" },
  { iana: "Europe/London", label: "London, GMT/BST (UTC+0/+1)" },
  { iana: "Europe/Paris", label: "Paris, Berlin, Rome (UTC+1/+2)" },
  { iana: "Europe/Moscow", label: "Moscow (UTC+3)" },
  { iana: "Asia/Dubai", label: "Dubai, Gulf Standard (UTC+4)" },
  { iana: "Asia/Riyadh", label: "Riyadh, Saudi Arabia (UTC+3)" },
  { iana: "Asia/Kolkata", label: "India Standard Time (UTC+5:30)" },
  { iana: "Asia/Singapore", label: "Singapore (UTC+8)" },
  { iana: "Asia/Tokyo", label: "Tokyo, Japan (UTC+9)" },
  { iana: "Australia/Sydney", label: "Sydney (UTC+10/+11)" },
  { iana: "America/New_York", label: "New York, Eastern Time (UTC-5/-4)" },
  { iana: "America/Chicago", label: "Chicago, Central Time (UTC-6/-5)" },
  { iana: "America/Denver", label: "Denver, Mountain Time (UTC-7/-6)" },
  { iana: "America/Los_Angeles", label: "Los Angeles, Pacific Time (UTC-8/-7)" },
  { iana: "America/Toronto", label: "Toronto (UTC-5/-4)" },
  { iana: "UTC", label: "Coordinated Universal Time (UTC)" },
];

/**
 * Detect the browser's local timezone safely
 */
export function detectBrowserTimezone(): string {
  try {
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return tz;
    }
  } catch (e) {
    console.warn("Timezone detection fallback:", e);
  }
  return "Africa/Addis_Ababa";
}

/**
 * Get formatted timezone details (e.g., "Africa/Addis_Ababa", "EAT", "UTC+3")
 */
export function getTimezoneInfo(timezone?: string): TimezoneInfo {
  const iana = timezone || detectBrowserTimezone();
  const now = new Date();

  let shortName = "UTC";
  let utcOffset = "+00:00";

  try {
    // Extract short name / abbreviation
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "short",
    });
    const parts = formatter.formatToParts(now);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    if (tzPart) shortName = tzPart.value;

    // Extract offset
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      timeZoneName: "longOffset",
    });
    const offsetParts = offsetFormatter.formatToParts(now);
    const offsetPart = offsetParts.find((p) => p.type === "timeZoneName");
    if (offsetPart && offsetPart.value.startsWith("GMT")) {
      utcOffset = offsetPart.value.replace("GMT", "UTC");
    } else {
      utcOffset = shortName;
    }
  } catch (e) {
    console.warn("Error getting timezone details:", e);
  }

  return { iana, shortName, utcOffset };
}

/**
 * Get the current Date, YYYY-MM-DD string, and HH:mm time string in a specific timezone
 */
export function getNowInTimezone(timezone?: string, referenceDate: Date = new Date()) {
  const tz = timezone || detectBrowserTimezone();

  // Format to parts in given timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(referenceDate);
  const partMap: { [key: string]: string } = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const year = partMap["year"] || "2026";
  const month = partMap["month"] || "11";
  const day = partMap["day"] || "02";
  const hour = partMap["hour"] === "24" ? "00" : partMap["hour"] || "00";
  const minute = partMap["minute"] || "00";
  const second = partMap["second"] || "00";

  const dateStr = `${year}-${month}-${day}`;
  const time24 = `${hour}:${minute}`;
  const time24WithSec = `${hour}:${minute}:${second}`;

  // Formatted display strings
  const displayDateStr = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(referenceDate);

  const displayTimeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(referenceDate);

  const hourNum = parseInt(hour, 10);
  let greeting = "Good evening";
  if (hourNum >= 4 && hourNum < 12) greeting = "Good morning";
  else if (hourNum >= 12 && hourNum < 17) greeting = "Good afternoon";

  return {
    dateStr,
    time24,
    time24WithSec,
    displayDateStr,
    displayTimeStr,
    greeting,
    timezone: tz,
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    hour: hourNum,
    minute: parseInt(minute, 10),
  };
}

/**
 * Calculate the Intelligent Status of a task based on the current local date & time
 *
 * Rules:
 * 1. Completed: user explicitly marked task complete (persists completed_at).
 * 2. Skipped: user explicitly skipped task.
 * 3. Rescheduled: task was explicitly moved.
 * 4. Missed: task date is strictly earlier than today and remained incomplete.
 * 5. Future date: task date is after today -> upcoming.
 * 6. Today:
 *    - currentTime < task.start_time -> upcoming
 *    - currentTime >= task.start_time && currentTime <= task.end_time -> in_progress
 *    - currentTime > task.end_time -> overdue
 */
export function parseTimeToMinutes(timeHHmm: string): number {
  if (!timeHHmm || !timeHHmm.includes(":")) return 0;
  const [h, m] = timeHHmm.split(":").map((v) => parseInt(v, 10) || 0);
  return h * 60 + m;
}

/**
 * Calculate the Intelligent Status of a task based on the current local date & time
 *
 * Rules:
 * 1. Completed: user explicitly marked task complete (persists completed_at).
 * 2. Skipped: user explicitly skipped task.
 * 3. Rescheduled: task was explicitly moved.
 * 4. Missed: task date is strictly earlier than today and remained incomplete.
 * 5. Future date: task date is after today -> upcoming.
 * 6. Today:
 *    - currentTime < task.start_time:
 *        - if within reminderWindowMinutes (default 15) -> starting_soon
 *        - otherwise -> upcoming
 *    - currentTime >= task.start_time && currentTime <= task.end_time -> in_progress
 *    - currentTime > task.end_time -> overdue
 */
export function calculateIntelligentTaskStatus(
  task: TaskTimeRecord,
  currentDateStr: string,
  currentTimeHHmm: string,
  reminderWindowMinutes = 15
): IntelligentTaskStatus {
  // If task has explicit final state, preserve it strictly
  if (task.status === "completed") return "completed";
  if (task.status === "skipped") return "skipped";
  if (task.status === "rescheduled") return "rescheduled";

  const taskDate = task.date;
  const startTime = task.start_time;
  const endTime = task.end_time;

  // Case 1: Task was scheduled on a previous day and is incomplete
  if (taskDate < currentDateStr) {
    return "missed";
  }

  // Case 2: Task is scheduled for a future day
  if (taskDate > currentDateStr) {
    return "upcoming";
  }

  // Case 3: Task is scheduled for TODAY
  if (taskDate === currentDateStr) {
    const curMins = parseTimeToMinutes(currentTimeHHmm);
    const startMins = parseTimeToMinutes(startTime);
    const endMins = parseTimeToMinutes(endTime);

    // Handle overnight task spanning across midnight (e.g., 22:00 - 04:00)
    if (endMins < startMins) {
      if (curMins >= startMins || curMins <= endMins) {
        return "in_progress";
      }
      if (curMins < startMins && curMins > endMins) {
        const diff = startMins - curMins;
        if (diff > 0 && diff <= reminderWindowMinutes) {
          return "starting_soon";
        }
        return "upcoming";
      }
    } else {
      if (curMins < startMins) {
        const diff = startMins - curMins;
        if (diff > 0 && diff <= reminderWindowMinutes) {
          return "starting_soon";
        }
        return "upcoming";
      }

      if (curMins >= startMins && curMins <= endMins) {
        return "in_progress";
      }

      if (curMins > endMins) {
        return "overdue";
      }
    }
  }

  return "upcoming";
}

/**
 * Calculate 90-Day Journey Progress based on current local date and start date
 */
export function calculateJourneyDayInfo(
  currentDateStr: string,
  startDateStr = "2026-11-02",
  totalDays = 90
): JourneyDayInfo {
  // Parse date strings safely as UTC midnight to avoid DST distortion
  const current = new Date(`${currentDateStr}T00:00:00Z`).getTime();
  const start = new Date(`${startDateStr}T00:00:00Z`).getTime();

  const diffMs = current - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    // Before Day 1 (e.g. Nov 1, 2026 before Nov 2 start)
    return {
      dayNumber: 0,
      totalDays,
      daysRemaining: totalDays,
      label: "Day 0 of 90 • Starts Tomorrow (Nov 2)",
      isStarted: false,
      startDateStr,
    };
  }

  const dayNumber = Math.min(totalDays, diffDays + 1);
  const daysRemaining = Math.max(0, totalDays - dayNumber);

  return {
    dayNumber,
    totalDays,
    daysRemaining,
    label: `Day ${dayNumber} of ${totalDays} • ${daysRemaining} days remaining`,
    isStarted: true,
    startDateStr,
  };
}

/**
 * Summarize task statuses for header and dashboard display
 */
export function getDailyTaskStatusSummary(
  tasks: TaskTimeRecord[],
  currentDateStr: string,
  currentTimeHHmm: string
): DailyStatusSummary {
  let completed = 0;
  let inProgress = 0;
  let startingSoon = 0;
  let upcoming = 0;
  let overdue = 0;
  let missed = 0;
  let skipped = 0;

  for (const t of tasks) {
    const status = calculateIntelligentTaskStatus(t, currentDateStr, currentTimeHHmm);
    switch (status) {
      case "completed":
        completed++;
        break;
      case "in_progress":
        inProgress++;
        break;
      case "starting_soon":
        startingSoon++;
        break;
      case "overdue":
        overdue++;
        break;
      case "missed":
        missed++;
        break;
      case "skipped":
        skipped++;
        break;
      case "upcoming":
      default:
        upcoming++;
        break;
    }
  }

  return {
    completed,
    inProgress,
    startingSoon,
    upcoming,
    overdue,
    missed,
    skipped,
    total: tasks.length,
  };
}

export interface WhatShouldIDoNowInfo {
  state: "in_progress" | "starting_soon" | "free_period" | "overdue" | "day_complete";
  currentActivity: any | null;
  nextActivity: any | null;
  minutesRemainingInCurrent: number | null;
  minutesUntilNext: number | null;
  guidanceText: string;
}

/**
 * Intelligent "WHAT SHOULD I DO NOW?" Engine
 *
 * Automatically inspects the current schedule against the live local time,
 * finds whether there is an active scheduled task, what is next,
 * and formulates actionable instructions.
 */
export function getWhatShouldIDoNow(
  tasks: any[],
  currentDateStr: string,
  currentTimeHHmm: string
): WhatShouldIDoNowInfo {
  if (!tasks || tasks.length === 0) {
    return {
      state: "free_period",
      currentActivity: null,
      nextActivity: null,
      minutesRemainingInCurrent: null,
      minutesUntilNext: null,
      guidanceText: "No tasks scheduled for this day. Plan priorities or rest.",
    };
  }

  const curMins = parseTimeToMinutes(currentTimeHHmm);

  // Filter tasks for the target day
  const todayTasks = tasks.filter((t) => t.date === currentDateStr);

  // Check for currently in-progress task (not completed/skipped/rescheduled)
  const activeTask = todayTasks.find((t) => {
    if (t.status === "completed" || t.status === "skipped" || t.status === "rescheduled") return false;
    const sMins = parseTimeToMinutes(t.start_time);
    const eMins = parseTimeToMinutes(t.end_time);
    if (eMins < sMins) {
      return curMins >= sMins || curMins <= eMins;
    }
    return curMins >= sMins && curMins <= eMins;
  });

  // Find next upcoming/starting soon task
  const upcomingTasks = todayTasks
    .filter((t) => {
      if (t.status === "completed" || t.status === "skipped" || t.status === "rescheduled") return false;
      const sMins = parseTimeToMinutes(t.start_time);
      return sMins > curMins;
    })
    .sort((a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time));

  const nextTask = upcomingTasks[0] || null;

  // Check for overdue tasks
  const overdueTasks = todayTasks.filter((t) => {
    if (t.status === "completed" || t.status === "skipped" || t.status === "rescheduled") return false;
    const sMins = parseTimeToMinutes(t.start_time);
    const eMins = parseTimeToMinutes(t.end_time);
    if (eMins < sMins) {
      return curMins > eMins && curMins < sMins;
    }
    return curMins > eMins;
  });

  if (activeTask) {
    const sMins = parseTimeToMinutes(activeTask.start_time);
    const endMins = parseTimeToMinutes(activeTask.end_time);
    const remMins = endMins < sMins
      ? (curMins >= sMins ? (1440 - curMins) + endMins : endMins - curMins)
      : Math.max(0, endMins - curMins);
    return {
      state: "in_progress",
      currentActivity: activeTask,
      nextActivity: nextTask,
      minutesRemainingInCurrent: remMins,
      minutesUntilNext: nextTask ? Math.max(0, parseTimeToMinutes(nextTask.start_time) - curMins) : null,
      guidanceText: `Execute ${activeTask.title}. Focus deeply on completion before ${activeTask.end_time} (${remMins}m remaining).`,
    };
  }

  if (nextTask) {
    const startMins = parseTimeToMinutes(nextTask.start_time);
    const untilMins = Math.max(0, startMins - curMins);
    const isStartingSoon = untilMins <= 15;

    return {
      state: isStartingSoon ? "starting_soon" : "free_period",
      currentActivity: null,
      nextActivity: nextTask,
      minutesRemainingInCurrent: null,
      minutesUntilNext: untilMins,
      guidanceText: isStartingSoon
        ? `${nextTask.title} starts in ${untilMins} minutes (${nextTask.start_time}). Prepare your mindset and tools now.`
        : `Transition / Recovery block. Next scheduled commitment is ${nextTask.title} at ${nextTask.start_time} (${untilMins}m away).`,
    };
  }

  if (overdueTasks.length > 0) {
    const firstOverdue = overdueTasks[0];
    return {
      state: "overdue",
      currentActivity: null,
      nextActivity: null,
      minutesRemainingInCurrent: null,
      minutesUntilNext: null,
      guidanceText: `You have ${overdueTasks.length} overdue item(s) from today including "${firstOverdue.title}". Complete or reschedule to maintain momentum.`,
    };
  }

  return {
    state: "day_complete",
    currentActivity: null,
    nextActivity: null,
    minutesRemainingInCurrent: null,
    minutesUntilNext: null,
    guidanceText: "All scheduled commitments for today are completed! Wind down, complete evening reflection, and rest on time.",
  };
}

