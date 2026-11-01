"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  detectBrowserTimezone,
  getTimezoneInfo,
  getNowInTimezone,
  calculateIntelligentTaskStatus,
  calculateJourneyDayInfo,
  getDailyTaskStatusSummary,
  getWhatShouldIDoNow,
  WhatShouldIDoNowInfo,
  TimezoneInfo,
  JourneyDayInfo,
  DailyStatusSummary,
  IntelligentTaskStatus,
  TaskTimeRecord,
  POPULAR_TIMEZONES,
} from "@/lib/timeEngine";

export interface TimeState {
  dateStr: string;
  time24: string;
  time24WithSec: string;
  displayDateStr: string;
  displayTimeStr: string;
  greeting: string;
  hour: number;
  minute: number;
}

export function useTimeEngine(initialTimezone?: string) {
  // 1. Timezone State with persistence
  const [timezone, setTimezoneState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("life_os_timezone");
      if (saved) return saved;
    }
    return initialTimezone || detectBrowserTimezone();
  });

  // 2. Live Time State
  const [timeState, setTimeState] = useState<TimeState>(() =>
    getNowInTimezone(timezone)
  );

  // Timezone Details
  const timezoneInfo = useMemo<TimezoneInfo>(
    () => getTimezoneInfo(timezone),
    [timezone]
  );

  // 90-Day Journey Progress
  const journeyInfo = useMemo<JourneyDayInfo>(
    () => calculateJourneyDayInfo(timeState.dateStr, "2026-11-02", 90),
    [timeState.dateStr]
  );

  // Update clock function
  const updateClock = useCallback(() => {
    const fresh = getNowInTimezone(timezone);
    setTimeState(fresh);
  }, [timezone]);

  // Set Timezone Handler
  const setTimezone = useCallback((newTz: string) => {
    setTimezoneState(newTz);
    if (typeof window !== "undefined") {
      localStorage.setItem("life_os_timezone", newTz);
      // Dispatch custom event to notify all listening components
      window.dispatchEvent(
        new CustomEvent("life_os_timezone_changed", { detail: newTz })
      );
    }
  }, []);

  // Sync clock every 1 second
  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 1000);

    // Also update immediately on tab visibility change or window focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateClock();
      }
    };

    const handleFocus = () => {
      updateClock();
    };

    const handleTzEvent = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail && customEvent.detail !== timezone) {
        setTimezoneState(customEvent.detail);
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("life_os_timezone_changed", handleTzEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("life_os_timezone_changed", handleTzEvent);
    };
  }, [updateClock, timezone]);

  // Helper to calculate intelligent status for any task in current local time
  const getTaskStatus = useCallback(
    (task: TaskTimeRecord): IntelligentTaskStatus => {
      return calculateIntelligentTaskStatus(
        task,
        timeState.dateStr,
        timeState.time24
      );
    },
    [timeState.dateStr, timeState.time24]
  );

  // Helper to summarize a list of tasks
  const summarizeTasks = useCallback(
    (tasks: TaskTimeRecord[]): DailyStatusSummary => {
      return getDailyTaskStatusSummary(
        tasks,
        timeState.dateStr,
        timeState.time24
      );
    },
    [timeState.dateStr, timeState.time24]
  );

  // Helper to get actionable guidance on what to do now
  const getActionGuidance = useCallback(
    (tasks: any[]): WhatShouldIDoNowInfo => {
      return getWhatShouldIDoNow(
        tasks,
        timeState.dateStr,
        timeState.time24
      );
    },
    [timeState.dateStr, timeState.time24]
  );

  return {
    timezone,
    setTimezone,
    timezoneInfo,
    timeState,
    now: timeState,
    journeyInfo,
    getTaskStatus,
    summarizeTasks,
    getActionGuidance,
    popularTimezones: POPULAR_TIMEZONES,
  };
}

