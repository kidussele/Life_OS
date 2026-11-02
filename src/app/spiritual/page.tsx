"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { PrayerTimer } from "@/components/PrayerTimer";
import { Modal } from "@/components/Modal";
import {
  Sun,
  Moon,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Quote,
  Check,
  Shield,
  Star,
  Layers,
  ArrowRight,
  Cross,
  Plus,
} from "lucide-react";
import { PrayerLog } from "@/lib/types";

export default function SpiritualLifePage() {
  const [logs, setLogs] = useState<PrayerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTimerType, setActiveTimerType] = useState<"morning" | "night" | null>(null);
  const [today, setToday] = useState("2026-11-02");

  // Local state for today's status
  const [morningCompleted, setMorningCompleted] = useState(false);
  const [nightCompleted, setNightCompleted] = useState(false);

  // Spiritual Goals checklist
  const [goalMorningDone, setGoalMorningDone] = useState(false);
  const [goalNightDone, setGoalNightDone] = useState(false);
  const [goalTotalDone, setGoalTotalDone] = useState(false);

  // Fetch from DB
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prayers");
      if (res.ok) {
        const data = await res.json();
        const prayerLogs: PrayerLog[] = data.logs || [];
        setLogs(prayerLogs);

        const currentToday = new Date().toISOString().split("T")[0];
        setToday(currentToday);

        const isMorningDone = prayerLogs.some(
          (l) => l.date === currentToday && l.prayer_type === "morning" && l.completed
        );
        const isNightDone = prayerLogs.some(
          (l) => l.date === currentToday && l.prayer_type === "night" && l.completed
        );
        setMorningCompleted(isMorningDone);
        setNightCompleted(isNightDone);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Mark as Completed
  const handleTogglePrayer = async (type: "morning" | "night") => {
    const isCurrentlyDone = type === "morning" ? morningCompleted : nightCompleted;
    const nextDone = !isCurrentlyDone;

    if (type === "morning") {
      setMorningCompleted(nextDone);
    } else {
      setNightCompleted(nextDone);
    }

    try {
      await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prayer_type: type,
          date: today,
          completed: nextDone,
          duration_minutes: 30,
          spiritual_focus: type === "morning" ? "Morning Praise & Intentions" : "Night Peace & Gratitude",
          gratitude_notes: type === "morning" ? "Thankfulness for a new day of life." : "Peace and gratitude before rest.",
        }),
      });
      fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // 90-day progress metrics
  const completedLogKeys = new Set(logs.filter((l) => l.completed).map((l) => `${l.date}_${l.prayer_type}`));
  if (morningCompleted && today) completedLogKeys.add(`${today}_morning`);
  if (nightCompleted && today) completedLogKeys.add(`${today}_night`);

  const morningCount = Array.from(completedLogKeys).filter((k) => k.endsWith("_morning")).length;
  const nightCount = Array.from(completedLogKeys).filter((k) => k.endsWith("_night")).length;
  const totalCompleted = completedLogKeys.size;
  const targetTotal = 180; // 90 morning + 90 night
  const progressPercent = Math.min(100, Math.round((totalCompleted / targetTotal) * 100));

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC ETHIOPIAN ORTHODOX HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[145px] sm:min-h-[165px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/spiritual/church_hero.jpg"
              alt="Ancient Ethiopian Orthodox Stone Monastery at Sunrise"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:w-[65%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title with Ethiopian Saint Mary Icon */}
            <div className="flex items-center space-x-4">
              {/* Authentic Ethiopian Orthodox Icon of St. Mary (Mariam) with Baby Jesus */}
              <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-md flex-shrink-0 relative bg-[#FEF3C7]">
                <Image
                  src="/spiritual/mary_icon.jpg"
                  alt="Ethiopian Orthodox Saint Mary Icon"
                  fill
                  className="object-cover object-top"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  Spiritual Life
                </h1>
                <p className="text-[13px] sm:text-[14px] text-[#284534] font-serif italic mt-0.5">
                  &ldquo;Pray without ceasing.&rdquo; — 1 Thessalonians 5:17
                </p>
              </div>
            </div>

            {/* Right Side: Golden Glassmorphic Quote Badge */}
            <div className="flex items-center flex-shrink-0">
              <div className="bg-black/45 backdrop-blur-md border border-[#D4AF37]/50 text-[#FEF3C7] rounded-2xl px-5 py-3 shadow-sm flex items-center space-x-2.5 max-w-sm">
                <Quote size={16} className="text-[#FCD34D] rotate-180 flex-shrink-0" />
                <span className="text-[12.5px] font-serif italic leading-snug">
                  &ldquo;With faith, all things are possible.&rdquo;
                </span>
                <Quote size={16} className="text-[#FCD34D] flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. TODAY'S TWO PRAYER CARDS (MORNING & NIGHT PRAYER)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* CARD 1: MORNING PRAYER */}
          <div className="relative rounded-3xl overflow-hidden border border-[#D5E2D9] shadow-xs min-h-[195px] flex flex-col justify-between p-5 sm:p-6 bg-[#FAF7F2]">
            {/* Background Image: Ethiopian Orthodox Church at Dawn */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/spiritual/morning_prayer.jpg"
                alt="Ethiopian Church at Sunrise"
                fill
                className="object-cover object-right opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:w-[70%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
            </div>

            {/* Content Top: Header + Status Badge */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Sun size={24} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-[#112318] tracking-tight">
                    Morning Prayer
                  </h3>
                  <span className="text-[12.5px] font-bold text-[#486053] font-mono block">
                    04:00 – 04:30 AM • 30 Minutes
                  </span>
                  <p className="text-[12px] text-[#5A6E63] font-medium mt-1">
                    Begin your day with prayer and thanksgiving.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`text-center px-3.5 py-1.5 rounded-2xl text-[11px] font-bold border shadow-2xs ${
                  morningCompleted
                    ? "bg-[#EBF5EE] text-[#165B33] border-[#B7E4C7]"
                    : "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                }`}
              >
                <span className="block text-[10px] uppercase font-extrabold text-[#6C8176]">
                  Today's Status
                </span>
                <span className="font-extrabold">
                  {morningCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            {/* Content Bottom: Actions */}
            <div className="relative z-10 flex items-center justify-between gap-3 pt-4 border-t border-[#EAEFEA]/80 mt-4">
              <button
                type="button"
                onClick={() => setActiveTimerType("morning")}
                className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-1"
              >
                <Clock size={13} />
                <span>Start 30m Devotion Timer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePrayer("morning")}
                className={`px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                  morningCompleted
                    ? "bg-[#165B33] text-white hover:bg-[#123D26]"
                    : "bg-white/95 hover:bg-white text-[#165B33] border border-[#B7E4C7]"
                }`}
              >
                <span>{morningCompleted ? "Completed" : "Mark as Completed"}</span>
                <Check size={13} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* CARD 2: NIGHT PRAYER */}
          <div className="relative rounded-3xl overflow-hidden border border-[#1E293B] shadow-xs min-h-[195px] flex flex-col justify-between p-5 sm:p-6 bg-[#0B132B]">
            {/* Background Image: Ethiopian Orthodox Church under Starry Night Sky */}
            <div className="absolute inset-0 pointer-events-none">
              <Image
                src="/spiritual/night_church.jpg"
                alt="Ethiopian Orthodox Church under Night Sky with Candles"
                fill
                className="object-cover object-right opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B132B]/95 via-[#0B132B]/85 to-transparent sm:w-[70%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/40 via-transparent to-transparent" />
            </div>

            {/* Content Top: Header + Status Badge */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#1E293B] text-[#93C5FD] flex items-center justify-center flex-shrink-0 shadow-2xs border border-white/10">
                  <Moon size={22} className="stroke-[2.2] fill-[#93C5FD]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-extrabold text-white tracking-tight">
                    Night Prayer
                  </h3>
                  <span className="text-[12.5px] font-bold text-[#93C5FD] font-mono block">
                    09:15 – 09:45 PM • 30 Minutes
                  </span>
                  <p className="text-[12px] text-[#CBD5E1] font-medium mt-1">
                    End your day with prayer and peace.
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div
                className={`text-center px-3.5 py-1.5 rounded-2xl text-[11px] font-bold border shadow-2xs ${
                  nightCompleted
                    ? "bg-[#EBF5EE] text-[#165B33] border-[#B7E4C7]"
                    : "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                }`}
              >
                <span className="block text-[10px] uppercase font-extrabold text-[#6C8176]">
                  Today's Status
                </span>
                <span className="font-extrabold">
                  {nightCompleted ? "Completed" : "Pending"}
                </span>
              </div>
            </div>

            {/* Content Bottom: Actions */}
            <div className="relative z-10 flex items-center justify-between gap-3 pt-4 border-t border-white/10 mt-4">
              <button
                type="button"
                onClick={() => setActiveTimerType("night")}
                className="text-[11.5px] font-bold text-[#93C5FD] hover:underline flex items-center gap-1"
              >
                <Clock size={13} />
                <span>Start 30m Devotion Timer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTogglePrayer("night")}
                className={`px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-1.5 shadow-sm transition-all ${
                  nightCompleted
                    ? "bg-[#165B33] text-white hover:bg-[#123D26]"
                    : "bg-white/95 hover:bg-white text-[#165B33] border border-[#B7E4C7]"
                }`}
              >
                <span>{nightCompleted ? "Completed" : "Mark as Completed"}</span>
                <Check size={13} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. MIDDLE ROW: PRAYER PROGRESS (LEFT) + SPIRITUAL GOALS (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: PRAYER PROGRESS (90 DAYS) (col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-2 text-[#112318] pb-2 border-b border-[#F0F4F1]">
              <Clock size={17} className="text-[#165B33]" />
              <h3 className="text-[15px] font-extrabold">Prayer Progress (90 Days)</h3>
            </div>

            {/* Gauge on Left + 3 Stats Columns on Right */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
              {/* Circular Gauge */}
              <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
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
                <div className="absolute flex flex-col items-center">
                  <span className="text-[17px] font-extrabold text-[#112318] font-mono leading-none">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] text-[#6C8176] font-medium mt-0.5">
                    Complete
                  </span>
                </div>
              </div>

              {/* 3 Stats Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 text-center">
                {/* Morning */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#D97706]">
                    <Sun size={13} />
                    <span>Morning Prayer</span>
                  </div>
                  <span className="text-[15px] font-extrabold text-[#112318] font-mono block">
                    {morningCount} / 90
                  </span>
                  <span className="text-[10px] font-bold text-[#6C8176] block">
                    {Math.round((morningCount / 90) * 100)}%
                  </span>
                  <div className="h-1 bg-[#E8EEEA] rounded-full overflow-hidden w-full max-w-[70px] mx-auto mt-1">
                    <div
                      className="h-full bg-[#D97706] rounded-full"
                      style={{ width: `${Math.round((morningCount / 90) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Night */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#1E40AF]">
                    <Moon size={13} />
                    <span>Night Prayer</span>
                  </div>
                  <span className="text-[15px] font-extrabold text-[#112318] font-mono block">
                    {nightCount} / 90
                  </span>
                  <span className="text-[10px] font-bold text-[#6C8176] block">
                    {Math.round((nightCount / 90) * 100)}%
                  </span>
                  <div className="h-1 bg-[#E8EEEA] rounded-full overflow-hidden w-full max-w-[70px] mx-auto mt-1">
                    <div
                      className="h-full bg-[#1E40AF] rounded-full"
                      style={{ width: `${Math.round((nightCount / 90) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-[#165B33]">
                    <Star size={13} />
                    <span>Total Prayers</span>
                  </div>
                  <span className="text-[15px] font-extrabold text-[#112318] font-mono block">
                    {totalCompleted} / 180
                  </span>
                  <span className="text-[10px] font-bold text-[#6C8176] block">
                    {progressPercent}%
                  </span>
                  <div className="h-1 bg-[#E8EEEA] rounded-full overflow-hidden w-full max-w-[70px] mx-auto mt-1">
                    <div
                      className="h-full bg-[#165B33] rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: SPIRITUAL GOALS (col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center space-x-2 text-[#112318] pb-2 border-b border-[#F0F4F1]">
              <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Shield size={14} className="stroke-[2.5]" />
              </div>
              <h3 className="text-[15px] font-extrabold">Spiritual Goals</h3>
            </div>

            {/* Checklist on Left + Ethiopian Orthodox Censer Image on Right */}
            <div className="flex items-center justify-between gap-4">
              {/* Checklist */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Item 1 */}
                <div
                  onClick={() => setGoalMorningDone(!goalMorningDone)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E2E9E4] hover:border-[#165B33] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        goalMorningDone
                          ? "bg-[#165B33] text-white"
                          : "border-2 border-[#CBD7CE] bg-white group-hover:border-[#165B33]"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} className={goalMorningDone ? "opacity-100" : "opacity-0"} />
                    </div>
                    <span className="text-[12.5px] font-bold text-[#14211A]">
                      90 Morning Prayer Sessions
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F7FAF8] text-[#D97706] border border-[#FDE68A]">
                    Target: 90
                  </span>
                </div>

                {/* Item 2 */}
                <div
                  onClick={() => setGoalNightDone(!goalNightDone)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E2E9E4] hover:border-[#165B33] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        goalNightDone
                          ? "bg-[#165B33] text-white"
                          : "border-2 border-[#CBD7CE] bg-white group-hover:border-[#165B33]"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} className={goalNightDone ? "opacity-100" : "opacity-0"} />
                    </div>
                    <span className="text-[12.5px] font-bold text-[#14211A]">
                      90 Night Prayer Sessions
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F7FAF8] text-[#D97706] border border-[#FDE68A]">
                    Target: 90
                  </span>
                </div>

                {/* Item 3 */}
                <div
                  onClick={() => setGoalTotalDone(!goalTotalDone)}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[#E2E9E4] hover:border-[#165B33] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        goalTotalDone
                          ? "bg-[#165B33] text-white"
                          : "border-2 border-[#CBD7CE] bg-white group-hover:border-[#165B33]"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} className={goalTotalDone ? "opacity-100" : "opacity-0"} />
                    </div>
                    <span className="text-[12.5px] font-bold text-[#14211A]">
                      180 Total Prayers
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F7FAF8] text-[#D97706] border border-[#FDE68A]">
                    Target: 180
                  </span>
                </div>
              </div>

              {/* Right Visual: Authentic Ethiopian Liturgical Censer (Ma'etant) */}
              <div className="w-28 sm:w-36 h-28 rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9] shadow-2xs bg-[#FAF7F2]">
                <Image
                  src="/spiritual/censer.jpg"
                  alt="Ethiopian Orthodox Liturgical Censer (Ma'etant)"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. BOTTOM ROW: DEVOTION HISTORY (LEFT) + SCRIPTURE BANNER (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: DEVOTION HISTORY (col-span-6) */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2 text-[#112318]">
                <div className="w-6 h-6 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center">
                  <Cross size={14} className="stroke-[2.5]" />
                </div>
                <h3 className="text-[15px] font-extrabold">Devotion History</h3>
              </div>
              <button
                type="button"
                onClick={() => fetchLogs()}
                className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Devotion Records List */}
            <div className="space-y-2.5">
              {logs.length > 0 ? (
                logs.slice(0, 3).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <Calendar size={15} className="text-[#165B33] flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-bold text-[#14211A] block truncate">
                          {log.date} • {log.prayer_type === "morning" ? "4:00 AM" : "9:15 PM"}
                        </span>
                        <span className="text-[#6C8176] text-[11px] truncate block">
                          {log.prayer_type === "morning" ? "Morning Prayer - Thankfulness." : "Night Prayer - Peace and gratitude."}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] flex-shrink-0">
                      Completed
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 px-4 text-center rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <p className="text-[12.5px] font-semibold text-[#14211A]">No prayer sessions logged yet</p>
                  <p className="text-[11px] text-[#6C8176] mt-0.5">Day 1 morning prayer begins at 04:00 AM.</p>
                </div>
              )}
            </div>
          </div>

          {/* CARD 2: SCRIPTURE CONTEMPLATION BANNER (col-span-6) */}
          <div className="lg:col-span-6 rounded-3xl overflow-hidden relative min-h-[170px] border border-[#D5E2D9] shadow-xs flex items-center p-6 sm:p-7 bg-[#0E2C1B]">
            <Image
              src="/spiritual/scripture_silhouette.jpg"
              alt="Person praying beside Ethiopian cross overlooking hills"
              fill
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[65%]" />

            <div className="relative z-10 max-w-sm space-y-1.5">
              <h3 className="text-[16px] sm:text-[18px] font-serif font-extrabold text-[#112318] italic leading-snug">
                &ldquo;Lord, give me the strength to walk in Your ways.&rdquo;
              </h3>
              <p className="text-[13px] font-bold text-[#165B33] tracking-wide font-serif">
                — Psalm 119:105
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL: ACTIVE PRAYER DEVOTION TIMER (30m)
            ======================================================== */}
        <Modal
          isOpen={!!activeTimerType}
          onClose={() => setActiveTimerType(null)}
          title={
            activeTimerType === "morning"
              ? "Morning Prayer Devotion (04:00 – 04:30 AM)"
              : "Night Prayer Devotion (09:15 – 09:45 PM)"
          }
          maxWidth="max-w-2xl"
        >
          {activeTimerType && (
            <PrayerTimer
              prayerType={activeTimerType}
              scheduledTime={activeTimerType === "morning" ? "04:00 AM" : "09:15 PM"}
              onComplete={() => {
                if (activeTimerType === "morning") setMorningCompleted(true);
                else setNightCompleted(true);
                setActiveTimerType(null);
                fetchLogs();
              }}
            />
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
