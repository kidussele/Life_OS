"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import Link from "next/link";
import {
  Activity,
  HeartPulse,
  CheckCircle2,
  Clock,
  Dumbbell,
  Timer,
  Check,
  ArrowRight,
  Glasses,
  X,
  Droplet,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Flame,
} from "lucide-react";

export default function HealthFitnessPage() {
  const [showAdvisory, setShowAdvisory] = useState(true);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isHealthPlanModalOpen, setIsHealthPlanModalOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);

  // Health Metrics
  const [bedtime, setBedtime] = useState("22:00");
  const [wakeTime, setWakeTime] = useState("06:00");
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [sleepQuality, setSleepQuality] = useState(85);
  const [recoveryScore, setRecoveryScore] = useState(92);

  useEffect(() => {
    const loadHealth = async () => {
      try {
        const res = await fetch("/api/health");
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            const latest = data.logs[0];
            if (latest.sleep_quality) setSleepQuality(latest.sleep_quality);
            if (latest.recovery_score) setRecoveryScore(latest.recovery_score);
            if (latest.hydration_glasses) setWaterGlasses(latest.hydration_glasses);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadHealth();
  }, []);

  const handleSaveSleep = async () => {
    setIsSleepModalOpen(false);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await fetch("/api/health", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr,
          sleep_hours: 8.0,
          sleep_quality: 90,
          recovery_score: 95,
          hydration_glasses: waterGlasses,
          workout_completed: 1,
          notes: `Bedtime: ${bedtime}, Wake: ${wakeTime}`,
        }),
      });
      setSleepQuality(90);
      setRecoveryScore(95);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP SLEEP DURATION ADVISORY BANNER                     */}
        {/* ========================================================= */}
        {showAdvisory && (
          <div className="relative bg-[#F0FDF4] border border-[#BBF7D0] p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start space-x-3 min-w-0 pr-6 sm:pr-0">
              {/* Runner Icon in Mint Circle */}
              <div className="w-8 h-8 rounded-full bg-[#DCFCE7] text-[#165B33] flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[16px]">🏃</span>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-[13px] text-[#0F172A]">
                    Sleep Duration Advisory (6 hrs / night)
                  </h3>
                  <span className="bg-[#DCFCE7] text-[#165B33] text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border border-[#86EFAC]">
                    INSUFFICIENT RECOVERY
                  </span>
                </div>

                <p className="text-[11px] text-[#475569] leading-relaxed mt-0.5">
                  You need preferences set for bedtime at 22:00 and wake-up at 06:00, resulting in 8 daily hours of sleep. Chronic sub-7h sleep impairs cognitive endurance, emotional stability in trading, and software engineering precision.
                </p>
              </div>
            </div>

            {/* Right Action Button & Dismiss */}
            <div className="flex items-center space-x-2 self-start sm:self-center flex-shrink-0">
              <button
                onClick={() => setIsSleepModalOpen(true)}
                className="bg-white hover:bg-[#F8FAFC] text-[#165B33] border border-[#CBD5E1] px-3.5 py-1.5 rounded-full text-[11px] font-bold shadow-xs transition-all flex items-center space-x-1"
              >
                <span>Update Sleep Goals</span>
                <ArrowRight size={11} className="ml-0.5" />
              </button>

              <button
                onClick={() => setShowAdvisory(false)}
                className="text-[#94A3B8] hover:text-[#64748B] p-1 rounded-md transition-colors"
                title="Dismiss banner"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. MAIN HERO BANNER: HEALTH, EXERCISE & SLEEP RECOVERY   */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C8E6C9] shadow-sm bg-[#0E2C1B] p-4 sm:p-5 min-h-[145px] flex items-center">
          {/* Alpine runner mountain landscape background (Clean, text-free) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-right pointer-events-none opacity-90"
            style={{
              backgroundImage: "url('/health/health_hero_runner.png')",
            }}
          />
          {/* Left soft mint gradient for 100% crisp text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#EBF8F1]/95 via-[#EBF8F1]/85 to-transparent sm:w-[65%] pointer-events-none" />

          <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              {/* Mint green heart with EKG pulse icon */}
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center flex-shrink-0 shadow-sm text-[#16A34A]">
                <HeartPulse size={28} className="stroke-[2.5]" />
              </div>

              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#165B33]">
                  VITALITY &amp; PHYSICAL ENERGY
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0D3823] tracking-tight">
                  Health, Exercise &amp; Sleep Recovery
                </h1>
                <p className="text-[12px] sm:text-[13px] text-[#24523A] font-medium mt-0.5">
                  Protect your physical health. Achieve your fitness goals. Get quality sleep for peak performance.
                </p>
              </div>
            </div>

            {/* View Health Plan Button */}
            <div className="flex-shrink-0 self-start sm:self-center">
              <button
                onClick={() => setIsHealthPlanModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-[#124B2C] hover:bg-[#0D3823] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all"
              >
                <span>View Health Plan</span>
                <ArrowRight size={13} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FOUR HEALTH STAT CARDS ROW                             */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Program Status */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#16A34A] flex-shrink-0 shadow-sm">
              <CheckCircle2 size={22} className="stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#64748B] block truncate">
                Program Status
              </span>
              <div className="text-[15px] sm:text-[16px] font-extrabold text-[#0F172A] leading-tight mt-0.5 truncate">
                Day 1 Initialized (0%)
              </div>
              <span className="text-[11px] font-semibold text-[#16A34A] flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                <span>Day 1 of 90-day plan</span>
              </span>
            </div>
          </div>

          {/* Card 2: Sleep Quality */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
                <Glasses size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#64748B] block truncate">
                  Sleep Quality
                </span>
                <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                  {sleepQuality}%
                </div>
                <span className="text-[11px] font-semibold text-[#16A34A] block truncate">
                  Day 1 Baseline
                </span>
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="w-12 h-6 hidden sm:block">
              <svg viewBox="0 0 50 25" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#86EFAC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points="2,18 12,15 22,20 32,10 42,12 48,6"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Weekly Workouts */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
                <Dumbbell size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#64748B] block truncate">
                  Weekly Workouts
                </span>
                <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                  0 / 5
                </div>
                <span className="text-[11px] font-semibold text-[#16A34A] flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>Starting Day 1</span>
                </span>
              </div>
            </div>

            {/* Sparkline curve */}
            <div className="w-12 h-6 hidden sm:block">
              <svg viewBox="0 0 50 25" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke="#86EFAC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  points="2,22 12,18 24,19 36,12 48,8"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Recovery Score */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-sm">
                <Timer size={22} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-[#64748B] block truncate">
                  Recovery Score
                </span>
                <div className="text-2xl font-extrabold text-[#0F172A] leading-tight mt-0.5">
                  {recoveryScore}%
                </div>
                <span className="text-[11px] font-semibold text-[#16A34A] flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                  <span>Ready for Day 1</span>
                </span>
              </div>
            </div>

            {/* Ascending green bars indicator */}
            <div className="flex items-end gap-1 h-7">
              <span className="w-1.5 bg-[#BBF7D0] rounded-t-sm h-2.5" />
              <span className="w-1.5 bg-[#86EFAC] rounded-t-sm h-3.5" />
              <span className="w-1.5 bg-[#4ADE80] rounded-t-sm h-4.5" />
              <span className="w-1.5 bg-[#22C55E] rounded-t-sm h-5.5" />
              <span className="w-1.5 bg-[#16A34A] rounded-t-sm h-7" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. REALISTIC WORKOUT PROTOCOLS (3 Cards)                  */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[#F1F5F9]">
            <div className="flex items-center space-x-2">
              <Dumbbell size={18} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#0F172A]">
                Realistic Workout Protocols
              </h2>
            </div>

            <button
              onClick={() => setIsHealthPlanModalOpen(true)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#165B33] border border-[#BBF7D0] rounded-full text-[11px] font-bold transition-all shadow-xs"
            >
              <span>View All Protocols</span>
              <ArrowRight size={11} className="ml-0.5" />
            </button>
          </div>

          {/* 3 Workout Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {/* Card 1: Morning Mobility & Core Circuit */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FBFBFA] flex items-start space-x-3 hover:border-[#165B33] transition-colors">
              <img
                src="/health/plank_workout.png"
                alt="Plank core workout"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E2E8F0]"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                  Morning Mobility & Core Circuit (60 Min)
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-[#64748B] font-medium mt-0.5 mb-2">
                  <Clock size={12} />
                  <span>04:30 – 05:30 AM</span>
                </div>

                <div className="space-y-1 text-[11px] text-[#475569]">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Dynamic Joint Mobility & Core (5 min)</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Full-Body Circuit – 3 sets of 15–20 reps (25 min)</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Cool Down & Stretching (10 min)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Saturday Strength & Cardio */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FBFBFA] flex items-start space-x-3 hover:border-[#165B33] transition-colors">
              <img
                src="/health/running_shoes.png"
                alt="Running shoes workout"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E2E8F0]"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                  Saturday Strength & Cardio (60 Min)
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-[#64748B] font-medium mt-0.5 mb-2">
                  <Clock size={12} />
                  <span>Saturday 05:30 – 06:30 AM</span>
                </div>

                <div className="space-y-1 text-[11px] text-[#475569]">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Light Jogging or Bike (20 min)</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Strength Circuit (30 min)</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Deep Stretching (10 min)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Sunday Recovery & Walking */}
            <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-[#FBFBFA] flex items-start space-x-3 hover:border-[#165B33] transition-colors">
              <img
                src="/health/forest_path.png"
                alt="Forest path walk"
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E2E8F0]"
              />

              <div className="min-w-0 flex-1">
                <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug">
                  Sunday Recovery & Walking
                </h3>
                <div className="flex items-center space-x-1 text-[11px] text-[#64748B] font-medium mt-0.5 mb-2">
                  <Clock size={12} />
                  <span>Sunday Afternoon</span>
                </div>

                <div className="space-y-1 text-[11px] text-[#475569]">
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Relaxing Nature Walk (45 min)</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Zinc Recovery Smoothie</span>
                  </div>
                  <div className="flex items-start space-x-1.5">
                    <CheckCircle2 size={12} className="text-[#16A34A] flex-shrink-0 mt-0.5" />
                    <span>Full Nervous System Reset</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. BOTTOM CARD: HEALTH SCIENCE INSIGHT                    */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C8E6C9] shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#F4FBF7]">
          {/* Subtle green leaves background graphic */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-right opacity-85 pointer-events-none"
            style={{
              backgroundImage: "url('/health/health_insight_banner.png')",
            }}
          />
          {/* Soft gradient fade so text is 100% crisp and legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4FBF7]/95 via-[#F4FBF7]/80 to-transparent sm:w-[70%] pointer-events-none" />

          <div className="relative z-10 flex items-start space-x-3 max-w-2xl">
            {/* Lightbulb in white box */}
            <div className="w-10 h-10 rounded-xl bg-white border border-[#C8E6C9] flex items-center justify-center flex-shrink-0 shadow-sm text-[18px]">
              💡
            </div>

            <div>
              <div className="text-[12px] font-extrabold text-[#165B33]">
                Health Science Insight
              </div>
              <h4 className="text-[13px] font-bold text-[#0F172A] mt-0.5">
                Why 6.0 Hours Require Schedule Optimization
              </h4>
              <p className="text-[11px] text-[#334155] leading-relaxed mt-0.5">
                While walking at 6:00 AM can improve your focus, Dilema rigidly recommend moving it to a 7:00 AM–7:30 AM slot for better long-term adherence.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex-shrink-0 self-start sm:self-center">
            <button
              onClick={() => setIsOptimizeModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#124B2C] hover:bg-[#0D3823] text-white rounded-xl text-[12px] font-bold shadow-sm transition-all"
            >
              <span>Optimize My Schedule</span>
              <ArrowRight size={13} className="ml-0.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: UPDATE SLEEP GOALS                                 */}
        {/* ========================================================= */}
        <Modal
          isOpen={isSleepModalOpen}
          onClose={() => setIsSleepModalOpen(false)}
          title="Update Sleep & Recovery Targets"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <p className="text-[12px] text-[#475569]">
              Set non-negotiable bedtime and wake-up times to guarantee at least 7.5 to 8.0 hours of physical sleep recovery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Bedtime Target
                </label>
                <input
                  type="time"
                  value={bedtime}
                  onChange={(e) => setBedtime(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                  Wake-Up Target
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-3 py-2 text-[12px] bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[12px] text-[#165B33]">
              <strong>Circadian Health: </strong>Consistent sleep rhythms regulate cortisol and testosterone levels, directly protecting energy levels for software development and trading.
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={handleSaveSleep}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                Save Sleep Preferences
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: VIEW HEALTH PLAN                                   */}
        {/* ========================================================= */}
        <Modal
          isOpen={isHealthPlanModalOpen}
          onClose={() => setIsHealthPlanModalOpen(false)}
          title="Holistic Physical Energy Architecture"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-[#165B33]">
              <strong>Primary Health Mandate: </strong>Physical vitality is the foundation for all financial and software accomplishments. Morning workouts are non-negotiable.
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A]">Weekly Workout Cadence:</h4>
              <ul className="space-y-1.5 text-[12px] text-[#475569]">
                <li>• <strong>Monday–Friday (04:30–05:30 AM):</strong> Joint mobility, pushups, bodyweight squats, core planks.</li>
                <li>• <strong>Saturday (05:30–06:30 AM):</strong> 30-min outdoor jog or bike + calisthenics.</li>
                <li>• <strong>Sunday Afternoon:</strong> 45-minute nature walk with family.</li>
              </ul>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
              <button
                onClick={() => setIsHealthPlanModalOpen(false)}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                Close Plan
              </button>
            </div>
          </div>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: OPTIMIZE MY SCHEDULE                               */}
        {/* ========================================================= */}
        <Modal
          isOpen={isOptimizeModalOpen}
          onClose={() => setIsOptimizeModalOpen(false)}
          title="Schedule Optimization & Chronotype Tuning"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-[13px] text-[#334155]">
            <p className="text-[12px] text-[#475569]">
              Rebalance morning walking and deep work blocks to prevent mid-day cognitive fatigue.
            </p>

            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5 text-[12px]">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Recommended Walk Time:</span>
                <span className="font-bold text-[#165B33]">07:00 – 07:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Morning Deep Work:</span>
                <span className="font-bold text-[#0F172A]">08:30 – 12:00 PM</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <Link
                href="/calendar"
                className="inline-flex items-center space-x-1 px-4 py-2 text-[12px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                <span>Go to Calendar</span>
                <ArrowRight size={12} className="ml-0.5" />
              </Link>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
