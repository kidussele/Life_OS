"use client";

import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import {
  Bot,
  Send,
  Sparkles,
  Clock,
  Target,
  Wallet,
  TrendingUp,
  Moon,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  suggestedActions?: string[];
  timestamp: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        `### 👋 Greetings, Kidus.\n\n` +
        `I am your **LIFE OS Planning & Accountability Assistant**.\n\n` +
        `My role is to remove ambiguity from your days, ensure your schedule is realistic, guard your prayer and family commitments, and hold you accountable to your financial and software milestones.\n\n` +
        `**How can I assist your execution today?**`,
      suggestedActions: [
        "What should I do right now?",
        "Audit my financial runway (ETB)",
        "Review my sleep debt & schedule",
        "Break down Suku MVP sprint",
        "Review Forex journal statistics",
      ],
      timestamp: "Ready",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          contextDate: today,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.content,
          suggestedActions: data.suggestedActions || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8E6DF] mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B4332] text-white flex items-center justify-center font-bold shadow-sm">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#181E1B]">
                Life OS Personal Planning Assistant
              </h1>
              <span className="text-[12px] text-[#6B7280]">
                Connected directly to your real schedule, financial balances, and milestones
              </span>
            </div>
          </div>
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#EDF7F1] text-[#1B4332] border border-[#B7E4C7] flex items-center gap-1">
            <ShieldCheck size={12} /> Active & Grounded
          </span>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl p-4.5 text-[13px] leading-relaxed shadow-2xs ${
                    isUser
                      ? "bg-[#1B4332] text-white rounded-br-xs"
                      : "bg-white border border-[#E8E6DF] text-[#181E1B] rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-sm max-w-none text-inherit">
                    {msg.content}
                  </div>

                  <span
                    className={`text-[10px] block mt-2 text-right ${
                      isUser ? "text-white/70" : "text-[#9CA3AF]"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Suggested Action Chips */}
                {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2.5 max-w-2xl">
                    {msg.suggestedActions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="text-[11px] font-semibold px-3 py-1.5 bg-white hover:bg-[#EDF7F1] text-[#1B4332] border border-[#B7E4C7] rounded-full transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <span>{action}</span>
                        <ChevronRight size={11} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-[12px] text-[#6B7280] p-3 bg-white border border-[#E8E6DF] rounded-xl w-fit">
              <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#1B4332] animate-bounce [animation-delay:0.4s]" />
              <span className="font-medium text-[#4B5563]">Analyzing system schedule and data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-[#E8E6DF] mt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your assistant (e.g., 'What task should I focus on next?', 'Analyze my budget')..."
              className="flex-1 px-4 py-2.5 text-[13px] bg-white border border-[#E8E6DF] rounded-xl focus:outline-none focus:border-[#1B4332] shadow-2xs"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] disabled:opacity-50 text-white rounded-xl shadow-sm transition-colors flex-shrink-0"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
