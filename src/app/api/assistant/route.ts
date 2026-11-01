import { NextResponse } from "next/server";
import {
  getUserProfile,
  getScheduleBlocks,
  getDailyTasks,
  getGoals,
  getHabitsWithTodayStatus,
  getFinancialSummary,
  getForexTrades,
  getEveningRotationForDate,
} from "@/lib/repository";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, contextDate } = body;
    const dateStr = contextDate || new Date().toISOString().split("T")[0];

    const profile = await getUserProfile();
    const tasks = await getDailyTasks("user_kidus_01", dateStr);
    const goals = await getGoals("user_kidus_01");
    const habits = await getHabitsWithTodayStatus("user_kidus_01", dateStr);
    const finances = await getFinancialSummary("user_kidus_01");
    const forex = await getForexTrades("user_kidus_01");
    const eveningFocus = getEveningRotationForDate(dateStr);

    const promptLower = (message || "").toLowerCase();

    let responseText = "";
    let suggestedActions: string[] = [];

    if (promptLower.includes("what to do next") || promptLower.includes("next task") || promptLower.includes("current")) {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, "0");
      const currentMins = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${currentHours}:${currentMins}`;

      const upcoming = tasks.filter((t) => t.status === "upcoming" || t.status === "in_progress");
      const nextTask = upcoming[0];

      if (nextTask) {
        responseText = `### 🎯 Current Focus & Next Step\n\n` +
          `**Activity:** **${nextTask.title}**\n` +
          `**Time Window:** \`${nextTask.start_time} - ${nextTask.end_time}\` (${nextTask.duration_minutes} min)\n` +
          `**Category:** *${nextTask.category.toUpperCase()}* | **Priority:** ${nextTask.priority.toUpperCase()}\n\n` +
          `**Execution Instructions:**\n${nextTask.instructions}\n\n` +
          (nextTask.is_protected ? `⚠️ *Protected block:* Strictly avoid context switching or personal browsing during this time.` : ``);
        suggestedActions = ["Start Task", "Mark Completed", "Review Schedule"];
      } else {
        responseText = `All planned activities for today have either been completed or processed! Take time to prepare for sleep by 21:45 PM and ensure your prayer devotion is fulfilled.`;
        suggestedActions = ["View Daily Reflection", "Check Tomorrow's Schedule"];
      }
    } else if (promptLower.includes("break down") || promptLower.includes("new goal") || promptLower.includes("plan goal")) {
      responseText = `### 🏗️ Goal Decomposition Framework\n\n` +
        `To convert an ambition into reality without overwhelming your weekday schedule, we apply the Life OS hierarchy:\n\n` +
        `1. **Vision (1-2 Years):** The ultimate milestone (e.g., Financial Sovereignity via software services).\n` +
        `2. **90-Day Sprint:** The tangible quarterly deliverable (e.g., Deliver Suku MVP or Sign 3 Freelance Clients).\n` +
        `3. **Monthly Milestones:** 30-day checkpoints that must be accomplished.\n` +
        `4. **Weekly Focus:** 1 designated evening block (60m) + Saturday deep-work (3h).\n` +
        `5. **Daily Micro-Tasks:** Single 20-40 min actionable step with zero ambiguity.\n\n` +
        `*Would you like me to auto-generate daily milestones for a specific category: Freelancing, Suku Marketplace, or Forex Study?*`;
      suggestedActions = ["Break Down Suku Goal", "Break Down Freelance Goal", "Create New 90-Day Sprint"];
    } else if (promptLower.includes("financial") || promptLower.includes("money") || promptLower.includes("salary") || promptLower.includes("savings")) {
      responseText = `### 💰 Financial Audit & Reality Check\n\n` +
        `- **Monthly Base Salary:** 30,000 ETB\n` +
        `- **Non-Negotiable Family Support:** 10,000 ETB (33.3% of income)\n` +
        `- **Recorded Total Expenses:** ${finances.totalExpenses.toLocaleString()} ETB\n` +
        `- **Current Emergency Fund Reserve:** ${finances.emergencyFund.toLocaleString()} ETB\n` +
        `- **Actual Net Liquid Balance:** ${finances.netBalance.toLocaleString()} ETB\n\n` +
        `**Productivity Recommendation:**\n` +
        `Do not assume any remaining balance is automatically savings. With 10,000 ETB dedicated to your family, your margin on salary alone is tight (~5,000-8,000 ETB/mo). Your fastest path to financial breathing room is executing your Wednesday & Saturday freelance client acquisition blocks to bring in an additional 30,000 - 45,000 ETB per project.`;
      suggestedActions = ["Record New Expense", "Review Freelance Pipeline", "Set Monthly Budget"];
    } else if (promptLower.includes("forex") || promptLower.includes("ict") || promptLower.includes("trading")) {
      const closed = forex.filter((t) => t.outcome !== "open");
      const wins = closed.filter((t) => t.outcome === "win");
      const winRate = closed.length > 0 ? ((wins.length / closed.length) * 100).toFixed(1) : "0";

      responseText = `### 📊 ICT Forex Execution Review\n\n` +
        `- **Logged Demo/Backtest Trades:** ${forex.length}\n` +
        `- **Win Rate:** ${winRate}% (${wins.length} wins / ${closed.length} closed)\n` +
        `- **Primary Models:** Silver Bullet, FVG Retest, Order Block MSS\n\n` +
        `⚠️ **Safety & Discipline Mandates:**\n` +
        `1. Trading is exclusively for your Tuesday & Friday evening sessions or Saturday analysis.\n` +
        `2. Zero live capital deployment until 100 demo trades are logged with verified R-expectancy.\n` +
        `3. Never take live trades during your 08:00–17:00 employment hours.\n` +
        `4. Respect stop loss as an expense of doing business; never move an SL in trade.`;
      suggestedActions = ["Log Backtest Trade", "Review Trade Journal", "Study ICT Model Notes"];
    } else if (promptLower.includes("sleep") || promptLower.includes("tired") || promptLower.includes("schedule")) {
      responseText = `### 🛌 Sleep & Recovery Analysis\n\n` +
        `**Current Schedule Setting:** Wake at **04:00 AM**, Sleep at **22:00 PM**.\n` +
        `**Calculated Sleep:** **6.0 hours**.\n\n` +
        `⚠️ **Sleep Debt Advisory:**\n` +
        `6 hours is below the 7.0-8.0 hour biological baseline. Over weeks, this accumulates cognitive fatigue, lowering coding accuracy and impulse control.\n\n` +
        `**Recommended Schedule Optimization:**\n` +
        `• **Option A (Earlier Bedtime):** Wind down at 20:45, Night prayer at 21:00, Bed at 21:15 → **6.75 hours** sleep.\n` +
        `• **Option B (Slight Wake Adjustment):** Sleep at 22:00, Wake at 05:00 → **7.0 hours** sleep (condense morning routine slightly while keeping 30m prayer fully intact).\n\n` +
        `You can adjust these parameters anytime in the Schedule Settings.`;
      suggestedActions = ["Adjust Bedtime to 21:15", "Adjust Wake to 05:00", "Keep Current Schedule"];
    } else {
      // General overview and executive briefing
      const completedCount = tasks.filter((t) => t.status === "completed").length;
      const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

      responseText = `### ⚡ Executive Briefing for Kidus Seleshi\n\n` +
        `**Philosophy:** *GOAL + DEADLINE + PLAN + DISCIPLINE + EXECUTION + REVIEW = SUCCESS*\n\n` +
        `**Today's Status:**\n` +
        `• **Tasks Completed:** ${completedCount} of ${tasks.length} (${completionRate}%)\n` +
        `• **Tonight's Main Focus (19:15-20:15):** ${eveningFocus.title}\n` +
        `• **Spiritual Devotion:** Morning prayer recorded. Night prayer scheduled at 21:15 (Protected).\n` +
        `• **Emergency Reserve:** ${finances.emergencyFund.toLocaleString()} ETB\n\n` +
        `**Action Directives:**\n` +
        `1. Execute your scheduled evening block with undivided attention.\n` +
        `2. Protect dinner and rest with family from 18:30 to 19:15.\n` +
        `3. Log today's expenses before night prayer.\n\n` +
        `How would you like to proceed?`;
      suggestedActions = ["Show Next Task", "Review Financials", "Analyze Sleep Schedule", "Break Down Suku Goal"];
    }

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      suggestedActions,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
