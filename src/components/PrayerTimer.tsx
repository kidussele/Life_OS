"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle2, HeartHandshake, BookOpen, Sparkles } from "lucide-react";
import { formatTo12H } from "@/lib/formatTime";

interface PrayerTimerProps {
  prayerType: "morning" | "night";
  scheduledTime: string;
  defaultDuration?: number; // minutes
  onComplete?: (data: { reflectionNotes: string; gratitudeNotes: string; focus: string }) => void;
}

export function PrayerTimer({
  prayerType,
  scheduledTime,
  defaultDuration = 30,
  onComplete,
}: PrayerTimerProps) {
  const totalSeconds = defaultDuration * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [reflectionNotes, setReflectionNotes] = useState("");
  const [gratitudeNotes, setGratitudeNotes] = useState("");
  const [spiritualFocus, setSpiritualFocus] = useState(
    prayerType === "morning"
      ? "Gratitude for life, wisdom for daily work, and steadfast discipline"
      : "Reflection on the day, peace of mind, confession, and restful sleep"
  );
  const [submitting, setSubmitting] = useState(false);
  const [completedSaved, setCompletedSaved] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play gentle harmonic chime using Web Audio API
  const playGentleChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Chord frequencies: C5, G5, E5 for gentle warm bell
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.12, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 2.6);
      });
    } catch (e) {
      // Audio fallback silent
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setHasFinished(true);
            playGentleChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const progressPercent = ((totalSeconds - secondsRemaining) / totalSeconds) * 100;

  const handleFinishAndSave = async () => {
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/prayers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prayer_type: prayerType,
          date: today,
          completed: true,
          duration_minutes: defaultDuration,
          reflection_notes: reflectionNotes,
          gratitude_notes: gratitudeNotes,
          spiritual_focus: spiritualFocus,
        }),
      });

      if (res.ok) {
        setCompletedSaved(true);
        if (onComplete) {
          onComplete({ reflectionNotes, gratitudeNotes, focus: spiritualFocus });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="os-card p-6 max-w-xl mx-auto bg-white border border-[#E8E6DF]">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF]">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-[#EDF7F1] text-[#1B4332] flex items-center justify-center font-bold">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h3 className="text-[16px] font-semibold text-[#181E1B]">
              {prayerType === "morning" ? "Morning Prayer Devotion" : "Night Prayer Devotion"}
            </h3>
            <span className="text-[12px] text-[#6B7280]">
              Scheduled: {formatTo12H(scheduledTime)} • 30 Minutes • Non-negotiable appointment
            </span>
          </div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EDF7F1] text-[#1B4332] border border-[#B7E4C7]">
          Protected
        </span>
      </div>

      {/* Timer Display */}
      <div className="py-6 text-center">
        <div className="text-5xl font-mono font-bold tracking-tight text-[#181E1B] mb-2">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <p className="text-[12px] text-[#6B7280]">
          {isRunning ? "Session in progress. Be still, reflect, and pray." : "Ready to begin your devotion"}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#F7F6F2] h-2 rounded-full mt-4 overflow-hidden border border-[#E8E6DF]">
          <div
            className="bg-[#2D6A4F] h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {!isRunning ? (
            <button
              onClick={() => setIsRunning(true)}
              className="inline-flex items-center px-4 py-2 bg-[#1B4332] text-white rounded-lg text-[13px] font-semibold hover:bg-[#2D6A4F] transition-colors shadow-sm"
            >
              <Play size={15} className="mr-1.5 fill-white" />
              {secondsRemaining === totalSeconds ? "Begin Prayer" : "Resume"}
            </button>
          ) : (
            <button
              onClick={() => setIsRunning(false)}
              className="inline-flex items-center px-4 py-2 bg-[#F7F6F2] text-[#181E1B] border border-[#D1CEC5] rounded-lg text-[13px] font-semibold hover:bg-[#E8E6DF] transition-colors"
            >
              <Pause size={15} className="mr-1.5" />
              Pause
            </button>
          )}

          <button
            onClick={() => {
              setIsRunning(false);
              setSecondsRemaining(totalSeconds);
              setHasFinished(false);
            }}
            className="p-2 text-[#6B7280] hover:text-[#181E1B] hover:bg-[#F7F6F2] rounded-lg transition-colors border border-transparent"
            title="Reset timer"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Reflection and Gratitude Section */}
      <div className="space-y-4 pt-4 border-t border-[#E8E6DF]">
        <div>
          <label className="block text-[12px] font-semibold text-[#181E1B] mb-1 flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#52B788]" />
            Spiritual Focus / Intention
          </label>
          <input
            type="text"
            value={spiritualFocus}
            onChange={(e) => setSpiritualFocus(e.target.value)}
            className="w-full px-3 py-1.5 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#2D6A4F]"
            placeholder="Focus for today's session..."
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#181E1B] mb-1 flex items-center gap-1.5">
            <BookOpen size={13} className="text-[#2D6A4F]" />
            Gratitude Journal (What are you thankful for?)
          </label>
          <textarea
            rows={2}
            value={gratitudeNotes}
            onChange={(e) => setGratitudeNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#2D6A4F]"
            placeholder="Thank God for family safety, guidance, opportunities..."
          />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-[#181E1B] mb-1">
            Reflection & Prayer Notes
          </label>
          <textarea
            rows={2}
            value={reflectionNotes}
            onChange={(e) => setReflectionNotes(e.target.value)}
            className="w-full px-3 py-1.5 text-[13px] bg-[#FBFBFA] border border-[#E8E6DF] rounded-lg focus:outline-none focus:border-[#2D6A4F]"
            placeholder="Spiritual insights, commitments, prayer points..."
          />
        </div>

        {completedSaved ? (
          <div className="p-3 bg-[#EDF7F1] border border-[#B7E4C7] rounded-lg text-[13px] text-[#1B4332] font-semibold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            Prayer Devotion Successfully Recorded!
          </div>
        ) : (
          <button
            onClick={handleFinishAndSave}
            disabled={submitting}
            className="w-full py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-lg text-[13px] font-semibold transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={16} />
            {submitting ? "Saving Reflection..." : "Mark Prayer Completed"}
          </button>
        )}
      </div>
    </div>
  );
}
