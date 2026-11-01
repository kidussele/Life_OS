"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Target,
  FileText,
  Volume2,
  VolumeX,
} from "lucide-react";

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTaskId?: string | null;
  initialTaskTitle?: string | null;
  initialGoalId?: string | null;
  onSessionSaved?: () => void;
}

const PRESET_DURATIONS = [
  { label: "25m Pomodoro", minutes: 25 },
  { label: "40m Flow", minutes: 40 },
  { label: "60m Sprint", minutes: 60 },
];

export function FocusModeModal({
  isOpen,
  onClose,
  initialTaskId = null,
  initialTaskTitle = null,
  initialGoalId = null,
  onSessionSaved,
}: FocusModeModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const [taskId, setTaskId] = useState<string | null>(initialTaskId);
  const [taskTitle, setTaskTitle] = useState<string>(initialTaskTitle || "Deep Focus Session");
  const [goalId, setGoalId] = useState<string | null>(initialGoalId);
  const [tasksList, setTasksList] = useState<Array<{ id: string; title: string; category: string }>>([]);

  const [showFinishPrompt, setShowFinishPrompt] = useState(false);
  const [showInterruptPrompt, setShowInterruptPrompt] = useState(false);
  const [interruptionReason, setInterruptionReason] = useState("");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync props when opening
  useEffect(() => {
    if (isOpen) {
      if (initialTaskId) setTaskId(initialTaskId);
      if (initialTaskTitle) setTaskTitle(initialTaskTitle);
      if (initialGoalId) setGoalId(initialGoalId);
    }
  }, [isOpen, initialTaskId, initialTaskTitle, initialGoalId]);

  // Fetch today's tasks for selector
  useEffect(() => {
    if (!isOpen) return;
    const loadTasks = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/tasks?date=${today}`);
        if (res.ok) {
          const data = await res.json();
          setTasksList(data.tasks || []);
        }
      } catch (_) {}
    };
    loadTasks();
  }, [isOpen]);

  // Set duration
  const setDuration = (mins: number, custom = false) => {
    if (isRunning) return;
    setSelectedMinutes(mins);
    setIsCustom(custom);
    setTimeLeft(mins * 60);
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsPaused(false);
            setShowFinishPrompt(true);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  // Audio notification chime using Web Audio API (no external file dependency)
  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (_) {}
  }, [soundEnabled]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setSessionStartTime(null);
    setTimeLeft(selectedMinutes * 60);
  };

  const handleFinishEarly = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setShowFinishPrompt(true);
  };

  const handleInterruptSubmit = async () => {
    await saveSessionRecord({
      interrupted: true,
      reason: interruptionReason || "Interrupted by distraction / call",
      completedTask: false,
    });
    setShowInterruptPrompt(false);
    onClose();
  };

  const handleFinishCompletion = async (markComplete: boolean) => {
    await saveSessionRecord({
      interrupted: false,
      reason: null,
      completedTask: markComplete,
    });
    setShowFinishPrompt(false);
    handleReset();
    onClose();
  };

  const saveSessionRecord = async (opts: {
    interrupted: boolean;
    reason: string | null;
    completedTask: boolean;
  }) => {
    setIsSaving(true);
    try {
      const elapsedSeconds = selectedMinutes * 60 - timeLeft;
      const actualMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

      const payload = {
        task_id: taskId || null,
        goal_id: goalId || null,
        title: taskTitle || "Focused Session",
        duration_minutes: selectedMinutes,
        actual_minutes: actualMinutes,
        interrupted: opts.interrupted,
        interruption_reason: opts.reason,
        notes: sessionNotes || null,
        completed_task: opts.completedTask,
      };

      const res = await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("life_os_task_updated"));
        if (onSessionSaved) onSessionSaved();
      }
    } catch (err) {
      console.error("Failed to save focus session:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.round(
    ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-[calc(100vw-1.25rem)] sm:max-w-lg max-h-[94vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#D5E2D9]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#E8ECE8] bg-[#F7FAF8] sticky top-0 z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-[#14211A] leading-tight">
                Focus Mode
              </h2>
              <p className="text-[11px] text-[#6C8176]">
                Distraction-free deep execution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-white rounded-lg transition-colors"
              title={soundEnabled ? "Mute completion chime" : "Enable chime"}
            >
              {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isRunning && !isPaused}
              className="p-1.5 text-[#6C8176] hover:text-[#14211A] hover:bg-white rounded-lg transition-colors disabled:opacity-40"
              title="Close modal"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Linked Task Selector */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6C8176] mb-1.5 flex items-center gap-1.5">
              <Target size={13} className="text-[#165B33]" />
              <span>Target Task / Objective</span>
            </label>
            {tasksList.length > 0 && !isRunning ? (
              <select
                value={taskId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setTaskId(val || null);
                  const found = tasksList.find((t) => t.id === val);
                  if (found) setTaskTitle(found.title);
                }}
                className="w-full px-3.5 py-2 text-[13px] bg-[#F8FAF9] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33] text-[#14211A] font-medium transition-all"
              >
                <option value="">Custom Focus Session (Unlinked)</option>
                {tasksList.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.category.toUpperCase()}] {t.title}
                  </option>
                ))}
              </select>
            ) : (
              <div className="px-3.5 py-2 text-[13px] bg-[#EBF5EE] text-[#165B33] font-bold rounded-xl border border-[#D5E6DC] truncate">
                {taskTitle}
              </div>
            )}
          </div>

          {/* Duration Selector Tabs (Disabled while running) */}
          {!isRunning && (
            <div className="flex items-center gap-2 mb-6">
              {PRESET_DURATIONS.map((preset) => (
                <button
                  key={preset.minutes}
                  type="button"
                  onClick={() => setDuration(preset.minutes, false)}
                  className={`flex-1 py-2 text-[12px] font-bold rounded-xl border transition-all ${
                    selectedMinutes === preset.minutes && !isCustom
                      ? "bg-[#165B33] text-white border-[#165B33] shadow-xs"
                      : "bg-[#F7FAF8] text-[#485A50] border-[#E2E9E4] hover:bg-[#EBF5EE]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
              <div className="relative w-20">
                <input
                  type="number"
                  placeholder="Min"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(e) => {
                    setCustomMinutes(e.target.value);
                    const val = parseInt(e.target.value, 10);
                    if (val > 0) setDuration(val, true);
                  }}
                  className={`w-full py-2 px-2.5 text-center text-[12px] font-bold rounded-xl border transition-all ${
                    isCustom
                      ? "bg-[#165B33] text-white border-[#165B33]"
                      : "bg-[#F7FAF8] text-[#485A50] border-[#E2E9E4]"
                  }`}
                />
              </div>
            </div>
          )}

          {/* Big Countdown Timer Display */}
          <div className="relative flex flex-col items-center justify-center py-6 px-4 bg-gradient-to-b from-[#F3F8F5] to-white rounded-2xl border border-[#DCEBE1] mb-6 shadow-inner">
            <div className="text-[58px] sm:text-[68px] font-extrabold font-mono text-[#123D26] tracking-tight leading-none">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>

            <div className="mt-2 text-[12px] font-semibold text-[#6C8176] flex items-center gap-1.5">
              <Clock size={13} className="text-[#165B33]" />
              <span>
                {isRunning
                  ? isPaused
                    ? "Paused"
                    : "Deep Focus In Progress"
                  : "Ready to focus"}
              </span>
              <span className="text-[#CBD7CE]">•</span>
              <span>{progressPercent}% Elapsed</span>
            </div>

            {/* Subtle Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-[#E2ECE5] rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-[#165B33] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="w-full max-w-xs py-3.5 px-6 bg-[#165B33] hover:bg-[#124B2C] text-white font-bold text-[14px] rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Play size={18} fill="currentColor" />
                <span>Start Focus Session</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    type="button"
                    onClick={handleResume}
                    className="flex-1 py-3 px-4 bg-[#165B33] hover:bg-[#124B2C] text-white font-bold text-[13px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="flex-1 py-3 px-4 bg-[#F3F7F4] hover:bg-[#E2ECE5] text-[#14211A] font-bold text-[13px] rounded-xl border border-[#D5E2D9] transition-all flex items-center justify-center gap-1.5"
                  >
                    <Pause size={16} />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="py-3 px-4 bg-[#EBF5EE] hover:bg-[#D5E6DC] text-[#165B33] font-bold text-[13px] rounded-xl border border-[#C5DDD0] transition-all flex items-center justify-center gap-1.5"
                  title="Finish session and record duration"
                >
                  <CheckCircle2 size={16} />
                  <span>Finish</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowInterruptPrompt(true)}
                  className="py-3 px-3.5 bg-white hover:bg-[#FEF2F2] text-[#DC2626] hover:border-[#FECACA] font-bold text-[12px] rounded-xl border border-[#E2E9E4] transition-all flex items-center justify-center gap-1"
                  title="Session interrupted"
                >
                  <AlertCircle size={15} />
                  <span>Interrupt</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="py-3 px-3 text-[#6C8176] hover:text-[#14211A] hover:bg-[#F3F7F4] rounded-xl transition-colors"
                  title="Reset timer"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Finish Dialog Modal Overlay */}
        {showFinishPrompt && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-between z-20 animate-in fade-in duration-150">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#EBF5EE] text-[#165B33] flex items-center justify-center mb-3">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-[18px] font-bold text-[#14211A]">
                Focus Session Completed!
              </h3>
              <p className="text-[13px] text-[#4F6A5B] mt-1">
                You focused on <strong className="text-[#14211A]">{taskTitle}</strong> for{" "}
                {Math.max(1, Math.round((selectedMinutes * 60 - timeLeft) / 60))} minutes.
              </p>

              <div className="mt-4">
                <label className="block text-[11px] font-bold text-[#6C8176] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText size={12} />
                  <span>Session Notes (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What breakthroughs or code deliverables were produced?"
                  className="w-full p-2.5 text-[12.5px] bg-[#F7FAF8] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#165B33]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-[#E8ECE8]">
              <div className="text-[12px] font-semibold text-[#14211A]">
                Update linked task status:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinishCompletion(true)}
                  className="py-2.5 px-3 bg-[#165B33] hover:bg-[#124B2C] text-white font-bold text-[12.5px] rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={15} />
                  <span>Mark Task Complete</span>
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleFinishCompletion(false)}
                  className="py-2.5 px-3 bg-[#F3F7F4] hover:bg-[#E2ECE5] text-[#14211A] font-bold text-[12.5px] rounded-xl border border-[#D5E2D9] transition-all"
                >
                  Keep In Progress
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Interrupt Reason Prompt Overlay */}
        {showInterruptPrompt && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-between z-20 animate-in fade-in duration-150">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3">
                <AlertCircle size={26} />
              </div>
              <h3 className="text-[18px] font-bold text-[#14211A]">
                Record Interrupted Session
              </h3>
              <p className="text-[13px] text-[#4F6A5B] mt-1">
                LIFE OS logs interruptions to identify focus friction and build higher cognitive stamina.
              </p>

              <div className="mt-4">
                <label className="block text-[11px] font-bold text-[#6C8176] uppercase tracking-wider mb-1">
                  Interruption Reason
                </label>
                <input
                  type="text"
                  value={interruptionReason}
                  onChange={(e) => setInterruptionReason(e.target.value)}
                  placeholder="e.g. Urgent client Slack message, unexpected call"
                  className="w-full p-2.5 text-[12.5px] bg-[#F7FAF8] border border-[#D5E2D9] rounded-xl focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8ECE8]">
              <button
                type="button"
                onClick={() => setShowInterruptPrompt(false)}
                className="py-2 px-4 text-[12.5px] font-bold text-[#4F6A5B] hover:bg-[#F3F7F4] rounded-xl"
              >
                Resume Session
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleInterruptSubmit}
                className="py-2 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-[12.5px] rounded-xl shadow-xs transition-all"
              >
                Log Interruption
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
