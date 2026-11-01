"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import Link from "next/link";
import {
  Heart,
  Activity,
  GraduationCap,
  Laptop,
  Store,
  TrendingUp,
  Coins,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sprout,
  Compass,
  Layers,
} from "lucide-react";

interface LifeDomain {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  progress: number;
  icon: any;
  iconBg: string;
  iconColor: string;
  isPrayer?: boolean;
}

const LIFE_DOMAINS: LifeDomain[] = [
  {
    id: "health",
    title: "Health & Fitness",
    subtitle: "Physical health, exercise, and wellness routine.",
    href: "/health",
    progress: 86,
    icon: Activity,
    iconBg: "bg-[#E8F8F0] border-[#C8E6C9]",
    iconColor: "text-[#16A34A]",
  },
  {
    id: "spiritual",
    title: "Spiritual Life",
    subtitle: "Prayer, devotion, and spiritual growth.",
    href: "/spiritual",
    progress: 72,
    icon: null,
    isPrayer: true,
    iconBg: "bg-[#FFF8E7] border-[#FEF3C7]",
    iconColor: "text-[#D97706]",
  },
  {
    id: "career",
    title: "Career & Learning",
    subtitle: "Skills, education, and career development.",
    href: "/career",
    progress: 78,
    icon: GraduationCap,
    iconBg: "bg-[#E8F8F0] border-[#C8E6C9]",
    iconColor: "text-[#165B33]",
  },
  {
    id: "freelancing",
    title: "Freelancing",
    subtitle: "Online work and professional services.",
    href: "/freelancing",
    progress: 64,
    icon: Laptop,
    iconBg: "bg-[#F0F9FF] border-[#BAE6FD]",
    iconColor: "text-[#0284C7]",
  },
  {
    id: "suku",
    title: "Business (Suku)",
    subtitle: "Your business and marketplace growth.",
    href: "/suku",
    progress: 69,
    icon: Store,
    iconBg: "bg-[#E8F8F0] border-[#C8E6C9]",
    iconColor: "text-[#165B33]",
  },
  {
    id: "forex",
    title: "Forex Journal",
    subtitle: "Trading insights and performance tracking.",
    href: "/forex",
    progress: 73,
    icon: TrendingUp,
    iconBg: "bg-[#E8F8F0] border-[#C8E6C9]",
    iconColor: "text-[#165B33]",
  },
  {
    id: "finances",
    title: "Financial Management",
    subtitle: "Money management and financial planning.",
    href: "/finances",
    progress: 75,
    icon: Coins,
    iconBg: "bg-[#FFF8E7] border-[#FEF3C7]",
    iconColor: "text-[#D97706]",
  },
  {
    id: "family",
    title: "Family & Relations",
    subtitle: "Family, friends, and relationships.",
    href: "/family",
    progress: 91,
    icon: Users,
    iconBg: "bg-[#E8F8F0] border-[#C8E6C9]",
    iconColor: "text-[#165B33]",
  },
];

export default function LifeCategoriesPage() {
  const [selectedDomain, setSelectedDomain] = useState<LifeDomain | null>(null);
  const [domains, setDomains] = useState<LifeDomain[]>(LIFE_DOMAINS);

  useEffect(() => {
    async function loadCategoryProgress() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          if (data.categories) {
            setDomains((prev) =>
              prev.map((d) => {
                const val = data.categories[d.id];
                return val !== undefined ? { ...d, progress: val } : d;
              })
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCategoryProgress();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-4 max-w-7xl mx-auto pb-16">
        {/* ========================================================= */}
        {/* 1. TOP HEADER SECTION (Matches Reference Image)           */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          {/* Left: Icon + Title + Subtitle */}
          <div className="flex items-start space-x-3.5">
            {/* Green Sprouting Leaves Icon in Mint Square */}
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] border border-[#C8E6C9] flex items-center justify-center flex-shrink-0 shadow-sm text-[#165B33]">
              <Sprout size={26} className="stroke-[2.5]" />
            </div>

            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#165B33]">
                HOLISTIC LIFE ARCHITECTURE
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#0D3823] tracking-tight">
                Life Categories & Domains
              </h1>
              <p className="text-[12px] sm:text-[13px] text-[#475569] mt-0.5">
                Explore and manage the key areas of your life. Track progress, set goals, and access relevant tools for each domain.
              </p>
            </div>
          </div>

          {/* Right: View All Categories Button */}
          <div className="flex-shrink-0 self-start sm:self-center">
            <button
              onClick={() => setSelectedDomain(domains[0])}
              className="inline-flex items-center space-x-1 px-4 py-2 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#165B33] border border-[#BBF7D0] rounded-full text-[12px] font-semibold transition-all shadow-sm"
            >
              <span>View All Categories</span>
              <ArrowRight size={13} className="ml-0.5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. THE 8 DOMAIN CARDS GRID (4 cols x 2 rows)              */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {domains.map((domain) => {
            const Icon = domain.icon;

            return (
              <div
                key={domain.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm flex flex-col justify-between hover:border-[#165B33] hover:shadow-md transition-all duration-200 group"
              >
                {/* Top Section: Icon + Title/Subtitle + Circular Progress */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    {/* Left Icon */}
                    <div
                      className={`w-11 h-11 rounded-2xl border ${domain.iconBg} ${domain.iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}
                    >
                      {domain.isPrayer ? (
                        <span className="text-[20px]">🙏</span>
                      ) : Icon ? (
                        <Icon size={20} className="stroke-[2.5]" />
                      ) : null}
                    </div>

                    {/* Middle: Title & Subtitle */}
                    <div className="min-w-0 flex-1 pl-1">
                      <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug truncate">
                        {domain.title}
                      </h3>
                      <p className="text-[11px] text-[#64748B] leading-tight mt-0.5 line-clamp-2">
                        {domain.subtitle}
                      </p>
                    </div>

                    {/* Right: Circular Progress Ring */}
                    <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                        {/* Background Ring */}
                        <circle
                          cx="22"
                          cy="22"
                          r="17"
                          stroke="#DCFCE7"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        {/* Active Progress Ring */}
                        <circle
                          cx="22"
                          cy="22"
                          r="17"
                          stroke="#16A34A"
                          strokeWidth="3.5"
                          strokeDasharray={106.8}
                          strokeDashoffset={106.8 * (1 - domain.progress / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700"
                        />
                      </svg>

                      {/* Percentage in center */}
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-[#0F172A]">
                        {domain.progress}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Open Domain -> Pill Button */}
                <div className="pt-2 flex justify-center">
                  <Link
                    href={domain.href}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-[#165B33] bg-[#F0FDF4] group-hover:bg-[#DCFCE7] border border-[#BBF7D0] px-3.5 py-1.5 rounded-full transition-all"
                  >
                    <span>Open Domain</span>
                    <ArrowRight size={12} className="ml-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM PANORAMIC BANNER CARD                           */}
        {/* ========================================================= */}
        <div className="relative overflow-hidden rounded-2xl border border-[#C8E6C9] shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 bg-[#F6FAF7] min-h-[110px]">
          {/* Background panoramic landscape with green hills (Clean, text-free) */}
          <div
            className="absolute inset-0 bg-no-repeat bg-cover bg-center pointer-events-none opacity-90"
            style={{
              backgroundImage: "url('/categories/categories_landscape_banner.png')",
            }}
          />
          {/* Soft gradient backdrop for quote text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F6FAF7]/95 via-[#F6FAF7]/85 to-transparent sm:w-[65%] pointer-events-none" />

          {/* Left Quote Content */}
          <div className="relative z-10 sm:pl-16 max-w-xl">
            <blockquote className="text-[13px] sm:text-[14px] font-extrabold text-[#0D3823] italic leading-snug">
              “A balanced life is the foundation of a successful journey.”
            </blockquote>
            <p className="text-[10px] sm:text-[11px] font-bold text-[#165B33] uppercase tracking-wider mt-0.5">
              — LIFE OS
            </p>
          </div>

          {/* Right Action Button */}
          <div className="relative z-10 flex-shrink-0 self-start sm:self-center">
            <Link
              href="/journey"
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#124B2C] hover:bg-[#0D3823] text-white rounded-xl text-[12px] font-bold transition-all shadow-sm"
            >
              <Compass size={14} />
              <span>View Life Overview</span>
              <ArrowRight size={13} className="ml-0.5" />
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MODAL: CATEGORY OVERVIEW DETAILS                          */}
        {/* ========================================================= */}
        <Modal
          isOpen={selectedDomain !== null}
          onClose={() => setSelectedDomain(null)}
          title="Holistic Life Architecture Domains"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-[13px]">
            <p className="text-[#475569]">
              LIFE OS organizes your daily habits, long-term visions, and execution schedules into 8 interconnected pillars:
            </p>

            <div className="space-y-2">
              {LIFE_DOMAINS.map((d) => (
                <Link
                  key={d.id}
                  href={d.href}
                  className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#165B33] bg-[#F8FAFC] flex items-center justify-between transition-colors block"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-[16px]">{d.isPrayer ? "🙏" : "🌿"}</span>
                    <div>
                      <div className="font-bold text-[#0F172A]">{d.title}</div>
                      <div className="text-[11px] text-[#64748B]">{d.subtitle}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[12px] font-bold text-[#165B33]">{d.progress}%</span>
                    <ArrowRight size={13} className="text-[#64748B]" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
              <button
                onClick={() => setSelectedDomain(null)}
                className="px-4 py-2 text-[12px] font-semibold text-white bg-[#124B2C] hover:bg-[#0D3823] rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
