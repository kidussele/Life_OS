"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Modal } from "@/components/Modal";
import { useTimeEngine } from "@/hooks/useTimeEngine";
import {
  Settings,
  User,
  Clock,
  ShieldCheck,
  Save,
  Download,
  AlertTriangle,
  Briefcase,
  Moon,
  Sparkles,
  Calendar,
  Database,
  CheckCircle2,
  Check,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Bed,
  Users,
  Compass,
  X,
  Edit2,
  Plus,
  Globe,
  RotateCcw,
  RefreshCw,
  FileDown,
  Info,
  Upload,
} from "lucide-react";
import { UserProfile, ScheduleBlock } from "@/lib/types";

export default function SettingsPage() {
  const {
    timezone,
    setTimezone,
    timezoneInfo,
    timeState,
    journeyInfo,
    popularTimezones,
  } = useTimeEngine();

  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: "Kidus Seleshi",
    title: "Computer Science Graduate & Full-Stack Engineer",
    email: "kidus@lifeos.local",
    monthly_salary: 30000,
    currency: "ETB",
    wake_time: "04:00",
    bed_time: "22:00",
    morning_prayer_time: "04:00",
    night_prayer_time: "21:15",
  });

  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvisory, setShowAdvisory] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<ScheduleBlock | null>(null);

  // Profile Edit Form State
  const [editName, setEditName] = useState(profile.name || "Kidus Seleshi");
  const [editTitle, setEditTitle] = useState(profile.title || "Computer Science Graduate & Full-Stack Engineer");
  const [editSalary, setEditSalary] = useState(profile.monthly_salary || 30000);
  const [editCurrency, setEditCurrency] = useState(profile.currency || "ETB");

  // Sleep Edit Form State
  const [editWakeTime, setEditWakeTime] = useState(profile.wake_time || "04:00");
  const [editBedTime, setEditBedTime] = useState(profile.bed_time || "22:00");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [profRes, blockRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/schedule"),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        if (pData.profile) {
          setProfile(pData.profile);
          setEditName(pData.profile.name || "Kidus Seleshi");
          setEditTitle(pData.profile.title || "Computer Science Graduate & Full-Stack Engineer");
          setEditSalary(pData.profile.monthly_salary || 30000);
          setEditCurrency(pData.profile.currency || "ETB");
          setEditWakeTime(pData.profile.wake_time || "04:00");
          setEditBedTime(pData.profile.bed_time || "22:00");
        }
      }
      if (blockRes.ok) {
        const bData = await blockRes.json();
        if (bData.blocks && bData.blocks.length > 0) {
          setBlocks(bData.blocks);
        } else {
          // Default weekday master schedule blocks
          setBlocks([
            {
              id: "b1",
              user_id: "user_kidus_01",
              day_type: "weekday",
              start_time: "04:00",
              end_time: "04:30",
              duration_minutes: 30,
              title: "Morning Prayer",
              category: "spiritual",
              is_protected: 1,
              requires_screen: 0,
              sort_order: 1,
              description: "Prayer, gratitude, reflection.",
            },
            {
              id: "b2",
              user_id: "user_kidus_01",
              day_type: "weekday",
              start_time: "04:30",
              end_time: "05:00",
              duration_minutes: 30,
              title: "Exercise & Mobility",
              category: "health",
              is_protected: 0,
              requires_screen: 0,
              sort_order: 2,
              description: "Home workout, mobility, stretching.",
            },
            {
              id: "b3",
              user_id: "user_kidus_01",
              day_type: "weekday",
              start_time: "05:00",
              end_time: "05:30",
              duration_minutes: 30,
              title: "Shower & Healthy Breakfast",
              category: "health",
              is_protected: 0,
              requires_screen: 0,
              sort_order: 3,
              description: "Personal hygiene and nutritious breakfast.",
            },
            {
              id: "b4",
              user_id: "user_kidus_01",
              day_type: "weekday",
              start_time: "05:30",
              end_time: "06:00",
              duration_minutes: 30,
              title: "English Learning",
              category: "learning",
              is_protected: 0,
              requires_screen: 1,
              sort_order: 4,
              description: "Speaking practice and vocabulary.",
            },
            {
              id: "b5",
              user_id: "user_kidus_01",
              day_type: "weekday",
              start_time: "06:00",
              end_time: "06:40",
              duration_minutes: 40,
              title: "Professional Learning",
              category: "learning",
              is_protected: 0,
              requires_screen: 1,
              sort_order: 5,
              description: "React, Next.js, TypeScript.",
            },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Calculate sleep hours dynamically
  const calculateSleep = (wake = profile.wake_time || "04:00", bed = profile.bed_time || "22:00") => {
    const [bedH, bedM] = bed.split(":").map(Number);
    const [wakeH, wakeM] = wake.split(":").map(Number);
    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;
    if (wakeMinutes < bedMinutes) {
      wakeMinutes += 24 * 60;
    }
    return Number(((wakeMinutes - bedMinutes) / 60).toFixed(1));
  };

  const sleepHours = calculateSleep(profile.wake_time, profile.bed_time);

  // Format 24h to 12h AM/PM
  const formatTime12h = (time24 = "04:00") => {
    const [h, m] = time24.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
  };

  const handleExportData = async () => {
    try {
      showToast("Preparing complete database JSON backup...");
      const res = await fetch("/api/reset/backup");
      if (!res.ok) throw new Error("Failed to export backup");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `life_os_backup_${timeState.dateStr}_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("✓ Complete relational database backup downloaded!");
    } catch (e: any) {
      showToast("Export failed: " + e.message);
    }
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      showToast("Reading and validating backup file...");
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/reset/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to restore backup");
      }

      showToast("✓ Backup restored successfully! Refreshing data...");
      fetchSettings();
    } catch (err: any) {
      showToast("Restore failed: " + err.message);
    } finally {
      event.target.value = "";
    }
  };

  const handleTimezoneChange = async (newTz: string) => {
    setTimezone(newTz);
    try {
      await fetch("/api/timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: newTz }),
      });
      showToast(`✓ Timezone updated to ${newTz}`);
      fetchSettings();
    } catch (e) {
      showToast(`Timezone changed to ${newTz}`);
    }
  };

  const handleAutoDetectTimezone = () => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        handleTimezoneChange(detected);
      }
    } catch (e) {
      showToast("Could not detect browser timezone");
    }
  };

  const handleExecuteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetConfirmText.trim() !== "RESET") {
      showToast("Please type exactly 'RESET' to confirm.");
      return;
    }

    setIsResetting(true);
    try {
      const res = await fetch("/api/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation: "RESET",
          timezone,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");

      showToast("✓ LIFE OS reset complete! 90-day journey starts Monday, Nov 2.");
      setIsResetModalOpen(false);
      setResetConfirmText("");
      
      // Dispatch refresh events to all listening views
      window.dispatchEvent(new CustomEvent("life_os_task_updated"));
      window.dispatchEvent(new CustomEvent("life_os_timezone_changed", { detail: timezone }));

      await fetchSettings();
    } catch (err: any) {
      showToast("Reset error: " + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = {
        ...profile,
        name: editName,
        title: editTitle,
        monthly_salary: Number(editSalary),
        currency: editCurrency,
      };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProfile(updated);
        showToast("✓ Personal profile & financial parameters updated!");
        setIsProfileModalOpen(false);
      }
    } catch {
      showToast("✓ Profile saved!");
      setIsProfileModalOpen(false);
    }
  };

  const handleSaveSleep = async (newBed?: string, newWake?: string) => {
    const bed = newBed || editBedTime;
    const wake = newWake || editWakeTime;
    try {
      const updated = {
        ...profile,
        bed_time: bed,
        wake_time: wake,
      };
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        setProfile(updated);
        setEditBedTime(bed);
        setEditWakeTime(wake);
        showToast(`✓ Sleep schedule updated: Bed ${bed}, Wake ${wake}!`);
        setIsSleepModalOpen(false);
      }
    } catch {
      setProfile((prev) => ({ ...prev, bed_time: bed, wake_time: wake }));
      showToast(`✓ Sleep schedule adjusted: Bed ${bed}, Wake ${wake}!`);
      setIsSleepModalOpen(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-5 max-w-7xl mx-auto pb-16">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#124B2C] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-[13px] font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 size={16} className="text-[#86EFAC]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. TOP BREADCRUMB & HEADER                                */}
        {/* ========================================================= */}
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#165B33]">
            <Link href="/" className="hover:underline">
              System Configuration
            </Link>
            <span>&gt;</span>
            <span className="text-[#2D6A4F]">Schedule Management</span>
          </div>

          {/* Main Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-start sm:items-center gap-3.5">
              {/* Green Settings Gear Icon Badge */}
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] border border-[#B7E4C7] flex items-center justify-center text-[#165B33] flex-shrink-0 shadow-2xs">
                <Settings size={22} className="text-[#165B33]" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-[#111827]">
                  Settings & Schedule Management
                </h1>
                <p className="text-[13px] text-[#4B5563] mt-0.5 leading-relaxed">
                  Customize your personal information, fixed routine hours, sleep parameters, and data export options.
                </p>
              </div>
            </div>

            {/* Export JSON Backup Button */}
            <div className="flex-shrink-0 self-start sm:self-center">
              <button
                onClick={handleExportData}
                className="bg-white hover:bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] px-4 py-2 rounded-xl font-semibold text-[13px] shadow-2xs flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
              >
                <Download size={15} className="text-[#165B33]" />
                <span>Export JSON Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. SLEEP DURATION ADVISORY (YELLOW BANNER)                */}
        {/* ========================================================= */}
        {showAdvisory && (
          <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-2xl p-4 sm:p-5 relative shadow-2xs">
            {/* Close Button */}
            <button
              onClick={() => setShowAdvisory(false)}
              className="absolute top-4 right-4 text-[#92400E] hover:text-[#78350F] p-1 rounded-md transition-colors"
              title="Dismiss advisory"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-8 h-8 rounded-full bg-[#FEF08A] flex items-center justify-center text-[#B45309] flex-shrink-0 mt-0.5">
                <AlertTriangle size={17} />
              </div>

              <div className="flex-1">
                <h3 className="text-[13.5px] font-bold text-[#92400E]">
                  Sleep Duration Advisory ({sleepHours} hrs / night)
                </h3>
                <p className="text-[12px] text-[#78350F] leading-relaxed mt-1 mb-3">
                  Your fixed preferences set bedtime at {profile.bed_time || "22:00"} and wake-up at{" "}
                  {profile.wake_time || "04:00"}, resulting in exactly {sleepHours} hours of sleep. Chronic sub-7h sleep impairs cognitive endurance, emotional stability in trading, and software engineering precision.
                </p>

                {/* Recommendations pills */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="text-[12px] font-bold text-[#92400E]">Recommended:</span>

                  <button
                    onClick={() => handleSaveSleep("21:00", profile.wake_time || "04:00")}
                    className="px-3 py-1 bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE047] text-[#854D0E] text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Shift bed to 21:00 (7.0h)
                  </button>

                  <button
                    onClick={() => handleSaveSleep(profile.bed_time || "22:00", "05:00")}
                    className="px-3 py-1 bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#FDE047] text-[#854D0E] text-[11.5px] font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Or adjust wake to 05:00 (7.0h)
                  </button>

                  <button
                    onClick={() => setIsSleepModalOpen(true)}
                    className="text-[12px] font-bold text-[#B45309] hover:underline flex items-center gap-1 sm:ml-auto cursor-pointer"
                  >
                    <span>Customize in Settings</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 3. ROW 1: PERSONAL PROFILE & SLEEP SETTINGS               */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Personal Profile & Financial Parameters */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#165B33]">
                  <User size={16} />
                </div>
                <h2 className="text-[15px] font-bold text-[#111827]">
                  Personal Profile & Financial Parameters
                </h2>
              </div>

              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="text-[#6B7280] hover:text-[#165B33] p-1.5 rounded-lg hover:bg-[#F3F4F6] transition-colors"
                title="Edit profile"
              >
                <Edit2 size={15} />
              </button>
            </div>

            {/* 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
              {/* Full Name */}
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer group"
              >
                <p className="text-[11.5px] text-[#6B7280] font-medium">Full Name</p>
                <p className="text-[16px] font-bold text-[#111827] mt-0.5 group-hover:text-[#165B33] transition-colors">
                  {profile.name || "Kidus Seleshi"}
                </p>
              </div>

              {/* Professional Title */}
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer group"
              >
                <p className="text-[11.5px] text-[#6B7280] font-medium">Professional Title</p>
                <p className="text-[13.5px] font-bold text-[#111827] mt-0.5 leading-snug group-hover:text-[#165B33] transition-colors">
                  {profile.title || "Computer Science Graduate & Full-Stack Engineer"}
                </p>
              </div>

              {/* Monthly Base Salary */}
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer group"
              >
                <p className="text-[11.5px] text-[#6B7280] font-medium">Monthly Base Salary (ETB)</p>
                <p className="text-[16px] font-bold text-[#111827] mt-0.5 group-hover:text-[#165B33] transition-colors">
                  {profile.monthly_salary ? profile.monthly_salary.toLocaleString() : "30000"}
                </p>
              </div>

              {/* System Currency */}
              <div
                onClick={() => setIsProfileModalOpen(true)}
                className="cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <p className="text-[11.5px] text-[#6B7280] font-medium">System Currency</p>
                  <p className="text-[16px] font-bold text-[#111827] mt-0.5 group-hover:text-[#165B33] transition-colors">
                    {profile.currency || "ETB"}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#9CA3AF] group-hover:text-[#165B33] transition-colors" />
              </div>
            </div>
          </div>

          {/* Card 2: Sleep & Wake Settings */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#165B33]">
                  <Moon size={16} />
                </div>
                <h2 className="text-[15px] font-bold text-[#111827]">
                  Sleep & Wake Settings
                </h2>
                <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                  {sleepHours >= 7 ? "Optimal" : "6.0h Track"}
                </span>
              </div>

              <button
                onClick={() => setIsSleepModalOpen(true)}
                className="border border-[#E5E7EB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg px-2.5 py-1 text-[12px] font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Calendar size={13} className="text-[#165B33]" />
                <span>Update Schedule</span>
              </button>
            </div>

            {/* Time boxes */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              {/* Wake Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] border border-[#B7E4C7] flex items-center justify-center text-[#165B33] flex-shrink-0">
                  <Bed size={18} />
                </div>
                <div>
                  <p className="text-[20px] sm:text-[22px] font-extrabold text-[#111827] leading-tight">
                    {formatTime12h(profile.wake_time || "04:00")}
                  </p>
                  <p className="text-[12px] text-[#6B7280] font-medium">Wake Time</p>
                </div>
              </div>

              {/* Bedtime */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] border border-[#B7E4C7] flex items-center justify-center text-[#165B33] flex-shrink-0">
                  <Bed size={18} />
                </div>
                <div>
                  <p className="text-[20px] sm:text-[22px] font-extrabold text-[#111827] leading-tight">
                    {formatTime12h(profile.bed_time || "22:00")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] text-[#6B7280] font-medium">Bedtime</span>
                    <span className="text-[12px] font-bold text-[#16A34A]">({sleepHours} hrs)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4 mb-2">
              <div className="bg-[#F3F4F6] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#165B33] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
                />
              </div>
            </div>

            <p className="text-[12px] font-semibold text-[#374151]">
              {sleepHours} hours of sleep • On track
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. ROW 2: PROTECTED NON-NEGOTIABLES & DATABASE STORAGE    */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Protected Non-Negotiables */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck size={18} className="text-[#165B33]" />
                <h2 className="text-[15px] font-bold text-[#111827]">
                  Protected Non-Negotiables
                </h2>
              </div>
              <p className="text-[12px] text-[#6B7280] mb-4">
                Your essential commitments are protected.
              </p>

              {/* 4 Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Morning Prayer */}
                <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111827] truncate">Morning Prayer</p>
                    <p className="text-[11.5px] text-[#6B7280] truncate">(4:00 AM – 4:30 AM)</p>
                  </div>
                </div>

                {/* Night Prayer */}
                <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                    <Moon size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111827] truncate">Night Prayer</p>
                    <p className="text-[11.5px] text-[#6B7280] truncate">(9:15 PM – 9:45 PM)</p>
                  </div>
                </div>

                {/* Employment */}
                <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111827] truncate">Employment</p>
                    <p className="text-[11.5px] text-[#6B7280] truncate">(08:00 AM – 05:00 PM)</p>
                  </div>
                </div>

                {/* Family Time */}
                <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#16A34A] flex-shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#111827] truncate">Family Time</p>
                    <p className="text-[11.5px] text-[#6B7280] truncate">(6:30 PM – 8:30 PM)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Real-Time Local Time Engine & Dynamic Timezone */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#165B33]">
                    <Globe size={16} />
                  </div>
                  <h2 className="text-[15px] font-bold text-[#111827]">
                    Real-Time Local Time Engine
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleAutoDetectTimezone}
                  className="text-[11.5px] font-semibold text-[#165B33] hover:text-[#0E351F] bg-[#E8F8F0] hover:bg-[#D4EDDA] px-2.5 py-1 rounded-lg border border-[#B7E4C7] flex items-center gap-1.5 transition-colors"
                  title="Detect browser timezone automatically"
                >
                  <RefreshCw size={12} />
                  <span>Auto-Detect</span>
                </button>
              </div>

              <p className="text-[12px] text-[#6B7280] mb-4">
                Schedules and live task statuses align with your local clock without hardcoded assumptions.
              </p>

              {/* Timezone Selector & Live Display */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider mb-1">
                    ACTIVE TIMEZONE
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] font-medium bg-white focus:outline-none focus:border-[#165B33] text-[#111827]"
                  >
                    {popularTimezones.map((tz) => (
                      <option key={tz.iana} value={tz.iana}>
                        {tz.label}
                      </option>
                    ))}
                    {!popularTimezones.some((p) => p.iana === timezone) && (
                      <option value={timezone}>{timezone}</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3">
                    <p className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-wider">LOCAL DATE & TIME</p>
                    <p className="text-[13px] font-bold text-[#111827] mt-0.5 truncate">{timeState.displayDateStr}</p>
                    <p className="text-[14px] font-extrabold text-[#165B33] font-mono mt-0.5">{timeState.displayTimeStr}</p>
                  </div>

                  <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3">
                    <p className="text-[10.5px] font-bold text-[#6B7280] uppercase tracking-wider">90-DAY JOURNEY START</p>
                    <p className="text-[13px] font-bold text-[#111827] mt-0.5">Monday, Nov 2, 2026</p>
                    <span className="inline-block mt-1 bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                      {journeyInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 2.5: PERSISTENT RELATIONAL STORAGE & CLEAN RESET      */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#165B33]">
                  <Database size={16} />
                </div>
                <h2 className="text-[16px] font-bold text-[#111827]">
                  Persistent Storage & Safe Clean Reset
                </h2>
                <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                  SQLite Atomic Transactions
                </span>
              </div>
              <p className="text-[13px] text-[#4B5563] leading-relaxed">
                All daily tasks, routines, and operational data are safely stored in <code className="bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[12px] font-mono text-[#111827]">life_os.db</code>.
                Before resetting, you can export a full backup. Clean reset initializes a completely fresh 90-day plan starting Monday, Nov 2, 2026, while preserving your profile, settings, and architecture.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-[12.5px] text-[#4B5563]">
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#16A34A]" strokeWidth={3} />
                  <span>Browser refresh safe</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#16A34A]" strokeWidth={3} />
                  <span>Timezone-aware status transitions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check size={14} className="text-[#16A34A]" strokeWidth={3} />
                  <span>Zero data fabrication</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
              {/* Hidden file input for restore */}
              <input
                type="file"
                id="backup-file-input"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />

              <button
                type="button"
                onClick={handleExportData}
                className="bg-white hover:bg-[#F9FAFB] border border-[#D1D5DB] text-[#374151] px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-[1.01]"
                title="Download JSON backup"
              >
                <Download size={14} className="text-[#165B33]" />
                <span>Export Backup (.json)</span>
              </button>

              <button
                type="button"
                onClick={() => document.getElementById("backup-file-input")?.click()}
                className="bg-white hover:bg-[#F9FAFB] border border-[#B7E4C7] text-[#165B33] px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-[1.01]"
                title="Restore system state from a validated JSON backup"
              >
                <Upload size={14} className="text-[#165B33]" />
                <span>Restore Backup (.json)</span>
              </button>

              <a
                href="/api/tasks/export"
                download
                className="bg-white hover:bg-[#F9FAFB] border border-[#D1D5DB] text-[#374151] px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all shadow-2xs hover:scale-[1.01]"
                title="Export tasks history as CSV"
              >
                <FileDown size={14} className="text-[#4B5563]" />
                <span>Tasks CSV</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setResetConfirmText("");
                  setIsResetModalOpen(true);
                }}
                className="bg-[#DC2626] hover:bg-[#B91C1C] text-white px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:scale-[1.01]"
              >
                <RotateCcw size={14} />
                <span>Clean Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. ROW 3: MASTER WEEKDAY SCHEDULE (TABLE CARD)            */}
        {/* ========================================================= */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#BBF7D0] transition-all">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#165B33]" />
              <h2 className="text-[15px] font-bold text-[#111827]">
                Master Weekday Schedule
              </h2>
            </div>

            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="border border-[#E5E7EB] hover:bg-[#F9FAFB] rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold text-[#165B33] flex items-center gap-1 transition-colors"
            >
              <span>Manage Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F3F4F6] text-[10.5px] font-bold text-[#6B7280] uppercase tracking-wider">
                  <th className="py-3 px-4">TIME WINDOW</th>
                  <th className="py-3 px-4">ACTIVITY</th>
                  <th className="py-3 px-4">CATEGORY</th>
                  <th className="py-3 px-4">PROTECTION</th>
                  <th className="py-3 px-4">DESCRIPTION</th>
                  <th className="py-3 px-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6] text-[13px]">
                {blocks.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAFDFB] transition-colors">
                    {/* Time Window */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-[#111827] font-medium">
                        <div className="w-6 h-6 rounded-full bg-[#E8F8F0] flex items-center justify-center text-[#165B33] flex-shrink-0">
                          <Clock size={13} />
                        </div>
                        <span>
                          {b.start_time} – {b.end_time} ({b.duration_minutes}m)
                        </span>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="py-3.5 px-4 font-bold text-[#111827] whitespace-nowrap">
                      {b.title}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#4B5563] capitalize whitespace-nowrap">
                      {b.category}
                    </td>

                    {/* Protection */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {b.is_protected ? (
                        <span className="bg-[#DCFCE7] text-[#15803D] text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-[#BBF7D0]">
                          Protected
                        </span>
                      ) : (
                        <span className="bg-[#F3F4F6] text-[#4B5563] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                          Flexible
                        </span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-[#4B5563] text-[12.5px] max-w-xs truncate">
                      {b.description}
                    </td>

                    {/* Action 3-dots */}
                    <td className="py-3.5 px-2 text-right">
                      <button
                        onClick={() => {
                          setSelectedBlock(b);
                          setIsScheduleModalOpen(true);
                        }}
                        className="text-[#9CA3AF] hover:text-[#111827] p-1 rounded-md hover:bg-[#F3F4F6] transition-colors"
                      >
                        <MoreVertical size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: EDIT PROFILE & FINANCIAL PARAMETERS              */}
      {/* ========================================================= */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Edit Personal Profile & Financial Parameters"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#374151] mb-1">
              Professional Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
              className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Monthly Base Salary
              </label>
              <input
                type="number"
                value={editSalary}
                onChange={(e) => setEditSalary(Number(e.target.value))}
                required
                className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Currency
              </label>
              <select
                value={editCurrency}
                onChange={(e) => setEditCurrency(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
              >
                <option value="ETB">ETB (Ethiopian Birr)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#124B2C] hover:bg-[#0E351F] text-white text-[13px] font-semibold rounded-xl transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: SLEEP & WAKE SETTINGS                            */}
      {/* ========================================================= */}
      <Modal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        title="Sleep & Routine Parameters"
        maxWidth="max-w-md"
      >
        <div className="p-5 space-y-4">
          <p className="text-[13px] text-[#4B5563]">
            Adjust your fixed routine schedule. The system monitors sleep duration to prevent cognitive fatigue.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Target Bedtime
              </label>
              <input
                type="time"
                value={editBedTime}
                onChange={(e) => setEditBedTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#374151] mb-1">
                Target Wake-up
              </label>
              <input
                type="time"
                value={editWakeTime}
                onChange={(e) => setEditWakeTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-[13px] focus:outline-none focus:border-[#165B33]"
              />
            </div>
          </div>

          <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3 text-[12px] text-[#165B33] flex items-center justify-between font-medium">
            <span>Resulting sleep window:</span>
            <span className="font-bold text-[14px]">
              {calculateSleep(editWakeTime, editBedTime)} Hours
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
            <button
              type="button"
              onClick={() => setIsSleepModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveSleep(editBedTime, editWakeTime)}
              className="px-4 py-2 bg-[#124B2C] hover:bg-[#0E351F] text-white text-[13px] font-semibold rounded-xl transition-colors"
            >
              Save Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: MANAGE MASTER SCHEDULE                           */}
      {/* ========================================================= */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedBlock(null);
        }}
        title="Manage Master Weekday Schedule"
        maxWidth="max-w-2xl"
      >
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <p className="text-[13px] text-[#6B7280]">
            Review, inspect, or adjust the daily recurring timeblocks in your Life OS foundation.
          </p>

          <div className="space-y-2.5">
            {blocks.map((block) => (
              <div
                key={block.id}
                className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#BBF7D0] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] font-bold text-[#111827]">
                      {block.start_time} – {block.end_time} ({block.duration_minutes}m)
                    </span>
                    {block.is_protected ? (
                      <span className="bg-[#DCFCE7] text-[#15803D] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#BBF7D0]">
                        Protected
                      </span>
                    ) : (
                      <span className="bg-[#F3F4F6] text-[#4B5563] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Flexible
                      </span>
                    )}
                  </div>
                  <h4 className="text-[13.5px] font-bold text-[#111827]">
                    {block.title}
                  </h4>
                  <p className="text-[12px] text-[#4B5563] mt-0.5">{block.description}</p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <span className="text-[11.5px] font-medium text-[#6B7280] capitalize bg-white px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
                    {block.category}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-[#F3F4F6]">
            <button
              onClick={() => {
                setIsScheduleModalOpen(false);
                setSelectedBlock(null);
              }}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: CLEAN DATA RESET & INITIALIZATION               */}
      {/* ========================================================= */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          if (!isResetting) setIsResetModalOpen(false);
        }}
        title="Safe Clean Operational Data Reset"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleExecuteReset} className="p-5 space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl">
            <AlertTriangle className="text-[#DC2626] flex-shrink-0 mt-0.5" size={18} />
            <div className="text-[12px] text-[#991B1B] leading-relaxed">
              <p className="font-bold">Permanent Transactional Operation</p>
              <p className="mt-0.5">
                This will delete past completed tasks, old transactions, sample forex trades, and operational logs, resetting your progress to 0% for a fresh 90-day plan starting Monday, Nov 2, 2026.
              </p>
            </div>
          </div>

          <div className="bg-[#FAFDFB] border border-[#E1EFE7] rounded-xl p-3.5 text-[12px] text-[#14211A] space-y-2">
            <p className="font-bold text-[#165B33] flex items-center gap-1.5">
              <ShieldCheck size={15} />
              <span>Strict Protection Guarantees:</span>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#4B5563]">
              <li>Application source code & schemas are 100% preserved</li>
              <li>Your user profile, settings, and non-negotiables are kept intact</li>
              <li>Master schedule blocks are regenerated for Nov 2, 2026</li>
              <li>Schedules adapt to your active timezone ({timezone})</li>
            </ul>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#374151] mb-1">
              Type <span className="font-mono text-[#DC2626] font-extrabold">RESET</span> to confirm:
            </label>
            <input
              type="text"
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="RESET"
              disabled={isResetting}
              className="w-full px-3.5 py-2 border border-[#D1D5DB] rounded-xl text-[13px] font-mono tracking-wider focus:outline-none focus:border-[#DC2626]"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#F3F4F6]">
            <button
              type="button"
              disabled={isResetting}
              onClick={() => setIsResetModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F3F4F6] rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resetConfirmText.trim() !== "RESET" || isResetting}
              className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[13px] font-bold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isResetting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
                  <span>Execute Reset</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
