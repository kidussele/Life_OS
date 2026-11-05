import { db, initDatabase } from "./db";
import { getNowInTimezone } from "./timeEngine";

export interface DateRangeBounds {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  prevStartDate: string;
  prevEndDate: string;
  label: string;
  dayCount: number;
}

/**
 * Safely computes date range bounds in the user's local timezone
 */
export function getDateRangeBounds(
  filter = "Last 30 Days",
  timezone = "Africa/Addis_Ababa",
  customStart?: string,
  customEnd?: string
): DateRangeBounds {
  const now = getNowInTimezone(timezone);
  const todayStr = now.dateStr;
  const todayDate = new Date(`${todayStr}T12:00:00Z`);

  const formatDate = (d: Date): string => d.toISOString().split("T")[0];

  const addDays = (d: Date, days: number): Date => {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  };

  let startDate = todayStr;
  let endDate = todayStr;
  let label = "Today";

  const normalized = (filter || "").toLowerCase().trim();

  if (normalized === "today") {
    startDate = todayStr;
    endDate = todayStr;
    label = "Today";
  } else if (normalized.includes("this week") || normalized === "week") {
    // Monday to Sunday of the current week
    const dayOfWeek = todayDate.getDay(); // 0 is Sun, 1 is Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = addDays(todayDate, mondayOffset);
    const sunday = addDays(monday, 6);
    startDate = formatDate(monday);
    endDate = formatDate(sunday);
    label = "This Week";
  } else if (normalized.includes("this month") || normalized === "month") {
    const year = todayDate.getUTCFullYear();
    const month = todayDate.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    startDate = formatDate(firstDay);
    endDate = formatDate(lastDay);
    label = "This Month";
  } else if (normalized.includes("last 90") || normalized === "90_days") {
    startDate = formatDate(addDays(todayDate, -89));
    endDate = todayStr;
    label = "Last 90 Days";
  } else if (normalized.includes("last 6 month") || normalized === "6_months") {
    startDate = formatDate(addDays(todayDate, -179));
    endDate = todayStr;
    label = "Last 6 Months";
  } else if (normalized.includes("year") || normalized === "last_year") {
    startDate = formatDate(addDays(todayDate, -364));
    endDate = todayStr;
    label = "Last Year";
  } else if (normalized.includes("custom") && customStart && customEnd) {
    startDate = customStart;
    endDate = customEnd;
    label = `${customStart} to ${customEnd}`;
  } else {
    // Default: Last 30 Days
    startDate = formatDate(addDays(todayDate, -29));
    endDate = todayStr;
    label = "Last 30 Days";
  }

  // Calculate day count
  const startD = new Date(`${startDate}T12:00:00Z`);
  const endD = new Date(`${endDate}T12:00:00Z`);
  const diffTime = Math.max(0, endD.getTime() - startD.getTime());
  const dayCount = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // Previous period of equal length
  const prevEndD = addDays(startD, -1);
  const prevStartD = addDays(prevEndD, -(dayCount - 1));
  const prevStartDate = formatDate(prevStartD);
  const prevEndDate = formatDate(prevEndD);

  return {
    startDate,
    endDate,
    prevStartDate,
    prevEndDate,
    label,
    dayCount,
  };
}

/**
 * 1. getDailyExecution — Real daily execution stats for any date
 */
export async function getDailyExecution(
  userId = "user_kidus_01",
  dateStr: string,
  timezone = "Africa/Addis_Ababa"
) {
  await initDatabase();
  const now = getNowInTimezone(timezone);
  const date = dateStr || now.dateStr;

  const tasksRes = await db.execute({
    sql: `SELECT * FROM daily_tasks WHERE user_id = ? AND date = ? ORDER BY start_time ASC`,
    args: [userId, date],
  });

  const tasks = tasksRes.rows as any[];
  const total = tasks.length;
  let completed = 0;
  let missed = 0;
  let skipped = 0;
  let inProgress = 0;
  let upcoming = 0;

  const categoryBreakdown: Record<string, { total: number; completed: number }> = {};

  for (const t of tasks) {
    const cat = String(t.category || "other").toLowerCase();
    if (!categoryBreakdown[cat]) {
      categoryBreakdown[cat] = { total: 0, completed: 0 };
    }
    categoryBreakdown[cat].total += 1;

    if (t.status === "completed") {
      completed++;
      categoryBreakdown[cat].completed += 1;
    } else if (t.status === "skipped") {
      skipped++;
    } else if (t.status === "in_progress") {
      inProgress++;
    } else if (date < now.dateStr) {
      missed++;
    } else {
      upcoming++;
    }
  }

  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Real focus minutes
  const focusRes = await db.execute({
    sql: `SELECT SUM(actual_duration_seconds) as secs FROM focus_sessions 
          WHERE user_id = ? AND started_at LIKE ?`,
    args: [userId, `${date}%`],
  });
  const sessionMins = Math.round(Number(focusRes.rows[0]?.secs || 0) / 60);

  const taskMinsRes = await db.execute({
    sql: `SELECT SUM(actual_duration_minutes) as mins FROM daily_tasks 
          WHERE user_id = ? AND date = ? AND status = 'completed'`,
    args: [userId, date],
  });
  const taskMins = Number(taskMinsRes.rows[0]?.mins || 0);
  const totalFocusMinutes = sessionMins + taskMins;

  return {
    date,
    total,
    completed,
    missed,
    skipped,
    inProgress,
    upcoming,
    completionPct,
    totalFocusMinutes,
    focusHours: Number((totalFocusMinutes / 60).toFixed(1)),
    categoryBreakdown,
    hasTasks: total > 0,
  };
}

/**
 * 2. getHabitAnalytics — Real habit adherence, occurrences, and streaks
 */
export async function getHabitAnalytics(
  userId = "user_kidus_01",
  startDate: string,
  endDate: string
) {
  await initDatabase();

  const habitsRes = await db.execute({
    sql: "SELECT * FROM habits WHERE user_id = ? AND is_active = 1",
    args: [userId],
  });
  const habits = habitsRes.rows as any[];

  // Eligible days in range (respects user's journey start date so days prior to starting are not counted as missed)
  const userRes = await db.execute({
    sql: "SELECT journey_start_date FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  const journeyStartDate = (userRes.rows[0]?.journey_start_date as string) || "2026-11-02";

  const startD = new Date(`${startDate}T12:00:00Z`);
  const endD = new Date(`${endDate}T12:00:00Z`);
  const dayCount = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const effectiveStartDate = startDate < journeyStartDate ? journeyStartDate : startDate;
  const effStartD = new Date(`${effectiveStartDate}T12:00:00Z`);
  const effectiveDayCount = Math.max(1, Math.round((endD.getTime() - effStartD.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Read all habit logs in range
  const logsRes = await db.execute({
    sql: `SELECT hl.habit_id, hl.date, hl.completed
          FROM habit_logs hl
          JOIN habits h ON hl.habit_id = h.id
          WHERE h.user_id = ? AND hl.date >= ? AND hl.date <= ?`,
    args: [userId, startDate, endDate],
  });

  // Read all completed daily tasks with habit_id in range
  const tasksRes = await db.execute({
    sql: `SELECT habit_id, date, status, title FROM daily_tasks
          WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });

  // Map of completed habit on date: key = `${habit_id}_${date}`
  const completedMap = new Set<string>();
  for (const row of logsRes.rows) {
    if (Number(row.completed) === 1) {
      completedMap.add(`${row.habit_id}_${row.date}`);
    }
  }

  // Cross-check daily tasks for completion
  const titleToHabitMap: Record<string, string> = {
    "morning prayer": "h_m_prayer",
    "exercise": "h_exercise",
    "workout": "h_exercise",
    "english learning": "h_english",
    "professional learning": "h_prof_learn",
    "employment": "h_work",
    "main development": "h_dev_session",
    "responsibilities & planning": "h_fin_track",
    "financial": "h_fin_track",
    "family": "h_family",
    "night prayer": "h_n_prayer",
    "sleep preparation": "h_sleep",
  };

  for (const t of tasksRes.rows) {
    if (t.status === "completed") {
      if (t.habit_id) {
        completedMap.add(`${t.habit_id}_${t.date}`);
      } else {
        const lower = String(t.title || "").toLowerCase();
        const matchedHabit = habits.find((h) => {
          const hn = String(h.name || "").toLowerCase();
          return hn === lower || lower.includes(hn) || hn.includes(lower) || (h.category && h.category === t.category);
        });
        if (matchedHabit) {
          completedMap.add(`${matchedHabit.id}_${t.date}`);
        } else {
          for (const [key, hid] of Object.entries(titleToHabitMap)) {
            if (lower.includes(key)) {
              completedMap.add(`${hid}_${t.date}`);
              break;
            }
          }
        }
      }
    }
  }

  // Calculate streaks and per-habit metrics
  const habitItems = [];
  let totalEligibleOccurrences = habits.length * effectiveDayCount;
  let totalCompletedOccurrences = 0;

  for (const h of habits) {
    let completedInRange = 0;
    // Iterate through all days in range to count completions
    for (let i = 0; i < dayCount; i++) {
      const curDate = new Date(startD);
      curDate.setDate(startD.getDate() + i);
      const curStr = curDate.toISOString().split("T")[0];
      if (completedMap.has(`${h.id}_${curStr}`)) {
        completedInRange++;
      }
    }

    totalCompletedOccurrences += completedInRange;

    // Calculate actual consecutive streak ending at endDate
    let currentStreak = 0;
    let checkDate = new Date(endD);
    while (true) {
      const dStr = checkDate.toISOString().split("T")[0];
      if (completedMap.has(`${h.id}_${dStr}`)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If the very first day checked was today and not done yet, check yesterday
        if (currentStreak === 0 && dStr === endDate) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yStr = checkDate.toISOString().split("T")[0];
          if (completedMap.has(`${h.id}_${yStr}`)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    const adherence = effectiveDayCount > 0 ? Math.min(100, Math.round((completedInRange / effectiveDayCount) * 100)) : 0;

    habitItems.push({
      id: h.id,
      name: h.name,
      category: h.category,
      completedCount: completedInRange,
      eligibleCount: effectiveDayCount,
      adherence,
      currentStreak,
    });
  }

  const overallAdherence = totalEligibleOccurrences > 0
    ? Math.min(100, Math.round((totalCompletedOccurrences / totalEligibleOccurrences) * 100))
    : 0;

  return {
    startDate,
    endDate,
    dayCount: effectiveDayCount,
    totalHabits: habits.length,
    totalEligibleOccurrences,
    totalCompletedOccurrences,
    overallAdherence,
    habits: habitItems,
  };
}

/**
 * 3. getGoalProgress — Real goal and milestone progress
 */
export async function getGoalProgress(userId = "user_kidus_01") {
  await initDatabase();

  const goalsRes = await db.execute({
    sql: "SELECT * FROM goals WHERE user_id = ? ORDER BY deadline ASC",
    args: [userId],
  });
  const goals = goalsRes.rows as any[];

  const milestonesRes = await db.execute({
    sql: `SELECT m.* FROM milestones m
          JOIN goals g ON m.goal_id = g.id
          WHERE g.user_id = ?`,
    args: [userId],
  });
  const milestones = milestonesRes.rows as any[];

  const milestonesByGoal = new Map<string, any[]>();
  for (const m of milestones) {
    if (!milestonesByGoal.has(m.goal_id)) {
      milestonesByGoal.set(m.goal_id, []);
    }
    milestonesByGoal.get(m.goal_id)!.push(m);
  }

  let totalGoals = goals.length;
  let completedGoals = 0;
  let totalMilestones = milestones.length;
  let completedMilestones = 0;

  const goalsWithMilestones = goals.map((g) => {
    const ms = milestonesByGoal.get(g.id) || [];
    const mTotal = ms.length;
    const mCompleted = ms.filter((m) => m.status === "completed").length;
    completedMilestones += mCompleted;

    // Recalculate true progress from milestones if available
    let progress = Number(g.progress || 0);
    if (mTotal > 0) {
      progress = Math.round((mCompleted / mTotal) * 100);
    }

    if (progress >= 100 || g.status === "completed") {
      completedGoals++;
    }

    return {
      ...g,
      progress,
      milestones: ms,
      milestonesCount: mTotal,
      completedMilestonesCount: mCompleted,
    };
  });

  const overallGoalProgress = totalGoals > 0
    ? Math.round(goalsWithMilestones.reduce((acc, g) => acc + g.progress, 0) / totalGoals)
    : 0;

  return {
    totalGoals,
    completedGoals,
    totalMilestones,
    completedMilestones,
    overallGoalProgress,
    goals: goalsWithMilestones,
  };
}

/**
 * 4. getFinancialAnalytics — Real financial inflows, expenses, savings rate
 */
export async function getFinancialAnalytics(
  userId = "user_kidus_01",
  startDate: string,
  endDate: string
) {
  await initDatabase();

  const txRes = await db.execute({
    sql: `SELECT * FROM financial_transactions 
          WHERE user_id = ? AND date >= ? AND date <= ?
          ORDER BY date DESC`,
    args: [userId, startDate, endDate],
  });
  const transactions = txRes.rows as any[];

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalSavings = 0;
  const categoryExpenses: Record<string, number> = {};

  for (const t of transactions) {
    const amt = Number(t.amount || 0);
    if (t.type === "income") {
      totalIncome += amt;
    } else if (t.type === "expense") {
      totalExpenses += amt;
      const cat = String(t.category || "other");
      categoryExpenses[cat] = (categoryExpenses[cat] || 0) + amt;
    } else if (t.type === "savings_transfer") {
      totalSavings += amt;
    }
  }

  // If user has salary set in profile and no explicit income transactions in range, reflect monthly salary proportion
  if (totalIncome === 0) {
    const userRes = await db.execute({
      sql: "SELECT monthly_salary, currency FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });
    if (userRes.rows.length > 0) {
      const salary = Number(userRes.rows[0].monthly_salary || 30000);
      // If 30-day or month range, use monthly salary
      totalIncome = salary;
    }
  }

  // Net savings = income - expenses
  const netSavings = Math.max(0, totalIncome - totalExpenses);
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return {
    startDate,
    endDate,
    totalIncome,
    totalExpenses,
    totalSavings,
    netSavings,
    savingsRate,
    transactionCount: transactions.length,
    categoryExpenses,
  };
}

/**
 * 5. getLearningAnalytics — Real study hours and topic breakdown
 */
export async function getLearningAnalytics(
  userId = "user_kidus_01",
  startDate: string,
  endDate: string
) {
  await initDatabase();

  // Tasks completed in learning category
  const learnTasksRes = await db.execute({
    sql: `SELECT * FROM daily_tasks 
          WHERE user_id = ? AND category = 'learning' AND status = 'completed'
          AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });
  const tasks = learnTasksRes.rows as any[];

  let totalMinutes = 0;
  let softwareEngineeringMins = 0;
  let englishMins = 0;

  for (const t of tasks) {
    const mins = Number(t.actual_duration_minutes || t.duration_minutes || 0);
    totalMinutes += mins;
    const title = String(t.title || "").toLowerCase();
    if (title.includes("english") || title.includes("vocab")) {
      englishMins += mins;
    } else {
      softwareEngineeringMins += mins;
    }
  }

  // Completed learning modules
  const modulesRes = await db.execute({
    sql: `SELECT COUNT(*) as count FROM learning_modules 
          WHERE user_id = ? AND completed = 1`,
    args: [userId],
  });
  const completedModules = Number(modulesRes.rows[0]?.count || 0);

  // Vocabulary words mastered
  const vocabRes = await db.execute({
    sql: `SELECT COUNT(*) as count FROM english_vocab 
          WHERE user_id = ? AND mastery_level >= 3`,
    args: [userId],
  });
  const masteredVocab = Number(vocabRes.rows[0]?.count || 0);

  return {
    startDate,
    endDate,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    totalMinutes,
    softwareEngineeringHours: Number((softwareEngineeringMins / 60).toFixed(1)),
    englishHours: Number((englishMins / 60).toFixed(1)),
    completedSessionsCount: tasks.length,
    completedModules,
    masteredVocab,
  };
}

/**
 * 6. getSpiritualAnalytics — Morning & night prayer consistency
 */
export async function getSpiritualAnalytics(
  userId = "user_kidus_01",
  startDate: string,
  endDate: string
) {
  await initDatabase();

  const prayerRes = await db.execute({
    sql: `SELECT date, prayer_type, completed FROM prayer_logs
          WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });
  const logs = prayerRes.rows as any[];

  // Also query spiritual daily tasks
  const tasksRes = await db.execute({
    sql: `SELECT date, title, status FROM daily_tasks
          WHERE user_id = ? AND category = 'spiritual'
          AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });

  const completedPrayers = new Set<string>(); // `${date}_${type}`
  for (const l of logs) {
    if (Number(l.completed) === 1) {
      completedPrayers.add(`${l.date}_${l.prayer_type}`);
    }
  }

  for (const t of tasksRes.rows) {
    if (t.status === "completed") {
      const lower = String(t.title || "").toLowerCase();
      if (lower.includes("morning")) {
        completedPrayers.add(`${t.date}_morning`);
      } else if (lower.includes("night")) {
        completedPrayers.add(`${t.date}_night`);
      }
    }
  }

  const startD = new Date(`${startDate}T12:00:00Z`);
  const endD = new Date(`${endDate}T12:00:00Z`);
  const dayCount = Math.max(1, Math.round((endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const eligiblePrayers = dayCount * 2; // morning + night
  const totalCompleted = completedPrayers.size;
  const devotionPct = eligiblePrayers > 0 ? Math.round((totalCompleted / eligiblePrayers) * 100) : 0;

  return {
    startDate,
    endDate,
    dayCount,
    eligiblePrayers,
    completedPrayers: totalCompleted,
    devotionPct,
  };
}

/**
 * 7. getHealthAnalytics — Workouts and sleep activity
 */
export async function getHealthAnalytics(
  userId = "user_kidus_01",
  startDate: string,
  endDate: string
) {
  await initDatabase();

  const healthLogsRes = await db.execute({
    sql: `SELECT * FROM health_logs WHERE user_id = ? AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });
  const healthLogs = healthLogsRes.rows as any[];

  // Health tasks
  const workoutTasksRes = await db.execute({
    sql: `SELECT * FROM daily_tasks 
          WHERE user_id = ? AND category = 'health' AND status = 'completed'
          AND date >= ? AND date <= ?`,
    args: [userId, startDate, endDate],
  });
  const workoutTasks = workoutTasksRes.rows as any[];

  const completedWorkouts = workoutTasks.length + healthLogs.filter((h) => Number(h.workout_completed) === 1).length;
  let totalExerciseMins = workoutTasks.reduce((acc, t) => acc + Number(t.actual_duration_minutes || t.duration_minutes || 0), 0);
  for (const h of healthLogs) {
    totalExerciseMins += Number(h.workout_minutes || 0);
  }

  let avgSleep = 7.5;
  if (healthLogs.length > 0) {
    const totalSleep = healthLogs.reduce((acc, h) => acc + Number(h.sleep_hours || 7), 0);
    avgSleep = Number((totalSleep / healthLogs.length).toFixed(1));
  }

  return {
    startDate,
    endDate,
    completedWorkouts,
    totalExerciseMins,
    exerciseHours: Number((totalExerciseMins / 60).toFixed(1)),
    avgSleep,
  };
}

/**
 * 8. getForexAnalytics — Segregated backtesting, demo, prop_firm, live stats
 */
export async function getForexAnalytics(
  userId = "user_kidus_01",
  startDate?: string,
  endDate?: string
) {
  await initDatabase();

  let sql = "SELECT * FROM forex_trades WHERE user_id = ?";
  const args: any[] = [userId];

  if (startDate && endDate) {
    sql += " AND date >= ? AND date <= ?";
    args.push(startDate, endDate);
  }

  sql += " ORDER BY date DESC, created_at DESC";

  const res = await db.execute({ sql, args });
  const allTrades = res.rows as any[];

  const calculateStatsFor = (trades: any[]) => {
    const totalTrades = trades.length;
    const closedTrades = trades.filter((t) => t.outcome !== "open");
    const wins = closedTrades.filter((t) => t.outcome === "win");
    const losses = closedTrades.filter((t) => t.outcome === "loss");
    const breakevens = closedTrades.filter((t) => t.outcome === "breakeven");

    const winRate = closedTrades.length > 0
      ? Number(((wins.length / closedTrades.length) * 100).toFixed(1))
      : 0;

    let totalR = 0;
    for (const t of closedTrades) {
      totalR += Number(t.result_r || 0);
    }
    totalR = Number(totalR.toFixed(2));

    const avgR = closedTrades.length > 0
      ? Number((totalR / closedTrades.length).toFixed(2))
      : 0;

    const ruleFollowedCount = trades.filter((t) => Number(t.rules_followed) === 1).length;
    const ruleAdherenceRate = totalTrades > 0
      ? Math.round((ruleFollowedCount / totalTrades) * 100)
      : 100;

    return {
      totalTrades,
      closedTrades: closedTrades.length,
      wins: wins.length,
      losses: losses.length,
      breakevens: breakevens.length,
      winRate,
      totalR,
      avgR,
      ruleAdherenceRate,
    };
  };

  const backtestTrades = allTrades.filter((t) => t.account_type === "backtest");
  const demoTrades = allTrades.filter((t) => t.account_type === "demo");
  const propTrades = allTrades.filter((t) => t.account_type === "prop_firm");
  const liveTrades = allTrades.filter((t) => t.account_type === "live");

  return {
    totalTrades: allTrades.length,
    overall: calculateStatsFor(allTrades),
    backtest: calculateStatsFor(backtestTrades),
    demo: calculateStatsFor(demoTrades),
    propFirm: calculateStatsFor(propTrades),
    live: calculateStatsFor(liveTrades),
  };
}

/**
 * 9. getProjectAndFreelanceAnalytics — Suku and Freelance progress
 */
export async function getProjectAndFreelanceAnalytics(
  userId = "user_kidus_01",
  startDate?: string,
  endDate?: string
) {
  await initDatabase();

  const sukuRes = await db.execute({
    sql: "SELECT * FROM suku_tasks WHERE user_id = ?",
    args: [userId],
  });
  const sukuTasks = sukuRes.rows as any[];
  const sukuTotal = sukuTasks.length;
  const sukuCompleted = sukuTasks.filter((t) => t.status === "completed").length;
  const sukuInProgress = sukuTasks.filter((t) => t.status === "in_progress").length;
  const sukuBacklog = sukuTasks.filter((t) => t.status === "backlog").length;
  const sukuProgress = sukuTotal > 0 ? Math.round((sukuCompleted / sukuTotal) * 100) : 0;

  const clientsRes = await db.execute({
    sql: "SELECT * FROM freelance_clients WHERE user_id = ?",
    args: [userId],
  });
  const clients = clientsRes.rows as any[];

  const projectsRes = await db.execute({
    sql: "SELECT * FROM freelance_projects WHERE user_id = ?",
    args: [userId],
  });
  const projects = projectsRes.rows as any[];

  let totalProjectValue = 0;
  let paidEarnings = 0;
  for (const p of projects) {
    totalProjectValue += Number(p.agreed_price || 0);
    paidEarnings += Number(p.paid_amount || 0);
  }

  return {
    suku: {
      total: sukuTotal,
      completed: sukuCompleted,
      inProgress: sukuInProgress,
      backlog: sukuBacklog,
      progressPct: sukuProgress,
    },
    freelance: {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "active").length,
      totalProjects: projects.length,
      deliveredProjects: projects.filter((p) => p.status === "delivered" || p.status === "paid").length,
      totalProjectValue,
      paidEarnings,
    },
  };
}

/**
 * 10. getComprehensiveAnalysis — Combines all dimensions for the Analysis view
 */
export async function getComprehensiveAnalysis(
  userId = "user_kidus_01",
  filter = "Last 30 Days",
  timezone = "Africa/Addis_Ababa",
  customStart?: string,
  customEnd?: string
) {
  await initDatabase();
  const bounds = getDateRangeBounds(filter, timezone, customStart, customEnd);

  // Parallel fetch of all sub-analytics
  const [
    dailyTasksRes,
    prevTasksRes,
    habitStats,
    goalStats,
    financialStats,
    learningStats,
    spiritualStats,
    healthStats,
    forexStats,
    projectStats,
  ] = await Promise.all([
    db.execute({
      sql: `SELECT * FROM daily_tasks WHERE user_id = ? AND date >= ? AND date <= ? ORDER BY date ASC, start_time ASC`,
      args: [userId, bounds.startDate, bounds.endDate],
    }),
    db.execute({
      sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done 
            FROM daily_tasks WHERE user_id = ? AND date >= ? AND date <= ?`,
      args: [userId, bounds.prevStartDate, bounds.prevEndDate],
    }),
    getHabitAnalytics(userId, bounds.startDate, bounds.endDate),
    getGoalProgress(userId),
    getFinancialAnalytics(userId, bounds.startDate, bounds.endDate),
    getLearningAnalytics(userId, bounds.startDate, bounds.endDate),
    getSpiritualAnalytics(userId, bounds.startDate, bounds.endDate),
    getHealthAnalytics(userId, bounds.startDate, bounds.endDate),
    getForexAnalytics(userId, bounds.startDate, bounds.endDate),
    getProjectAndFreelanceAnalytics(userId, bounds.startDate, bounds.endDate),
  ]);

  const tasks = dailyTasksRes.rows as any[];
  const plannedTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const missedTasks = tasks.filter((t) => t.status === "missed").length;
  const skippedTasks = tasks.filter((t) => t.status === "skipped").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;

  const completionPct = plannedTasks > 0 ? Math.round((completedTasks / plannedTasks) * 100) : 0;

  // Previous period comparison
  const prevTotal = Number(prevTasksRes.rows[0]?.total || 0);
  const prevDone = Number(prevTasksRes.rows[0]?.done || 0);
  const prevCompletionPct = prevTotal > 0 ? Math.round((prevDone / prevTotal) * 100) : 0;
  const completionChange = completionPct - prevCompletionPct;

  // Day-by-day trend within range
  const daysMap = new Map<string, { total: number; completed: number }>();
  for (const t of tasks) {
    if (!daysMap.has(t.date)) {
      daysMap.set(t.date, { total: 0, completed: 0 });
    }
    const d = daysMap.get(t.date)!;
    d.total += 1;
    if (t.status === "completed") {
      d.completed += 1;
    }
  }

  const completionTrend: { date: string; dayLabel: string; total: number; completed: number; percent: number }[] = [];
  const startD = new Date(`${bounds.startDate}T12:00:00Z`);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < bounds.dayCount; i++) {
    const cur = new Date(startD);
    cur.setDate(startD.getDate() + i);
    const dStr = cur.toISOString().split("T")[0];
    const rec = daysMap.get(dStr) || { total: 0, completed: 0 };
    const pct = rec.total > 0 ? Math.round((rec.completed / rec.total) * 100) : 0;
    completionTrend.push({
      date: dStr,
      dayLabel: dayNames[cur.getDay()],
      total: rec.total,
      completed: rec.completed,
      percent: pct,
    });
  }

  // Category time allocation
  const categoryMinutes: Record<string, number> = {};
  for (const t of tasks) {
    const cat = String(t.category || "other");
    const dur = Number(t.actual_duration_minutes || t.duration_minutes || 0);
    categoryMinutes[cat] = (categoryMinutes[cat] || 0) + dur;
  }

  const hasData = plannedTasks > 0 || financialStats.transactionCount > 0 || forexStats.totalTrades > 0;

  return {
    bounds,
    hasData,
    summary: {
      plannedTasks,
      completedTasks,
      missedTasks,
      skippedTasks,
      inProgressTasks,
      completionPct,
      prevCompletionPct,
      completionChange,
    },
    completionTrend,
    categoryMinutes,
    habits: habitStats,
    goals: goalStats,
    finances: financialStats,
    learning: learningStats,
    spiritual: spiritualStats,
    health: healthStats,
    forex: forexStats,
    projects: projectStats,
  };
}

/**
 * 11. getStructuredReports — Produces the 8 unified reports
 */
export async function getStructuredReports(
  userId = "user_kidus_01",
  filter = "Last 30 Days",
  timezone = "Africa/Addis_Ababa",
  customStart?: string,
  customEnd?: string
) {
  const analysis = await getComprehensiveAnalysis(userId, filter, timezone, customStart, customEnd);
  const { bounds, summary, habits, goals, finances, learning, spiritual, health, forex, projects } = analysis;

  // Real verified achievements
  const milestonesRes = await db.execute({
    sql: `SELECT m.title, m.target_date, g.category FROM milestones m
          JOIN goals g ON m.goal_id = g.id
          WHERE g.user_id = ? AND m.status = 'completed'
          ORDER BY m.target_date DESC LIMIT 5`,
    args: [userId],
  });

  const verifiedAchievements = milestonesRes.rows.map((m: any) => ({
    title: m.title,
    category: m.category,
    date: m.target_date || "Recent",
  }));

  if (forex.overall.wins >= 5) {
    verifiedAchievements.push({
      title: `${forex.overall.wins} Forex Trades Executed at Profit`,
      category: "Forex",
      date: bounds.endDate,
    });
  }

  // 1. Daily Execution Report
  const dailyReport = {
    id: "daily_execution",
    title: "Daily Execution Report",
    periodLabel: bounds.label,
    plannedActivities: summary.plannedTasks,
    completedActivities: summary.completedTasks,
    completionPercentage: summary.completionPct,
    changeVsPrevious: summary.completionChange,
    hasEnoughData: summary.plannedTasks > 0,
    metrics: {
      missed: summary.missedTasks,
      skipped: summary.skippedTasks,
      inProgress: summary.inProgressTasks,
    },
    achievements: verifiedAchievements.slice(0, 2),
    areasForImprovement: summary.missedTasks > 0
      ? [`${summary.missedTasks} scheduled activities were missed during this period.`]
      : ["Maintain current momentum across daily transition windows."],
  };

  // 2. Weekly Performance Report
  const weeklyReport = {
    id: "weekly_performance",
    title: "Weekly Performance Report",
    periodLabel: bounds.label,
    plannedActivities: summary.plannedTasks,
    completedActivities: summary.completedTasks,
    completionPercentage: summary.completionPct,
    changeVsPrevious: summary.completionChange,
    hasEnoughData: summary.plannedTasks > 0,
    metrics: {
      weeklyAdherence: habits.overallAdherence,
      totalHabitOccurrences: habits.totalCompletedOccurrences,
    },
    achievements: verifiedAchievements.slice(0, 3),
    areasForImprovement: habits.overallAdherence < 70
      ? [`Habit adherence is currently at ${habits.overallAdherence}%. Prioritize core non-negotiable anchors.`]
      : ["Keep execution consistency sustained during weekend transitions."],
  };

  // 3. Monthly Life Progress Report
  const monthlyReport = {
    id: "monthly_progress",
    title: "Monthly Life Progress Report",
    periodLabel: bounds.label,
    plannedActivities: summary.plannedTasks,
    completedActivities: summary.completedTasks,
    completionPercentage: summary.completionPct,
    changeVsPrevious: summary.completionChange,
    hasEnoughData: summary.plannedTasks > 0,
    metrics: {
      overallGoalProgress: goals.overallGoalProgress,
      completedMilestones: goals.completedMilestones,
      totalMilestones: goals.totalMilestones,
    },
    achievements: verifiedAchievements,
    areasForImprovement: goals.overallGoalProgress < 30
      ? ["Focus on milestone delivery for high-priority sprint goals."]
      : ["Review quarterly targets and align weekly execution."],
  };

  // 4. Habit & Discipline Report
  const habitReport = {
    id: "habit_discipline",
    title: "Habit & Discipline Report",
    periodLabel: bounds.label,
    plannedActivities: habits.totalEligibleOccurrences,
    completedActivities: habits.totalCompletedOccurrences,
    completionPercentage: habits.overallAdherence,
    changeVsPrevious: 0,
    hasEnoughData: habits.totalEligibleOccurrences > 0,
    metrics: {
      totalHabits: habits.totalHabits,
      bestStreak: Math.max(...habits.habits.map((h) => h.currentStreak), 0),
    },
    achievements: habits.habits
      .filter((h) => h.currentStreak >= 3)
      .map((h) => ({ title: `${h.name}: ${h.currentStreak}-Day Streak`, category: "Habit", date: bounds.endDate })),
    areasForImprovement: habits.habits
      .filter((h) => h.adherence < 50)
      .map((h) => `${h.name} completed only ${h.adherence}% of scheduled occurrences.`),
  };

  // 5. Financial Report
  const financialReport = {
    id: "financial",
    title: "Financial Report",
    periodLabel: bounds.label,
    plannedActivities: 1, // Monthly budget maintenance
    completedActivities: finances.transactionCount > 0 ? 1 : 0,
    completionPercentage: finances.savingsRate,
    changeVsPrevious: 0,
    hasEnoughData: finances.totalIncome > 0,
    metrics: {
      totalIncome: finances.totalIncome,
      totalExpenses: finances.totalExpenses,
      netSavings: finances.netSavings,
      savingsRate: finances.savingsRate,
    },
    achievements: finances.netSavings > 0
      ? [{ title: `Generated ${finances.netSavings.toLocaleString()} ETB Net Savings`, category: "Finance", date: bounds.endDate }]
      : [],
    areasForImprovement: finances.totalExpenses > finances.totalIncome
      ? ["Total expenses exceed monthly income. Review non-essential spending."]
      : ["Allocate portion of net savings directly to emergency buffer."],
  };

  // 6. Goal Progress Report
  const goalReport = {
    id: "goal_progress",
    title: "Goal Progress Report",
    periodLabel: bounds.label,
    plannedActivities: goals.totalMilestones,
    completedActivities: goals.completedMilestones,
    completionPercentage: goals.overallGoalProgress,
    changeVsPrevious: 0,
    hasEnoughData: goals.totalGoals > 0,
    metrics: {
      totalGoals: goals.totalGoals,
      completedGoals: goals.completedGoals,
      totalMilestones: goals.totalMilestones,
      completedMilestones: goals.completedMilestones,
    },
    achievements: verifiedAchievements,
    areasForImprovement: goals.totalMilestones > goals.completedMilestones
      ? [`${goals.totalMilestones - goals.completedMilestones} milestones remaining for targeted goals.`]
      : ["All current sprint milestones completed."],
  };

  // 7. Learning & Career Report
  const learningReport = {
    id: "learning_career",
    title: "Learning & Career Report",
    periodLabel: bounds.label,
    plannedActivities: learning.completedSessionsCount + 5, // baseline
    completedActivities: learning.completedSessionsCount,
    completionPercentage: learning.totalHours > 0 ? Math.min(100, Math.round((learning.totalHours / 20) * 100)) : 0,
    changeVsPrevious: 0,
    hasEnoughData: learning.completedSessionsCount > 0,
    metrics: {
      totalHours: learning.totalHours,
      softwareEngineeringHours: learning.softwareEngineeringHours,
      englishHours: learning.englishHours,
      masteredVocab: learning.masteredVocab,
    },
    achievements: learning.totalHours >= 5
      ? [{ title: `Logged ${learning.totalHours} Focus Hours in Software & English`, category: "Learning", date: bounds.endDate }]
      : [],
    areasForImprovement: learning.totalHours < 10
      ? ["Increase dedicated technical code study blocks to meet weekly targets."]
      : ["Balance software study with active spoken English practice."],
  };

  // 8. Spiritual Consistency Report
  const spiritualReport = {
    id: "spiritual_consistency",
    title: "Spiritual Consistency Report",
    periodLabel: bounds.label,
    plannedActivities: spiritual.eligiblePrayers,
    completedActivities: spiritual.completedPrayers,
    completionPercentage: spiritual.devotionPct,
    changeVsPrevious: 0,
    hasEnoughData: spiritual.eligiblePrayers > 0,
    metrics: {
      eligiblePrayers: spiritual.eligiblePrayers,
      completedPrayers: spiritual.completedPrayers,
      devotionPct: spiritual.devotionPct,
    },
    achievements: spiritual.devotionPct >= 80
      ? [{ title: `High Devotion: ${spiritual.devotionPct}% Prayer Adherence`, category: "Spiritual", date: bounds.endDate }]
      : [],
    areasForImprovement: spiritual.devotionPct < 70
      ? ["Protect 04:00 AM and 21:15 prayer blocks from daily fatigue or screen overlap."]
      : ["Maintain peaceful reflection and gratitude journaling."],
  };

  return {
    periodLabel: bounds.label,
    startDate: bounds.startDate,
    endDate: bounds.endDate,
    reports: [
      dailyReport,
      weeklyReport,
      monthlyReport,
      habitReport,
      financialReport,
      goalReport,
      learningReport,
      spiritualReport,
    ],
    analysis,
  };
}
