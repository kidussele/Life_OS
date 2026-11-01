"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  GraduationCap,
  BookOpen,
  Code2,
  Globe,
  ArrowRight,
  CheckCircle2,
  Check,
  Laptop,
  Lightbulb,
  Flame,
  Award,
  Layers,
  Database,
  Layout,
  Network,
  Plus,
  Volume2,
  Sparkles,
} from "lucide-react";
import { EnglishVocab } from "@/lib/types";

export default function CareerLearningPage() {
  const [vocabList, setVocabList] = useState<EnglishVocab[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStudyPlanOpen, setIsStudyPlanOpen] = useState(false);
  const [isRoadmapsModalOpen, setIsRoadmapsModalOpen] = useState(false);
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [activePlanType, setActivePlanType] = useState<"english" | "software">("english");

  // New Vocab Form
  const [newWord, setNewWord] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newExample, setNewExample] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch vocabulary from API
  const fetchLearningData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/learning");
      if (res.ok) {
        const data = await res.json();
        setVocabList(data.vocab || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningData();
  }, []);

  const handleAddVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word_phrase: newWord,
          definition: newContext || "Daily useful phrases",
          example_sentence: newExample || "Professional communication phrase.",
          mastery_level: 75,
        }),
      });

      if (res.ok) {
        setIsVocabModalOpen(false);
        setNewWord("");
        setNewContext("");
        setNewExample("");
        fetchLearningData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // 4 Roadmaps matching screenshot
  const roadmaps = [
    {
      id: "rm_nextjs",
      title: "Next.js & Server-Side Architecture",
      subtitle: "Master Next.js, SSR, and API Routes",
      items: [
        "App Router & Layouts",
        "Server Components",
        "Performance Optimization",
      ],
      image: "/learning/nextjs_laptop.jpg",
      status: "Active",
      statusColor: "bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]",
      progressLabel: "Sprint 1 Ready",
    },
    {
      id: "rm_db",
      title: "Relational Databases & APIs",
      subtitle: "Learn Database Design & REST APIs",
      items: [
        "PostgreSQL & MySQL",
        "API Development",
        "Data Modeling",
      ],
      image: "/learning/databases_3d.jpg",
      status: "Not Started",
      statusColor: "bg-[#F7FAF8] text-[#6C8176] border-[#E2EAE5]",
      progressLabel: "Not Started",
    },
    {
      id: "rm_system_design",
      title: "System Design",
      subtitle: "Design Scalable Systems",
      items: [
        "Architecture Patterns",
        "Scalability & Performance",
        "System Design Interviews",
      ],
      image: "/learning/system_design_3d.jpg",
      status: "Not Started",
      statusColor: "bg-[#F7FAF8] text-[#6C8176] border-[#E2EAE5]",
      progressLabel: "Not Started",
    },
    {
      id: "rm_uiux",
      title: "UI/UX Design Systems",
      subtitle: "Build Beautiful Interfaces",
      items: [
        "Design Principles",
        "Component Libraries",
        "Accessibility",
      ],
      image: "/learning/uiux_design_3d.jpg",
      status: "Not Started",
      statusColor: "bg-[#F7FAF8] text-[#6C8176] border-[#E2EAE5]",
      progressLabel: "Not Started",
    },
  ];

  // 4 Vocabulary Cards matching screenshot
  const initialVocabulary = [
    {
      word: "Pragmatic",
      context: "Daily useful phrases",
      example: '"Let\'s get started."',
      mastery: 75,
    },
    {
      word: "Unwavering",
      context: "Build confidence",
      example: '"I can do it."',
      mastery: 65,
    },
    {
      word: "Displacement",
      context: "Express ideas clearly",
      example: '"As a result..."',
      mastery: 70,
    },
    {
      word: "Tenacity",
      context: "Stay consistent",
      example: '"Never give up."',
      mastery: 80,
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC MOUNTAIN HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[145px] sm:min-h-[160px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Mountain Panorama Backdrop"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:w-[65%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title with Graduation Cap & Books Thumbnail */}
            <div className="flex items-center space-x-4">
              <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border border-[#D5E2D9] shadow-sm flex-shrink-0 relative bg-white">
                <Image
                  src="/learning/grad_cap_books.jpg"
                  alt="Graduation Cap and Books"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#112318]">
                  Career, Software Engineering &amp; English Mastery
                </h1>
                <p className="text-[12.5px] sm:text-[13.5px] text-[#284534] font-medium leading-relaxed mt-0.5">
                  Build in-demand skills, grow your career, and communicate confidently.
                </p>
              </div>
            </div>

            {/* Right Card: Overall Learning Progress (62%) */}
            <div className="flex items-center flex-shrink-0">
              <div className="bg-white/95 backdrop-blur-md border border-[#D5E2D9] rounded-2xl px-6 py-3 shadow-xs text-center min-w-[210px]">
                <span className="text-[12px] font-bold text-[#14211A] block">
                  Overall Learning Progress
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-[#112318] font-mono block my-0.5">
                  62%
                </span>
                <div className="w-full bg-[#E8EEEA] h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-[#165B33] h-full rounded-full transition-all duration-700"
                    style={{ width: "62%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. TWO MAIN SKILL FOCUS CARDS (ENGLISH & SOFTWARE STUDY)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* CARD 1: ENGLISH SPEAKING & COMMUNICATION */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5 min-w-0">
                {/* Green Hexagon / Code Bracket Icon */}
                <div className="w-13 h-13 rounded-2xl bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] flex items-center justify-center font-mono font-extrabold text-lg flex-shrink-0 shadow-2xs">
                  &lt;/&gt;
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15px] font-extrabold text-[#112318] truncate">
                    English Speaking &amp; Communication
                  </h3>
                  <p className="text-[12px] font-medium text-[#486053] mt-0.5">
                    Target: <strong>90 min daily • 45 hours in 90 days</strong>
                  </p>
                  <span className="text-[12px] font-semibold text-[#14211A] block mt-1">
                    Progress: 12.5 h / 45 h
                  </span>
                </div>
              </div>

              {/* Study Plan Pill Button */}
              <button
                type="button"
                onClick={() => {
                  setActivePlanType("english");
                  setIsStudyPlanOpen(true);
                }}
                className="bg-[#EBF5EE] hover:bg-[#D8EEDF] text-[#165B33] border border-[#B7E4C7] font-bold text-[12px] px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition-colors flex-shrink-0"
              >
                <span>Study Plan</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Horizontal Progress Bar with 28% label */}
            <div className="flex items-center space-x-3 pt-1">
              <div className="flex-1 h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                  style={{ width: "28%" }}
                />
              </div>
              <span className="text-[11.5px] font-bold text-[#14211A] font-mono">
                28%
              </span>
            </div>
          </div>

          {/* CARD 2: PROFESSIONAL SOFTWARE STUDY */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5 min-w-0">
                {/* Laptop Thumbnail */}
                <div className="w-13 h-13 rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#D5E2D9] shadow-2xs bg-[#F7FAF8]">
                  <Image
                    src="/learning/nextjs_laptop.jpg"
                    alt="Laptop with code"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <h3 className="text-[15px] font-extrabold text-[#112318] truncate">
                    Professional Software Study
                  </h3>
                  <p className="text-[12px] font-medium text-[#486053] mt-0.5">
                    Target: <strong>60 hours • 2 projects</strong>
                  </p>
                  <span className="text-[12px] font-semibold text-[#14211A] block mt-1">
                    Progress: 18 h / 60 h
                  </span>
                </div>
              </div>

              {/* Study Plan Pill Button */}
              <button
                type="button"
                onClick={() => {
                  setActivePlanType("software");
                  setIsStudyPlanOpen(true);
                }}
                className="bg-[#EBF5EE] hover:bg-[#D8EEDF] text-[#165B33] border border-[#B7E4C7] font-bold text-[12px] px-3.5 py-1.5 rounded-full flex items-center gap-1 shadow-2xs transition-colors flex-shrink-0"
              >
                <span>Study Plan</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* Horizontal Progress Bar with 30% label */}
            <div className="flex items-center space-x-3 pt-1">
              <div className="flex-1 h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#165B33] rounded-full transition-all duration-500"
                  style={{ width: "30%" }}
                />
              </div>
              <span className="text-[11.5px] font-bold text-[#14211A] font-mono">
                30%
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. SOFTWARE ENGINEERING ROADMAPS & CURRICULA (4 CARDS)
            ======================================================== */}
        <div className="bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                <BookOpen size={16} />
              </div>
              <h2 className="text-[15px] font-extrabold text-[#112318]">
                Software Engineering Roadmaps &amp; Curricula
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setIsRoadmapsModalOpen(true)}
              className="text-[12px] font-bold text-[#165B33] hover:underline flex items-center gap-1"
            >
              <span>View All Roadmaps</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 4 Roadmap Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmaps.map((rm) => (
              <div
                key={rm.id}
                className="p-4 rounded-2xl border border-[#E2EAE5] bg-[#FCFDFD] hover:border-[#B7E4C7] transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <h3 className="text-[13.5px] font-extrabold text-[#112318] leading-snug">
                    {rm.title}
                  </h3>
                  <p className="text-[11.5px] text-[#5A6E63] font-medium mt-0.5">
                    {rm.subtitle}
                  </p>

                  {/* Checklist items */}
                  <div className="space-y-1.5 mt-3">
                    {rm.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[11.5px] text-[#14211A]">
                        <CheckCircle2 size={13} className="text-[#165B33] flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Image Graphic + Status Pill */}
                <div className="pt-2 border-t border-[#F0F4F1] flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${rm.statusColor}`}
                  >
                    {rm.status}
                  </span>

                  <div className="w-16 h-10 rounded-xl overflow-hidden relative flex-shrink-0 border border-[#E2EAE5] bg-white">
                    <Image
                      src={rm.image}
                      alt={rm.title}
                      fill
                      className="object-contain p-0.5"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            4. BOTTOM ROW: VOCABULARY & PHRASE BANK (LEFT) + LEARNING INSIGHTS (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: ENGLISH PRACTICAL VOCABULARY & PHRASE BANK (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0">
                  <Globe size={16} />
                </div>
                <h3 className="text-[15px] font-extrabold text-[#112318]">
                  English Practical Vocabulary &amp; Phrase Bank
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsVocabModalOpen(true)}
                className="text-[12px] font-bold text-[#165B33] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {/* 4 Vocabulary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {initialVocabulary.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-[#E2EAE5] bg-[#F7FAF8] hover:border-[#165B33] transition-colors flex flex-col justify-between space-y-2"
                >
                  <div>
                    <h4 className="text-[14px] font-extrabold text-[#112318]">
                      {v.word}
                    </h4>
                    <span className="text-[11px] text-[#6C8176] block mt-0.5">
                      {v.context}
                    </span>
                    <p className="text-[12px] font-medium text-[#14211A] italic my-2">
                      {v.example}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10.5px] font-bold text-[#6C8176] block mb-1">
                      Mastery Level {v.mastery}%
                    </span>
                    <div className="h-1.5 bg-[#E8EEEA] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#165B33] rounded-full"
                        style={{ width: `${v.mastery}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD 2: LEARNING INSIGHTS & MOMENTUM CHART (col-span-4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4 bg-gradient-to-br from-white via-white to-[#F2FBF5]">
            {/* Header */}
            <div className="flex items-center space-x-2 text-[#112318] pb-2 border-b border-[#F0F4F1]">
              <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                <Lightbulb size={14} className="stroke-[2.5]" />
              </div>
              <h3 className="text-[15px] font-extrabold">Learning Insights</h3>
            </div>

            {/* Insights Stats & Momentum Chart */}
            <div className="flex items-center justify-between gap-4">
              {/* Left 3 Stats */}
              <div className="space-y-3 text-[12px]">
                <div className="flex items-start space-x-2.5">
                  <Flame size={16} className="text-[#D97706] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[#6C8176] text-[11px] block font-normal">Study Streak</span>
                    <strong className="text-[#14211A] font-bold">7 days 🔥</strong>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <Code2 size={16} className="text-[#165B33] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[#6C8176] text-[11px] block font-normal">Total Learning Hours</span>
                    <strong className="text-[#14211A] font-bold">18 / 60 h</strong>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <GraduationCap size={16} className="text-[#165B33] mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[#6C8176] text-[11px] block font-normal">Projects Completed</span>
                    <strong className="text-[#14211A] font-bold">0 / 2</strong>
                  </div>
                </div>
              </div>

              {/* Right Ascending Momentum Bars Chart */}
              <div className="flex items-end justify-center gap-1.5 h-28 pr-2">
                {[
                  { label: "d10", h: "h-6" },
                  { label: "d15", h: "h-10" },
                  { label: "d20", h: "h-16" },
                  { label: "d25", h: "h-22" },
                  { label: "d30", h: "h-28" },
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-3.5 bg-[#165B33] rounded-t-md transition-all duration-500 ${bar.h}`}
                    />
                    <span className="text-[9px] text-[#6C8176] font-mono mt-1">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Quote Banner */}
            <div className="p-3 rounded-2xl bg-[#EBF5EE] border border-[#B7E4C7] text-center text-[11.5px] font-medium text-[#165B33] italic">
              &ldquo;Knowledge is the bridge between your current self and your dreams.&rdquo;
            </div>
          </div>
        </div>

        {/* ========================================================
            MODAL 1: STUDY PLAN DETAIL
            ======================================================== */}
        {isStudyPlanOpen && (
          <Modal
            isOpen={isStudyPlanOpen}
            onClose={() => setIsStudyPlanOpen(false)}
            title={
              activePlanType === "english"
                ? "English Speaking & Communication Study Plan"
                : "Professional Software Engineering Study Plan"
            }
            maxWidth="max-w-xl"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#E2E9E4] space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-[#165B33]">
                  90-Day Mastery Curriculum
                </span>
                <h4 className="text-[14px] font-bold text-[#14211A]">
                  {activePlanType === "english"
                    ? "Target: 45 Total Practice Hours (90 min daily)"
                    : "Target: 60 Hours Deep Work (Next.js 15 + PostgreSQL MVP)"}
                </h4>
                <p className="text-[12px] text-[#5A6E63]">
                  {activePlanType === "english"
                    ? "Shadowing tech pitch presentations, vocabulary flashcards, and live voice recording."
                    : "Server components, streaming SSR, PostgreSQL database indexes, and end-to-end testing."}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[12px] font-bold text-[#14211A]">Daily Study Blocks</h5>
                <div className="p-3 rounded-xl border border-[#E2E9E4] flex items-center justify-between text-[12px]">
                  <span className="font-bold">05:00 – 05:30 AM</span>
                  <span>English Technical Pitch &amp; Speaking</span>
                  <span className="text-[#165B33] font-bold">30 min</span>
                </div>
                <div className="p-3 rounded-xl border border-[#E2E9E4] flex items-center justify-between text-[12px]">
                  <span className="font-bold">06:00 – 06:40 AM</span>
                  <span>Next.js 15 &amp; Architecture Deep Study</span>
                  <span className="text-[#165B33] font-bold">40 min</span>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsStudyPlanOpen(false)}
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12px] font-bold shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 2: VIEW ALL ROADMAPS
            ======================================================== */}
        {isRoadmapsModalOpen && (
          <Modal
            isOpen={isRoadmapsModalOpen}
            onClose={() => setIsRoadmapsModalOpen(false)}
            title="Software Engineering Roadmaps & Full Syllabus"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {roadmaps.map((rm) => (
                <div key={rm.id} className="p-4 rounded-2xl border border-[#E2E9E4] bg-[#F7FAF8] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[14px] font-extrabold text-[#112318]">{rm.title}</h4>
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${rm.statusColor}`}>
                      {rm.status}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#5A6E63]">{rm.subtitle}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAEFEA]">
                    {rm.items.map((it, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-[12px]">
                        <CheckCircle2 size={13} className="text-[#165B33]" />
                        <span>{it}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsRoadmapsModalOpen(false)}
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12px] font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 3: ADD / VIEW VOCABULARY
            ======================================================== */}
        {isVocabModalOpen && (
          <Modal
            isOpen={isVocabModalOpen}
            onClose={() => setIsVocabModalOpen(false)}
            title="Add Practical Vocabulary & Phrase"
            maxWidth="max-w-md"
          >
            <form onSubmit={handleAddVocab} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Word or Phrase
                </label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="e.g. Scrutinize"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Usage Context
                </label>
                <input
                  type="text"
                  value={newContext}
                  onChange={(e) => setNewContext(e.target.value)}
                  placeholder="e.g. Code Review & Architecture"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Example Sentence
                </label>
                <textarea
                  rows={2}
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="e.g. We must scrutinize database transaction locks."
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsVocabModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#5A6E63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12.5px] font-bold shadow-xs"
                >
                  {submitting ? "Saving..." : "Save Word"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
