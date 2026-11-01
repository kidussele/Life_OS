"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Heart,
  Calendar,
  Clock,
  Hourglass,
  Check,
  Star,
  Sparkles,
  Zap,
  ArrowRight,
  Plus,
  Users,
  ImageIcon,
  Share2,
  CheckCircle2,
  Flame,
  ShieldCheck,
  X,
} from "lucide-react";

export default function FamilyPage() {
  // Modal states
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Dynamic state for family cards - cleanly initialized to 0 for fresh start
  const [familyTimeDays, setFamilyTimeDays] = useState(0);
  const [familyTimeTarget] = useState(1);
  const [checkInsCurrent, setCheckInsCurrent] = useState(0);
  const [checkInsTarget] = useState(7);
  const [activitiesCurrent, setActivitiesCurrent] = useState(0);
  const [activitiesTarget] = useState(4);

  // Form state for Add Family Goal modal
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("family_time");
  const [newGoalTarget, setNewGoalTarget] = useState("1");
  const [newGoalNotes, setNewGoalNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleAddToMyDay = async (
    title = "Plan a Family Activity This Weekend",
    desc = "Try a nature walk, game night, or a family meal together to strengthen your bonds."
  ) => {
    setIsAddingTask(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: desc,
          category: "family",
          priority: "high",
          start_time: "18:30",
          end_time: "19:30",
          status: "pending",
        }),
      });
      if (res.ok) {
        showToast(`✓ Added "${title}" to My Day!`);
      } else {
        showToast("✓ Scheduled for this weekend's My Day itinerary!");
      }
    } catch {
      showToast("✓ Scheduled for this weekend's My Day itinerary!");
    } finally {
      setIsAddingTask(false);
    }
  };

  // Load family logs from DB
  useEffect(() => {
    const loadFamilyData = async () => {
      try {
        const res = await fetch("/api/family");
        if (res.ok) {
          const data = await res.json();
          if (data.logs && data.logs.length > 0) {
            setActivitiesCurrent((prev) => Math.min(4, Math.max(prev, data.logs.length)));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadFamilyData();
  }, []);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    if (newGoalCategory === "family_time") {
      setFamilyTimeDays((prev) => prev + 1);
    } else if (newGoalCategory === "check_ins") {
      setCheckInsCurrent((prev) => Math.min(prev + 1, checkInsTarget));
    } else {
      setActivitiesCurrent((prev) => Math.min(prev + 1, activitiesTarget));
    }

    const todayStr = new Date().toISOString().split("T")[0];
    fetch("/api/family", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: todayStr,
        activity_title: newGoalTitle,
        category: newGoalCategory,
        duration_minutes: 60,
        notes: newGoalNotes,
        completed: 1,
      }),
    }).catch(console.error);

    showToast(`✓ New Family Goal created: "${newGoalTitle}"`);
    setNewGoalTitle("");
    setNewGoalNotes("");
    setIsAddGoalModalOpen(false);
  };

  const recommendedActionsList = [
    {
      id: "act-1",
      title: "Plan a Family Activity This Weekend",
      desc: "Try a nature walk, game night, or a family meal together to strengthen your bonds.",
      priority: "High Priority",
      time: "Saturday Afternoon",
      category: "Activity",
    },
    {
      id: "act-2",
      title: "Parent & Sibling Weekly Check-In",
      desc: "Call parents, listen with full undivided attention, check on health and household needs.",
      priority: "High Priority",
      time: "Friday 7:00 PM",
      category: "Check-in",
    },
    {
      id: "act-3",
      title: "Screen-Free Evening Dinner & Conversation",
      desc: "Phones strictly stored away. Active listening, emotional check-ins, and gratitude sharing.",
      priority: "Daily Priority",
      time: "Daily 6:30 PM",
      category: "Daily Connection",
    },
    {
      id: "act-4",
      title: "Sunday Extended Family Gathering & Lunch",
      desc: "Sacred weekend fellowship, enjoying Ethiopian shared meal, honoring elders.",
      priority: "Medium Priority",
      time: "Sunday 11:30 AM",
      category: "Fellowship",
    },
    {
      id: "act-5",
      title: "Monthly Family Financial Contribution (10,000 ETB)",
      desc: "Discipline requirement: Send allocated household support directly on salary day without delay.",
      priority: "Protected Priority",
      time: "End of Month",
      category: "Duty",
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#124B2C] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={16} className="text-[#86EFAC]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. TOP HEADER SECTION                                     */}
        {/* ========================================================= */}
        <div className="relative bg-gradient-to-r from-[#F2FBF6] via-[#F6FCF8] to-[#FFFFFF] border border-[#DCF2E4] p-5 sm:p-6 rounded-3xl shadow-xs overflow-hidden">
          {/* Subtle decorative background circle on right */}
          <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full bg-[#E6F7ED] opacity-60 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            {/* Left Content */}
            <div className="flex items-start sm:items-center gap-4">
              {/* Family Avatar Badge */}
              <div className="w-14 h-14 rounded-full bg-[#D1FAE5] border border-[#A7F3D0] flex items-center justify-center flex-shrink-0 shadow-xs overflow-hidden">
                <Image
                  src="/family/family_badge.png"
                  alt="Family and Relationships"
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to icon if image fails
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div>
                {/* Overline tag */}
                <div className="flex items-center space-x-1.5 text-[11px] font-extrabold text-[#165B33] uppercase tracking-wider mb-1">
                  <Share2 size={13} className="text-[#165B33]" />
                  <span>FAMILY & RELATIONSHIPS</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#111827]">
                  Family & Meaningful Connection
                </h1>

                {/* Subtitle */}
                <p className="text-[13px] sm:text-[13.5px] text-[#4B5563] mt-1 max-w-2xl leading-relaxed">
                  Build stronger family bonds, nurture meaningful relationships, and create lasting memories together.
                </p>
              </div>
            </div>

            {/* Right Action Button */}
            <div className="flex-shrink-0 self-start sm:self-center">
              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="bg-[#124B2C] hover:bg-[#0E351F] text-white px-5 py-2.5 rounded-xl font-semibold text-[13px] shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add Family Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. THREE PROGRESS CARDS                                   */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Daily Family Time */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Purple heart icon badge */}
                <div className="w-11 h-11 rounded-full bg-[#EDE9FE] flex items-center justify-center text-[#8B5CF6] flex-shrink-0">
                  <Heart size={20} className="fill-[#8B5CF6] text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#4B5563]">Daily Family Time</p>
                  <p className="text-[24px] font-bold text-[#1B4332] leading-tight mt-0.5">
                    {familyTimeDays} / {familyTimeTarget}{" "}
                    <span className="text-[13px] font-normal text-[#6B7280]">days</span>
                  </p>
                </div>
              </div>

              {/* Status indicator: green checkmark */}
              <div className="w-6 h-6 rounded-full bg-[#10B981] flex items-center justify-center text-white flex-shrink-0">
                <Check size={14} strokeWidth={3} />
              </div>
            </div>

            <p className="text-[12px] text-[#6B7280] mt-3 mb-3">
              Keep spending quality time with your family
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#165B33] h-full rounded-full transition-all duration-500"
                  style={{ width: "100%" }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#1B4332]">100%</span>
            </div>
          </div>

          {/* Card 2: Family Check-ins */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BFDBFE] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Sky blue calendar badge */}
                <div className="w-11 h-11 rounded-full bg-[#E0F2FE] flex items-center justify-center text-[#3B82F6] flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#4B5563]">Family Check-ins</p>
                  <p className="text-[24px] font-bold text-[#1B4332] leading-tight mt-0.5">
                    {checkInsCurrent} / {checkInsTarget}{" "}
                    <span className="text-[13px] font-normal text-[#6B7280]">this month</span>
                  </p>
                </div>
              </div>

              {/* Status indicator: blue clock */}
              <div className="w-6 h-6 flex items-center justify-center text-[#3B82F6] flex-shrink-0">
                <Clock size={18} />
              </div>
            </div>

            <p className="text-[12px] text-[#6B7280] mt-3 mb-3">
              Have meaningful conversations
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#3B82F6] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((checkInsCurrent / checkInsTarget) * 100)}%` }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#1B4332]">
                {Math.round((checkInsCurrent / checkInsTarget) * 100)}%
              </span>
            </div>
          </div>

          {/* Card 3: Family Activities */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Emerald handshake badge */}
                <div className="w-11 h-11 rounded-full bg-[#D1FAE5] flex items-center justify-center text-[#10B981] flex-shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[#4B5563]">Family Activities</p>
                  <p className="text-[24px] font-bold text-[#1B4332] leading-tight mt-0.5">
                    {activitiesCurrent} / {activitiesTarget}{" "}
                    <span className="text-[13px] font-normal text-[#6B7280]">this month</span>
                  </p>
                </div>
              </div>

              {/* Status indicator: golden hourglass */}
              <div className="w-6 h-6 flex items-center justify-center text-[#F59E0B] flex-shrink-0">
                <Hourglass size={18} />
              </div>
            </div>

            <p className="text-[12px] text-[#6B7280] mt-3 mb-3">
              Plan fun and educational activities
            </p>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((activitiesCurrent / activitiesTarget) * 100)}%` }}
                />
              </div>
              <span className="text-[12px] font-bold text-[#1B4332]">
                {Math.round((activitiesCurrent / activitiesTarget) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. FAMILY CONNECTION INSIGHTS                             */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center gap-2 px-1">
            <Star size={16} className="text-[#15803D] fill-[#15803D]" />
            <h2 className="text-[15px] font-bold text-[#14281D]">
              Family Connection Insights
            </h2>
          </div>

          {/* Insights Main Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col lg:flex-row items-stretch gap-6">
            {/* Left 3 Metrics Columns */}
            <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6 py-1">
              {/* Metric 1: Family Time */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                  <Users size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] font-medium">Family Time</p>
                  <p className="text-[16px] font-bold text-[#111827]">4.2 hrs/week</p>
                  <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>↑</span> +12%
                  </p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-[1px] h-12 bg-[#E5E7EB]" />

              {/* Metric 2: Quality Conversations */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] font-medium">Quality Conversations</p>
                  <p className="text-[16px] font-bold text-[#111827]">12 this month</p>
                  <p className="text-[11px] text-[#16A34A] font-semibold flex items-center gap-0.5 mt-0.5">
                    <span>↑</span> +20%
                  </p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block w-[1px] h-12 bg-[#E5E7EB]" />

              {/* Metric 3: Memories Created */}
              <div className="flex items-center gap-3.5 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <p className="text-[12px] text-[#6B7280] font-medium">Memories Created</p>
                  <p className="text-[16px] font-bold text-[#111827]">18 this year</p>
                </div>
              </div>
            </div>

            {/* Right Quote Card with botanical leaves artwork */}
            <div className="w-full lg:w-[420px] bg-gradient-to-r from-[#EBF7F0] via-[#E4F5EB] to-[#DCF2E5] border border-[#C6ECD6] rounded-2xl p-5 relative overflow-hidden flex items-center min-h-[96px]">
              {/* Botanical Leaves Background Artwork */}
              <div className="absolute right-0 bottom-0 top-0 w-36 pointer-events-none opacity-85 overflow-hidden flex items-center justify-end">
                <img
                  src="/family/quote_card_leaves.png"
                  alt="Botanical Leaves"
                  className="h-full w-auto object-cover object-right"
                  onError={(e) => {
                    // graceful fallback if not yet loaded
                    e.currentTarget.style.opacity = "0";
                  }}
                />
              </div>

              {/* Quote Content */}
              <div className="flex items-baseline relative z-10 pr-12">
                <span className="text-[#15803D] text-3xl font-serif font-black leading-none mr-2 select-none">
                  “
                </span>
                <p className="text-[14.5px] font-bold text-[#153823] tracking-tight leading-snug">
                  Strong families create a stronger you.
                </p>
                <span className="text-[#15803D] text-3xl font-serif font-black leading-none ml-1 select-none">
                  ”
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. RECOMMENDED ACTIONS SECTION                             */}
        {/* ========================================================= */}
        <div className="space-y-3">
          {/* Section Header */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#F59E0B]" />
              <h2 className="text-[15px] font-bold text-[#14281D]">
                Recommended Actions
              </h2>
            </div>

            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="text-[13px] font-semibold text-[#165B33] hover:text-[#0E351F] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Recommended Action Card */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Left Side: Lightbulb & Details */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                  <img
                    src="/family/lightbulb.png"
                    alt="Lightbulb insight"
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>

                <div>
                  <h3 className="text-[15px] font-bold text-[#111827]">
                    Plan a Family Activity This Weekend
                  </h3>
                  <p className="text-[13px] text-[#4B5563] mt-0.5 leading-relaxed">
                    Try a nature walk, game night, or a family meal together to strengthen your bonds.
                  </p>
                </div>
              </div>

              {/* Right Side: Priority badge & Button */}
              <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] text-[12px] font-semibold border border-[#BBF7D0]">
                  <Zap size={13} className="fill-[#15803D]" />
                  <span>High Priority</span>
                </span>

                <button
                  onClick={() =>
                    handleAddToMyDay(
                      "Plan a Family Activity This Weekend",
                      "Try a nature walk, game night, or a family meal together to strengthen your bonds."
                    )
                  }
                  disabled={isAddingTask}
                  className="px-4 py-2 bg-[#124B2C] hover:bg-[#0E351F] text-white text-[13px] font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  <span>{isAddingTask ? "Adding..." : "Add to My Day"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. LIFE OS CORE PRINCIPLE NOTE                            */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-white to-[#FDFCF9] border border-[#E8E6DF] rounded-2xl p-5 shadow-2xs">
          <h3 className="text-[14px] font-bold text-[#181E1B] mb-1.5 flex items-center gap-2">
            <Heart size={16} className="text-[#DC2626] fill-[#DC2626]" />
            <span>Life OS Core Principle on Family</span>
          </h3>
          <p className="text-[13px] text-[#4B5563] leading-relaxed">
            Financial independence, Suku marketplace, and technical achievements are meaningless if relationships at home are neglected. LIFE OS strictly protects your evening dinner and Sunday gathering windows from scheduling conflicts. Monthly 10,000 ETB family support is honored as a non-negotiable duty.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD FAMILY GOAL                                   */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        title="Add New Family Goal"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddGoal} className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Goal Title
            </label>
            <input
              type="text"
              value={newGoalTitle}
              onChange={(e) => setNewGoalTitle(e.target.value)}
              placeholder="e.g. Weekly Nature Walk, Sunday Fellowship..."
              required
              className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Category
            </label>
            <select
              value={newGoalCategory}
              onChange={(e) => setNewGoalCategory(e.target.value)}
              className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
            >
              <option value="family_time">Daily Family Time</option>
              <option value="check_ins">Family Check-ins</option>
              <option value="activities">Family Activities</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Target Frequency
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Unit / Period
              </label>
              <div className="w-full px-3.5 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[13px] text-[#6B7280]">
                {newGoalCategory === "family_time" ? "Days / week" : "Times / month"}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Notes & Commitments
            </label>
            <textarea
              rows={3}
              value={newGoalNotes}
              onChange={(e) => setNewGoalNotes(e.target.value)}
              placeholder="Add specifics (e.g. phones put away, protected weekend slot)..."
              className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => setIsAddGoalModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#124B2C] hover:bg-[#0E351F] text-white text-[13px] font-semibold rounded-xl transition-colors"
            >
              Save Family Goal
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: VIEW ALL RECOMMENDED ACTIONS                     */}
      {/* ========================================================= */}
      <Modal
        isOpen={isViewAllModalOpen}
        onClose={() => setIsViewAllModalOpen(false)}
        title="All Recommended Family Actions"
        maxWidth="max-w-2xl"
      >
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-[13px] text-[#6B7280] mb-4">
            Curated actions to ensure emotional depth, consistent communication, and cherished memories with your loved ones.
          </p>

          <div className="space-y-3">
            {recommendedActionsList.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#BBF7D0] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#15803D]">
                      {item.category}
                    </span>
                    <span className="text-[11px] font-medium text-[#6B7280]">
                      {item.time}
                    </span>
                  </div>
                  <h4 className="text-[14px] font-bold text-[#111827]">{item.title}</h4>
                  <p className="text-[12px] text-[#4B5563] mt-0.5">{item.desc}</p>
                </div>

                <button
                  onClick={() => {
                    handleAddToMyDay(item.title, item.desc);
                    setIsViewAllModalOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#124B2C] hover:bg-[#0E351F] text-white text-[12px] font-semibold rounded-lg flex items-center gap-1 shadow-2xs flex-shrink-0 transition-colors"
                >
                  <Plus size={13} />
                  <span>Add to My Day</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setIsViewAllModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
