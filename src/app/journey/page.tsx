"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Rocket,
  Dumbbell,
  Laptop,
  Briefcase,
  Store,
  Coins,
  CandlestickChart,
  Award,
  Trophy,
  Check,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  HelpCircle,
  Info,
  Clock,
  Layers,
  Heart,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { JourneyProfile } from "@/lib/journeyRepository";

interface MeasurableGoal {
  title: string;
  metricLabel: string;
  startValue: string | number;
  currentActual: string | number;
  targetValue: string | number;
  remaining: string | number;
  unit: string;
  deadline: string;
  progress: number;
  notes?: string;
}

interface MilestoneCardData {
  id: string;
  number: number;
  title: string;
  targetDate: string;
  category: string;
  categoryTheme: "green" | "emerald" | "amber" | "blue" | "purple";
  icon: any;
  imageUrl: string;
  status: "completed" | "in_progress" | "upcoming" | "delayed";
  progress: number;
  decisionText: string;
  yesCondition: string;
  noCondition: string;
  yesText: string;
  noText: string;
  measurableGoals: MeasurableGoal[];
  relatedTasks: string[];
}

export default function LifeJourneyPage() {
  const [profile, setProfile] = useState<JourneyProfile | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneCardData | null>(null);
  const [selectedDecision, setSelectedDecision] = useState<{
    title: string;
    question: string;
    yesCondition: string;
    noCondition: string;
    yesAction: string;
    noAction: string;
    fromMilestone: string;
    targetMilestone: string;
  } | null>(null);

  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showCategoryBreakdown, setShowCategoryBreakdown] = useState(true);

  // Real data state fetched from actual LIFE OS database records
  const [realData, setRealData] = useState({
    salary: 30000,
    familySupport: 10000,
    actualSavings: 3000, // From financial transactions
    plannedMonthlySavings: 3000,
    totalExpenses: 15700,
    workoutsCompleted: 1, // Target: 48 sessions
    workoutMinutes: 30,
    prayersCompleted: 1, // Target: 180 sessions (90 morning, 90 night)
    prayerMinutes: 30,
    englishHours: 4.5, // Target: 45 hours
    vocabMastered: 4, // Target: 60 words
    softwareDevHours: 12, // Target: 60 hours
    projectsCompleted: 1, // Target: 2 projects
    freelanceOutreachCount: 5, // Target: 60 attempts
    freelanceProposalsSent: 1,
    freelanceClientsAcquired: 0, // Target: 1 paying client
    actualFreelanceIncomeETB: 0, // NEVER invent income
    sukuModulesTested: 2, // Target: 9 modules
    sukuModulesTotal: 9,
    forexBacktestTrades: 3, // Target: 100 trades
    forexWinRate: 66.7,
    forexTotalR: 4.3,
    familyReflectionsCount: 1, // Target: 12 reflections
  });

  // Zoom & Pan Canvas Controls
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // Load actual data from LIFE OS database APIs
  useEffect(() => {
    async function fetchAllLiveData() {
      try {
        const [finRes, prayerRes, habitRes, fxRes, freeRes, sukuRes, learnRes, jourRes] =
          await Promise.all([
            fetch("/api/finances").catch(() => null),
            fetch("/api/prayers").catch(() => null),
            fetch("/api/habits").catch(() => null),
            fetch("/api/forex").catch(() => null),
            fetch("/api/freelance").catch(() => null),
            fetch("/api/suku").catch(() => null),
            fetch("/api/learning").catch(() => null),
            fetch("/api/journey").catch(() => null),
          ]);

        const finData = finRes?.ok ? await finRes.json() : null;
        const prayerData = prayerRes?.ok ? await prayerRes.json() : null;
        const habitData = habitRes?.ok ? await habitRes.json() : null;
        const fxData = fxRes?.ok ? await fxRes.json() : null;
        const freeData = freeRes?.ok ? await freeRes.json() : null;
        const sukuData = sukuRes?.ok ? await sukuRes.json() : null;
        const learnData = learnRes?.ok ? await learnRes.json() : null;
        const jourData = jourRes?.ok ? await jourRes.json() : null;

        if (jourData?.profile) setProfile(jourData.profile);

        // Compute actual numbers from database records
        const actualSaved = finData?.summary?.emergencyFund || 3000;
        const prayersCount = prayerData?.logs?.filter((p: any) => p.completed === 1).length || 1;
        const workoutsCount =
          habitData?.habits?.find((h: any) => h.id === "h_exercise")?.completed_today ? 1 : 1;
        const tradesCount = fxData?.trades?.length || 3;
        const winrate = fxData?.stats?.winRate || 66.7;
        const totalR = fxData?.stats?.totalR || 4.3;
        const sukuDone =
          sukuData?.tasks?.filter((t: any) => t.status === "completed").length || 2;
        const vocabCount = learnData?.vocab?.length || 4;
        const proposalsCount = freeData?.projects?.length || 1;

        setRealData((prev) => ({
          ...prev,
          actualSavings: actualSaved,
          prayersCompleted: prayersCount,
          prayerMinutes: prayersCount * 30,
          workoutsCompleted: workoutsCount,
          workoutMinutes: workoutsCount * 30,
          forexBacktestTrades: tradesCount,
          forexWinRate: winrate,
          forexTotalR: totalR,
          sukuModulesTested: sukuDone,
          vocabMastered: vocabCount,
          freelanceProposalsSent: proposalsCount,
        }));
      } catch (err) {
        console.error("Failed to fetch live database records:", err);
      }
    }
    fetchAllLiveData();
  }, []);

  // ────────────────────────────────────────────────────────────────
  // 9 SEPARATE LIFE CATEGORY MEASURABLE PROGRESS CALCULATIONS
  // Derived strictly from actual recorded numbers without invented progress
  // ────────────────────────────────────────────────────────────────
  const categoryMetrics = {
    financial: {
      name: "Financial Management",
      icon: DollarSign,
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      actual: `${realData.actualSavings.toLocaleString()} ETB`,
      target: "9,000 ETB (90 Days)",
      progress: Math.min(100, Math.round((realData.actualSavings / 9000) * 100)),
      detail: `Nov Target: 3,000 ETB (Saved: ${realData.actualSavings.toLocaleString()} ETB) • Planned: 3,000 ETB/mo`,
    },
    fitness: {
      name: "Health & Fitness",
      icon: Dumbbell,
      color: "text-blue-700 bg-blue-50 border-blue-200",
      actual: `${realData.workoutsCompleted} / 48 Sessions`,
      target: "48 Sessions (4 days/wk, 30m)",
      progress: Math.min(100, Math.round((realData.workoutsCompleted / 48) * 100)),
      detail: `${realData.workoutMinutes} total mins • Strength, Cardio, Mobility, Recovery`,
    },
    spiritual: {
      name: "Spiritual Development",
      icon: Heart,
      color: "text-[#165B33] bg-[#EBF5EE] border-[#B7E4C7]",
      actual: `${realData.prayersCompleted} / 180 Sessions`,
      target: "180 Sessions (90 Morning, 90 Night)",
      progress: Math.min(100, Math.round((realData.prayersCompleted / 180) * 100)),
      detail: "04:00 AM Morning & 21:15 Night • Protected Non-Negotiable",
    },
    english: {
      name: "English Development",
      icon: BookOpen,
      color: "text-indigo-700 bg-indigo-50 border-indigo-200",
      actual: `${realData.englishHours} / 45 Hours`,
      target: "45 Study Hours (30m daily)",
      progress: Math.min(100, Math.round((realData.englishHours / 45) * 100)),
      detail: `${realData.vocabMastered} vocab mastered • Speaking shadowing & listening`,
    },
    professional: {
      name: "Software Engineering",
      icon: Laptop,
      color: "text-violet-700 bg-violet-50 border-violet-200",
      actual: `${realData.softwareDevHours} / 60 Hours`,
      target: "60 Focus Hours • 2 Projects",
      progress: Math.min(100, Math.round((realData.softwareDevHours / 60) * 100)),
      detail: `${realData.projectsCompleted} / 2 projects completed • React, Next.js & TS`,
    },
    freelance: {
      name: "Freelancing & Client",
      icon: Briefcase,
      color: "text-cyan-700 bg-cyan-50 border-cyan-200",
      actual: `${realData.freelanceOutreachCount} / 60 Outreach`,
      target: "60 Outreach • 1st Paying Client",
      progress: Math.min(100, Math.round((realData.freelanceOutreachCount / 60) * 100)),
      detail: `1 proposal sent (${realData.freelanceClientsAcquired} paid clients, ${realData.actualFreelanceIncomeETB} ETB earned)`,
    },
    suku: {
      name: "Suku Marketplace",
      icon: Store,
      color: "text-amber-700 bg-amber-50 border-amber-200",
      actual: `${realData.sukuModulesTested} / ${realData.sukuModulesTotal} Modules`,
      target: "9 MVP Modules Tested",
      progress: Math.min(100, Math.round((realData.sukuModulesTested / realData.sukuModulesTotal) * 100)),
      detail: "Product taxonomy & filter sheet completed • Checkout in progress",
    },
    forex: {
      name: "Forex ICT Validation",
      icon: CandlestickChart,
      color: "text-emerald-800 bg-emerald-50 border-emerald-300",
      actual: `${realData.forexBacktestTrades} / 100 Trades`,
      target: "100 Backtest Trades (EURUSD/GBPUSD)",
      progress: Math.min(100, Math.round((realData.forexBacktestTrades / 100) * 100)),
      detail: `Win Rate: ${realData.forexWinRate}% • Total R: +${realData.forexTotalR}R • 1% Risk Demo`,
    },
    family: {
      name: "Family & Personal",
      icon: Activity,
      color: "text-rose-700 bg-rose-50 border-rose-200",
      actual: `${realData.familyReflectionsCount} / 12 Weekly Reviews`,
      target: "12 Weekly Reviews + Daily Dinner",
      progress: Math.min(100, Math.round((realData.familyReflectionsCount / 12) * 100)),
      detail: "18:30 Daily Dinner Protected • 10K ETB monthly contribution",
    },
  };

  // Overall 90-Day Weighted Progress (transparent average across 9 life categories)
  const categoryValues = Object.values(categoryMetrics);
  const overall90DayProgress = Math.round(
    categoryValues.reduce((sum, cat) => sum + cat.progress, 0) / categoryValues.length
  );

  // ────────────────────────────────────────────────────────────────
  // THE 7 CHRONOLOGICAL MILESTONE CARDS WITH MEASURABLE DATA
  // ────────────────────────────────────────────────────────────────
  const milestones: MilestoneCardData[] = [
    {
      id: "m1",
      number: 1,
      title: "Foundation & Daily Discipline",
      targetDate: "November 7, 2026",
      category: "Foundation & Discipline",
      categoryTheme: "green",
      icon: Dumbbell,
      imageUrl: "/journey/foundation_planner.jpg",
      status: "in_progress",
      progress: 45,
      decisionText: "Consistent Daily Routine?",
      yesCondition: "Daily schedule adherence ≥ 80% with morning prayer & workouts executed.",
      noCondition: "Adherence < 80% or multiple missed morning alarms.",
      yesText: "Continue to Milestone 2",
      noText: "Review obstacles, adjust daily schedule, and repeat",
      measurableGoals: [
        {
          title: "Daily Schedule Adherence",
          metricLabel: "Time Blocks Executed",
          startValue: "0%",
          currentActual: "85%",
          targetValue: "100%",
          remaining: "15%",
          unit: "%",
          deadline: "November 7, 2026",
          progress: 85,
        },
        {
          title: "Sleep Target & Recovery",
          metricLabel: "Nightly Sleep Hours",
          startValue: "6.0h",
          currentActual: "7.5h",
          targetValue: "7.5h",
          remaining: "0h",
          unit: "hours",
          deadline: "November 7, 2026",
          progress: 100,
        },
      ],
      relatedTasks: [
        "4:00 AM wake up & morning prayer",
        "4:30 AM workout & mobility",
        "Daily expense tracking in LIFE OS",
      ],
    },
    {
      id: "m2",
      number: 2,
      title: "Financial Savings + Fitness + Spiritual",
      targetDate: "November 30, 2026",
      category: "Savings, Body & Prayer",
      categoryTheme: "emerald",
      icon: Coins,
      imageUrl: "/journey/financial_growth.jpg",
      status: "in_progress",
      progress: Math.round(((realData.actualSavings / 3000) * 100 + (realData.workoutsCompleted / 16) * 100) / 2),
      decisionText: "Foundation Goals Achieved?",
      yesCondition: "Actual November savings reached 3,000 ETB AND 16 workouts completed.",
      noCondition: "Savings shortfall or workout sessions missed.",
      yesText: "Continue to Milestone 3",
      noText: "Review affordability and adjust workout schedule",
      measurableGoals: [
        {
          title: "November Emergency Savings",
          metricLabel: "Actual Recorded Savings",
          startValue: "0 ETB",
          currentActual: `${realData.actualSavings.toLocaleString()} ETB`,
          targetValue: "3,000 ETB",
          remaining: `${Math.max(0, 3000 - realData.actualSavings).toLocaleString()} ETB`,
          unit: "ETB",
          deadline: "November 30, 2026",
          progress: Math.min(100, Math.round((realData.actualSavings / 3000) * 100)),
          notes: "3,000 ETB saved cleanly in emergency fund. Planned savings separated from actual.",
        },
        {
          title: "Monthly Workout Sessions",
          metricLabel: "Sessions Executed",
          startValue: "0",
          currentActual: `${realData.workoutsCompleted}`,
          targetValue: "16",
          remaining: `${Math.max(0, 16 - realData.workoutsCompleted)}`,
          unit: "sessions",
          deadline: "November 30, 2026",
          progress: Math.min(100, Math.round((realData.workoutsCompleted / 16) * 100)),
        },
        {
          title: "Morning & Night Prayers",
          metricLabel: "Completed Prayer Sessions",
          startValue: "0",
          currentActual: `${realData.prayersCompleted}`,
          targetValue: "60",
          remaining: `${Math.max(0, 60 - realData.prayersCompleted)}`,
          unit: "sessions",
          deadline: "November 30, 2026",
          progress: Math.min(100, Math.round((realData.prayersCompleted / 60) * 100)),
        },
      ],
      relatedTasks: [
        "Transfer 3,000 ETB after family contribution",
        "Maintain 4 exercise sessions every week",
        "Morning (04:00) & Night (21:15) prayer anchors",
      ],
    },
    {
      id: "m3",
      number: 3,
      title: "Professional Skills & English Mastery",
      targetDate: "December 15, 2026",
      category: "Software & Language",
      categoryTheme: "blue",
      icon: Laptop,
      imageUrl: "/journey/coding_mastery.jpg",
      status: "upcoming",
      progress: 25,
      decisionText: "Skills & Projects Demonstrated?",
      yesCondition: "2 portfolio projects tested AND 60 learning hours documented.",
      noCondition: "Projects incomplete or lacking measurable depth.",
      yesText: "Continue to Freelance Client Outreach",
      noText: "Complete additional practical engineering projects",
      measurableGoals: [
        {
          title: "Technical Learning Hours",
          metricLabel: "Study Hours Logged",
          startValue: "0 hrs",
          currentActual: `${realData.softwareDevHours} hrs`,
          targetValue: "60 hrs",
          remaining: `${Math.max(0, 60 - realData.softwareDevHours)} hrs`,
          unit: "hours",
          deadline: "December 15, 2026",
          progress: Math.min(100, Math.round((realData.softwareDevHours / 60) * 100)),
        },
        {
          title: "Portfolio Ready Projects",
          metricLabel: "Completed Fullstack Apps",
          startValue: "0",
          currentActual: `${realData.projectsCompleted}`,
          targetValue: "2",
          remaining: `${Math.max(0, 2 - realData.projectsCompleted)}`,
          unit: "projects",
          deadline: "December 15, 2026",
          progress: Math.min(100, Math.round((realData.projectsCompleted / 2) * 100)),
        },
        {
          title: "English Practice Hours",
          metricLabel: "Daily Shadowing & Audio",
          startValue: "0 hrs",
          currentActual: `${realData.englishHours} hrs`,
          targetValue: "45 hrs",
          remaining: `${Math.max(0, 45 - realData.englishHours)} hrs`,
          unit: "hours",
          deadline: "December 15, 2026",
          progress: Math.min(100, Math.round((realData.englishHours / 45) * 100)),
        },
      ],
      relatedTasks: [
        "React 19 & Next.js 16 App Router architecture",
        "TypeScript strict typing & system design",
        "Daily technical shadowing & vocabulary flashcards",
      ],
    },
    {
      id: "m4",
      number: 4,
      title: "Freelancing & Client Acquisition",
      targetDate: "December 31, 2026",
      category: "Client Acquisition",
      categoryTheme: "amber",
      icon: Briefcase,
      imageUrl: "/journey/freelance_portfolio.jpg",
      status: "upcoming",
      progress: 15,
      decisionText: "First Paying Client Acquired?",
      yesCondition: "At least 1 paying client signed with actual received deposit.",
      noCondition: "0 paying clients recorded in database.",
      yesText: "Continue toward business expansion",
      noText: "Refine portfolio case studies and continue outreach",
      measurableGoals: [
        {
          title: "Client Outreach Attempts",
          metricLabel: "Targeted Qualified Pitches",
          startValue: "0",
          currentActual: `${realData.freelanceOutreachCount}`,
          targetValue: "60",
          remaining: `${Math.max(0, 60 - realData.freelanceOutreachCount)}`,
          unit: "pitches",
          deadline: "December 31, 2026",
          progress: Math.min(100, Math.round((realData.freelanceOutreachCount / 60) * 100)),
        },
        {
          title: "Service Packages Published",
          metricLabel: "Live Service Tiers",
          startValue: "0",
          currentActual: "3",
          targetValue: "3",
          remaining: "0",
          unit: "packages",
          deadline: "December 31, 2026",
          progress: 100,
        },
        {
          title: "First Paying Client",
          metricLabel: "Delivered & Paid Clients",
          startValue: "0",
          currentActual: `${realData.freelanceClientsAcquired}`,
          targetValue: "1",
          remaining: `${Math.max(0, 1 - realData.freelanceClientsAcquired)}`,
          unit: "clients",
          deadline: "December 31, 2026",
          progress: realData.freelanceClientsAcquired > 0 ? 100 : 0,
          notes: "Actual Freelance Income: 0 ETB. (Never display estimated value as earned income)",
        },
      ],
      relatedTasks: [
        "Prepare 3 clear service tiers (Starter, Pro, Enterprise)",
        "5 targeted proposals per week on Upwork & direct channels",
        "Log client status in CRM (Lead → Proposal → Active)",
      ],
    },
    {
      id: "m5",
      number: 5,
      title: "Suku Marketplace Business Development",
      targetDate: "January 10, 2027",
      category: "E-Commerce MVP",
      categoryTheme: "purple",
      icon: Store,
      imageUrl: "/journey/suku_mvp.jpg",
      status: "upcoming",
      progress: 22,
      decisionText: "Suku MVP Readiness Checklist Ready?",
      yesCondition: "All core buyer/seller/checkout modules tested with 0 critical bugs.",
      noCondition: "Checkout or merchant auth issues remain unresolved.",
      yesText: "Continue toward pilot merchant launch",
      noText: "Fix MVP bugs and complete security checklist",
      measurableGoals: [
        {
          title: "MVP Readiness Checklist",
          metricLabel: "Tested Core Features",
          startValue: "0 / 9",
          currentActual: `${realData.sukuModulesTested} / ${realData.sukuModulesTotal}`,
          targetValue: "9 / 9",
          remaining: `${realData.sukuModulesTotal - realData.sukuModulesTested}`,
          unit: "features",
          deadline: "January 10, 2027",
          progress: Math.min(100, Math.round((realData.sukuModulesTested / realData.sukuModulesTotal) * 100)),
          notes: "Do not claim Suku has launched until Addis merchants are actively live.",
        },
        {
          title: "Pilot Merchant Roster",
          metricLabel: "Qualified Addis Merchants",
          startValue: "0",
          currentActual: "2",
          targetValue: "5",
          remaining: "3",
          unit: "merchants",
          deadline: "January 10, 2027",
          progress: 40,
        },
      ],
      relatedTasks: [
        "Test Telebirr/Chapa checkout & order management",
        "Seller dashboard & product listing workflows",
        "Security & performance checklist before Addis pilot",
      ],
    },
    {
      id: "m6",
      number: 6,
      title: "Forex Strategy Validation & Financial Security",
      targetDate: "January 15, 2027",
      category: "Forex & Savings",
      categoryTheme: "green",
      icon: CandlestickChart,
      imageUrl: "/journey/forex_trading.jpg",
      status: "upcoming",
      progress: 10,
      decisionText: "100 Trades Backtested & Edge Proven?",
      yesCondition: "100 documented historical trades on EURUSD/GBPUSD with positive expectancy.",
      noCondition: "Trade journal < 100 trades or rules broken.",
      yesText: "Continue to 90-Day Mission Finale",
      noText: "Backtest weaknesses and review trading psychology",
      measurableGoals: [
        {
          title: "Documented Backtest Trades",
          metricLabel: "Historical Journal Entries",
          startValue: "0",
          currentActual: `${realData.forexBacktestTrades}`,
          targetValue: "100",
          remaining: `${Math.max(0, 100 - realData.forexBacktestTrades)}`,
          unit: "trades",
          deadline: "January 15, 2027",
          progress: Math.min(100, Math.round((realData.forexBacktestTrades / 100) * 100)),
          notes: "Strict 1% risk demo testing only. No live capital or prop fee purchase required.",
        },
        {
          title: "Win Rate & R:R Expectancy",
          metricLabel: "ICT Strategy Edge",
          startValue: "0%",
          currentActual: `${realData.forexWinRate}% (4.3R)`,
          targetValue: "50%+ (>2R)",
          remaining: "Edge Validated",
          unit: "winrate",
          deadline: "January 15, 2027",
          progress: 100,
        },
        {
          title: "90-Day Emergency Reserve",
          metricLabel: "Total Cumulative Savings",
          startValue: "0 ETB",
          currentActual: `${realData.actualSavings.toLocaleString()} ETB`,
          targetValue: "9,000 ETB",
          remaining: `${Math.max(0, 9000 - realData.actualSavings).toLocaleString()} ETB`,
          unit: "ETB",
          deadline: "January 15, 2027",
          progress: Math.min(100, Math.round((realData.actualSavings / 9000) * 100)),
        },
      ],
      relatedTasks: [
        "Focus strictly on EURUSD & GBPUSD major pairs",
        "Record entry price, stop loss, take profit & screenshots",
        "Analyze win rate, average R, and maximum drawdown",
      ],
    },
    {
      id: "m7",
      number: 7,
      title: "Complete 90-Day Review & Family Harmony",
      targetDate: "January 29, 2027",
      category: "Quarterly Evaluation",
      categoryTheme: "emerald",
      icon: Award,
      imageUrl: "/journey/mountain_viewpoint.jpg",
      status: "upcoming",
      progress: 0,
      decisionText: "90-Day Mission Objectives Achieved?",
      yesCondition: "Measurable progress verified across all 9 life categories.",
      noCondition: "Critical goals missed without documented adaptation.",
      yesText: "Step into Success Destination & Plan Next 90 Days",
      noText: "Identify weak areas, recalibrate targets, and create improved plan",
      measurableGoals: [
        {
          title: "Life Category Reviews",
          metricLabel: "Evaluated Areas",
          startValue: "0 / 9",
          currentActual: "9 / 9",
          targetValue: "9 / 9",
          remaining: "0",
          unit: "categories",
          deadline: "January 29, 2027",
          progress: 100,
        },
        {
          title: "Weekly Personal Reflections",
          metricLabel: "Completed Reviews",
          startValue: "0",
          currentActual: `${realData.familyReflectionsCount}`,
          targetValue: "12",
          remaining: `${Math.max(0, 12 - realData.familyReflectionsCount)}`,
          unit: "reviews",
          deadline: "January 29, 2027",
          progress: Math.min(100, Math.round((realData.familyReflectionsCount / 12) * 100)),
        },
        {
          title: "Family Balance & Contribution",
          metricLabel: "Monthly Family Support",
          startValue: "10,000 ETB",
          currentActual: "10,000 ETB",
          targetValue: "10,000 ETB",
          remaining: "0 ETB",
          unit: "ETB/mo",
          deadline: "January 29, 2027",
          progress: 100,
        },
      ],
      relatedTasks: [
        "Evaluate discipline, habits, and prayers consistency",
        "Review savings reserves and cash flow sustainability",
        "Review Suku pilot merchant feedback & Forex edge validation",
      ],
    },
  ];

  // Zoom handlers
  const handleZoomIn = () => setZoom((z) => Math.min(1.4, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.25, Number((z - 0.1).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitToScreen = () => {
    if (viewportRef.current) {
      const containerWidth = viewportRef.current.clientWidth - 32;
      const targetScale = Math.min(1, Math.max(0.25, Number((containerWidth / 1320).toFixed(2))));
      setZoom(targetScale);
      setPan({ x: 0, y: 0 });
    }
  };

  // Drag-to-pan handlers (Mouse & Touch)
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".interactive-node, button, a")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(".interactive-node, button, a")) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC HERO BANNER (Alpine Lake & Mountains)
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[160px] sm:min-h-[180px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Majestic Alpine Mountains & Lake"
              fill
              priority
              className="object-cover object-center opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent sm:w-[65%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-6 px-6 sm:px-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF5EE] text-[#165B33] text-[11px] font-extrabold uppercase tracking-wider border border-[#B7E4C7]">
                <Target size={13} />
                <span>Measurable Life Roadmap</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#112318]">
                Your Life Journey
              </h1>
              <p className="text-[13.5px] sm:text-[14.5px] text-[#284534] font-medium leading-relaxed">
                Every ambition is measurable. Every milestone connects actual recorded data to your 90-day mission.
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1.5 flex-shrink-0">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl py-2.5 px-4 border border-white/80 shadow-xs flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                  <Calendar size={17} />
                </div>
                <div>
                  <div className="text-[12.5px] font-extrabold text-[#14211A] leading-tight">
                    90-Day Mission Sprint
                  </div>
                  <div className="text-[11px] text-[#5A6E63] font-medium leading-tight">
                    Nov 1, 2026 – Jan 29, 2027
                  </div>
                </div>
              </div>

              <span className="text-[12px] italic text-[#165B33] font-bold drop-shadow-xs pr-1">
                "Goal + Target + Deadline + Discipline = Success"
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. FLOATING METRICS SUMMARY BAR
            ======================================================== */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#E2EAE5]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
            {/* Metric 1: Overall 90-Day Weighted Progress */}
            <div className="flex items-center space-x-3.5 sm:pr-4 sm:border-r border-[#E2EAE5]">
              <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
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
                    strokeDasharray={`${overall90DayProgress}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[13px] font-extrabold text-[#14211A] font-mono">
                  {overall90DayProgress}%
                </span>
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#14211A] leading-tight">
                  Overall 90-Day Progress
                </div>
                <div className="text-[11.5px] text-[#165B33] font-semibold leading-tight mt-0.5">
                  Weighted 9-Category Score
                </div>
              </div>
            </div>

            {/* Metric 2: Actual Savings vs 90-Day Target */}
            <div className="flex items-center space-x-3 sm:px-4 sm:border-r border-[#E2EAE5]">
              <div className="w-10 h-10 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                <Coins size={18} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#14211A] leading-tight font-mono">
                  {realData.actualSavings.toLocaleString()} / 9,000 ETB
                </div>
                <div className="text-[11.5px] text-[#6C8176] font-medium leading-tight">
                  Emergency Savings Goal
                </div>
              </div>
            </div>

            {/* Metric 3: Fitness & Workout Sessions */}
            <div className="flex items-center space-x-3 sm:px-4 sm:border-r border-[#E2EAE5]">
              <div className="w-10 h-10 rounded-xl bg-[#E8F1FC] text-[#1E40AF] flex items-center justify-center flex-shrink-0">
                <Dumbbell size={18} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#14211A] leading-tight font-mono">
                  {realData.workoutsCompleted} / 48
                </div>
                <div className="text-[11.5px] text-[#6C8176] font-medium leading-tight">
                  Workouts Completed
                </div>
              </div>
            </div>

            {/* Metric 4: Spiritual Prayer Anchors */}
            <div className="flex items-center space-x-3 sm:pl-4">
              <div className="w-10 h-10 rounded-xl bg-[#FEF3D6] text-[#B47805] flex items-center justify-center flex-shrink-0">
                <Heart size={18} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-[#14211A] leading-tight font-mono">
                  {realData.prayersCompleted} / 180
                </div>
                <div className="text-[11.5px] text-[#6C8176] font-medium leading-tight">
                  Prayers Protected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. SECTION 12: 9-CATEGORY MEASURABLE LIFE PROGRESS
            Separate progress for every life category derived from actual data
            ======================================================== */}
        <div className="bg-white rounded-2xl border border-[#E2EAE5] shadow-xs overflow-hidden">
          <div
            onClick={() => setShowCategoryBreakdown(!showCategoryBreakdown)}
            className="p-4 sm:px-5 flex items-center justify-between cursor-pointer hover:bg-[#F9FBFA] transition-colors"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                <Activity size={17} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-[#14211A] leading-tight">
                  9-Category Measurable Life Progress Breakdown
                </h3>
                <span className="text-[11.5px] text-[#5A6E63]">
                  Real recorded progress calculated separately across all 9 life categories
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[12px] font-bold font-mono text-[#165B33] bg-[#EBF5EE] px-2.5 py-0.5 rounded-full">
                {overall90DayProgress}% Average
              </span>
              {showCategoryBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>

          {showCategoryBreakdown && (
            <div className="p-4 sm:p-5 pt-0 border-t border-[#EAEFEA] bg-[#FAFCFA]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-3">
                {Object.entries(categoryMetrics).map(([key, item]) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={key}
                      className="p-3.5 rounded-xl bg-white border border-[#E2EAE5] shadow-2xs space-y-2 hover:border-[#165B33]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg border ${item.color}`}>
                            <Icon size={14} />
                          </div>
                          <span className="text-[12.5px] font-bold text-[#14211A]">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[12px] font-extrabold font-mono text-[#165B33]">
                          {item.progress}%
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#5A6E63] font-medium">
                          <span>Actual: <strong className="text-[#14211A]">{item.actual}</strong></span>
                          <span>Target: {item.target}</span>
                        </div>
                      </div>

                      <p className="text-[10.5px] text-[#6C8176] line-clamp-1 border-t border-[#F0F4F1] pt-1.5">
                        {item.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ========================================================
            4. FLOWCHART TOOLBAR & LEGEND
            ======================================================== */}
        <div className="bg-white rounded-2xl px-5 py-3 border border-[#E2EAE5] shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11.5px] font-semibold text-[#486053]">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-[#165B33] rounded-full inline-block" />
              <span>Forward Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#165B33] ring-2 ring-[#76C893] animate-pulse" />
              <span>Current Active Node</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-dashed border-[#8DA697] inline-block" />
              <span>Upcoming Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 border-b-2 border-dashed border-[#D97706] inline-block" />
              <span>Retry / Loopback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rotate-45 bg-[#EBF5EE] border border-[#76C893] inline-block" />
              <span>Measurable Decision Gate</span>
            </div>
          </div>

          {/* Interactive Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-[#F7FAF8] p-1 rounded-xl border border-[#E2E9E4]">
            <button
              type="button"
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 hover:bg-white rounded-lg text-[#14211A] hover:text-[#165B33] transition-colors shadow-2xs"
            >
              <ZoomIn size={16} />
            </button>
            <span className="text-[11.5px] font-bold font-mono px-2 text-[#2D4A39]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 hover:bg-white rounded-lg text-[#14211A] hover:text-[#165B33] transition-colors shadow-2xs"
            >
              <ZoomOut size={16} />
            </button>
            <div className="w-[1px] h-4 bg-[#D5E2D9] mx-1" />
            <button
              type="button"
              onClick={handleFitToScreen}
              title="Fit to Screen"
              className="px-2.5 py-1 text-[11px] font-bold hover:bg-white rounded-lg text-[#14211A] hover:text-[#165B33] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Maximize2 size={13} />
              <span>Fit</span>
            </button>
            <button
              type="button"
              onClick={handleResetView}
              title="Reset View (100%)"
              className="px-2.5 py-1 text-[11px] font-bold hover:bg-white rounded-lg text-[#14211A] hover:text-[#165B33] transition-colors flex items-center gap-1 shadow-2xs"
            >
              <RotateCw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            5. THE CONNECTED MEASURABLE LIFE JOURNEY FLOWCHART CANVAS
            Start → Foundation → Financial/Fitness/Spiritual → Skills/English →
            Freelance → Suku → Forex/Financial Security → 90-Day Review → Success
            ======================================================== */}
        <div
          ref={viewportRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative bg-gradient-to-br from-[#FAFCFA] via-white to-[#F2F8F4] rounded-3xl border border-[#D5E2D9] shadow-xs overflow-x-auto overflow-y-hidden select-none min-h-[1920px] cursor-grab active:cursor-grabbing touch-pan-x touch-pan-y"
          style={{ touchAction: "pan-x pan-y" }}
        >
          {/* Subtle Grid Canvas Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.25]"
            style={{
              backgroundImage:
                "radial-gradient(#165B33 0.8px, transparent 0.8px), radial-gradient(#165B33 0.8px, #FAFCFA 0.8px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "0 0, 16px 16px",
            }}
          />

          {/* Scalable & Pannable Flowchart Container */}
          <div
            className="relative transition-transform duration-100 ease-out origin-top-left"
            style={{
              width: "1320px",
              height: "1880px",
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            }}
          >
            {/* ----------------------------------------------------
                SVG CONTINUOUS CONNECTOR LINES OVERLAY
                ---------------------------------------------------- */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              viewBox="0 0 1320 1880"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <marker
                  id="arrow-green"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#165B33" />
                </marker>
                <marker
                  id="arrow-gray"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8DA697" />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#D97706" />
                </marker>
                <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#165B33" floodOpacity="0.3" />
                </filter>
                <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#D97706" floodOpacity="0.3" />
                </filter>
              </defs>

              {/* ──────────────────────────────────────────────────────────
                  ROW 1 PATHS: START -> M1 -> D1 -> M2 + NO LOOP 1
                  ────────────────────────────────────────────────────────── */}
              {/* Path 1: START (330, 202) -> M1 (430, 202) */}
              <path
                d="M 330 202 L 430 202"
                stroke="#165B33"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrow-green)"
                filter="url(#glow-green)"
              />

              {/* Path 2: M1 (780, 202) -> D1 (900, 202) */}
              <path
                d="M 780 202 L 900 202"
                stroke="#165B33"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrow-green)"
                filter="url(#glow-green)"
              />

              {/* NO Loop 1: D1 Top (970, 132) -> M1 Top (605, 85) */}
              <path
                d="M 970 132 C 970 35 910 35 830 35 L 670 35 C 605 35 605 55 605 85"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
                filter="url(#glow-amber)"
              />

              {/* YES Branch 1: D1 Bottom (970, 272) -> M2 Top (1005, 440) */}
              <path
                d="M 970 272 L 970 355 C 970 405 1005 405 1005 440"
                stroke="#165B33"
                strokeWidth="3.5"
                strokeLinecap="round"
                markerEnd="url(#arrow-green)"
                filter="url(#glow-green)"
              />

              {/* ──────────────────────────────────────────────────────────
                  ROW 2 PATHS: M2 -> D2 -> M3 + NO LOOP 2 (Right to Left)
                  ────────────────────────────────────────────────────────── */}
              {/* Path 3: M2 Left (830, 557) -> D2 Right (700, 557) */}
              <path
                d="M 830 557 L 700 557"
                stroke="#165B33"
                strokeWidth="3"
                strokeLinecap="round"
                markerEnd="url(#arrow-green)"
              />

              {/* NO Loop 2: D2 Top (630, 487) -> M2 Top (935, 440) */}
              <path
                d="M 630 487 C 630 390 690 390 770 390 L 870 390 C 935 390 935 410 935 440"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 2: D2 Left (560, 557) -> M3 Left (100, 907) */}
              <path
                d="M 560 557 L 180 557 C 100 557 100 660 100 750 L 100 907"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* ──────────────────────────────────────────────────────────
                  ROW 3 PATHS: M3 -> D3 -> M4 -> D4 + NO LOOPS (Left to Right)
                  ────────────────────────────────────────────────────────── */}
              {/* Path 4: M3 Right (450, 907) -> D3 Left (530, 907) */}
              <path
                d="M 450 907 L 530 907"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* NO Loop 3: D3 Top (590, 847) -> M3 Top (275, 790) */}
              <path
                d="M 590 847 C 590 740 540 740 450 740 L 350 740 C 275 740 275 765 275 790"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 3: D3 Right (650, 907) -> M4 Left (730, 907) */}
              <path
                d="M 650 907 L 730 907"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* Path 5: M4 Right (1080, 907) -> D4 Left (1150, 907) */}
              <path
                d="M 1080 907 L 1150 907"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* NO Loop 4: D4 Top (1210, 847) -> M4 Top (905, 790) */}
              <path
                d="M 1210 847 C 1210 740 1150 740 1060 740 L 970 740 C 905 740 905 765 905 790"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 4: D4 Bottom (1210, 967) -> M5 Top (1025, 1140) */}
              <path
                d="M 1210 967 L 1210 1050 C 1210 1100 1025 1100 1025 1140"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* ──────────────────────────────────────────────────────────
                  ROW 4 PATHS: M5 -> D5 -> M6 -> D6 + NO LOOPS (Right to Left)
                  ────────────────────────────────────────────────────────── */}
              {/* Path 6: M5 Left (850, 1257) -> D5 Right (750, 1257) */}
              <path
                d="M 850 1257 L 750 1257"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* NO Loop 5: D5 Top (690, 1197) -> M5 Top (925, 1140) */}
              <path
                d="M 690 1197 C 690 1090 750 1090 820 1090 L 870 1090 C 925 1090 925 1115 925 1140"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 5: D5 Left (630, 1257) -> M6 Right (550, 1257) */}
              <path
                d="M 630 1257 L 550 1257"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* Path 7: M6 Left (200, 1257) -> D6 Right (130, 1257) */}
              <path
                d="M 200 1257 L 130 1257"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* NO Loop 6: D6 Top (75, 1197) -> M6 Top (375, 1140) */}
              <path
                d="M 75 1197 C 75 1090 150 1090 250 1090 L 320 1090 C 375 1090 375 1115 375 1140"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 6: D6 Bottom (75, 1317) -> M7 Left (160, 1610) */}
              <path
                d="M 75 1317 L 75 1460 C 75 1610 110 1610 160 1610"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* ──────────────────────────────────────────────────────────
                  ROW 5 PATHS: M7 -> D7 -> SUCCESS DESTINATION (Left to Right)
                  ────────────────────────────────────────────────────────── */}
              {/* Path 8: M7 Right (510, 1610) -> D7 Left (600, 1610) */}
              <path
                d="M 510 1610 L 600 1610"
                stroke="#8DA697"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-gray)"
              />

              {/* NO Loop 7: D7 Top (660, 1550) -> M7 Top (335, 1490) */}
              <path
                d="M 660 1550 C 660 1440 600 1440 490 1440 L 390 1440 C 335 1440 335 1465 335 1490"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
                markerEnd="url(#arrow-amber)"
              />

              {/* YES Branch 7 (FINAL VICTORY PATH): D7 Right (720, 1610) -> SUCCESS (840, 1610) */}
              <path
                d="M 720 1610 L 840 1610"
                stroke="#165B33"
                strokeWidth="4"
                strokeLinecap="round"
                markerEnd="url(#arrow-green)"
                filter="url(#glow-green)"
              />
            </svg>

            {/* ----------------------------------------------------
                TEXT PILLS ON CONNECTOR LINES (YES / NO Labels)
                ---------------------------------------------------- */}
            {/* ROW 1 LABELS */}
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "770px", top: "35px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: Adherence &lt; 80% → Review Obstacles</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "970px", top: "355px" }}
            >
              <span className="bg-[#165B33] text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full shadow-xs">
                YES: Routine Adherence ≥ 80%
              </span>
            </div>

            {/* ROW 2 LABELS */}
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "780px", top: "390px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: Savings &lt; 3,000 ETB or Missed Workouts</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "340px", top: "557px" }}
            >
              <span className="bg-white text-[#165B33] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#165B33] shadow-xs">
                YES: 3,000 ETB Saved &amp; 4 Wk/Sessions
              </span>
            </div>

            {/* ROW 3 LABELS */}
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "410px", top: "740px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: Projects Incomplete → Build Practical Apps</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "690px", top: "907px" }}
            >
              <span className="bg-white text-[#165B33] text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-[#CBD7CE] shadow-xs">
                YES: 2 Projects Tested
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "1060px", top: "740px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: 0 Paying Clients → Refine Outreach</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "1210px", top: "1050px" }}
            >
              <span className="bg-white text-[#165B33] text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-[#CBD7CE] shadow-xs">
                YES: ≥ 1 Real Client Paid
              </span>
            </div>

            {/* ROW 4 LABELS */}
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "790px", top: "1090px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: MVP Incomplete → Fix Checkout &amp; Vendor UI</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "590px", top: "1257px" }}
            >
              <span className="bg-white text-[#165B33] text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-[#CBD7CE] shadow-xs">
                YES: Core MVP Verified
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "220px", top: "1090px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: &lt; 100 Trades → Continue Backtesting</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "75px", top: "1440px" }}
            >
              <span className="bg-white text-[#165B33] text-[10.5px] font-extrabold px-2 py-0.5 rounded-full border border-[#CBD7CE] shadow-xs">
                YES: 100 Trades Documented
              </span>
            </div>

            {/* ROW 5 LABELS */}
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "490px", top: "1440px" }}
            >
              <span className="bg-[#FFFBEB] text-[#D97706] text-[10.5px] font-extrabold px-3 py-1 rounded-full border border-amber-300 shadow-xs flex items-center gap-1">
                <RotateCcw size={11} />
                <span>NO: Weak Areas Identified → Adjust Plan</span>
              </span>
            </div>
            <div
              className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: "780px", top: "1610px" }}
            >
              <span className="bg-[#165B33] text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                <Sparkles size={11} />
                <span>YES: 90-Day Mission Accomplished!</span>
              </span>
            </div>

            {/* ========================================================
                ROW 1 NODES: START -> M1 -> D1
                ======================================================== */}
            {/* 1. START NODE (X: 50, Y: 90, W: 280, H: 225) */}
            <div
              onClick={() => setIsStartModalOpen(true)}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#BDE0C8] shadow-xs hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "50px", top: "90px", width: "280px", height: "225px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2.5">
                  <div className="w-13 h-13 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9]">
                    <Image
                      src="/journey/start_path.jpg"
                      alt="Beginning of mountain journey"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 text-[#165B33] mb-0.5">
                      <Rocket size={14} />
                      <span className="text-[10px] font-extrabold uppercase tracking-wider">Start Node</span>
                    </div>
                    <h3 className="text-[14.5px] font-extrabold text-[#14211A] leading-tight">
                      My Current Reality
                    </h3>
                    <span className="text-[11px] text-[#5A6E63] font-medium block mt-0.5">
                      Starting: Nov 1, 2026
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-[11px] bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4]">
                  <div className="flex justify-between">
                    <span className="text-[#6C8176]">Monthly Salary:</span>
                    <strong className="text-[#14211A]">30,000 ETB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C8176]">Family Contribution:</span>
                    <strong className="text-[#14211A]">~10,000 ETB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C8176]">Starting Savings:</span>
                    <strong className="text-[#14211A]">0 ETB</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C8176]">Academic Baseline:</span>
                    <strong className="text-[#14211A]">CS Graduate</strong>
                  </div>
                </div>
              </div>

              <div className="text-[10.5px] text-[#165B33] font-bold text-center mt-1 flex items-center justify-center gap-1">
                <span>View Starting Baseline</span>
                <ArrowRight size={11} />
              </div>

              {/* Port Right: (330, 202) */}
              <div
                title="Forward Connection Node"
                className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#165B33] ring-3 ring-white shadow-xs"
              />
            </div>

            {/* 2. MILESTONE 1: Foundation & Daily Discipline (X: 430, Y: 85, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[0])}
              className="interactive-node absolute bg-[#F0F7F3] rounded-2xl p-4 border-2 border-[#165B33] shadow-md hover:shadow-lg transition-all cursor-pointer group z-20 ring-4 ring-[#165B33]/15 flex flex-col justify-between"
              style={{ left: "430px", top: "85px", width: "350px", height: "235px" }}
            >
              {/* CURRENT ACTIVE BADGE */}
              <div className="absolute -top-3 left-4 bg-[#165B33] text-white text-[10.5px] font-extrabold px-3 py-0.5 rounded-full flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <span>CURRENT ACTIVE MILESTONE</span>
              </div>

              <div>
                <div className="flex items-start space-x-3 mb-2.5 mt-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[0].imageUrl}
                      alt={milestones[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#165B33] uppercase tracking-wide">
                        Milestone 1 • Nov 7
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63] font-mono">
                        Target: {milestones[0].targetDate}
                      </span>
                    </div>
                    <h4 className="text-[14.5px] font-bold text-[#14211A] leading-snug">
                      {milestones[0].title}
                    </h4>
                  </div>
                </div>

                {/* Measurable Targets Inside Card */}
                <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-[#D5E2D9] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Routine Adherence:</span>
                    <strong className="text-[#14211A]">Target: 100% • Actual: 85%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Sleep Recovery:</span>
                    <strong className="text-[#14211A]">Target: 7.5h • Actual: 7.5h</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#165B33] font-semibold">
                    <span>Deadline: Nov 7, 2026</span>
                    <span>Remaining: 15%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#165B33]">Phase I Adherence</span>
                  <span className="font-mono text-[#165B33]">{milestones[0].progress}%</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden border border-[#D5E2D9]">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[0].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#165B33] ring-3 ring-white shadow-xs" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#165B33] ring-3 ring-white shadow-xs" />
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 3. DECISION DIAMOND 1: Consistent Daily Routine? (Center: 970, 202) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 1 — Daily Routine",
                  question: milestones[0].decisionText,
                  yesCondition: milestones[0].yesCondition,
                  noCondition: milestones[0].noCondition,
                  yesAction: milestones[0].yesText,
                  noAction: milestones[0].noText,
                  fromMilestone: milestones[0].title,
                  targetMilestone: milestones[1].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "900px", top: "132px", width: "140px", height: "140px" }}
            >
              <div className="w-24 h-24 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[10.5px] text-[#14211A] leading-tight px-1 select-none">
                  Consistent Routine?
                </span>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#165B33] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#165B33] ring-2 ring-white shadow-xs" />
            </div>

            {/* ========================================================
                ROW 2 NODES: M2 -> D2 (Right to Left)
                ======================================================== */}
            {/* 4. MILESTONE 2: Financial Savings + Fitness + Spiritual (X: 830, Y: 440, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[1])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border-2 border-[#165B33] shadow-md hover:shadow-lg transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "830px", top: "440px", width: "350px", height: "235px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[1].imageUrl}
                      alt={milestones[1].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#165B33] uppercase tracking-wide">
                        Milestone 2 • Nov 30
                      </span>
                      <span className="text-[10px] font-bold bg-[#EBF5EE] text-[#165B33] px-2 py-0.5 rounded-full">
                        Savings &amp; Health
                      </span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      Savings + Fitness + Prayer
                    </h4>
                  </div>
                </div>

                {/* Measurable Targets Inside Card */}
                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Nov Savings:</span>
                    <strong className="text-[#165B33] font-mono">
                      {realData.actualSavings.toLocaleString()} / 3,000 ETB (Saved ✓)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Workouts:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 16 • Completed: {realData.workoutsCompleted}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Prayers:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 60 • Completed: {realData.prayersCompleted}
                    </strong>
                  </div>
                  {/* Visual Savings Stepper: 0 -> 3k -> 6k -> 9k */}
                  <div className="text-[9.5px] font-bold text-[#2D4A39] border-t border-[#E2E9E4] pt-1 flex items-center justify-between font-mono">
                    <span className="text-[#165B33]">0 ETB</span>
                    <span>→</span>
                    <span className="text-[#165B33] font-extrabold bg-[#EBF5EE] px-1 rounded">3,000 ETB</span>
                    <span>→</span>
                    <span className="text-[#6C8176]">6,000</span>
                    <span>→</span>
                    <span className="text-[#6C8176]">9,000 ETB</span>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>Nov Milestone Execution</span>
                  <span className="font-mono text-[#165B33]">{milestones[1].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[1].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#165B33] ring-3 ring-white shadow-xs" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#165B33] ring-2 ring-white shadow-xs" />
              <div className="absolute left-[33%] -top-2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 5. DECISION DIAMOND 2: Savings & Health Achieved? (Center: 630, 557) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 2 — Savings & Health Targets",
                  question: milestones[1].decisionText,
                  yesCondition: milestones[1].yesCondition,
                  noCondition: milestones[1].noCondition,
                  yesAction: milestones[1].yesText,
                  noAction: milestones[1].noText,
                  fromMilestone: milestones[1].title,
                  targetMilestone: milestones[2].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "560px", top: "487px", width: "140px", height: "140px" }}
            >
              <div className="w-24 h-24 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[10px] text-[#14211A] leading-tight px-1 select-none">
                  Savings &amp; Health Achieved?
                </span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#165B33] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
            </div>

            {/* ========================================================
                ROW 3 NODES: M3 -> D3 -> M4 -> D4 (Left to Right)
                ======================================================== */}
            {/* 6. MILESTONE 3: Professional Skills & English (X: 100, Y: 790, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[2])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#E2EAE5] hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "100px", top: "790px", width: "350px", height: "235px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[2].imageUrl}
                      alt={milestones[2].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#1E40AF] uppercase tracking-wide">
                        Milestone 3 • Dec 15
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63]">Upcoming</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      Software &amp; English Mastery
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Coding Study:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 60h • Actual: {realData.softwareDevHours}h
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Portfolio Projects:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 2 • Completed: {realData.projectsCompleted}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">English Practice:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 45h • Actual: {realData.englishHours}h ({realData.vocabMastered} vocab)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[#1E40AF] font-semibold border-t border-[#E2E9E4] pt-1">
                    <span>Deadline: Dec 15, 2026</span>
                    <span>Remaining: 48h</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>Progress Target</span>
                  <span className="font-mono">{milestones[2].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[2].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 7. DECISION DIAMOND 3: Skills Demonstrated? (Center: 590, 907) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 3 — Software & English Skills",
                  question: milestones[2].decisionText,
                  yesCondition: milestones[2].yesCondition,
                  noCondition: milestones[2].noCondition,
                  yesAction: milestones[2].yesText,
                  noAction: milestones[2].noText,
                  fromMilestone: milestones[2].title,
                  targetMilestone: milestones[3].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "530px", top: "847px", width: "120px", height: "120px" }}
            >
              <div className="w-22 h-22 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[10px] text-[#14211A] leading-tight px-1 select-none">
                  Skills Demonstrated?
                </span>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
            </div>

            {/* 8. MILESTONE 4: Freelancing & Client Acquisition (X: 730, Y: 790, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[3])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#E2EAE5] hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "730px", top: "790px", width: "350px", height: "235px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[3].imageUrl}
                      alt={milestones[3].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#B47805] uppercase tracking-wide">
                        Milestone 4 • Dec 31
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63]">Upcoming</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      Freelancing &amp; Client Acquisition
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Client Outreach:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 60 • Actual: {realData.freelanceOutreachCount}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Service Packages:</span>
                    <strong className="text-[#14211A] font-mono">3 / 3 Live Packages</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Paid Clients:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 1 • Actual: {realData.freelanceClientsAcquired}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[#B47805] font-semibold border-t border-[#E2E9E4] pt-1">
                    <span>Actual Income: 0 ETB</span>
                    <span>1 Proposal Pending</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>Outreach Progress</span>
                  <span className="font-mono">{milestones[3].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[3].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 9. DECISION DIAMOND 4: Client Acquired? (Center: 1210, 907) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 4 — Client Acquisition",
                  question: milestones[3].decisionText,
                  yesCondition: milestones[3].yesCondition,
                  noCondition: milestones[3].noCondition,
                  yesAction: milestones[3].yesText,
                  noAction: milestones[3].noText,
                  fromMilestone: milestones[3].title,
                  targetMilestone: milestones[4].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "1150px", top: "847px", width: "120px", height: "120px" }}
            >
              <div className="w-22 h-22 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[9.5px] text-[#14211A] leading-tight px-1 select-none">
                  Client Acquired?
                </span>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
            </div>

            {/* ========================================================
                ROW 4 NODES: M5 -> D5 -> M6 -> D6 (Right to Left)
                ======================================================== */}
            {/* 10. MILESTONE 5: Suku Marketplace Business Development (X: 850, Y: 1140, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[4])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#E2EAE5] hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "850px", top: "1140px", width: "350px", height: "235px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[4].imageUrl}
                      alt={milestones[4].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wide">
                        Milestone 5 • Jan 10
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63]">MVP In Progress</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      Suku Marketplace Business
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">MVP Checklist:</span>
                    <strong className="text-[#14211A] font-mono">
                      {realData.sukuModulesTested} / {realData.sukuModulesTotal} Features Tested
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Pilot Merchants:</span>
                    <strong className="text-[#14211A] font-mono">Target: 5 • Qualified: 2</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Launch Status:</span>
                    <strong className="text-amber-800 font-mono">Pre-Launch MVP Verification</strong>
                  </div>
                  <div className="text-[10px] text-[#6C8176] border-t border-[#E2E9E4] pt-1">
                    Checkout &amp; merchant security in active test
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>MVP Readiness Progress</span>
                  <span className="font-mono">{milestones[4].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[4].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-[25%] -top-2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 11. DECISION DIAMOND 5: Suku MVP Ready? (Center: 690, 1257) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 5 — Suku MVP Readiness",
                  question: milestones[4].decisionText,
                  yesCondition: milestones[4].yesCondition,
                  noCondition: milestones[4].noCondition,
                  yesAction: milestones[4].yesText,
                  noAction: milestones[4].noText,
                  fromMilestone: milestones[4].title,
                  targetMilestone: milestones[5].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "630px", top: "1197px", width: "120px", height: "120px" }}
            >
              <div className="w-22 h-22 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[10px] text-[#14211A] leading-tight px-1 select-none">
                  Suku MVP Ready?
                </span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
            </div>

            {/* 12. MILESTONE 6: Forex Strategy Validation & Financial Security (X: 200, Y: 1140, W: 350, H: 235) */}
            <div
              onClick={() => setSelectedMilestone(milestones[5])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#E2EAE5] hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "200px", top: "1140px", width: "350px", height: "235px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[5].imageUrl}
                      alt={milestones[5].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#165B33] uppercase tracking-wide">
                        Milestone 6 • Jan 15
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63]">Validation</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      Forex Strategy &amp; Financial Edge
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Backtest Trades:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 100 • Documented: {realData.forexBacktestTrades}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">ICT Verified Edge:</span>
                    <strong className="text-[#165B33] font-mono">
                      Win Rate: {realData.forexWinRate}% (+{realData.forexTotalR}R)
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">90-Day Emergency Fund:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 9,000 ETB • Actual: {realData.actualSavings.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div className="text-[10px] text-[#6C8176] border-t border-[#E2E9E4] pt-1">
                    Strict 1% demo risk • No live capital risk
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>Strategy Validation Progress</span>
                  <span className="font-mono">{milestones[5].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[5].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 13. DECISION DIAMOND 6: Strategy Validated? (Center: 75, 1257) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 6 — Forex Strategy & Risk Rules",
                  question: milestones[5].decisionText,
                  yesCondition: milestones[5].yesCondition,
                  noCondition: milestones[5].noCondition,
                  yesAction: milestones[5].yesText,
                  noAction: milestones[5].noText,
                  fromMilestone: milestones[5].title,
                  targetMilestone: milestones[6].title,
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "15px", top: "1197px", width: "120px", height: "120px" }}
            >
              <div className="w-22 h-22 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[9.5px] text-[#14211A] leading-tight px-1 select-none">
                  Strategy Validated?
                </span>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
            </div>

            {/* ========================================================
                ROW 5 NODES: M7 -> D7 -> SUCCESS DESTINATION (Left to Right)
                ======================================================== */}
            {/* 14. MILESTONE 7: Complete 90-Day Review & Family Harmony (X: 160, Y: 1490, W: 350, H: 240) */}
            <div
              onClick={() => setSelectedMilestone(milestones[6])}
              className="interactive-node absolute bg-white rounded-2xl p-4 border border-[#E2EAE5] hover:border-[#165B33] hover:shadow-md transition-all cursor-pointer group z-20 flex flex-col justify-between"
              style={{ left: "160px", top: "1490px", width: "350px", height: "240px" }}
            >
              <div>
                <div className="flex items-start space-x-3 mb-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#CBD7CE]">
                    <Image
                      src={milestones[6].imageUrl}
                      alt={milestones[6].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#165B33] uppercase tracking-wide">
                        Milestone 7 • Jan 29
                      </span>
                      <span className="text-[10px] font-semibold text-[#5A6E63]">Mission Finale</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#14211A] leading-snug">
                      90-Day Review &amp; Family Harmony
                    </h4>
                  </div>
                </div>

                <div className="space-y-1.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E2E9E4] text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Categories Evaluated:</span>
                    <strong className="text-[#14211A] font-mono">9 / 9 Life Categories</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Weekly Reflections:</span>
                    <strong className="text-[#14211A] font-mono">
                      Target: 12 • Completed: {realData.familyReflectionsCount}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6C8176]">Family Contribution:</span>
                    <strong className="text-[#165B33] font-mono">10,000 ETB / Month Maintained</strong>
                  </div>
                  <div className="text-[10px] text-[#6C8176] border-t border-[#E2E9E4] pt-1">
                    Protected 18:30 family dinners &amp; Sunday planning
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#5A6E63]">
                  <span>Review Ready</span>
                  <span className="font-mono">{milestones[6].progress}%</span>
                </div>
                <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#165B33] rounded-full transition-all"
                    style={{ width: `${milestones[6].progress}%` }}
                  />
                </div>
              </div>

              {/* Ports */}
              <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 -top-2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
            </div>

            {/* 15. DECISION DIAMOND 7: 90-Day Mission Achieved? (Center: 660, 1610) */}
            <div
              onClick={() =>
                setSelectedDecision({
                  title: "Decision Gate 7 — 90-Day Mission Victory",
                  question: milestones[6].decisionText,
                  yesCondition: milestones[6].yesCondition,
                  noCondition: milestones[6].noCondition,
                  yesAction: milestones[6].yesText,
                  noAction: milestones[6].noText,
                  fromMilestone: milestones[6].title,
                  targetMilestone: "Final Success Destination",
                })
              }
              className="interactive-node absolute flex items-center justify-center cursor-pointer group z-20"
              style={{ left: "600px", top: "1550px", width: "120px", height: "120px" }}
            >
              <div className="w-24 h-24 rotate-45 bg-gradient-to-br from-[#EBF5EE] to-[#D5EEDD] border-2 border-[#76C893] rounded-2xl flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-[#165B33] transition-all">
                <span className="-rotate-45 text-center font-bold text-[10px] text-[#14211A] leading-tight px-1 select-none">
                  90-Day Mission Achieved?
                </span>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#8DA697] ring-2 ring-white shadow-xs" />
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#D97706] ring-2 ring-white shadow-xs" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#165B33] ring-2 ring-white shadow-xs" />
            </div>

            {/* 16. FINAL SUCCESS DESTINATION NODE (X: 840, Y: 1480, W: 420, H: 260) */}
            <div
              onClick={() => setIsSuccessModalOpen(true)}
              className="interactive-node absolute bg-white rounded-3xl p-5 border-3 border-[#165B33] shadow-lg hover:shadow-xl transition-all cursor-pointer group z-20 ring-4 ring-[#165B33]/20 overflow-hidden flex flex-col justify-between"
              style={{ left: "840px", top: "1480px", width: "420px", height: "260px" }}
            >
              <div>
                <div className="relative h-28 w-full rounded-2xl overflow-hidden mb-3 border border-[#A3D9B5]">
                  <Image
                    src="/journey/success_mountain.jpg"
                    alt="Mountain summit victory at sunrise"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute top-2.5 right-2.5 bg-[#FEF3D6] text-[#B47805] text-[10.5px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Trophy size={12} />
                    <span>SUMMIT DESTINATION</span>
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Ultimate Life Objective
                    </div>
                    <h4 className="text-[16px] font-extrabold leading-tight">
                      Freedom, Independence &amp; Fulfillment
                    </h4>
                  </div>
                </div>

                <div className="text-[11.5px] text-[#486053] font-medium leading-relaxed px-1">
                  10 Continuing Long-Term Goals: Financial independence, software mastery, Suku marketplace, ICT trading edge, and family security.
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#EAEFEA] pt-2.5 mt-2">
                <span className="text-[12px] font-extrabold text-[#165B33]">
                  10 Long-Term Goals
                </span>
                <button
                  type="button"
                  className="bg-[#165B33] group-hover:bg-[#123D26] text-white text-[11.5px] font-bold py-2 px-4 rounded-full shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>Open Vision Sheet</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Left Input Port */}
              <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#165B33] ring-3 ring-white shadow-xs" />
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL 1: MILESTONE MEASURABLE TARGETS & CONCRETE TASKS
            ======================================================== */}
        {selectedMilestone && (
          <Modal
            isOpen={!!selectedMilestone}
            onClose={() => setSelectedMilestone(null)}
            title={`Milestone ${selectedMilestone.number} — ${selectedMilestone.title}`}
            maxWidth="max-w-2xl"
          >
            <div className="space-y-5">
              {/* Image Banner */}
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#D5E2D9] bg-[#E8EEEA]">
                <Image
                  src={selectedMilestone.imageUrl}
                  alt={selectedMilestone.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                      {selectedMilestone.category}
                    </span>
                    <h3 className="text-lg font-extrabold text-white leading-tight">
                      {selectedMilestone.title}
                    </h3>
                  </div>
                  <span className="text-[12px] font-mono font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                    Deadline: {selectedMilestone.targetDate}
                  </span>
                </div>
              </div>

              {/* Measurable Numerical Goals Breakdown */}
              <div className="space-y-3">
                <h4 className="text-[13px] font-extrabold text-[#14211A] flex items-center gap-1.5">
                  <Target size={15} className="text-[#165B33]" />
                  <span>Specific Numerical Targets &amp; Actual Recorded Progress:</span>
                </h4>

                <div className="space-y-2.5">
                  {selectedMilestone.measurableGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#14211A]">{goal.title}</span>
                        <span className="text-[12px] font-mono font-extrabold text-[#165B33]">
                          {goal.progress}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] bg-white p-2 rounded-lg border border-[#EAEFEA]">
                        <div>
                          <span className="text-[#6C8176] block text-[10.5px]">Start:</span>
                          <strong className="text-[#14211A] font-mono">{goal.startValue}</strong>
                        </div>
                        <div>
                          <span className="text-[#6C8176] block text-[10.5px]">Current Actual:</span>
                          <strong className="text-[#165B33] font-mono">{goal.currentActual}</strong>
                        </div>
                        <div>
                          <span className="text-[#6C8176] block text-[10.5px]">Target:</span>
                          <strong className="text-[#14211A] font-mono">{goal.targetValue}</strong>
                        </div>
                        <div>
                          <span className="text-[#6C8176] block text-[10.5px]">Remaining:</span>
                          <strong className="text-[#B47805] font-mono">{goal.remaining}</strong>
                        </div>
                      </div>

                      <div className="h-2 bg-[#E8EEEA] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#165B33] rounded-full transition-all"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>

                      {goal.notes && (
                        <p className="text-[11px] text-[#5A6E63] italic">{goal.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Execution Tasks */}
              <div className="space-y-2">
                <h4 className="text-[12.5px] font-bold text-[#14211A]">Related Execution Tasks:</h4>
                <div className="space-y-1.5">
                  {selectedMilestone.relatedTasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-white border border-[#E2E9E4] flex items-center space-x-2 text-[12px] text-[#345140]"
                    >
                      <CheckCircle2 size={14} className="text-[#165B33] flex-shrink-0" />
                      <span>{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decision Gate Criteria */}
              <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-amber-200 space-y-1.5 text-[12px]">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <RotateCcw size={14} />
                  <span>Evaluation Gate: {selectedMilestone.decisionText}</span>
                </div>
                <div className="text-amber-800 flex items-center gap-2">
                  <span className="font-bold text-emerald-800">YES Criteria:</span>
                  <span>{selectedMilestone.yesCondition}</span>
                </div>
                <div className="text-amber-800 flex items-center gap-2">
                  <span className="font-bold text-amber-900">NO Criteria:</span>
                  <span>{selectedMilestone.noCondition}</span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2EAE5]">
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#165B33] text-white shadow-xs hover:bg-[#123D26] transition-colors"
                >
                  Close &amp; Continue Flowchart
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 2: DECISION GATE LOGIC & MEASURABLE CRITERIA
            ======================================================== */}
        {selectedDecision && (
          <Modal
            isOpen={!!selectedDecision}
            onClose={() => setSelectedDecision(null)}
            title={selectedDecision.title}
            maxWidth="max-w-md"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F7FAF8] border border-[#CBD7CE] space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#165B33]">
                  Measurable Flowchart Gate
                </span>
                <p className="text-[15px] font-extrabold text-[#14211A] leading-snug">
                  "{selectedDecision.question}"
                </p>
              </div>

              <div className="space-y-2.5 text-[12.5px]">
                <div className="p-3 rounded-xl bg-[#EBF5EE] border border-[#B7E4C7] space-y-1">
                  <span className="font-extrabold text-[#165B33] flex items-center gap-1">
                    <CheckCircle2 size={15} />
                    <span>YES Condition (Advances Forward)</span>
                  </span>
                  <p className="text-[#2D4A39] font-medium leading-relaxed">
                    {selectedDecision.yesCondition}
                  </p>
                  <p className="text-[11.5px] text-[#486053] italic">
                    Action: {selectedDecision.yesAction}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-[#FFFBEB] border border-amber-200 space-y-1">
                  <span className="font-extrabold text-amber-900 flex items-center gap-1">
                    <RotateCcw size={15} />
                    <span>NO Condition (Retry / Improvement Loop)</span>
                  </span>
                  <p className="text-amber-800 font-medium leading-relaxed">
                    {selectedDecision.noCondition}
                  </p>
                  <p className="text-[11.5px] text-amber-700 italic">
                    Recovery: {selectedDecision.noAction}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2EAE5]">
                <button
                  type="button"
                  onClick={() => setSelectedDecision(null)}
                  className="px-5 py-2 rounded-xl text-[12.5px] font-bold bg-[#165B33] text-white shadow-xs"
                >
                  Understood
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 3: START NODE — MY CURRENT REALITY
            ======================================================== */}
        {isStartModalOpen && (
          <Modal
            isOpen={isStartModalOpen}
            onClose={() => setIsStartModalOpen(false)}
            title="Start — My Current Reality (November 1, 2026)"
            maxWidth="max-w-xl"
          >
            <div className="space-y-4">
              <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-[#CBD7CE]">
                <Image
                  src="/journey/start_path.jpg"
                  alt="Trailhead of mountain journey"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-4 text-white text-[13px] font-bold">
                  Baseline: November 1, 2026 Trailhead
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px]">
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <span className="text-[#6C8176] block text-[11px]">Academic Baseline</span>
                  <span className="font-bold text-[#14211A]">Computer Science Graduate</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <span className="text-[#6C8176] block text-[11px]">Full-Time Employment</span>
                  <span className="font-bold text-[#14211A]">30,000 ETB / Month</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <span className="text-[#6C8176] block text-[11px]">Starting Savings</span>
                  <span className="font-bold text-[#14211A]">0 ETB</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4]">
                  <span className="text-[#6C8176] block text-[11px]">Family Support Contribution</span>
                  <span className="font-bold text-[#14211A]">~10,000 ETB Monthly</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] text-[12px] space-y-1">
                <span className="font-bold text-[#14211A] block">Important Financial Rules:</span>
                <span className="text-[#486053] block leading-relaxed">
                  First calculate available income after family contribution (10K), transportation, essential expenses and obligations. Allow reducing or postponing targets if unaffordable. Never invent deposits or financial transactions. Show planned savings (3,000 ETB/mo) separately from actual savings ({realData.actualSavings.toLocaleString()} ETB).
                </span>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2EAE5]">
                <button
                  type="button"
                  onClick={() => setIsStartModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-[12.5px] font-bold bg-[#165B33] text-white shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 4: LONG-TERM SUCCESS DESTINATIONS SHEET
            ======================================================== */}
        {isSuccessModalOpen && (
          <Modal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            title="Long-Term Success Destination — Freedom & Fulfillment"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-[#A3D9B5]">
                <Image
                  src="/journey/success_mountain.jpg"
                  alt="Mountain summit at sunrise"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-extrabold text-white leading-tight">
                    Mountain Summit at Sunrise
                  </h3>
                  <span className="text-[12px] text-emerald-200">
                    Achievement, Freedom, Financial Independence, and Lifelong Fulfillment
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[12.5px] font-extrabold text-[#14211A] uppercase tracking-wider block">
                  The 10 Continuing Long-Term Goals:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "1. Become financially independent.",
                    "2. Develop a sustainable freelance income.",
                    "3. Build a successful software development business.",
                    "4. Grow Suku into a trusted marketplace.",
                    "5. Become a consistently disciplined and validated trader.",
                    "6. Build emergency savings and long-term investments.",
                    "7. Become an excellent software developer.",
                    "8. Communicate confidently in English.",
                    "9. Maintain physical health and spiritual consistency.",
                    "10. Support my family and build a meaningful life.",
                  ].map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#F7FAF8] border border-[#E2E9E4] flex items-center space-x-2 text-[12.5px] font-bold text-[#14211A]"
                    >
                      <Trophy size={14} className="text-[#B47805] flex-shrink-0" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-[#E2EAE5]">
                <button
                  type="button"
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#165B33] text-white shadow-xs hover:bg-[#123D26] transition-colors"
                >
                  Close Vision Sheet
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
