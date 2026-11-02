"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import {
  Briefcase,
  Plus,
  Users,
  Wallet,
  Target,
  TrendingUp,
  CheckCircle2,
  Check,
  Trophy,
  ArrowRight,
  Mail,
  Code2,
  Calendar,
  Send,
  Handshake,
  Rocket,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { FreelanceClient, FreelanceProject } from "@/lib/types";

export default function FreelancingPage() {
  const [clients, setClients] = useState<FreelanceClient[]>([]);
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // New Client Form
  const [clientName, setClientName] = useState("");
  const [company, setCompany] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [serviceOffered, setServiceOffered] = useState("Full-Stack Next.js Web Application");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [submittingClient, setSubmittingClient] = useState(false);

  // Fetch freelance data
  const fetchFreelance = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/freelance");
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
        setProjects(data.projects || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFreelance();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName) return;
    setSubmittingClient(true);
    try {
      const res = await fetch("/api/freelance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "client",
          name: clientName,
          company,
          contact_info: contactInfo,
          status: "lead",
          service_offered: serviceOffered,
          estimated_value: parseFloat(estimatedValue) || 15000,
          notes,
        }),
      });

      if (res.ok) {
        setIsAddClientModalOpen(false);
        setClientName("");
        setCompany("");
        setContactInfo("");
        setEstimatedValue("");
        setNotes("");
        fetchFreelance();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingClient(false);
    }
  };

  const totalRevenue = projects
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + (p.agreed_price || 0), 0);
  const activeProjectsCount = projects.filter((p) => p.status !== "paid").length;
  const totalClientsCount = clients.length;

  const handleUpdateClientStatus = async (clientId: string, nextStatus: string) => {
    try {
      await fetch("/api/freelance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "client",
          id: clientId,
          status: nextStatus,
        }),
      });
      fetchFreelance();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProjectStatus = async (projectId: string, nextStatus: string) => {
    try {
      await fetch("/api/freelance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "project",
          id: projectId,
          status: nextStatus,
        }),
      });
      fetchFreelance();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1550px] mx-auto pb-16">
        {/* ========================================================
            1. TOP PANORAMIC CITY HERO BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] bg-[#0E2C1B] min-h-[145px] sm:min-h-[160px] flex items-center">
          <div className="absolute inset-0">
            <Image
              src="/freelancing/city_hero.jpg"
              alt="City Skyline Backdrop"
              fill
              priority
              className="object-cover object-center opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-transparent sm:w-[65%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 w-full py-5 px-5 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left Header Title + Handshake Thumbnail */}
            <div className="flex items-center space-x-4">
              <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-2xl overflow-hidden border border-white/60 shadow-sm flex-shrink-0 relative bg-white">
                <Image
                  src="/freelancing/handshake.jpg"
                  alt="Business Handshake"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-[#EBF5EE] text-[#165B33] border border-[#B7E4C7] flex items-center justify-center flex-shrink-0 shadow-2xs">
                  <Briefcase size={22} className="stroke-[2.2]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#112318]">
                    Freelance Software Services &amp; Client CRM
                  </h1>
                  <p className="text-[12.5px] sm:text-[13px] text-[#284534] font-medium leading-relaxed mt-0.5">
                    Grow your freelance business, get more clients, and track your success.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Action: "+ Add New Client" button */}
            <div className="flex items-center flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(true)}
                className="bg-[#165B33] hover:bg-[#123D26] text-white text-[12.5px] font-bold py-2.5 px-5 rounded-2xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Add New Client</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. TOP METRIC CARDS ROW (4 CARDS)
            ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Clients */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Users size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#6C8176] block">Total Clients</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] font-mono leading-none block my-0.5">
                {totalClientsCount}
              </span>
              <span className="text-[11px] font-bold text-[#165B33]">In Pipeline</span>
            </div>
          </div>

          {/* Card 2: Total Revenue */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Wallet size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#6C8176] block">Total Revenue</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] font-mono leading-none block my-0.5">
                {totalRevenue.toLocaleString()} ETB
              </span>
              <span className="text-[11px] font-bold text-[#165B33]">{totalRevenue > 0 ? "Verified Income" : "Clean Baseline"}</span>
            </div>
          </div>

          {/* Card 3: Active Projects */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Briefcase size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#6C8176] block">Active Projects</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] font-mono leading-none block my-0.5">
                {activeProjectsCount}
              </span>
              <span className="text-[11px] font-bold text-[#1D4ED8]">In Progress</span>
            </div>
          </div>

          {/* Card 4: Monthly Target */}
          <div className="bg-white rounded-2xl p-4.5 sm:p-5 border border-[#E2EAE5] shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Target size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12px] font-bold text-[#6C8176] block">Monthly Target</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#112318] leading-none block my-0.5">
                5 Clients
              </span>
              <span className="text-[11px] font-medium text-[#6C8176]">(60 in 90 days)</span>
            </div>
          </div>
        </div>

        {/* ========================================================
            3. MIDDLE ROW: 90-DAY PROGRESS (LEFT) + RECENT ACTIVITY (RIGHT)
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: YOUR 90-DAY FREELANCING PROGRESS (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2 text-[#112318]">
                <TrendingUp size={17} className="text-[#165B33]" />
                <h3 className="text-[15px] font-extrabold">Your 90-Day Freelancing Progress</h3>
              </div>
              <span className="text-[12px] font-bold text-[#6C8176]">
                {totalClientsCount} / 60 Outreach Target
              </span>
            </div>

            {/* Main Content: Ring Gauge + Checklist + Feature Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center pt-1">
              {/* Left Circular Ring Gauge (col-span-4) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#E8EEEA" strokeWidth="3" fill="none" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      stroke="#165B33"
                      strokeWidth="3.5"
                      strokeDasharray="100, 100"
                      strokeDashoffset={100 - (totalClientsCount > 0 ? Math.min(100, Math.round((totalClientsCount / 5) * 100)) : 0)}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-[20px] font-extrabold text-[#112318] font-mono leading-none">
                      {totalClientsCount > 0 ? `${Math.min(100, Math.round((totalClientsCount / 5) * 100))}%` : "0%"}
                    </span>
                    <span className="text-[9.5px] font-bold text-[#6C8176] mt-1 leading-tight">
                      {totalClientsCount > 0 ? `Target Progress (${totalClientsCount} / 5)` : "Day 0 Baseline\n(0 / 5 Clients)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle 4 Checklist Items (col-span-4) */}
              <div className="md:col-span-4 space-y-2 text-[12px] font-bold text-[#14211A]">
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${totalClientsCount > 0 ? "bg-[#165B33] text-white border-[#165B33]" : "border-[#CBD5E1] text-transparent"}`}>✓</span>
                  <span>Professional Portfolio</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${totalClientsCount > 0 ? "bg-[#165B33] text-white border-[#165B33]" : "border-[#CBD5E1] text-transparent"}`}>✓</span>
                  <span>3 Service Packages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${totalClientsCount >= 5 ? "bg-[#165B33] text-white border-[#165B33]" : "border-[#CBD5E1] text-transparent"}`}>✓</span>
                  <span>60 Client Outreach Attempts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${totalRevenue > 0 ? "bg-[#165B33] text-white border-[#165B33]" : "border-[#CBD5E1] text-transparent"}`}>✓</span>
                  <span>1 Paying Client</span>
                </div>
              </div>

              {/* Right Feature Card: Outreach Status (col-span-4) */}
              <div className="md:col-span-4 p-4 rounded-2xl bg-[#F0FDF4] border border-[#B7E4C7] flex flex-col justify-between space-y-3 relative overflow-hidden">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Trophy size={16} className="stroke-[2.2]" />
                  </div>
                  <h4 className="text-[14px] font-extrabold text-[#112318]">{totalClientsCount > 0 ? "Active Pipeline" : "Clean Slate Ready"}</h4>
                </div>

                <p className="text-[11.5px] text-[#486053] font-medium leading-relaxed">
                  {totalClientsCount > 0 ? "Outreach pipeline is active. Keep pitching Ethiopian SMEs to secure new contracts." : "Pipeline cleanly reset. Ready to launch targeted outreach campaigns starting Nov 2."}
                </p>

                <div className="flex items-end justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddClientModalOpen(true)}
                    className="bg-[#165B33] hover:bg-[#123D26] text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-2xs flex items-center gap-1 transition-all"
                  >
                    <span>+ Add Prospect</span>
                    <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: RECENT ACTIVITY (col-span-4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2 text-[#112318]">
                <Calendar size={16} className="text-[#165B33]" />
                <h3 className="text-[15px] font-extrabold">Recent Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(true)}
                className="text-[11.5px] font-bold text-[#165B33] hover:underline flex items-center gap-1"
              >
                <span>Add Client</span>
                <ArrowRight size={12} />
              </button>
            </div>

            {/* Connected Vertical Timeline or Clean Empty State */}
            {clients.length === 0 && projects.length === 0 ? (
              <div className="py-8 text-center text-[#6C8176] text-[12px] flex flex-col items-center justify-center">
                <span className="font-semibold text-[#112318] block mb-1">Clean Outreach Pipeline</span>
                <p className="text-[11px] max-w-[200px] leading-relaxed">
                  No historical prospects or deliverables. Add your first prospective client to record activity.
                </p>
              </div>
            ) : (
              <div className="relative pl-7 space-y-4 pt-1">
                <div className="absolute left-[13px] top-3 bottom-3 w-[1.5px] bg-[#E2EAE5]" />
                {clients.slice(0, 3).map((c) => (
                  <div key={c.id} className="relative flex items-start space-x-3 text-[12px]">
                    <div className="absolute -left-[27px] w-7 h-7 rounded-full flex items-center justify-center z-10 border border-white shadow-2xs bg-[#EBF5EE] text-[#165B33]">
                      <Briefcase size={13} strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0 flex-1 pl-1">
                      <span className="text-[10px] text-[#6C8176] font-mono block">In Pipeline</span>
                      <strong className="text-[#14211A] font-bold text-[12.5px] block truncate">{c.name}</strong>
                      <span className="text-[#6C8176] text-[11px] block truncate">{c.company}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            4. ROW 3: YOUR FREELANCE JOURNEY & KEY INSIGHTS
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* CARD 1: YOUR FREELANCE JOURNEY (col-span-7) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center space-x-2 text-[#112318] pb-2 border-b border-[#F0F4F1]">
              <Shield size={16} className="text-[#165B33]" />
              <h3 className="text-[15px] font-extrabold">Your Freelance Journey</h3>
            </div>

            {/* 5-Step Connected Flowchart */}
            <div className="flex items-center justify-between pt-2 px-2 overflow-x-auto">
              {/* Step 1: Portfolio */}
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#165B33] text-white flex items-center justify-center shadow-xs">
                  <Check size={16} strokeWidth={3} />
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-2 block">Portfolio</span>
                <span className="text-[9.5px] font-medium text-[#6C8176]">Completed</span>
              </div>

              {/* Connector Line 1 */}
              <div className="flex-1 h-[2px] bg-[#165B33] mx-2" />

              {/* Step 2: Service Packages */}
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-[#165B33] text-white flex items-center justify-center shadow-xs">
                  <Check size={16} strokeWidth={3} />
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-2 block leading-tight">Service</span>
                <span className="text-[9.5px] font-medium text-[#6C8176]">Packages</span>
              </div>

              {/* Connector Line 2 */}
              <div className="flex-1 h-[2px] bg-[#165B33] mx-2" />

              {/* Step 3: Outreach Campaign */}
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div className={`w-9 h-9 rounded-full ${clients.length > 0 ? "bg-[#165B33] text-white" : "border-2 border-[#165B33] bg-[#EBF5EE] text-[#165B33]"} flex items-center justify-center shadow-xs font-bold text-xs`}>
                  {clients.length > 0 ? <Check size={16} strokeWidth={3} /> : "3"}
                </div>
                <span className="text-[11.5px] font-bold text-[#14211A] mt-2 block leading-tight">Outreach</span>
                <span className="text-[9.5px] font-medium text-[#6C8176]">Campaign</span>
              </div>

              {/* Connector Line 3 */}
              <div className={`flex-1 h-[2px] ${clients.length > 0 ? "bg-[#165B33]" : "border-t-2 border-dashed border-[#CBD7CE]"} mx-2`} />

              {/* Step 4 (Active / Highlighted): Get First Client */}
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div className="w-11 h-11 rounded-full border-2 border-[#165B33] bg-[#EBF5EE] text-[#D97706] flex items-center justify-center shadow-xs ring-4 ring-[#B7E4C7]/50">
                  <Trophy size={18} className="stroke-[2.2]" />
                </div>
                <span className="text-[11.5px] font-extrabold text-[#165B33] mt-1.5 block leading-tight">Get First</span>
                <span className="text-[9.5px] font-extrabold text-[#165B33]">Client</span>
              </div>

              {/* Connector Line 4 (Dashed) */}
              <div className="flex-1 h-[2px] border-t-2 border-dashed border-[#CBD7CE] mx-2" />

              {/* Step 5 (Upcoming): Grow Business */}
              <div className="flex flex-col items-center text-center flex-shrink-0">
                <div className="w-9 h-9 rounded-full border-2 border-[#CBD7CE] bg-[#F7FAF8] text-[#8C9E94] flex items-center justify-center">
                  <Rocket size={15} />
                </div>
                <span className="text-[11.5px] font-bold text-[#8C9E94] mt-2 block leading-tight">Grow</span>
                <span className="text-[9.5px] font-medium text-[#8C9E94]">Business</span>
              </div>
            </div>
          </div>

          {/* CARD 2: KEY INSIGHTS (col-span-5) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E2EAE5] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0F4F1]">
              <div className="flex items-center space-x-2 text-[#112318]">
                <TrendingUp size={16} className="text-[#165B33]" />
                <h3 className="text-[15px] font-extrabold">Key Insights</h3>
              </div>
              <div className="text-[11px] font-bold text-[#165B33] bg-[#EBF5EE] border border-[#B7E4C7] px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer">
                <span>Last 90 Days</span>
                <ChevronDown size={12} />
              </div>
            </div>

            {/* 4 Metric Tiles Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
              {/* Tile 1 */}
              <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE5] flex flex-col items-center justify-center space-y-1">
                <Send size={16} className="text-[#0284C7]" />
                <span className="text-[16px] font-extrabold text-[#112318] font-mono leading-none">
                  {clients.length}
                </span>
                <span className="text-[9.5px] font-bold text-[#6C8176] leading-tight">Outreach<br />Attempts</span>
              </div>

              {/* Tile 2 */}
              <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE5] flex flex-col items-center justify-center space-y-1">
                <Users size={16} className="text-[#165B33]" />
                <span className="text-[16px] font-extrabold text-[#112318] font-mono leading-none">
                  {clients.filter((c) => c.status === "lead" || c.status === "contacted").length}
                </span>
                <span className="text-[9.5px] font-bold text-[#6C8176] leading-tight">Qualified<br />Leads</span>
              </div>

              {/* Tile 3 */}
              <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE5] flex flex-col items-center justify-center space-y-1">
                <Handshake size={16} className="text-[#D97706]" />
                <span className="text-[16px] font-extrabold text-[#112318] font-mono leading-none">
                  {clients.filter((c) => c.status === "active" || c.status === "completed").length}
                </span>
                <span className="text-[9.5px] font-bold text-[#6C8176] leading-tight">Clients<br />Acquired</span>
              </div>

              {/* Tile 4 */}
              <div className="p-3 rounded-2xl bg-[#F7FAF8] border border-[#E2EAE5] flex flex-col items-center justify-center space-y-1">
                <Wallet size={16} className="text-[#165B33]" />
                <span className="text-[14px] font-extrabold text-[#112318] font-mono leading-none">
                  {totalRevenue.toLocaleString()} ETB
                </span>
                <span className="text-[9.5px] font-bold text-[#6C8176] leading-tight"><br />Revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. BOTTOM PANORAMIC MOUNTAIN QUOTE BANNER
            ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs border border-[#D5E2D9] min-h-[90px] sm:min-h-[105px] flex items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/journey/hero_mountains.jpg"
              alt="Mountain Backdrop"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />
          </div>

          <div className="relative z-10 text-center px-4 py-3">
            <p className="text-[13px] sm:text-[14.5px] font-serif italic text-white/95 tracking-wide drop-shadow-sm">
              &ldquo;Build a successful freelance business through skills, consistency, and persistence.&rdquo;
            </p>
          </div>
        </div>

        {/* ========================================================
            MODAL 1: ADD NEW CLIENT
            ======================================================== */}
        {isAddClientModalOpen && (
          <Modal
            isOpen={isAddClientModalOpen}
            onClose={() => setIsAddClientModalOpen(false)}
            title="Add New Freelance Client / Lead"
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Client / Contact Name
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dawit Haile"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Company / Business
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Haile Trading PLC"
                    className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                    Estimated Value (ETB)
                  </label>
                  <input
                    type="number"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    placeholder="e.g. 25000"
                    className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Service Package Offered
                </label>
                <select
                  value={serviceOffered}
                  onChange={(e) => setServiceOffered(e.target.value)}
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                >
                  <option value="Full-Stack Next.js Web Application">Full-Stack Next.js Web Application</option>
                  <option value="Corporate Brand Website & CMS">Corporate Brand Website &amp; CMS</option>
                  <option value="E-Commerce Storefront Integration">E-Commerce Storefront Integration</option>
                  <option value="Custom Database & REST API">Custom Database &amp; REST API</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Contact Info / Phone / Telegram
                </label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="e.g. +251 911 234567 or @dawit_trade"
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#14211A] mb-1">
                  Notes / Proposal Scope
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Next steps, requirements, timeline..."
                  className="w-full px-3.5 py-2 text-[13px] bg-white border border-[#CBD7CE] rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2 text-[12px] font-bold text-[#5A6E63]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClient}
                  className="px-5 py-2.5 bg-[#165B33] text-white rounded-xl text-[12.5px] font-bold shadow-xs hover:bg-[#123D26] transition-colors"
                >
                  {submittingClient ? "Adding..." : "Add Client"}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* ========================================================
            MODAL 2: 90-DAY OUTREACH DETAILS
            ======================================================== */}
        {isDetailsModalOpen && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            title="90-Day Outreach Campaign Details"
            maxWidth="max-w-xl"
          >
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#B7E4C7] space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-[#165B33]">
                  Outreach Goal Achieved: 60 / 60
                </span>
                <h4 className="text-[14px] font-bold text-[#112318]">
                  Target Acquisition Strategy: 1–3 Retained Clients
                </h4>
                <p className="text-[12px] text-[#486053]">
                  You have contacted 60 local and remote prospective clients across Addis Ababa and international platforms. Continue active follow-ups to convert warm leads.
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-[12.5px] font-bold text-[#14211A]">Pipeline Conversion Breakdown</h5>
                <div className="p-3 rounded-xl border border-[#E2EAE5] flex items-center justify-between text-[12px]">
                  <span>Total Outreach Messages Sent</span>
                  <strong className="font-mono text-[#165B33]">60</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E2EAE5] flex items-center justify-between text-[12px]">
                  <span>Responses &amp; Qualified Inquiries</span>
                  <strong className="font-mono text-[#0284C7]">1 Qualified Lead</strong>
                </div>
                <div className="p-3 rounded-xl border border-[#E2EAE5] flex items-center justify-between text-[12px]">
                  <span>Proposals In Review</span>
                  <strong className="font-mono text-[#D97706]">1 Pending</strong>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2 bg-[#165B33] text-white rounded-xl text-[12px] font-bold"
                >
                  Done
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* ========================================================
            MODAL 3: RECENT ACTIVITY FULL LOG
            ======================================================== */}
        {isHistoryModalOpen && (
          <Modal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            title="Freelance Pipeline & Projects CRM"
            maxWidth="max-w-2xl"
          >
            <div className="space-y-4">
              {/* Clients Section */}
              <div>
                <h4 className="text-[13px] font-bold text-[#112318] mb-2">Clients &amp; Prospects</h4>
                <div className="space-y-2">
                  {clients.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-[#E2EAE5] bg-[#F7FAF8] flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-[#14211A] text-[13px]">{c.name}</strong>
                          <span className="text-[11px] text-[#6C8176]">({c.company})</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33] uppercase">
                            {c.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5A6E63] mt-0.5">
                          {c.service_offered} &bull; Est. {c.estimated_value?.toLocaleString()} ETB
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {c.status !== "active" && (
                          <button
                            onClick={() => handleUpdateClientStatus(c.id, "active")}
                            className="px-2.5 py-1 bg-[#165B33] text-white text-[10.5px] font-bold rounded-lg hover:bg-[#123D26]"
                          >
                            Mark Active
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects Section */}
              <div>
                <h4 className="text-[13px] font-bold text-[#112318] mb-2">Projects &amp; Deliverables</h4>
                <div className="space-y-2">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-[#E2EAE5] bg-[#F7FAF8] flex items-center justify-between text-[12px]"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <strong className="text-[#14211A] text-[13px]">{p.title}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] uppercase">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#5A6E63] mt-0.5">
                          Agreed: {p.agreed_price?.toLocaleString()} ETB &bull; Due: {p.deadline}
                        </div>
                        <div className="text-[10.5px] text-[#6C8176] mt-0.5 italic">
                          {p.deliverables}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {p.status !== "paid" ? (
                          <button
                            onClick={() => handleUpdateProjectStatus(p.id, "paid")}
                            className="px-2.5 py-1 bg-[#16A34A] text-white text-[10.5px] font-bold rounded-lg hover:bg-[#15803D]"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10.5px] font-bold text-[#16A34A]">✓ Paid &amp; Invoiced</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-[#EAEFEA]">
                <button
                  type="button"
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="px-4 py-2 bg-[#165B33] text-white rounded-xl text-[12px] font-bold"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
