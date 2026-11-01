"use client";

import { useState, useEffect } from "react";
import {
  X,
  Zap,
  CheckCircle2,
  ListTodo,
  Lightbulb,
  Receipt,
  Bell,
  FileText,
  Rocket,
  Target,
  AlertTriangle,
  ArrowRight,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded?: () => void;
}

const CAPTURE_TYPES = [
  { id: "task", label: "Task", icon: ListTodo, color: "text-[#165B33]", placeholder: "What needs to get done?" },
  { id: "idea", label: "Idea", icon: Lightbulb, color: "text-[#D97706]", placeholder: "Capture a sudden insight or architectural concept..." },
  { id: "expense", label: "Expense", icon: Receipt, color: "text-[#2563EB]", placeholder: "e.g. 520 ETB server hosting renewal" },
  { id: "reminder", label: "Reminder", icon: Bell, color: "text-[#DC2626]", placeholder: "What must you remember before tomorrow?" },
  { id: "note", label: "Personal Note", icon: FileText, color: "text-[#4F6A5B]", placeholder: "Quick reflection, meeting note, or observation..." },
  { id: "project_idea", label: "Project Idea", icon: Rocket, color: "text-[#9333EA]", placeholder: "New product feature or client proposal idea..." },
  { id: "goal", label: "Goal", icon: Target, color: "text-[#165B33]", placeholder: "Strategic 90-day outcome to achieve..." },
  { id: "problem", label: "Problem", icon: AlertTriangle, color: "text-[#B45309]", placeholder: "Friction, bug, or obstacle requiring root-cause analysis..." },
];

export function QuickCaptureModal({ isOpen, onClose, onItemAdded }: QuickCaptureModalProps) {
  const [activeTab, setActiveTab] = useState<"capture" | "inbox">("capture");
  const [selectedType, setSelectedType] = useState<string>("task");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("development");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inboxItems, setInboxItems] = useState<any[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);

  // Load Inbox items
  const loadInbox = async () => {
    setLoadingInbox(true);
    try {
      const res = await fetch("/api/quick-capture");
      if (res.ok) {
        const data = await res.json();
        setInboxItems(data.items || []);
      }
    } catch (_) {}
    finally {
      setLoadingInbox(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInbox();
    }
  }, [isOpen, activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quick-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          content: content.trim(),
          category,
        }),
      });

      if (res.ok) {
        setContent("");
        if (onItemAdded) onItemAdded();
        await loadInbox();
        setActiveTab("inbox");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: string, action: string, extra = {}) => {
    try {
      const res = await fetch("/api/quick-capture", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, ...extra }),
      });
      if (res.ok) {
        setInboxItems((prev) => prev.filter((item) => item.id !== id));
        window.dispatchEvent(new Event("life_os_task_updated"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const activeTypeObj = CAPTURE_TYPES.find((t) => t.id === selectedType) || CAPTURE_TYPES[0];
  const ActiveIcon = activeTypeObj.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#D5E2D9] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECE8] bg-[#F7FAF8]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center shadow-xs">
              <Zap size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#14211A] leading-tight">
                Universal Quick Capture
              </h2>
              <p className="text-[11px] text-[#6C8176]">
                Instant capture in &lt; 5 seconds • Sort later
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#E8ECE8] p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("capture")}
              className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all ${
                activeTab === "capture"
                  ? "bg-white text-[#165B33] shadow-xs"
                  : "text-[#6C8176] hover:text-[#14211A]"
              }`}
            >
              New Capture
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("inbox")}
              className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                activeTab === "inbox"
                  ? "bg-white text-[#165B33] shadow-xs"
                  : "text-[#6C8176] hover:text-[#14211A]"
              }`}
            >
              <span>Inbox</span>
              {inboxItems.length > 0 && (
                <span className="bg-[#165B33] text-white text-[9px] px-1.5 py-0.2 rounded-full">
                  {inboxItems.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-white rounded-lg transition-colors ml-2"
            title="Close"
          >
            <X size={19} />
          </button>
        </div>

        {/* Tab 1: New Capture Form */}
        {activeTab === "capture" ? (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
            {/* Capture Types Grid */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6C8176] mb-2 flex items-center gap-1">
                <Layers size={12} />
                <span>Select Capture Type</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CAPTURE_TYPES.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedType(t.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        isSelected
                          ? "bg-[#EBF5EE] border-[#165B33] text-[#165B33] font-bold shadow-xs scale-102"
                          : "bg-[#F7FAF8] border-[#E2E9E4] text-[#485A50] hover:bg-white hover:border-[#CBD7CE]"
                      }`}
                    >
                      <Icon size={18} className={isSelected ? "text-[#165B33]" : t.color} />
                      <span className="text-[11px] mt-1 line-clamp-1">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Content Field */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6C8176] mb-1.5 flex items-center gap-1">
                <ActiveIcon size={13} className="text-[#165B33]" />
                <span>{activeTypeObj.label} Details</span>
              </label>
              <textarea
                rows={4}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={activeTypeObj.placeholder}
                className="w-full p-3.5 text-[13px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-2xl focus:outline-none focus:border-[#165B33] focus:bg-white text-[#14211A] leading-relaxed transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Category / Context Pill */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-[11.5px] font-bold text-[#6C8176]">Domain:</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-2.5 py-1.5 text-[12px] bg-[#F7FAF8] border border-[#D5E2D9] rounded-xl text-[#14211A] font-semibold focus:outline-none focus:border-[#165B33]"
                >
                  <option value="development">Software Development</option>
                  <option value="suku">Suku Marketplace</option>
                  <option value="freelancing">Freelance Clients</option>
                  <option value="forex">Forex Trading</option>
                  <option value="health">Health & Fitness</option>
                  <option value="spiritual">Orthodox Spiritual</option>
                  <option value="family">Family & Duties</option>
                  <option value="finances">Finance & Budget</option>
                  <option value="general">General Life</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-[12.5px] font-bold text-[#6C8176] hover:bg-[#F3F7F4] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="px-5 py-2 bg-[#165B33] hover:bg-[#124B2C] text-white font-bold text-[13px] rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <CheckCircle2 size={15} />
                  <span>{isSubmitting ? "Saving..." : "Capture (Ctrl+↵)"}</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Tab 2: Captured Inbox & Assignment */
          <div className="p-6 overflow-y-auto flex-1 divide-y divide-[#F0F4F2]">
            {loadingInbox ? (
              <div className="py-12 text-center text-[13px] text-[#6C8176]">
                Loading inbox items...
              </div>
            ) : inboxItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} />
                </div>
                <div className="text-[14px] font-bold text-[#14211A]">Inbox is Clear</div>
                <p className="text-[12px] text-[#6C8176] mt-1">
                  All captured thoughts and tasks have been assigned.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("capture")}
                  className="mt-4 px-4 py-1.5 bg-[#165B33] text-white text-[12px] font-bold rounded-xl"
                >
                  + Capture New Item
                </button>
              </div>
            ) : (
              inboxItems.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#165B33]">
                          {item.type}
                        </span>
                        <span className="text-[10px] font-semibold text-[#6C8176] bg-[#F3F4F6] px-1.5 py-0.5 rounded">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-[#8CA095] ml-auto">
                          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-[13px] font-semibold text-[#14211A] mt-1.5 leading-snug">
                        {item.content}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAction(item.id, "delete")}
                      className="p-1.5 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg transition-colors flex-shrink-0"
                      title="Discard item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Quick Convert Buttons */}
                  <div className="flex items-center flex-wrap gap-2 mt-2.5 pt-2 border-t border-[#F7FAF8]">
                    <button
                      type="button"
                      onClick={() =>
                        handleAction(item.id, "convert_task", {
                          title: item.content,
                          category: item.category,
                          target_date: new Date().toISOString().split("T")[0],
                        })
                      }
                      className="px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Calendar size={11} />
                      <span>Convert to Task Today</span>
                    </button>

                    {item.type === "expense" && (
                      <button
                        type="button"
                        onClick={() => {
                          const match = item.content.match(/(\d+(\.\d+)?)/);
                          const amt = match ? parseFloat(match[0]) : 100;
                          handleAction(item.id, "convert_expense", {
                            amount: amt,
                            currency: "ETB",
                            category: item.category,
                          });
                        }}
                        className="px-2.5 py-1 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Receipt size={11} />
                        <span>Log as Expense</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleAction(item.id, "process")}
                      className="px-2.5 py-1 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] text-[11px] font-semibold rounded-lg transition-colors ml-auto flex items-center gap-1"
                    >
                      <span>Mark Processed</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
