"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Modal } from "./Modal";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStartTime, setTaskStartTime] = useState("19:15");
  const [taskEndTime, setTaskEndTime] = useState("20:15");
  const [taskCategory, setTaskCategory] = useState("development");
  const [taskInstructions, setTaskInstructions] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [loading, setLoading] = useState(false);

  // Sidebar expanded / collapsed desktop state with persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load sidebar collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("life_os_sidebar_collapsed");
      if (saved !== null) {
        setIsSidebarCollapsed(saved === "true");
      }
    } catch (_) {}
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("life_os_sidebar_collapsed", String(next));
      } catch (_) {}
      return next;
    });
  }, []);

  // Global Keyboard shortcuts:
  // - Ctrl+B / Cmd+B: Toggle Sidebar Expand/Collapse
  // - Escape: Close Mobile Navigation Drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInput =
        targetTag === "input" ||
        targetTag === "textarea" ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebarCollapse();
      }

      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebarCollapse, mobileMenuOpen]);

  // Lock body scroll on mobile when drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [sh, sm] = taskStartTime.split(":").map(Number);
      const [eh, em] = taskEndTime.split(":").map(Number);
      let dur = (eh * 60 + em) - (sh * 60 + sm);
      if (dur <= 0) dur = 60;

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskTitle,
          start_time: taskStartTime,
          end_time: taskEndTime,
          duration_minutes: dur,
          category: taskCategory,
          instructions: taskInstructions,
          priority: taskPriority,
          date: today,
          is_protected: 0,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setTaskTitle("");
        setTaskInstructions("");
        // Reload current page to refresh task lists
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F3F7F4] overflow-hidden text-[#14211A]">
      {/* Responsive Collapsible Sidebar & Mobile Drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 xl:p-8">
          <div className="w-full max-w-[1720px] mx-auto">{children}</div>
        </main>
      </div>

      {/* Quick Add Task Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Scheduled Task to Life OS"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Suku Merchant Onboarding API test"
              className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={taskStartTime}
                onChange={(e) => setTaskStartTime(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={taskEndTime}
                onChange={(e) => setTaskEndTime(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
              >
                <option value="development">Software Development</option>
                <option value="freelancing">Freelancing & Clients</option>
                <option value="business">Suku Marketplace</option>
                <option value="forex">Forex Study / Backtest</option>
                <option value="learning">Career & Code Study</option>
                <option value="health">Health & Exercise</option>
                <option value="family">Family Time</option>
                <option value="planning">Financial & Planning</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
                Priority
              </label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value)}
                className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
              Instructions & Action Steps
            </label>
            <textarea
              rows={3}
              value={taskInstructions}
              onChange={(e) => setTaskInstructions(e.target.value)}
              placeholder="What specifically needs to be accomplished?"
              className="w-full px-3 py-2 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#1B4332]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-[13px] font-medium text-[#4B5563] hover:bg-[#F7F6F2] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[13px] font-semibold text-white bg-[#1B4332] hover:bg-[#2D6A4F] rounded-lg shadow-sm"
            >
              {loading ? "Adding..." : "Add to Schedule"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
