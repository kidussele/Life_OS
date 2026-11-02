"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  MoreHorizontal,
  Compass,
  Clock,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Check,
  Trophy,
  Rocket,
  Flame,
  CircleDot,
  FileText,
  UserCheck,
  PiggyBank,
} from "lucide-react";
import { Goal, Milestone } from "@/lib/types";

interface DisplayGoal {
  id: string;
  title: string;
  desc: string;
  tierLabel: string;
  tierKey: "all" | "vision" | "90_day" | "monthly" | "weekly";
  priority: "High Priority" | "Medium Priority" | "Low Priority";
  priorityType: "high" | "medium" | "low";
  progress: number;
  coreReason: string;
  deadline: string;
  targetMetricName: string;
  targetMetricValue: string;
  achievedMetricName: string;
  achievedMetricValue: string;
  image: string;
  timelineBadge?: "On Track" | "Next Milestone" | "Active Sprint" | null;
  milestones?: { id: string; title: string; date: string; completed: boolean }[];
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>("all");

  // Interactive Modals
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<DisplayGoal | null>(null);

  // New Goal Form
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCat, setNewCat] = useState("development");
  const [newReason, setNewReason] = useState("");
  const [newTier, setNewTier] = useState<"vision" | "90_day" | "monthly" | "weekly">("90_day");
  const [newStart, setNewStart] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newCriteria, setNewCriteria] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [newTargetMetric, setNewTargetMetric] = useState("");
  const [submittingGoal, setSubmittingGoal] = useState(false);

  // Pristine display goals initialized for fresh start beginning Nov 2, 2026
  const initialDisplayGoals: DisplayGoal[] = [
    {
      id: "goal_ict_100",
      title: "Master ICT Methodology & Complete 100 Demo Backtests",
      desc: "Enhance MSS, Order Blocks, and Silver Bullet on EURUSD & GBPUSD, with strict 1:2+ RR, logging all trades without risking real capital.",
      tierLabel: "90-DAY GOAL",
      tierKey: "90_day",
      priority: "High Priority",
      priorityType: "high",
      progress: 0,
      coreReason: "Build a professional trading edge with a disciplined mechanical approach.",
      deadline: "Dec 31, 2026",
      targetMetricName: "Target",
      targetMetricValue: "100 Backtests",
      achievedMetricName: "Achieved",
      achievedMetricValue: "0 / 100",
      image: "/journey/cs_graduate.jpg",
      timelineBadge: "Active Sprint",
      milestones: [
        { id: "m_1", title: "Complete 30 London Silver Bullet Backtests", date: "Nov 15, 2026", completed: false },
        { id: "m_2", title: "Log 30 NY Session Order Block & MSS Setups", date: "Dec 05, 2026", completed: false },
        { id: "m_3", title: "Final 40 Trades with strict 1:2+ RR & Notion Journaling", date: "Dec 31, 2026", completed: false },
      ],
    },
    {
      id: "goal_emergency_15k",
      title: "Establish Initial 15,000 ETB Emergency Fund",
      desc: "Discipline allocation of salary and freelance proceeds to build an untouchable emergency cushion.",
      tierLabel: "90-DAY GOAL",
      tierKey: "90_day",
      priority: "High Priority",
      priorityType: "high",
      progress: 0,
      coreReason: "Build financial resilience and peace of mind.",
      deadline: "Jan 29, 2027",
      targetMetricName: "Baseline",
      targetMetricValue: "15,000 ETB",
      achievedMetricName: "Saved",
      achievedMetricValue: "0 ETB",
      image: "/journey/emergency_fund.jpg",
      timelineBadge: "Active Sprint",
      milestones: [
        { id: "m_4", title: "Deposit Month 1 Savings: 3,000 ETB into Dedicated Bank", date: "Nov 30, 2026", completed: false },
        { id: "m_5", title: "Deposit Month 2 Savings: 6,000 ETB (Salary + Freelance)", date: "Dec 31, 2026", completed: false },
        { id: "m_6", title: "Final Deposit to reach 15,000 ETB total liquid reserve", date: "Jan 29, 2027", completed: false },
      ],
    },
    {
      id: "goal_freelance_clients",
      title: "Land First 3 High-Value Software Clients",
      desc: "Package services, build a portfolio, and secure 3 paid clients.",
      tierLabel: "90-DAY GOAL",
      tierKey: "90_day",
      priority: "Medium Priority",
      priorityType: "medium",
      progress: 0,
      coreReason: "Grow freelancing income and professional reputation.",
      deadline: "Jan 29, 2027",
      targetMetricName: "Target",
      targetMetricValue: "3 Clients",
      achievedMetricName: "Acquired",
      achievedMetricValue: "0 Clients",
      image: "/journey/workspace.jpg",
      timelineBadge: "Next Milestone",
      milestones: [
        { id: "m_7", title: "Launch interactive portfolio with 3 high-impact case studies", date: "Nov 14, 2026", completed: false },
        { id: "m_8", title: "Reach out to 25 target eCommerce & service businesses", date: "Dec 10, 2026", completed: false },
        { id: "m_9", title: "Sign agreements and deliver solutions for 3 retained clients", date: "Jan 29, 2027", completed: false },
      ],
    },
    {
      id: "goal_suku_marketplace",
      title: "Launch Suku Ethiopian Marketplace MVP to Production",
      desc: "Deploy core multi-vendor marketplace with Telebirr/Chapa checkout and onboard first 20 active merchants.",
      tierLabel: "90-DAY GOAL",
      tierKey: "90_day",
      priority: "High Priority",
      priorityType: "high",
      progress: 0,
      coreReason: "Create an enduring digital commerce engine for Ethiopian merchants.",
      deadline: "Dec 31, 2026",
      targetMetricName: "Merchants",
      targetMetricValue: "20 Active",
      achievedMetricName: "Onboarded",
      achievedMetricValue: "0 / 20",
      image: "/journey/suku_mvp.jpg",
      timelineBadge: "Next Milestone",
      milestones: [
        { id: "m_10", title: "Vendor Storefront & Product Catalogue Grid", date: "Nov 05, 2026", completed: false },
        { id: "m_11", title: "Telebirr & Chapa Payment Gateway Checkout API", date: "Nov 20, 2026", completed: false },
        { id: "m_12", title: "Addis Ababa Pilot Merchant Launch & First 50 Orders", date: "Dec 31, 2026", completed: false },
      ],
    },
    {
      id: "goal_vision_independence",
      title: "Achieve Financial Freedom & Multi-Income Stream Resilience",
      desc: "Build sustainable baseline where salary, Suku equity, freelance contracts, and prop trading yield freedom.",
      tierLabel: "LONG-TERM VISION",
      tierKey: "vision",
      priority: "High Priority",
      priorityType: "high",
      progress: 0,
      coreReason: "Generational prosperity, family peace of mind, and purpose-driven impact.",
      deadline: "Dec 31, 2027",
      targetMetricName: "Target Monthly",
      targetMetricValue: "150,000 ETB",
      achievedMetricName: "Current Base",
      achievedMetricValue: "30,000 ETB (Salary)",
      image: "/journey/financial_growth.jpg",
      timelineBadge: null,
      milestones: [
        { id: "m_13", title: "Build 50,000 ETB Untouchable Liquid Emergency Fund", date: "Apr 30, 2027", completed: false },
        { id: "m_14", title: "Scale Suku Marketplace to 100,000 ETB Monthly Gross Volume", date: "Aug 31, 2027", completed: false },
        { id: "m_15", title: "Fund $50k Prop Firm Account with ICT Consistency", date: "Dec 31, 2027", completed: false },
      ],
    },
  ];

  const [displayGoals, setDisplayGoals] = useState<DisplayGoal[]>(initialDisplayGoals);

  // Fetch from DB
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      if (res.ok) {
        const data = await res.json();
        const dbGoals: Goal[] = data.goals || [];
        setGoals(dbGoals);

        // Merge any new DB goals not in display list
        if (dbGoals.length > 0) {
          const formattedDbGoals: DisplayGoal[] = dbGoals.map((g, idx) => {
            const priorityLabel =
              g.priority === "high"
                ? "High Priority"
                : g.priority === "low"
                ? "Low Priority"
                : "Medium Priority";

            const tierLabel =
              g.tier === "vision"
                ? "LONG-TERM VISION"
                : g.tier === "monthly"
                ? "MONTHLY MILESTONE"
                : g.tier === "weekly"
                ? "WEEKLY OBJECTIVE"
                : "90-DAY GOAL";

            let img = "/journey/cs_graduate.jpg";
            if (g.category === "financial") img = "/journey/emergency_fund.jpg";
            else if (g.category === "freelancing") img = "/journey/workspace.jpg";
            else if (g.category === "business") img = "/journey/suku_mvp.jpg";
            else if (g.category === "spiritual") img = "/journey/prayer_spiritual.jpg";
            else if (g.category === "health") img = "/journey/fitness_health.jpg";

            return {
              id: g.id,
              title: g.title,
              desc: g.description,
              tierLabel,
              tierKey: g.tier as any,
              priority: priorityLabel,
              priorityType: g.priority,
              progress: g.progress || 0,
              coreReason: g.reason || "Build personal mastery and high-leverage execution.",
              deadline: g.deadline || "Dec 31, 2026",
              targetMetricName: "Target",
              targetMetricValue: g.completion_criteria || "100%",
              achievedMetricName: "Progress",
              achievedMetricValue: `${g.progress}%`,
              image: img,
              timelineBadge: idx === 1 ? "On Track" : idx === 2 ? "Next Milestone" : null,
              milestones: g.milestones?.map((m) => ({
                id: m.id,
                title: m.title,
                date: m.target_date,
                completed: m.status === "completed",
              })),
            };
          });

          // Use real database goals directly
          setDisplayGoals(formattedDbGoals);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setNewStart(new Date().toISOString().split("T")[0]);
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSubmittingGoal(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCat,
          reason: newReason,
          tier: newTier,
          start_date: newStart,
          deadline: newDeadline,
          priority: newPriority,
          completion_criteria: newCriteria,
          progress: 0,
          status: "in_progress",
        }),
      });

      const newDisplayItem: DisplayGoal = {
        id: `custom_${Date.now()}`,
        title: newTitle,
        desc: newDesc || "Strategic sprint deliverable.",
        tierLabel: newTier === "vision" ? "LONG-TERM VISION" : "90-DAY GOAL",
        tierKey: newTier,
        priority: newPriority === "high" ? "High Priority" : "Medium Priority",
        priorityType: newPriority,
        progress: 0,
        coreReason: newReason || "Disciplined execution and strategic milestone attainment.",
        deadline: newDeadline || "Jan 29, 2027",
        targetMetricName: "Target",
        targetMetricValue: newTargetMetric || newCriteria || "Completed",
        achievedMetricName: "Achieved",
        achievedMetricValue: "0%",
        image:
          newCat === "financial"
            ? "/journey/emergency_fund.jpg"
            : newCat === "freelancing"
            ? "/journey/workspace.jpg"
            : "/journey/cs_graduate.jpg",
        timelineBadge: null,
      };

      setDisplayGoals((prev) => [newDisplayItem, ...prev]);
      setIsAddGoalModalOpen(false);
      setNewTitle("");
      setNewDesc("");
      setNewReason("");
      setNewCriteria("");
      setNewTargetMetric("");
      fetchGoals();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleToggleMilestoneCheck = async (goalId: string, milestoneId: string) => {
    let nextStatus: "completed" | "pending" = "completed";
    const currentGoal = displayGoals.find((g) => g.id === goalId);
    const currentM = currentGoal?.milestones?.find((m) => m.id === milestoneId);
    if (currentM) {
      nextStatus = currentM.completed ? "pending" : "completed";
    }

    setDisplayGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId && g.milestones) {
          const updatedMilestones = g.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: nextStatus === "completed" } : m
          );
          const completedCount = updatedMilestones.filter((m) => m.completed).length;
          const newProgress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
          return {
            ...g,
            progress: newProgress,
            achievedMetricValue: `${newProgress}%`,
            milestones: updatedMilestones,
          };
        }
        return g;
      })
    );

    if (selectedGoalForDetails && selectedGoalForDetails.id === goalId && selectedGoalForDetails.milestones) {
      const updatedMilestones = selectedGoalForDetails.milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: nextStatus === "completed" } : m
      );
      const completedCount = updatedMilestones.filter((m) => m.completed).length;
      const newProgress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
      setSelectedGoalForDetails({
        ...selectedGoalForDetails,
        progress: newProgress,
        milestones: updatedMilestones,
      });
    }

    try {
      await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_milestone",
          id: milestoneId,
          status: nextStatus,
        }),
      });
    } catch (e) {
      console.error("Could not sync milestone toggle:", e);
    }
  };

  // Filtered goals
  const filteredGoals =
    selectedTier === "all"
      ? displayGoals
      : displayGoals.filter((g) => g.tierKey === selectedTier);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC MOUNTAIN HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[140px] sm:min-h-[155px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Mountain Sunrise Landscape"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[65%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title with Dartboard/Target Icon */}
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/95 border border-[#B7E4C7] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Target size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  Goals, Milestones &amp; Strategic Sprints
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-[#284534] font-medium leading-relaxed">
                  Turn your vision into measurable progress with clear goals, milestones and focused sprints.
                </p>
              </div>
            </div>

            {/* Right Action: "+ Create Goal" button */}
            <div className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddGoalModalOpen(true)}
                className="bg-[#165B33] hover:bg-[#123D26] text-white text-[13px] font-bold py-2.5 px-5 rounded-full flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Create Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. FILTER TABS (PILLS)
            ======================================================== */}
        <div className="flex flex-wrap items-center gap-2.5">
          {[
            { key: "all", label: `All Strategic Goals (${displayGoals.length})`, icon: Target },
            { key: "vision", label: "Long-Term Vision (12–18M)", icon: Compass },
            { key: "90_day", label: "90-Day Sprints", icon: Clock },
            { key: "monthly", label: "Monthly Milestones", icon: MapPin },
            { key: "weekly", label: "Weekly Objectives", icon: CalendarDays },
          ].map((tab) => {
            const isSelected = selectedTier === tab.key;
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedTier(tab.key)}
                className={`px-4 py-2 text-[12px] font-bold rounded-full transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[#165B33] text-white shadow-xs"
                    : "bg-white text-[#14211A] hover:bg-[#F2F7F4] border border-[#E2EAE5]"
                }`}
              >
                <Icon size={14} className={isSelected ? "text-white" : "text-[#165B33]"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            STRATEGIC HIERARCHY BREADCRUMB (Section 5 Requirement)
            ======================================================== */}
        <div className="bg-[#FAFDFB] border border-[#D5E2D9] rounded-2xl p-3 px-4 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-[#4F6A5B] font-medium">
            <span className="font-extrabold text-[#112318] uppercase tracking-wide text-[11px]">Strategic Hierarchy:</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD7CE] text-[#112318] font-bold">Long-Term Vision</span>
            <span className="text-[#8CA095]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD7CE] text-[#112318] font-bold">Quarterly 90-Day Goals</span>
            <span className="text-[#8CA095]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD7CE] text-[#112318] font-bold">Monthly Milestones</span>
            <span className="text-[#8CA095]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-[#CBD7CE] text-[#112318] font-bold">Weekly Targets</span>
            <span className="text-[#8CA095]">→</span>
            <span className="px-2 py-0.5 rounded-md bg-[#EBF5EE] border border-[#B7E4C7] text-[#165B33] font-extrabold">Daily Tasks (My Day)</span>
          </div>

          <Link href="/my-day" className="font-bold text-[#165B33] hover:underline flex items-center gap-1">
            <span>Execute on My Day</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* ========================================================
            3. CONNECTED VERTICAL TIMELINE WITH STRATEGIC GOAL CARDS
            ======================================================== */}
        <div className="relative pl-12 space-y-6 pt-2">
          {/* Continuous Vertical Green Connector Line */}
          <div className="absolute left-[20px] top-6 bottom-6 w-[2px] bg-[#B7E4C7]" />

          {filteredGoals.map((goal, idx) => {
            return (
              <div key={goal.id} className="relative">
                {/* Timeline Node Dot centered on line at left-[20px] (-28px relative to content) */}
                <div className="absolute -left-[35px] top-8 w-4 h-4 rounded-full bg-[#165B33] border-2 border-white ring-2 ring-[#B7E4C7]/60 z-10 shadow-2xs" />

                {/* Timeline Badge (e.g. "On Track", "Next Milestone") resting beside/above the node */}
                {goal.timelineBadge && (
                  <div className="absolute -left-[54px] -top-3 z-20">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-2xs border ${
                        goal.timelineBadge === "On Track"
                          ? "bg-[#EBF5EE] text-[#165B33] border-[#B7E4C7]"
                          : "bg-white text-[#14211A] border-[#D5E2D9]"
                      }`}
                    >
                      {goal.timelineBadge}
                    </span>
                  </div>
                )}

                {/* Main Goal Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EAE5] shadow-xs hover:border-[#B7E4C7] transition-all space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                    {/* Left: Thumbnail Image + Middle Info */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
                      {/* Image Thumbnail */}
                      <div className="w-full sm:w-44 h-32 rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9] shadow-2xs bg-[#F7FAF8]">
                        <Image
                          src={goal.image}
                          alt={goal.title}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Middle Info Block */}
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Badges: Tier Pill + Priority Pill */}
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {goal.tierLabel}
                          </span>
                          <span
                            className={`text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                              goal.priorityType === "high"
                                ? "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]"
                                : goal.priorityType === "medium"
                                ? "bg-[#FEF9C3] text-[#A16207] border-[#FEF08A]"
                                : "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]"
                            }`}
                          >
                            {goal.priority}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-[16px] font-extrabold text-[#112318] tracking-tight leading-snug">
                          {goal.title}
                        </h2>

                        {/* Description */}
                        <p className="text-[12.5px] text-[#486053] font-medium leading-relaxed">
                          {goal.desc}
                        </p>

                        {/* Progress Bar with Percentage */}
                        <div className="flex items-center space-x-3 pt-1 max-w-md">
                          <div className="flex-1 h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <span className="text-[12px] font-mono font-extrabold text-[#112318]">
                            {goal.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Metrics & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F0F4F1]">
                      {/* 3 Metric Rows */}
                      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 text-[12px] text-[#14211A] font-semibold">
                        <div className="flex items-center space-x-2">
                          <Calendar size={15} className="text-[#6C8176]" />
                          <div>
                            <span className="text-[#6C8176] text-[11px] block font-normal">Deadline</span>
                            <span className="font-bold text-[#14211A]">{goal.deadline}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Target size={15} className="text-[#165B33]" />
                          <div>
                            <span className="text-[#6C8176] text-[11px] block font-normal">{goal.targetMetricName}</span>
                            <span className="font-bold text-[#14211A]">{goal.targetMetricValue}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 col-span-2 lg:col-span-1">
                          <TrendingUp size={15} className="text-[#165B33]" />
                          <div>
                            <span className="text-[#6C8176] text-[11px] block font-normal">{goal.achievedMetricName}</span>
                            <span className="font-bold text-[#14211A]">{goal.achievedMetricValue}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons: [View Details →] [•••] */}
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGoalForDetails(goal);
                            setIsDetailsModalOpen(true);
                          }}
                          className="px-4 py-2 rounded-xl border border-[#CBD7CE] hover:border-[#165B33] hover:bg-[#F0F7F3] text-[12px] font-bold text-[#14211A] flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <span>View Details</span>
                          <ArrowRight size={13} className="text-[#165B33]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedGoalForDetails(goal);
                            setIsOptionsModalOpen(true);
                          }}
                          className="w-9 h-9 rounded-xl border border-[#CBD7CE] hover:border-[#165B33] hover:bg-[#F0F7F3] flex items-center justify-center text-[#486053] hover:text-[#14211A] transition-colors shadow-2xs"
                          title="More options"
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Core Reason Footer Box */}
                  <div className="bg-[#F5FAF7] border border-[#E2EBE5] rounded-xl px-3.5 py-2 flex items-center space-x-2 text-[12px] font-medium text-[#284534]">
                    <CheckCircle2 size={15} className="text-[#165B33] flex-shrink-0" />
                    <span>
                      <strong className="font-semibold text-[#14211A]">Core Reason:</strong> {goal.coreReason}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================
            4. BOTTOM SUCCESS DESTINATION BANNER
            ======================================================== */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EAE5] shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden relative">
          {/* Left: Trophy + Title & Subtitle */}
          <div className="flex items-center space-x-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Trophy size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[17px] font-extrabold text-[#112318] tracking-tight">
                Your Success Destination
              </h3>
              <p className="text-[12.5px] text-[#486053] font-medium">
                A disciplined, focused and balanced life of freedom, impact and fulfillment.
              </p>
            </div>
          </div>

          {/* Middle: 3 Pillars Checkpoints */}
          <div className="space-y-1.5 text-[12.5px] font-bold text-[#14211A]">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-[#165B33]" />
              <span>Financial Independence</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-[#165B33]" />
              <span>Successful Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-[#165B33]" />
              <span>Healthy Body &amp; Mind</span>
            </div>
          </div>

          {/* Right: Panoramic Celebration Thumbnail + "You're on the right path! 🚀" */}
          <div className="relative rounded-2xl overflow-hidden border border-[#D5E2D9] h-20 w-full lg:w-72 flex items-center justify-center">
            <Image
              src="/journey/mountain_viewpoint.jpg"
              alt="Person celebrating on mountain peak"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <Link
              href="/journey"
              className="relative z-10 bg-[#165B33] hover:bg-[#123D26] text-white text-[12px] font-bold px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 transition-colors"
            >
              <span>You're on the right path! 🚀</span>
            </Link>
          </div>
        </div>

        {/* ========================================================
            MODAL 1: CREATE NEW STRATEGIC GOAL
            ======================================================== */}
        {isAddGoalModalOpen && (
          <Modal
            isOpen={isAddGoalModalOpen}
            onClose={() => setIsAddGoalModalOpen(false)}
            title="Create New Strategic Goal"
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master ICT Silver Bullet & Complete 100 Demo Backtests"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Strategic Tier
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value as any)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  >
                    <option value="90_day">90-Day Sprint</option>
                    <option value="vision">Long-Term Vision (12–18M)</option>
                    <option value="monthly">Monthly Milestone</option>
                    <option value="weekly">Weekly Objective</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Category
                  </label>
                  <select
                    value={newCat}
                    onChange={(e) => setNewCat(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  >
                    <option value="forex">Forex Trading (ICT)</option>
                    <option value="financial">Financial &amp; Savings</option>
                    <option value="freelancing">Freelance Software Clients</option>
                    <option value="business">Business (Suku)</option>
                    <option value="spiritual">Spiritual Life</option>
                    <option value="health">Health &amp; Mobility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Core Reason (Why is this critical for your life?)
                </label>
                <textarea
                  rows={2}
                  required
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder="Build proven psychological discipline and mechanical consistency..."
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Description &amp; Specific Scope
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Specific deliverables, parameters, risk ratios..."
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Target Metric
                  </label>
                  <input
                    type="text"
                    value={newTargetMetric}
                    onChange={(e) => setNewTargetMetric(e.target.value)}
                    placeholder="e.g. 100 Backtests"
                    className="w-full px-3 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#5A6E63] hover:bg-black/5 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGoal}
                  className="px-5 py-2.5 bg-[#165B33] hover:bg-[#123D26] text-white rounded-xl text-[12.5px] font-bold shadow-xs transition-colors"
                >
                  {submittingGoal ? "Creating..." : "Create Strategic Goal"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ========================================================
            MODAL 2: VIEW DETAILS & MILESTONES BREAKDOWN
            ======================================================== */}
        {isDetailsModalOpen && selectedGoalForDetails && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            title="Strategic Goal Architecture & Milestones"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-5">
              {/* Header card info */}
              <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {selectedGoalForDetails.tierLabel}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                    {selectedGoalForDetails.priority}
                  </span>
                </div>
                <h3 className="text-[16px] font-extrabold text-[#112318]">
                  {selectedGoalForDetails.title}
                </h3>
                <p className="text-[12.5px] text-[#486053] leading-relaxed">
                  {selectedGoalForDetails.desc}
                </p>
                <div className="pt-2 flex items-center justify-between text-[12px] font-mono border-t border-[#EAEFEA]">
                  <span className="text-[#6C8176]">Target Deadline: {selectedGoalForDetails.deadline}</span>
                  <span className="font-extrabold text-[#165B33]">
                    {selectedGoalForDetails.progress}% Complete
                  </span>
                </div>
              </div>

              {/* Core Reason Box */}
              <div className="p-3.5 rounded-xl bg-[#F0F7F3] border border-[#BDE0C8] text-[12px]">
                <strong className="text-[#165B33] block mb-0.5">Philosophy &amp; Core Reason:</strong>
                <p className="text-[#284534] italic">{selectedGoalForDetails.coreReason}</p>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold text-[#14211A] flex items-center gap-1.5">
                    <Layers size={14} className="text-[#165B33]" />
                    <span>Actionable Milestones</span>
                  </h4>
                  <span className="text-[11px] text-[#6C8176]">Click checkbox to toggle progress</span>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedGoalForDetails.milestones && selectedGoalForDetails.milestones.length > 0 ? (
                    selectedGoalForDetails.milestones.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestoneCheck(selectedGoalForDetails.id, m.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-[12.5px] ${
                          m.completed
                            ? "bg-[#F7FAF8] border-[#B7E4C7] text-[#6C8176]"
                            : "bg-white border-[#E2E9E4] hover:border-[#165B33] text-[#14211A]"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              m.completed
                                ? "bg-[#165B33] border-[#165B33] text-white"
                                : "border-[#CBD7CE] bg-white text-transparent"
                            }`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                          <span className={m.completed ? "line-through" : "font-medium"}>
                            {m.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-[#6C8176]">{m.date}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[12px] text-[#6C8176] italic">No milestones recorded.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2 bg-[#165B33] hover:bg-[#123D26] text-white rounded-xl text-[12px] font-bold shadow-xs transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 3: OPTIONS MENU (•••)
            ======================================================== */}
        {isOptionsModalOpen && selectedGoalForDetails && (
          <Modal
            isOpen={isOptionsModalOpen}
            onClose={() => setIsOptionsModalOpen(false)}
            title="Strategic Goal Options"
            maxWidth="max-w-sm"
          >
            <div className="space-y-3">
              <p className="text-[12px] text-[#5A6E63]">
                Manage: <strong>{selectedGoalForDetails.title}</strong>
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsOptionsModalOpen(false);
                  setIsDetailsModalOpen(true);
                }}
                className="w-full text-left p-3 rounded-xl border border-[#E2E9E4] hover:bg-[#F0F7F3] hover:border-[#165B33] text-[12.5px] font-bold text-[#14211A] flex items-center gap-2 transition-colors"
              >
                <Layers size={16} className="text-[#165B33]" />
                <span>View Full Milestones &amp; Architecture</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const newProg = prompt(
                    "Enter new progress percentage (0 - 100):",
                    String(selectedGoalForDetails.progress)
                  );
                  if (newProg !== null) {
                    const parsed = Math.min(100, Math.max(0, parseInt(newProg) || 0));
                    setDisplayGoals((prev) =>
                      prev.map((g) =>
                        g.id === selectedGoalForDetails.id
                          ? { ...g, progress: parsed, achievedMetricValue: `${parsed}%` }
                          : g
                      )
                    );
                  }
                  setIsOptionsModalOpen(false);
                }}
                className="w-full text-left p-3 rounded-xl border border-[#E2E9E4] hover:bg-[#F0F7F3] hover:border-[#165B33] text-[12.5px] font-bold text-[#14211A] flex items-center gap-2 transition-colors"
              >
                <TrendingUp size={16} className="text-[#165B33]" />
                <span>Update Progress Percentage</span>
              </button>

              <div className="flex justify-end pt-2 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsOptionsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[12px] font-bold bg-[#F7FAF8] text-[#5A6E63]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
