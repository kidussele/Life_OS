import { db } from "./db";
import { seedInitialData } from "./seed";
import { calculateIntelligentTaskStatus, getNowInTimezone, getDailyTaskStatusSummary } from "./timeEngine";
import {
  UserProfile,
  ScheduleBlock,
  DailyTask,
  Goal,
  Milestone,
  PrayerLog,
  Habit,
  FinancialTransaction,
  FreelanceClient,
  FreelanceProject,
  SukuTask,
  ForexTrade,
  EnglishVocab,
  DailyReflection,
  NotificationItem,
  FocusSession,
  QuickCaptureItem,
  WeeklyReview,
} from "./types";

export async function ensureReady() {
  await seedInitialData();
}

// -------------------------------------------------------------
// USER & PROFILE
// -------------------------------------------------------------
export async function getUserProfile(userId = "user_kidus_01"): Promise<UserProfile | null> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM users WHERE id = ? LIMIT 1",
    args: [userId],
  });
  if (res.rows.length === 0) return null;
  return res.rows[0] as unknown as UserProfile;
}

export async function updateUserProfile(
  userId = "user_kidus_01",
  data: Partial<UserProfile>
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  args.push(userId);

  await db.execute({
    sql: `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}

// -------------------------------------------------------------
// SCHEDULE BLOCKS & SCHEDULING ENGINE
// -------------------------------------------------------------
export async function getScheduleBlocks(
  userId = "user_kidus_01",
  dayType?: string
): Promise<ScheduleBlock[]> {
  await ensureReady();
  let sql = "SELECT * FROM schedule_blocks WHERE user_id = ?";
  const args: any[] = [userId];

  if (dayType) {
    sql += " AND (day_type = ? OR day_type = 'all')";
    args.push(dayType);
  }

  sql += " ORDER BY sort_order ASC, start_time ASC";

  const res = await db.execute({ sql, args });
  return res.rows as unknown as ScheduleBlock[];
}

export async function updateScheduleBlock(
  id: string,
  data: Partial<ScheduleBlock>
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  args.push(id);

  await db.execute({
    sql: `UPDATE schedule_blocks SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}

// Evening Focus Rotation based on Day of Week:
// Monday (1): Freelancing and portfolio development
// Tuesday (2): Forex learning and backtesting
// Wednesday (3): Freelancing and client acquisition
// Thursday (4): Suku business development
// Friday (5): Forex journal and weekly strategy analysis
// Saturday (6): Deep work, software development, and business
// Sunday (0): Family, prayer, finances, weekly review, and recovery
export function getEveningRotationForDate(dateStr: string): { title: string; desc: string; category: any; goalId?: string } {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getDay(); // 0 is Sun, 1 is Mon, etc.

  switch (day) {
    case 1:
      return {
        title: "Main Development: Freelancing & Portfolio Showcase",
        desc: "Build client demonstration components, optimize portfolio case studies, refine service proposals.",
        category: "freelancing",
        goalId: "goal_90d_freelance",
      };
    case 2:
      return {
        title: "Main Development: Forex ICT Backtesting & Study",
        desc: "Backtest 10 ICT setups on EURUSD (MSS + Order Block), log R:R, study displacement candles.",
        category: "forex",
        goalId: "goal_90d_forex",
      };
    case 3:
      return {
        title: "Main Development: Freelance Client Outreach & Proposals",
        desc: "Research 5 prospect businesses, prepare personalized Next.js value propositions, follow up on leads.",
        category: "freelancing",
        goalId: "goal_90d_freelance",
      };
    case 4:
      return {
        title: "Main Development: Suku Marketplace Feature Build",
        desc: "Implement product listing, checkout flow, or merchant dashboard for Suku marketplace.",
        category: "business",
        goalId: "goal_90d_suku",
      };
    case 5:
      return {
        title: "Main Development: Forex Journal & Weekly Strategy Review",
        desc: "Analyze week's demo execution, evaluate discipline & emotions, calculate winrate and R-expectancy.",
        category: "forex",
        goalId: "goal_90d_forex",
      };
    case 6:
      return {
        title: "Deep Work: Full-Stack Engineering & Suku Architecture",
        desc: "Continuous deep-focus coding block: core backend APIs, database optimization, merchant tooling.",
        category: "development",
        goalId: "goal_90d_suku",
      };
    case 0:
    default:
      return {
        title: "Weekly Life & Financial Review + Upcoming Week Planning",
        desc: "Review weekly expenditure, balance emergency fund, plan upcoming week's priority tasks and recovery.",
        category: "planning",
        goalId: "goal_monthly_savings",
      };
  }
}

// -------------------------------------------------------------
// DAILY TASKS (MY DAY)
// -------------------------------------------------------------
export async function getDailyTasks(
  userId = "user_kidus_01",
  dateStr: string,
  timezone?: string
): Promise<DailyTask[]> {
  await ensureReady();

  // Resolve user's active local timezone
  let tz = timezone;
  if (!tz) {
    const userRes = await db.execute({
      sql: "SELECT timezone FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });
    tz = (userRes.rows[0]?.timezone as string) || "Africa/Addis_Ababa";
  }

  const now = getNowInTimezone(tz);

  const annotateStatus = (t: any): DailyTask => {
    const dynamicStatus = calculateIntelligentTaskStatus(
      {
        date: t.date,
        start_time: t.start_time,
        end_time: t.end_time,
        status: t.status,
        completed_at: t.completed_at,
      },
      now.dateStr,
      now.time24
    );

    return {
      ...t,
      status: dynamicStatus,
    };
  };

  // Check if tasks exist for this date
  const res = await db.execute({
    sql: "SELECT * FROM daily_tasks WHERE user_id = ? AND date = ? ORDER BY start_time ASC",
    args: [userId, dateStr],
  });

  if (res.rows.length > 0) {
    return (res.rows as unknown as DailyTask[]).map(annotateStatus);
  }

  // Auto-generate tasks from schedule blocks for this date
  const d = new Date(dateStr + "T12:00:00Z");
  const dayOfWeek = d.getDay();
  let dayType: string = "weekday";
  if (dayOfWeek === 6) dayType = "saturday";
  else if (dayOfWeek === 0) dayType = "sunday";

  const blocks = await getScheduleBlocks(userId, dayType);
  const eveningFocus = getEveningRotationForDate(dateStr);

  const generatedTasks: DailyTask[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let title = b.title;
    let instructions = b.description;
    let category = b.category;
    let goalId: string | null = null;

    if (b.title === "Main Development Session" && dayType === "weekday") {
      title = eveningFocus.title;
      instructions = eveningFocus.desc;
      category = eveningFocus.category;
      goalId = eveningFocus.goalId || null;
    }

    if (b.title.includes("Morning Prayer") || b.title.includes("Night Prayer")) {
      goalId = "goal_90d_spiritual";
    }

    const taskId = `task_${dateStr}_${i + 1}`;
    await db.execute({
      sql: `INSERT INTO daily_tasks (
        id, user_id, goal_id, title, instructions, category, date,
        start_time, end_time, duration_minutes, priority, status, is_protected
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?)`,
      args: [
        taskId,
        userId,
        goalId,
        title,
        instructions,
        category,
        dateStr,
        b.start_time,
        b.end_time,
        b.duration_minutes,
        b.is_protected ? "high" : "medium",
        b.is_protected,
      ],
    });

    generatedTasks.push({
      id: taskId,
      user_id: userId,
      goal_id: goalId,
      title,
      instructions,
      category,
      date: dateStr,
      start_time: b.start_time,
      end_time: b.end_time,
      duration_minutes: b.duration_minutes,
      priority: b.is_protected ? "high" : "medium",
      status: "upcoming",
      is_protected: b.is_protected,
      created_at: new Date().toISOString(),
    });
  }

  return generatedTasks.map(annotateStatus);
}

export async function updateDailyTask(
  taskId: string,
  data: Partial<DailyTask>
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  args.push(taskId);

  await db.execute({
    sql: `UPDATE daily_tasks SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  // If status was updated, recalculate linked goal progress
  if (data.status) {
    try {
      const taskRes = await db.execute({
        sql: "SELECT goal_id FROM daily_tasks WHERE id = ?",
        args: [taskId],
      });
      const goalId = taskRes.rows[0]?.goal_id as string;
      if (goalId) {
        const statsRes = await db.execute({
          sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE goal_id = ?",
          args: [goalId],
        });
        const total = Number(statsRes.rows[0]?.total || 0);
        const done = Number(statsRes.rows[0]?.done || 0);
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        await db.execute({
          sql: "UPDATE goals SET progress = ?, status = CASE WHEN ? = 100 THEN 'completed' ELSE 'in_progress' END WHERE id = ?",
          args: [progress, progress, goalId],
        });
      }
    } catch (_) {}
  }
}

export async function createDailyTask(task: Omit<DailyTask, "id" | "created_at">): Promise<DailyTask> {
  await ensureReady();
  const id = `task_custom_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO daily_tasks (
      id, user_id, goal_id, title, instructions, category, date,
      start_time, end_time, duration_minutes, priority, status, is_protected, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      task.user_id,
      task.goal_id || null,
      task.title,
      task.instructions || "",
      task.category,
      task.date,
      task.start_time,
      task.end_time,
      task.duration_minutes,
      task.priority || "medium",
      task.status || "upcoming",
      task.is_protected ? 1 : 0,
      task.notes || null,
    ],
  });

  return {
    ...task,
    id,
    created_at: new Date().toISOString(),
  };
}

export async function rescheduleTask(
  taskId: string,
  newDate: string,
  newStartTime: string,
  newEndTime: string,
  reason: string
): Promise<void> {
  await ensureReady();
  await db.execute({
    sql: `UPDATE daily_tasks SET
      date = ?, start_time = ?, end_time = ?,
      status = 'rescheduled', reschedule_reason = ?
      WHERE id = ?`,
    args: [newDate, newStartTime, newEndTime, reason, taskId],
  });
}

// -------------------------------------------------------------
// PRAYER LOGS & DEVOTION
// -------------------------------------------------------------
export async function getPrayerLogs(
  userId = "user_kidus_01",
  dateStr?: string
): Promise<PrayerLog[]> {
  await ensureReady();
  let sql = "SELECT * FROM prayer_logs WHERE user_id = ?";
  const args: any[] = [userId];

  if (dateStr) {
    sql += " AND date = ?";
    args.push(dateStr);
  }

  sql += " ORDER BY date DESC, scheduled_time ASC";

  const res = await db.execute({ sql, args });
  return res.rows as unknown as PrayerLog[];
}

export async function savePrayerLog(log: Omit<PrayerLog, "id">): Promise<void> {
  await ensureReady();
  const id = `pl_${log.prayer_type}_${log.date}`;
  await db.execute({
    sql: `INSERT INTO prayer_logs (
      id, user_id, date, prayer_type, scheduled_time, duration_minutes,
      completed, completed_at, reflection_notes, gratitude_notes, spiritual_focus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date, prayer_type) DO UPDATE SET
      completed = excluded.completed,
      completed_at = excluded.completed_at,
      reflection_notes = excluded.reflection_notes,
      gratitude_notes = excluded.gratitude_notes,
      spiritual_focus = excluded.spiritual_focus`,
    args: [
      id,
      log.user_id,
      log.date,
      log.prayer_type,
      log.scheduled_time,
      log.duration_minutes || 30,
      log.completed ? 1 : 0,
      log.completed_at || null,
      log.reflection_notes || null,
      log.gratitude_notes || null,
      log.spiritual_focus || null,
    ],
  });

  // Cross-system sync: update goal_90d_spiritual progress
  try {
    const pRes = await db.execute({
      sql: "SELECT COUNT(*) as done FROM prayer_logs WHERE user_id = ? AND completed = 1 AND date >= '2026-11-02'",
      args: [log.user_id],
    });
    const donePrayers = Number(pRes.rows[0]?.done || 0);
    const pProgress = Math.min(100, Math.round((donePrayers / 60) * 100));
    await db.execute({
      sql: "UPDATE goals SET current_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_spiritual' OR category = 'spiritual')",
      args: [donePrayers, pProgress, pProgress, log.user_id],
    });
  } catch (_) {}
}

// -------------------------------------------------------------
// GOALS & MILESTONES
// -------------------------------------------------------------
export async function getGoals(userId = "user_kidus_01"): Promise<Goal[]> {
  await ensureReady();
  const goalsRes = await db.execute({
    sql: "SELECT * FROM goals WHERE user_id = ? ORDER BY priority DESC, deadline ASC",
    args: [userId],
  });

  const goals = goalsRes.rows as unknown as Goal[];

  const milestonesRes = await db.execute({
    sql: `SELECT m.* FROM milestones m
          JOIN goals g ON m.goal_id = g.id
          WHERE g.user_id = ?
          ORDER BY m.sort_order ASC, m.target_date ASC`,
    args: [userId],
  });

  const milestones = milestonesRes.rows as unknown as Milestone[];

  for (const g of goals) {
    g.milestones = milestones.filter((m) => m.goal_id === g.id);
  }

  return goals;
}

export async function createGoal(goal: Omit<Goal, "id" | "created_at">): Promise<string> {
  await ensureReady();
  const id = `goal_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO goals (
      id, user_id, title, description, category, reason, tier,
      parent_goal_id, start_date, deadline, priority, progress, status, completion_criteria
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      goal.user_id,
      goal.title,
      goal.description || "",
      goal.category,
      goal.reason || "",
      goal.tier,
      goal.parent_goal_id || null,
      goal.start_date,
      goal.deadline,
      goal.priority || "medium",
      goal.progress || 0,
      goal.status || "in_progress",
      goal.completion_criteria || "",
    ],
  });
  return id;
}

export async function updateGoal(id: string, data: Partial<Goal>): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "milestones" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  args.push(id);

  await db.execute({
    sql: `UPDATE goals SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function createMilestone(m: Omit<Milestone, "id">): Promise<void> {
  await ensureReady();
  const id = `m_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO milestones (id, goal_id, title, target_date, status, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, m.goal_id, m.title, m.target_date, m.status || "pending", m.sort_order || 0],
  });
}

export async function toggleMilestone(milestoneId: string, status: "pending" | "completed"): Promise<void> {
  await updateMilestoneStatus(milestoneId, status);
}

// -------------------------------------------------------------
// HABITS & DISCIPLINE
// -------------------------------------------------------------
export async function getHabitsWithTodayStatus(
  userId = "user_kidus_01",
  dateStr: string
): Promise<Habit[]> {
  await ensureReady();
  const habitsRes = await db.execute({
    sql: "SELECT * FROM habits WHERE user_id = ? AND is_active = 1",
    args: [userId],
  });

  const habits = habitsRes.rows as unknown as Habit[];

  const logsRes = await db.execute({
    sql: `SELECT hl.habit_id, hl.completed
          FROM habit_logs hl
          JOIN habits h ON hl.habit_id = h.id
          WHERE h.user_id = ? AND hl.date = ?`,
    args: [userId, dateStr],
  });

  const logsMap = new Map<string, number>();
  for (const row of logsRes.rows) {
    logsMap.set(String(row.habit_id), Number(row.completed));
  }

  // Calculate streaks
  for (const h of habits) {
    h.completed_today = (logsMap.get(h.id) ?? 0) === 1;

    // Approximate recent streak (last 7 days completed count)
    const streakRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ? AND completed = 1`,
      args: [h.id],
    });
    h.current_streak = Number(streakRes.rows[0]?.count || 0);
  }

  return habits;
}

export async function toggleHabitLog(
  habitId: string,
  dateStr: string,
  completed: boolean,
  userId = "user_kidus_01"
): Promise<void> {
  await ensureReady();
  const id = `hl_${habitId}_${dateStr}`;
  await db.execute({
    sql: `INSERT INTO habit_logs (id, habit_id, date, completed)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed`,
    args: [id, habitId, dateStr, completed ? 1 : 0],
  });

  // Cross-synchronize matching daily task on that date
  const habitKeywords: Record<string, string> = {
    h_m_prayer: "Morning Prayer",
    h_n_prayer: "Night Prayer",
    h_exercise: "Exercise",
    h_english: "English",
    h_prof_learn: "Professional",
    h_work: "Employment",
    h_dev_session: "Development Session",
    h_family: "Family",
    h_fin_track: "Planning",
    h_sleep: "Sleep",
  };

  const kw = habitKeywords[habitId];
  if (kw) {
    await db.execute({
      sql: `UPDATE daily_tasks SET status = ?, completed_at = ?
            WHERE user_id = ? AND date = ? AND title LIKE ?`,
      args: [
        completed ? "completed" : "upcoming",
        completed ? new Date().toISOString() : null,
        userId,
        dateStr,
        `%${kw}%`,
      ],
    });
  }

  // Cross-synchronize prayer logs if prayer habit
  if (habitId === "h_m_prayer") {
    await savePrayerLog({
      user_id: userId,
      date: dateStr,
      prayer_type: "morning",
      scheduled_time: "04:00",
      duration_minutes: 30,
      completed: completed ? 1 : 0,
      completed_at: completed ? new Date().toISOString() : null,
    });
  } else if (habitId === "h_n_prayer") {
    await savePrayerLog({
      user_id: userId,
      date: dateStr,
      prayer_type: "night",
      scheduled_time: "21:15",
      duration_minutes: 30,
      completed: completed ? 1 : 0,
      completed_at: completed ? new Date().toISOString() : null,
    });
  } else if (habitId === "h_exercise") {
    await saveHealthLog({
      user_id: userId,
      date: dateStr,
      workout_completed: completed ? 1 : 0,
      workout_title: "Exercise & Mobility Routine",
      workout_minutes: 30,
    });
  }
}

// -------------------------------------------------------------
// FINANCIAL TRANSACTIONS & SUMMARY
// -------------------------------------------------------------
export async function syncFinancialGoalsAndJourney(userId = "user_kidus_01"): Promise<void> {
  await ensureReady();
  const summary = await getFinancialSummary(userId);
  const emergencyFund = summary.emergencyFund;

  // Single source of truth update for Emergency Fund Goal
  const goalRes = await db.execute({
    sql: "SELECT id, target_value FROM goals WHERE user_id = ? AND (id = 'goal_monthly_savings' OR id = 'goal_emergency_fund' OR title LIKE '%Emergency%') LIMIT 1",
    args: [userId],
  });

  if (goalRes.rows.length > 0) {
    const goal = goalRes.rows[0];
    const target = Number(goal.target_value || 15000);
    const progress = target > 0 ? Math.min(100, Math.round((emergencyFund / target) * 100)) : 0;
    const status = progress >= 100 ? "completed" : "in_progress";

    await db.execute({
      sql: "UPDATE goals SET current_value = ?, progress = ?, status = ? WHERE id = ?",
      args: [emergencyFund, progress, status, goal.id],
    });
  }

  // Journey Profile savings synchronization
  await db.execute({
    sql: "UPDATE journey_profile SET current_savings = ?, updated_at = datetime('now') WHERE user_id = ?",
    args: [emergencyFund, userId],
  });
}

export async function getFinancialTransactions(
  userId = "user_kidus_01"
): Promise<FinancialTransaction[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM financial_transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC",
    args: [userId],
  });
  return res.rows as unknown as FinancialTransaction[];
}

export async function createFinancialTransaction(
  tx: Omit<FinancialTransaction, "id" | "created_at">
): Promise<void> {
  await ensureReady();
  const id = `tx_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO financial_transactions (id, user_id, date, type, category, amount, currency, description, bucket)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      tx.user_id,
      tx.date,
      tx.type,
      tx.category,
      tx.amount,
      tx.currency || "ETB",
      tx.description,
      tx.bucket || "personal",
    ],
  });

  await syncFinancialGoalsAndJourney(tx.user_id);
}

export async function getFinancialSummary(userId = "user_kidus_01") {
  await ensureReady();
  const txs = await getFinancialTransactions(userId);
  let totalIncome = 0;
  let totalExpenses = 0;
  let emergencyFund = 0;
  let familyContributions = 0;

  for (const t of txs) {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else if (t.type === "expense") {
      totalExpenses += t.amount;
      if (t.category === "family_contribution") {
        familyContributions += t.amount;
      }
    } else if (t.type === "savings_transfer") {
      emergencyFund += t.amount;
    }
  }

  const netBalance = totalIncome - totalExpenses - emergencyFund;
  return {
    totalIncome,
    totalExpenses,
    emergencyFund,
    familyContributions,
    netBalance,
    currency: "ETB",
  };
}

export async function deleteFinancialTransaction(id: string): Promise<void> {
  await ensureReady();
  const txRes = await db.execute({
    sql: "SELECT user_id FROM financial_transactions WHERE id = ? LIMIT 1",
    args: [id],
  });
  const userId = (txRes.rows[0]?.user_id as string) || "user_kidus_01";

  await db.execute({
    sql: "DELETE FROM financial_transactions WHERE id = ?",
    args: [id],
  });

  await syncFinancialGoalsAndJourney(userId);
}

// -------------------------------------------------------------
// FREELANCING
// -------------------------------------------------------------
export async function getFreelanceData(userId = "user_kidus_01") {
  await ensureReady();
  const clientsRes = await db.execute({
    sql: "SELECT * FROM freelance_clients WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });

  const projectsRes = await db.execute({
    sql: `SELECT p.*, c.name as client_name
          FROM freelance_projects p
          LEFT JOIN freelance_clients c ON p.client_id = c.id
          WHERE p.user_id = ?
          ORDER BY p.deadline ASC`,
    args: [userId],
  });

  return {
    clients: clientsRes.rows as unknown as FreelanceClient[],
    projects: projectsRes.rows as unknown as FreelanceProject[],
  };
}

export async function createFreelanceClient(client: Partial<FreelanceClient> & { user_id: string; name: string }): Promise<string> {
  await ensureReady();
  const id = client.id || `fc_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO freelance_clients (id, user_id, name, company, contact_info, status, service_offered, estimated_value, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      client.user_id,
      client.name,
      client.company || "",
      client.contact_info || "",
      client.status || "lead",
      client.service_offered || "",
      client.estimated_value || 0,
      client.notes || "",
    ],
  });
  return id;
}

export async function createFreelanceProject(project: Partial<FreelanceProject> & { user_id: string; title: string; agreed_price: number; deadline: string; deliverables: string }): Promise<string> {
  await ensureReady();
  const id = project.id || `fp_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO freelance_projects (id, user_id, client_id, title, description, agreed_price, deadline, status, deliverables)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      project.user_id,
      project.client_id || null,
      project.title,
      project.description || "",
      project.agreed_price,
      project.deadline,
      project.status || "planning",
      project.deliverables,
    ],
  });
  return id;
}

// -------------------------------------------------------------
// SUKU BUSINESS
// -------------------------------------------------------------
export async function getSukuTasks(userId = "user_kidus_01"): Promise<SukuTask[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM suku_tasks WHERE user_id = ? ORDER BY priority DESC, target_date ASC",
    args: [userId],
  });
  return res.rows as unknown as SukuTask[];
}

export async function createSukuTask(task: Partial<SukuTask> & { user_id: string; area: any; title: string; target_date: string }): Promise<string> {
  await ensureReady();
  const id = task.id || `suku_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO suku_tasks (id, user_id, area, title, description, priority, status, target_date, stage_id)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      task.user_id,
      task.area,
      task.title,
      task.description,
      task.priority || "medium",
      task.status || "backlog",
      task.target_date,
      task.stage_id || 1,
    ],
  });
  return id;
}

export async function updateSukuTask(id: string, data: Partial<SukuTask>): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  args.push(id);

  await db.execute({
    sql: `UPDATE suku_tasks SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  // Cross-system sync: update goal_90d_suku and journey profile
  try {
    const taskRes = await db.execute({
      sql: "SELECT user_id, stage_id FROM suku_tasks WHERE id = ? LIMIT 1",
      args: [id],
    });
    const userId = (taskRes.rows[0]?.user_id as string) || "user_kidus_01";
    const statsRes = await db.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM suku_tasks WHERE user_id = ?",
      args: [userId],
    });
    const total = Number(statsRes.rows[0]?.total || 0);
    const done = Number(statsRes.rows[0]?.done || 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await db.execute({
      sql: "UPDATE goals SET current_value = ?, target_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_suku' OR category = 'business')",
      args: [done, total, progress, progress, userId],
    });

    await db.execute({
      sql: "UPDATE journey_profile SET suku_status = ?, updated_at = datetime('now') WHERE user_id = ?",
      args: [`${done}/${total} MVP stages completed`, userId],
    });
  } catch (_) {}
}

export async function deleteSukuTask(id: string): Promise<void> {
  await ensureReady();
  const taskRes = await db.execute({
    sql: "SELECT user_id FROM suku_tasks WHERE id = ? LIMIT 1",
    args: [id],
  });
  const userId = (taskRes.rows[0]?.user_id as string) || "user_kidus_01";

  await db.execute({
    sql: "DELETE FROM suku_tasks WHERE id = ?",
    args: [id],
  });

  try {
    const statsRes = await db.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM suku_tasks WHERE user_id = ?",
      args: [userId],
    });
    const total = Number(statsRes.rows[0]?.total || 0);
    const done = Number(statsRes.rows[0]?.done || 0);
    const progress = total > 0 ? Math.round((done / total) * 100) : 0;

    await db.execute({
      sql: "UPDATE goals SET current_value = ?, target_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_suku' OR category = 'business')",
      args: [done, total, progress, progress, userId],
    });

    await db.execute({
      sql: "UPDATE journey_profile SET suku_status = ?, updated_at = datetime('now') WHERE user_id = ?",
      args: [`${done}/${total} MVP stages completed`, userId],
    });
  } catch (_) {}
}

// -------------------------------------------------------------
// FOREX TRADING JOURNAL (ICT METHODOLOGY)
// -------------------------------------------------------------
export async function getForexTrades(userId = "user_kidus_01"): Promise<ForexTrade[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM forex_trades WHERE user_id = ? ORDER BY date DESC, created_at DESC",
    args: [userId],
  });
  return res.rows as unknown as ForexTrade[];
}

export async function getForexSummary(userId = "user_kidus_01") {
  await ensureReady();
  const trades = await getForexTrades(userId);
  const closedTrades = trades.filter((t) => t.outcome !== "open");
  const wins = closedTrades.filter((t) => t.outcome === "win");
  const losses = closedTrades.filter((t) => t.outcome === "loss");
  const winRate = closedTrades.length > 0 ? Number(((wins.length / closedTrades.length) * 100).toFixed(1)) : 0;

  let totalR = 0;
  let grossProfitR = 0;
  let grossLossR = 0;

  for (const t of closedTrades) {
    const r = Number(t.result_r || 0);
    totalR += r;
    if (r > 0) grossProfitR += r;
    if (r < 0) grossLossR += Math.abs(r);
  }

  const profitFactor = grossLossR > 0 ? Number((grossProfitR / grossLossR).toFixed(2)) : grossProfitR > 0 ? grossProfitR : 0;

  return {
    trades,
    stats: {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      wins: wins.length,
      losses: losses.length,
      winRate,
      totalR: Number(totalR.toFixed(2)),
      profitFactor,
    },
  };
}

export async function syncForexGoalAndJourney(userId = "user_kidus_01"): Promise<void> {
  try {
    const statsRes = await db.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN outcome = 'win' THEN 1 ELSE 0 END) as wins, SUM(COALESCE(result_r, 0)) as total_r FROM forex_trades WHERE user_id = ? AND outcome != 'open'",
      args: [userId],
    });
    const totalClosed = Number(statsRes.rows[0]?.total || 0);
    const totalR = Number(statsRes.rows[0]?.total_r || 0);
    const progress = Math.min(100, Math.round((totalClosed / 100) * 100));

    await db.execute({
      sql: "UPDATE goals SET current_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_forex' OR category = 'forex')",
      args: [totalClosed, progress, progress, userId],
    });

    await db.execute({
      sql: "UPDATE journey_profile SET forex_status = ?, updated_at = datetime('now') WHERE user_id = ?",
      args: [`${totalClosed}/100 ICT backtest trades logged. Total R: ${totalR >= 0 ? '+' : ''}${totalR.toFixed(1)}R`, userId],
    });
  } catch (_) {}
}

export async function createForexTrade(trade: Partial<ForexTrade> & { user_id: string; pair: string; direction: any; entry_price: number; stop_loss: number; take_profit: number; date: string }): Promise<string> {
  await ensureReady();
  const id = trade.id || `fx_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO forex_trades (
      id, user_id, account_type, pair, direction, setup_model, session,
      entry_price, stop_loss, take_profit, exit_price, risk_reward_ratio,
      result_r, outcome, emotional_state, rules_followed, notes, date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      trade.user_id,
      trade.account_type,
      trade.pair,
      trade.direction,
      trade.setup_model,
      trade.session,
      trade.entry_price,
      trade.stop_loss,
      trade.take_profit,
      trade.exit_price || null,
      trade.risk_reward_ratio,
      trade.result_r !== undefined ? trade.result_r : null,
      trade.outcome || "open",
      trade.emotional_state,
      trade.rules_followed ? 1 : 0,
      trade.notes || "",
      trade.date,
    ],
  });

  await syncForexGoalAndJourney(trade.user_id);
  return id;
}

export async function deleteForexTrade(id: string): Promise<void> {
  await ensureReady();
  const tRes = await db.execute({
    sql: "SELECT user_id FROM forex_trades WHERE id = ? LIMIT 1",
    args: [id],
  });
  const userId = (tRes.rows[0]?.user_id as string) || "user_kidus_01";

  await db.execute({
    sql: "DELETE FROM forex_trades WHERE id = ?",
    args: [id],
  });

  await syncForexGoalAndJourney(userId);
}

// -------------------------------------------------------------
// ENGLISH VOCABULARY & LEARNING
// -------------------------------------------------------------
export async function getEnglishVocab(userId = "user_kidus_01"): Promise<EnglishVocab[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM english_vocab WHERE user_id = ? ORDER BY created_at DESC",
    args: [userId],
  });
  return res.rows as unknown as EnglishVocab[];
}

export async function createEnglishVocab(v: Omit<EnglishVocab, "id" | "created_at">): Promise<void> {
  await ensureReady();
  const id = `vocab_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO english_vocab (id, user_id, word_phrase, definition, example_sentence, mastery_level)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [id, v.user_id, v.word_phrase, v.definition, v.example_sentence, v.mastery_level || 1],
  });
}

// -------------------------------------------------------------
// DAILY REFLECTIONS
// -------------------------------------------------------------
export async function getDailyReflection(userId = "user_kidus_01", dateStr: string): Promise<DailyReflection | null> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM daily_reflections WHERE user_id = ? AND date = ? LIMIT 1",
    args: [userId, dateStr],
  });
  if (res.rows.length === 0) return null;
  return res.rows[0] as unknown as DailyReflection;
}

export async function saveDailyReflection(reflection: Omit<DailyReflection, "id" | "created_at">): Promise<void> {
  await ensureReady();
  const id = `refl_${reflection.date}`;
  await db.execute({
    sql: `INSERT INTO daily_reflections (
      id, user_id, date, morning_intention, evening_wins, evening_improvements, energy_rating, discipline_rating
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      morning_intention = excluded.morning_intention,
      evening_wins = excluded.evening_wins,
      evening_improvements = excluded.evening_improvements,
      energy_rating = excluded.energy_rating,
      discipline_rating = excluded.discipline_rating`,
    args: [
      id,
      reflection.user_id,
      reflection.date,
      reflection.morning_intention || "",
      reflection.evening_wins || "",
      reflection.evening_improvements || "",
      reflection.energy_rating || 3,
      reflection.discipline_rating || 3,
    ],
  });
}

// -------------------------------------------------------------
// NOTIFICATIONS
// -------------------------------------------------------------
export async function getNotifications(userId = "user_kidus_01"): Promise<NotificationItem[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM notifications WHERE user_id = ? ORDER BY is_read ASC, created_at DESC LIMIT 20",
    args: [userId],
  });
  return res.rows as unknown as NotificationItem[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await ensureReady();
  await db.execute({
    sql: "UPDATE notifications SET is_read = 1 WHERE id = ?",
    args: [id],
  });
}

// -------------------------------------------------------------
// MILESTONE TOGGLE & RECALCULATE GOAL PROGRESS
// -------------------------------------------------------------
export async function updateMilestoneStatus(
  milestoneId: string,
  status: "pending" | "completed"
): Promise<{ goalId: string; newProgress: number }> {
  await ensureReady();
  // 1. Update milestone
  await db.execute({
    sql: "UPDATE milestones SET status = ? WHERE id = ?",
    args: [status, milestoneId],
  });

  // 2. Find parent goal
  const mRes = await db.execute({
    sql: "SELECT goal_id FROM milestones WHERE id = ? LIMIT 1",
    args: [milestoneId],
  });
  const goalId = mRes.rows[0]?.goal_id as string;

  if (goalId) {
    // 3. Recalculate progress based on all milestones for this goal
    const allM = await db.execute({
      sql: "SELECT status FROM milestones WHERE goal_id = ?",
      args: [goalId],
    });
    if (allM.rows.length > 0) {
      const completedCount = allM.rows.filter((r) => r.status === "completed").length;
      const newProgress = Math.round((completedCount / allM.rows.length) * 100);
      const goalStatus = newProgress >= 100 ? "completed" : "in_progress";
      await db.execute({
        sql: "UPDATE goals SET progress = ?, status = ? WHERE id = ?",
        args: [newProgress, goalStatus, goalId],
      });
      return { goalId, newProgress };
    }
  }
  return { goalId: goalId || "", newProgress: 0 };
}

// -------------------------------------------------------------
// FREELANCE CLIENT & PROJECT UPDATES (AUTOMATIC INCOME SYNC)
// -------------------------------------------------------------
export async function updateFreelanceClient(
  clientId: string,
  data: Partial<FreelanceClient>
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }
  if (fields.length === 0) return;
  args.push(clientId);
  await db.execute({
    sql: `UPDATE freelance_clients SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function updateFreelanceProject(
  projectId: string,
  data: Partial<FreelanceProject> & { paid_amount?: number; deliverables_completed?: number; deliverables_total?: number }
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }
  if (fields.length === 0) return;
  args.push(projectId);

  // Check previous status before updating
  const prevRes = await db.execute({
    sql: "SELECT user_id, title, agreed_price, status FROM freelance_projects WHERE id = ? LIMIT 1",
    args: [projectId],
  });
  const prevProject = prevRes.rows[0];

  await db.execute({
    sql: `UPDATE freelance_projects SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  // If status changed to 'paid' and was not previously 'paid', automatically register income transaction!
  if (data.status === "paid" && prevProject && prevProject.status !== "paid") {
    const amount = Number(data.agreed_price || prevProject.agreed_price || 0);
    if (amount > 0) {
      const todayStr = new Date().toISOString().split("T")[0];
      await createFinancialTransaction({
        user_id: prevProject.user_id as string,
        date: todayStr,
        type: "income",
        category: "freelance",
        amount,
        currency: "ETB",
        description: `Freelance Revenue: ${prevProject.title}`,
        bucket: "business",
      });
    }
  }

  // Sync Freelancing Goal & Journey Profile
  if (prevProject) {
    try {
      const fRes = await db.execute({
        sql: `SELECT COUNT(*) as total_projects,
                     SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_projects,
                     SUM(CASE WHEN status = 'paid' THEN agreed_price ELSE 0 END) as paid_revenue
              FROM freelance_projects WHERE user_id = ?`,
        args: [prevProject.user_id],
      });
      const paidCount = Number(fRes.rows[0]?.paid_projects || 0);
      const paidRev = Number(fRes.rows[0]?.paid_revenue || 0);
      const fProgress = Math.min(100, Math.round((paidCount / 3) * 100)); // Target 3 clients

      await db.execute({
        sql: "UPDATE goals SET current_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_freelance' OR category = 'freelancing')",
        args: [paidCount, fProgress, fProgress, prevProject.user_id],
      });

      await db.execute({
        sql: "UPDATE journey_profile SET freelance_status = ?, updated_at = datetime('now') WHERE user_id = ?",
        args: [`${paidCount} paid clients (${paidRev.toLocaleString()} ETB revenue)`, prevProject.user_id],
      });
    } catch (_) {}
  }
}

// -------------------------------------------------------------
// FOREX TRADE UPDATE
// -------------------------------------------------------------
export async function updateForexTrade(
  tradeId: string,
  data: Partial<ForexTrade>
): Promise<void> {
  await ensureReady();
  const fields: string[] = [];
  const args: any[] = [];
  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }
  if (fields.length === 0) return;
  args.push(tradeId);

  const tRes = await db.execute({
    sql: "SELECT user_id FROM forex_trades WHERE id = ? LIMIT 1",
    args: [tradeId],
  });
  const userId = (tRes.rows[0]?.user_id as string) || "user_kidus_01";

  await db.execute({
    sql: `UPDATE forex_trades SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });

  await syncForexGoalAndJourney(userId);
}

// -------------------------------------------------------------
// HEALTH LOGS
// -------------------------------------------------------------
export async function getHealthLogs(userId = "user_kidus_01", dateStr?: string) {
  await ensureReady();
  let sql = "SELECT * FROM health_logs WHERE user_id = ?";
  const args: any[] = [userId];
  if (dateStr) {
    sql += " AND date = ?";
    args.push(dateStr);
  }
  sql += " ORDER BY date DESC LIMIT 30";
  const res = await db.execute({ sql, args });
  return res.rows;
}

export async function saveHealthLog(log: {
  user_id: string;
  date: string;
  sleep_hours?: number;
  sleep_quality?: number;
  workout_completed?: number;
  workout_title?: string;
  workout_minutes?: number;
  recovery_score?: number;
  hydration_glasses?: number;
  notes?: string;
}): Promise<void> {
  await ensureReady();
  const id = `hl_${log.date}`;
  await db.execute({
    sql: `INSERT INTO health_logs (
      id, user_id, date, sleep_hours, sleep_quality, workout_completed,
      workout_title, workout_minutes, recovery_score, hydration_glasses, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      sleep_hours = coalesce(excluded.sleep_hours, health_logs.sleep_hours),
      sleep_quality = coalesce(excluded.sleep_quality, health_logs.sleep_quality),
      workout_completed = coalesce(excluded.workout_completed, health_logs.workout_completed),
      workout_title = coalesce(excluded.workout_title, health_logs.workout_title),
      workout_minutes = coalesce(excluded.workout_minutes, health_logs.workout_minutes),
      recovery_score = coalesce(excluded.recovery_score, health_logs.recovery_score),
      hydration_glasses = coalesce(excluded.hydration_glasses, health_logs.hydration_glasses),
      notes = coalesce(excluded.notes, health_logs.notes)`,
    args: [
      id,
      log.user_id,
      log.date,
      log.sleep_hours ?? 7.0,
      log.sleep_quality ?? 85,
      log.workout_completed ?? 0,
      log.workout_title ?? null,
      log.workout_minutes ?? 0,
      log.recovery_score ?? 90,
      log.hydration_glasses ?? 6,
      log.notes ?? null,
    ],
  });

  // Cross-system sync: update goal_90d_health progress (Target: 48 completed workouts)
  try {
    const hRes = await db.execute({
      sql: "SELECT COUNT(*) as done FROM health_logs WHERE user_id = ? AND workout_completed = 1 AND date >= '2026-11-02'",
      args: [log.user_id],
    });
    const doneWorkouts = Number(hRes.rows[0]?.done || 0);
    const hProgress = Math.min(100, Math.round((doneWorkouts / 48) * 100));
    await db.execute({
      sql: "UPDATE goals SET current_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_health' OR category = 'health')",
      args: [doneWorkouts, hProgress, hProgress, log.user_id],
    });
  } catch (_) {}
}

// -------------------------------------------------------------
// FAMILY LOGS
// -------------------------------------------------------------
export async function getFamilyLogs(userId = "user_kidus_01", dateStr?: string) {
  await ensureReady();
  let sql = "SELECT * FROM family_logs WHERE user_id = ?";
  const args: any[] = [userId];
  if (dateStr) {
    sql += " AND date = ?";
    args.push(dateStr);
  }
  sql += " ORDER BY date DESC, created_at DESC LIMIT 30";
  const res = await db.execute({ sql, args });
  return res.rows;
}

export async function saveFamilyLog(log: {
  user_id: string;
  date: string;
  activity_title: string;
  category?: string;
  duration_minutes?: number;
  notes?: string;
  completed?: number;
}): Promise<void> {
  await ensureReady();
  const id = `fam_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO family_logs (
      id, user_id, date, activity_title, category, duration_minutes, notes, completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      log.user_id,
      log.date,
      log.activity_title,
      log.category || "activity",
      log.duration_minutes || 30,
      log.notes || null,
      log.completed ?? 1,
    ],
  });

  // Cross-system sync: update goal_90d_family progress (Target: 12 weekly reviews & family milestones)
  try {
    const fRes = await db.execute({
      sql: "SELECT COUNT(*) as done FROM family_logs WHERE user_id = ? AND completed = 1 AND date >= '2026-11-02'",
      args: [log.user_id],
    });
    const doneFam = Number(fRes.rows[0]?.done || 0);
    const fProgress = Math.min(100, Math.round((doneFam / 12) * 100));
    await db.execute({
      sql: "UPDATE goals SET current_value = ?, progress = ?, status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END WHERE user_id = ? AND (id = 'goal_90d_family' OR category = 'family')",
      args: [doneFam, fProgress, fProgress, log.user_id],
    });
  } catch (_) {}
}

// -------------------------------------------------------------
// DYNAMIC LIFE CATEGORIES PROGRESS
// -------------------------------------------------------------
export async function getCategoryProgressOverview(userId = "user_kidus_01") {
  await ensureReady();

  // 1. Health: % of health habits & workouts completed in last 7 days
  const healthTasks = await db.execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE user_id = ? AND category = 'health'",
    args: [userId],
  });
  const hDone = Number(healthTasks.rows[0]?.done || 0);
  const hTotal = Number(healthTasks.rows[0]?.total || 0);
  const healthProgress = hTotal > 0 ? Math.round((hDone / hTotal) * 100) : 0;

  // 2. Spiritual: Prayer consistency
  const prayerCount = await db.execute({
    sql: "SELECT COUNT(*) as done FROM prayer_logs WHERE user_id = ? AND completed = 1",
    args: [userId],
  });
  const spiritualDone = Number(prayerCount.rows[0]?.done || 0);
  const spiritualProgress = Math.min(100, Math.round((spiritualDone / 60) * 100)); // Target 60 prayer sessions

  // 3. Career & Learning: Learning tasks completed
  const learningTasks = await db.execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE user_id = ? AND category = 'learning'",
    args: [userId],
  });
  const lDone = Number(learningTasks.rows[0]?.done || 0);
  const lTotal = Number(learningTasks.rows[0]?.total || 0);
  const careerProgress = lTotal > 0 ? Math.round((lDone / lTotal) * 100) : 0;

  // 4. Freelancing: Active projects & proposals
  const freelanceProjects = await db.execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status IN ('delivered', 'paid') THEN 1 ELSE 0 END) as done FROM freelance_projects WHERE user_id = ?",
    args: [userId],
  });
  const fDone = Number(freelanceProjects.rows[0]?.done || 0);
  const fTotal = Number(freelanceProjects.rows[0]?.total || 0);
  const freelanceProgress = fTotal > 0 ? Math.round((fDone / fTotal) * 100) : 0;

  // 5. Business (Suku): completed suku tasks / total
  const sukuRes = await db.execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM suku_tasks WHERE user_id = ?",
    args: [userId],
  });
  const sDone = Number(sukuRes.rows[0]?.done || 0);
  const sTotal = Number(sukuRes.rows[0]?.total || 0);
  const sukuProgress = sTotal > 0 ? Math.round((sDone / sTotal) * 100) : 0;

  // 6. Forex: Closed backtest trades vs 100 target
  const fxRes = await db.execute({
    sql: "SELECT COUNT(*) as total FROM forex_trades WHERE user_id = ? AND outcome != 'open'",
    args: [userId],
  });
  const fxDone = Number(fxRes.rows[0]?.total || 0);
  const forexProgress = Math.min(100, Math.round((fxDone / 100) * 100));

  // 7. Finance: Emergency fund vs 15,000 ETB initial target
  const finSummary = await getFinancialSummary(userId);
  const emergencyTarget = 15000;
  const financeProgress = Math.min(100, Math.round((finSummary.emergencyFund / emergencyTarget) * 100));

  // 8. Family: Family commitments honored
  const famTasks = await db.execute({
    sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE user_id = ? AND category = 'family'",
    args: [userId],
  });
  const famDone = Number(famTasks.rows[0]?.done || 0);
  const famTotal = Number(famTasks.rows[0]?.total || 0);
  const familyProgress = famTotal > 0 ? Math.round((famDone / famTotal) * 100) : 0;

  return {
    health: healthProgress,
    spiritual: spiritualProgress,
    career: careerProgress,
    freelancing: freelanceProgress,
    suku: sukuProgress,
    forex: forexProgress,
    finance: financeProgress,
    family: familyProgress,
  };
}

// -------------------------------------------------------------
// UNIFIED DASHBOARD OVERVIEW
// -------------------------------------------------------------
export async function getDashboardOverview(
  userId = "user_kidus_01",
  dateStr?: string,
  timezone?: string
) {
  await ensureReady();

  // Resolve user's active timezone
  let tz = timezone;
  if (!tz) {
    const userRes = await db.execute({
      sql: "SELECT timezone FROM users WHERE id = ? LIMIT 1",
      args: [userId],
    });
    tz = (userRes.rows[0]?.timezone as string) || "Africa/Addis_Ababa";
  }

  const now = getNowInTimezone(tz);
  const today = dateStr || now.dateStr;

  const [tasks, profile, finances, goals, forexTrades, sukuTasks, freelanceData, categories] =
    await Promise.all([
      getDailyTasks(userId, today, tz),
      getUserProfile(userId),
      getFinancialSummary(userId),
      getGoals(userId),
      getForexTrades(userId),
      getSukuTasks(userId),
      getFreelanceData(userId),
      getCategoryProgressOverview(userId),
    ]);

  const statusSummary = getDailyTaskStatusSummary(tasks, now.dateStr, now.time24);
  const completedTasks = statusSummary.completed;
  const totalTasks = tasks.length;
  const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Closed Forex stats
  const closedFx = forexTrades.filter((t) => t.outcome !== "open");
  const winFx = closedFx.filter((t) => t.outcome === "win");
  const fxWinRate = closedFx.length > 0 ? Number(((winFx.length / closedFx.length) * 100).toFixed(1)) : 0;
  let fxTotalR = 0;
  for (const t of closedFx) {
    fxTotalR += Number(t.result_r || 0);
  }

  // Active goals with upcoming deadlines
  const upcomingGoals = goals
    .filter((g) => g.deadline)
    .sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""))
    .slice(0, 5);

  return {
    today,
    tasks,
    taskStats: {
      completed: completedTasks,
      total: totalTasks,
      percent: taskCompletionPct,
    },
    statusSummary,
    profile,
    finances,
    forex: {
      totalTrades: forexTrades.length,
      closedTrades: closedFx.length,
      winRate: fxWinRate,
      totalR: Number(fxTotalR.toFixed(2)),
    },
    suku: {
      total: sukuTasks.length,
      completed: sukuTasks.filter((t) => t.status === "completed").length,
      progress:
        sukuTasks.length > 0
          ? Math.round((sukuTasks.filter((t) => t.status === "completed").length / sukuTasks.length) * 100)
          : 0,
    },
    freelance: {
      clientCount: freelanceData.clients.length,
      activeProjects: freelanceData.projects.filter((p) => p.status !== "paid").length,
      totalProjects: freelanceData.projects.length,
    },
    categories,
    upcomingGoals,
  };
}

// -------------------------------------------------------------
// UNIFIED REPORTS & DISCIPLINE ANALYTICS
// -------------------------------------------------------------
export async function getReportsOverview(userId = "user_kidus_01", timeRange = "Last 30 Days") {
  await ensureReady();

  // 1. Weekly Consistency Day-by-Day (Mon - Sun for current week)
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeklyTrend: { day: string; date: string; percent: number; completed: number; total: number }[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];

    const tasksRes = await db.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done FROM daily_tasks WHERE user_id = ? AND date = ?",
      args: [userId, dateStr],
    });

    const total = Number(tasksRes.rows[0]?.total || 0);
    const done = Number(tasksRes.rows[0]?.done || 0);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    weeklyTrend.push({
      day: weekDays[i],
      date: dateStr,
      percent: pct,
      completed: done,
      total,
    });
  }

  // 2. Capital Allocation Breakdown from financial_transactions
  const txs = await getFinancialTransactions(userId);
  let familySupport = 0;
  let savingsInvestment = 0;
  let personalTransport = 0;
  let softwareDev = 0;
  let totalExpenses = 0;

  for (const t of txs) {
    if (t.type === "expense") {
      totalExpenses += t.amount;
      if (t.category === "family_contribution") {
        familySupport += t.amount;
      } else if (t.category === "savings_transfer" || t.category === "savings") {
        savingsInvestment += t.amount;
      } else if (t.category === "software" || t.category === "tools" || t.category === "business") {
        softwareDev += t.amount;
      } else {
        personalTransport += t.amount;
      }
    } else if (t.type === "savings_transfer") {
      savingsInvestment += t.amount;
    }
  }

  const finSummary = await getFinancialSummary(userId);

  // 3. Real Achievements
  const achievements: { title: string; subtitle: string; category: string; date: string; icon: string }[] = [];
  const compMilestones = await db.execute({
    sql: "SELECT title, target_date FROM milestones WHERE status = 'completed' ORDER BY target_date DESC LIMIT 4",
    args: [],
  });
  for (const m of compMilestones.rows) {
    achievements.push({
      title: m.title as string,
      subtitle: "Milestone Attained",
      category: "Milestone",
      date: (m.target_date as string) || "Recent",
      icon: "🎯",
    });
  }

  const recentTasks = await db.execute({
    sql: "SELECT title, updated_at, status FROM daily_tasks WHERE user_id = ? AND status = 'completed' ORDER BY updated_at DESC LIMIT 5",
    args: [userId],
  });
  const recentActivity = recentTasks.rows.map((r: any) => ({
    title: `Completed: ${r.title}`,
    time: r.updated_at ? new Date(r.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today",
    status: r.status,
  }));

  return {
    timeRange,
    weeklyTrend,
    finSummary,
    capitalAllocation: {
      familySupport,
      savingsInvestment: savingsInvestment || finSummary.emergencyFund,
      personalTransport,
      softwareDev,
      totalExpenses,
    },
    achievements,
    recentActivity,
  };
}

// -------------------------------------------------------------
// INTELLIGENT RESCHEDULING & SLOT RECOVERY
// -------------------------------------------------------------
export async function suggestIntelligentSlot(
  userId = "user_kidus_01",
  durationMinutes = 45,
  preferredDate?: string
): Promise<{ date: string; start_time: string; end_time: string; reason: string }> {
  await ensureReady();
  const date = preferredDate || new Date().toISOString().split("T")[0];
  const existingTasks = await db.execute({
    sql: "SELECT start_time, end_time FROM daily_tasks WHERE user_id = ? AND date = ? AND status != 'skipped' ORDER BY start_time ASC",
    args: [userId, date],
  });

  const parseMinutes = (t: string) => {
    const [h, m] = (t || "00:00").split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Candidate focus blocks that protect sleep (22:00 - 04:00) and avoid fixed work (08:00 - 17:00)
  const candidateSlots = [
    { start: "06:00", end: "07:00" },
    { start: "17:30", end: "18:30" },
    { start: "18:30", end: "19:30" },
    { start: "19:30", end: "20:30" },
    { start: "20:30", end: "21:15" },
  ];

  for (const slot of candidateSlots) {
    const sMins = parseMinutes(slot.start);
    const eMins = sMins + durationMinutes;
    if (eMins > parseMinutes("21:45")) continue; // Strictly protect night prayer & sleep wind-down

    const conflicts = existingTasks.rows.some((row: any) => {
      const ts = parseMinutes(row.start_time as string);
      const te = parseMinutes(row.end_time as string);
      return Math.max(sMins, ts) < Math.min(eMins, te);
    });

    if (!conflicts) {
      const endHH = String(Math.floor(eMins / 60)).padStart(2, "0");
      const endMM = String(eMins % 60).padStart(2, "0");
      return {
        date,
        start_time: slot.start,
        end_time: `${endHH}:${endMM}`,
        reason: "Optimal non-overlapping slot protecting employment & 22:00 sleep boundary",
      };
    }
  }

  // Next-day evening recovery
  const d = new Date(date + "T12:00:00Z");
  d.setDate(d.getDate() + 1);
  const nextDateStr = d.toISOString().split("T")[0];

  return {
    date: nextDateStr,
    start_time: "18:30",
    end_time: "19:30",
    reason: "Current day schedule is packed; placed into tomorrow evening to protect recovery",
  };
}

// -------------------------------------------------------------
// SINGLE SOURCE OF TRUTH: EMERGENCY FUND GOAL
// -------------------------------------------------------------
export async function getEmergencyFundGoal(userId = "user_kidus_01") {
  await ensureReady();
  const res = await db.execute({
    sql: `SELECT * FROM goals WHERE user_id = ? AND (id = 'goal_monthly_savings' OR id = 'goal_emergency_fund' OR title LIKE '%Emergency%') LIMIT 1`,
    args: [userId],
  });

  const finSummary = await getFinancialSummary(userId);
  const currentSavings = finSummary.emergencyFund;

  if (res.rows.length === 0) {
    const goalId = "goal_monthly_savings";
    const target = 15000;
    const progress = target > 0 ? Math.min(100, Math.round((currentSavings / target) * 100)) : 0;
    await db.execute({
      sql: `INSERT OR REPLACE INTO goals (
        id, user_id, title, description, category, reason, tier,
        start_date, deadline, priority, progress, target_value, current_value, unit, currency, status, completion_criteria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        goalId,
        userId,
        "Establish Initial 15,000 ETB Emergency Fund",
        "Disciplined allocation of salary and freelance proceeds to build an untouchable emergency cushion.",
        "financial",
        "Break the cycle of zero savings and establish financial peace of mind.",
        "monthly",
        null,
        "2026-11-02",
        "2026-11-30",
        "high",
        progress,
        target,
        currentSavings,
        "ETB",
        "ETB",
        progress === 100 ? "completed" : "in_progress",
        "15,000 ETB verified balance in designated emergency savings account.",
      ],
    });
    return {
      id: goalId,
      title: "Establish Initial 15,000 ETB Emergency Fund",
      target_value: target,
      current_value: currentSavings,
      progress,
      unit: "ETB",
      currency: "ETB",
      deadline: "2026-11-30",
    };
  }

  const row = res.rows[0];
  const target = Number(row.target_value || 15000);
  const progress = target > 0 ? Math.min(100, Math.round((currentSavings / target) * 100)) : 0;

  // Single source of truth update: ensure current_value and progress reflect genuine ledger
  if (Number(row.current_value) !== currentSavings || Number(row.progress) !== progress) {
    await db.execute({
      sql: `UPDATE goals SET
            current_value = ?,
            progress = ?,
            status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END
            WHERE id = ?`,
      args: [currentSavings, progress, progress, row.id as string],
    });
  }

  return {
    id: row.id as string,
    title: (row.title as string) || "Establish Initial 15,000 ETB Emergency Fund",
    target_value: target,
    current_value: currentSavings,
    progress,
    unit: (row.unit as string) || "ETB",
    currency: (row.currency as string) || "ETB",
    deadline: (row.deadline as string) || "2026-11-30",
  };
}

// -------------------------------------------------------------
// FOCUS SESSIONS REPOSITORY
// -------------------------------------------------------------
export async function createFocusSession(session: Omit<FocusSession, "id" | "created_at">): Promise<FocusSession> {
  await ensureReady();
  const id = `focus_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO focus_sessions (
      id, user_id, task_id, goal_id, title, target_duration_minutes,
      actual_duration_seconds, interrupted, interruption_reason, status,
      started_at, completed_at, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      session.user_id,
      session.task_id || null,
      session.goal_id || null,
      session.title,
      session.target_duration_minutes,
      session.actual_duration_seconds || 0,
      session.interrupted ? 1 : 0,
      session.interruption_reason || null,
      session.status || "completed",
      session.started_at,
      session.completed_at || null,
      session.notes || null,
    ],
  });

  // If session is tied to a task, add actual duration
  if (session.task_id && session.actual_duration_seconds > 0) {
    const mins = Math.round(session.actual_duration_seconds / 60);
    try {
      await db.execute({
        sql: `UPDATE daily_tasks
              SET actual_duration_minutes = COALESCE(actual_duration_minutes, 0) + ?
              WHERE id = ?`,
        args: [mins, session.task_id],
      });
    } catch (_) {}
  }

  return {
    ...session,
    id,
    created_at: new Date().toISOString(),
  };
}

export async function getFocusSessions(userId = "user_kidus_01", limit = 30): Promise<FocusSession[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC LIMIT ?",
    args: [userId, limit],
  });
  return res.rows as unknown as FocusSession[];
}

export async function getTodayFocusMinutes(userId = "user_kidus_01", dateStr?: string): Promise<number> {
  await ensureReady();
  const date = dateStr || new Date().toISOString().split("T")[0];
  const res = await db.execute({
    sql: `SELECT COALESCE(SUM(actual_duration_seconds), 0) as total_sec
          FROM focus_sessions
          WHERE user_id = ? AND started_at LIKE ?`,
    args: [userId, `${date}%`],
  });
  const sec = Number(res.rows[0]?.total_sec || 0);
  return Math.round(sec / 60);
}

// -------------------------------------------------------------
// UNIVERSAL QUICK CAPTURE REPOSITORY
// -------------------------------------------------------------
export async function createQuickCaptureItem(item: Omit<QuickCaptureItem, "id" | "created_at">): Promise<QuickCaptureItem> {
  await ensureReady();
  const id = `qc_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO quick_capture_items (
      id, user_id, type, content, category, assigned_to, is_processed
    ) VALUES (?, ?, ?, ?, ?, ?, 0)`,
    args: [
      id,
      item.user_id,
      item.type,
      item.content,
      item.category || "general",
      item.assigned_to || null,
    ],
  });

  return {
    ...item,
    id,
    is_processed: 0,
    created_at: new Date().toISOString(),
  };
}

export async function getQuickCaptureItems(userId = "user_kidus_01", includeProcessed = false): Promise<QuickCaptureItem[]> {
  await ensureReady();
  const sql = includeProcessed
    ? "SELECT * FROM quick_capture_items WHERE user_id = ? ORDER BY created_at DESC"
    : "SELECT * FROM quick_capture_items WHERE user_id = ? AND is_processed = 0 ORDER BY created_at DESC";
  const res = await db.execute({ sql, args: [userId] });
  return res.rows as unknown as QuickCaptureItem[];
}

export async function processQuickCaptureItem(id: string, action: "process" | "delete", targetId?: string): Promise<void> {
  await ensureReady();
  if (action === "delete") {
    await db.execute({ sql: "DELETE FROM quick_capture_items WHERE id = ?", args: [id] });
  } else {
    await db.execute({
      sql: `UPDATE quick_capture_items
            SET is_processed = 1, assigned_to = ?, processed_at = datetime('now')
            WHERE id = ?`,
      args: [targetId || null, id],
    });
  }
}

// -------------------------------------------------------------
// LIFE INTELLIGENCE & RULE-BASED RECOMMENDATION ENGINE
// -------------------------------------------------------------
export async function getLifeIntelligenceSummary(userId = "user_kidus_01", timezone = "Africa/Addis_Ababa") {
  await ensureReady();
  const profile = await getUserProfile(userId);
  const categoriesProgress = await getCategoryProgressOverview(userId);
  const finSummary = await getFinancialSummary(userId);
  const emergencyGoal = await getEmergencyFundGoal(userId);

  // 1. Determine Strongest & Most Neglected Categories
  const categoryEntries = Object.entries(categoriesProgress);
  let strongestCat = { name: "Spiritual", score: 0 };
  let neglectedCat = { name: "Health", score: 100 };

  for (const [name, score] of categoryEntries) {
    if (score > strongestCat.score) strongestCat = { name, score };
    if (score < neglectedCat.score) neglectedCat = { name, score };
  }

  // 2. Sleep Schedule Consistency Check
  const wake = profile?.wake_time || "04:00";
  const bed = profile?.bed_time || "22:00";
  const [bH, bM] = bed.split(":").map(Number);
  const [wH, wM] = wake.split(":").map(Number);
  let bMins = bH * 60 + bM;
  let wMins = wH * 60 + wM;
  if (wMins < bMins) wMins += 24 * 60;
  const calculatedSleep = Number(((wMins - bMins) / 60).toFixed(1));
  const targetSleep = Number(profile?.sleep_target_hours || 7.5);
  const sleepDeficit = Number((targetSleep - calculatedSleep).toFixed(1));

  // 3. Overloaded Days Audit (> 10h / 600m focus scheduled)
  const taskLoadRes = await db.execute({
    sql: `SELECT date, SUM(duration_minutes) as total_duration, COUNT(*) as task_count
          FROM daily_tasks
          WHERE user_id = ? AND date >= '2026-11-02'
          GROUP BY date`,
    args: [userId],
  });

  const overloadedDays = taskLoadRes.rows
    .filter((r) => Number(r.total_duration || 0) > 600 || Number(r.task_count || 0) > 12)
    .map((r) => ({
      date: r.date as string,
      total_hours: Number((Number(r.total_duration) / 60).toFixed(1)),
      task_count: Number(r.task_count),
    }));

  // 4. Upcoming Deadlines Bottlenecks
  const deadlinesRes = await db.execute({
    sql: `SELECT id, title, category, deadline, progress
          FROM goals
          WHERE user_id = ? AND status != 'completed' AND deadline IS NOT NULL
          ORDER BY deadline ASC LIMIT 4`,
    args: [userId],
  });

  // 5. Intelligent Transparent Recommendations
  const recommendations: Array<{
    id: string;
    type: "warning" | "schedule" | "finance" | "habit" | "opportunity";
    title: string;
    description: string;
    rationale: string;
    actionLabel?: string;
    actionHref?: string;
  }> = [];

  // Sleep check recommendation
  if (sleepDeficit > 0) {
    recommendations.push({
      id: "rec_sleep",
      type: "warning",
      title: `Sleep Duration Below Target (${calculatedSleep}h vs ${targetSleep}h target)`,
      description: `Your bedtime (${bed}) and wake-up (${wake}) yield exactly ${calculatedSleep} hours. Chronic sleep deficits reduce cognitive endurance and focus capacity.`,
      rationale: `Configured sleep target is ${targetSleep} hours. A deficit of ${sleepDeficit}h per night accumulates to ${Number((sleepDeficit * 7).toFixed(1))}h of weekly fatigue.`,
      actionLabel: "Adjust Sleep Schedule in Settings",
      actionHref: "/settings#schedule",
    });
  }

  // Emergency Fund recommendation
  if (finSummary.emergencyFund < emergencyGoal.target_value) {
    const remainingToSave = emergencyGoal.target_value - finSummary.emergencyFund;
    recommendations.push({
      id: "rec_emergency",
      type: "finance",
      title: `Prioritize Emergency Reserve (${finSummary.emergencyFund.toLocaleString()} / ${emergencyGoal.target_value.toLocaleString()} ETB)`,
      description: `Reserve goal is ${emergencyGoal.progress}% funded. Establishing 3 months of emergency reserves prevents capital liquidation during unexpected events.`,
      rationale: `Single source of truth goal requires ${emergencyGoal.target_value.toLocaleString()} ETB by ${emergencyGoal.deadline}. Remaining to fund: ${remainingToSave.toLocaleString()} ETB.`,
      actionLabel: "Record Savings Transfer",
      actionHref: "/finances",
    });
  }

  // Neglected domain recommendation
  if (neglectedCat.score < 20) {
    recommendations.push({
      id: "rec_neglected",
      type: "habit",
      title: `Protect Time for ${neglectedCat.name.toUpperCase()} (Currently at ${neglectedCat.score}%)`,
      description: `Your execution in ${neglectedCat.name} is the lowest across all 8 life pillars. Schedule dedicated focus sessions this week to restore balance.`,
      rationale: `Holistic architecture requires steady progress across all domains. ${neglectedCat.name} has the lowest completion record.`,
      actionLabel: `Open ${neglectedCat.name} Module`,
      actionHref: `/${neglectedCat.name.toLowerCase()}`,
    });
  }

  // Suku Marketplace recommendation
  recommendations.push({
    id: "rec_suku",
    type: "opportunity",
    title: "Protect Thursday & Saturday Deep Work for Suku MVP",
    description: "Thursday evening (60m) and Saturday morning (3.5h) are designated for merchant catalog schemas and Chapa/Telebirr payment webhooks.",
    rationale: "Target MVP pilot launch is Dec 31, 2026. Consistent weekend deep work prevents milestone bottlenecks.",
    actionLabel: "Inspect Suku Roadmap",
    actionHref: "/suku",
  });

  return {
    lifeProgressScore: Math.round(
      categoryEntries.reduce((acc, [, val]) => acc + val, 0) / Math.max(1, categoryEntries.length)
    ),
    strongestCategory: strongestCat,
    mostNeglectedCategory: neglectedCat,
    categoriesProgress,
    sleepAudit: {
      wakeTime: wake,
      bedTime: bed,
      calculatedHours: calculatedSleep,
      targetHours: targetSleep,
      deficitHours: sleepDeficit,
      isDeficit: sleepDeficit > 0,
      statusLabel: sleepDeficit > 0 ? "Insufficient Sleep" : "Optimal Sleep Duration",
    },
    emergencyFund: emergencyGoal,
    overloadedDays,
    criticalDeadlines: deadlinesRes.rows,
    recommendations,
  };
}

// -------------------------------------------------------------
// SMART WEEKLY PLANNER & REVIEW SYSTEM
// -------------------------------------------------------------
export async function getWeeklyReviews(userId = "user_kidus_01"): Promise<WeeklyReview[]> {
  await ensureReady();
  const res = await db.execute({
    sql: "SELECT * FROM weekly_reviews WHERE user_id = ? ORDER BY week_start_date DESC",
    args: [userId],
  });
  return res.rows.map((row: any) => ({
    id: row.id,
    user_id: row.user_id,
    week_start_date: row.week_start_date,
    week_end_date: row.week_end_date,
    reflection: row.reflection || "",
    learnings: row.learnings || "",
    improvements: row.improvements || "",
    next_week_priorities: row.next_week_priorities || "",
    overall_score: Number(row.overall_score || 0),
    tasks_completed: Number(row.tasks_completed || 0),
    tasks_missed: Number(row.tasks_missed || 0),
    goals_progressed: Number(row.goals_progressed || 0),
    actual_spending: Number(row.actual_spending || 0),
    savings_progress: Number(row.savings_progress || 0),
    suggestions_json: row.suggestions_json ? JSON.parse(row.suggestions_json) : [],
    status: row.status || "reviewed",
    created_at: row.created_at,
  }));
}

export async function saveWeeklyReview(userId = "user_kidus_01", data: Partial<WeeklyReview>): Promise<void> {
  await ensureReady();
  const id = data.id || `wr_${data.week_start_date || new Date().toISOString().split("T")[0]}`;
  const weekStart = data.week_start_date || "2026-11-02";
  const weekEnd = data.week_end_date || "2026-11-08";

  await db.execute({
    sql: `INSERT INTO weekly_reviews (
      id, user_id, week_start_date, week_end_date, reflection, learnings,
      improvements, next_week_priorities, overall_score, tasks_completed,
      tasks_missed, goals_progressed, actual_spending, savings_progress,
      suggestions_json, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      reflection = excluded.reflection,
      learnings = excluded.learnings,
      improvements = excluded.improvements,
      next_week_priorities = excluded.next_week_priorities,
      overall_score = excluded.overall_score,
      tasks_completed = excluded.tasks_completed,
      tasks_missed = excluded.tasks_missed,
      goals_progressed = excluded.goals_progressed,
      actual_spending = excluded.actual_spending,
      savings_progress = excluded.savings_progress,
      suggestions_json = excluded.suggestions_json,
      status = excluded.status`,
    args: [
      id,
      userId,
      weekStart,
      weekEnd,
      data.reflection || "",
      data.learnings || "",
      data.improvements || "",
      data.next_week_priorities || "",
      Number(data.overall_score || 0),
      Number(data.tasks_completed || 0),
      Number(data.tasks_missed || 0),
      Number(data.goals_progressed || 0),
      Number(data.actual_spending || 0),
      Number(data.savings_progress || 0),
      data.suggestions_json ? JSON.stringify(data.suggestions_json) : "[]",
      data.status || "reviewed",
    ],
  });
}

export async function getWeeklyPlannerData(userId = "user_kidus_01", weekStartStr = "2026-11-02") {
  await ensureReady();

  // Calculate 7-day span: Monday to Sunday
  const start = new Date(weekStartStr);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const weekEndStr = end.toISOString().split("T")[0];

  // 1. Tasks in week
  const tasksRes = await db.execute({
    sql: `SELECT id, title, date, start_time, end_time, duration_minutes,
                 actual_duration_minutes, status, category, priority
          FROM daily_tasks
          WHERE user_id = ? AND date BETWEEN ? AND ?
          ORDER BY date ASC, start_time ASC`,
    args: [userId, weekStartStr, weekEndStr],
  });
  const tasks = tasksRes.rows as any[];
  const tasksCompleted = tasks.filter((t) => t.status === "completed").length;
  const tasksMissed = tasks.filter((t) => t.status === "missed").length;
  const tasksUpcoming = tasks.filter((t) => t.status === "upcoming").length;

  // 2. Focus Time (focus_sessions + actual_duration_minutes)
  const focusRes = await db.execute({
    sql: `SELECT COALESCE(SUM(actual_duration_seconds), 0) as total_sec FROM focus_sessions
          WHERE user_id = ? AND started_at BETWEEN ? AND ?`,
    args: [userId, `${weekStartStr}T00:00:00`, `${weekEndStr}T23:59:59`],
  });
  const sessionMin = Math.round(Number(focusRes.rows[0]?.total_sec || 0) / 60);
  const taskFocusMin = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.actual_duration_minutes || t.duration_minutes || 0), 0);
  const totalFocusMinutes = Math.max(sessionMin, taskFocusMin);

  // 3. Learning Hours
  const learningMinutes = tasks
    .filter((t) => t.category === "learning" && t.status === "completed")
    .reduce((sum, t) => sum + Number(t.duration_minutes || 0), 0);
  const learningHours = Number((learningMinutes / 60).toFixed(1));

  // 4. Exercise Sessions
  const exerciseRes = await db.execute({
    sql: `SELECT COUNT(*) as count FROM health_logs
          WHERE user_id = ? AND workout_completed = 1 AND date BETWEEN ? AND ?`,
    args: [userId, weekStartStr, weekEndStr],
  });
  const healthTaskCompleted = tasks.filter((t) => t.category === "health" && t.status === "completed").length;
  const exerciseSessions = Math.max(Number(exerciseRes.rows[0]?.count || 0), healthTaskCompleted);

  // 5. Spiritual Consistency
  const prayersRes = await db.execute({
    sql: `SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as done
          FROM prayer_logs
          WHERE user_id = ? AND date BETWEEN ? AND ?`,
    args: [userId, weekStartStr, weekEndStr],
  });
  const totalPrayers = Number(prayersRes.rows[0]?.total || 0);
  const donePrayers = Number(prayersRes.rows[0]?.done || 0);
  const spiritualConsistencyPercent = totalPrayers > 0 ? Math.round((donePrayers / totalPrayers) * 100) : 0;

  // 6. Finances: Spending & Savings
  const finRes = await db.execute({
    sql: `SELECT
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as spending,
            SUM(CASE WHEN type = 'savings' THEN amount ELSE 0 END) as savings
          FROM financial_transactions
          WHERE user_id = ? AND date BETWEEN ? AND ?`,
    args: [userId, weekStartStr, weekEndStr],
  });
  const actualSpending = Number(finRes.rows[0]?.spending || 0);
  const savingsProgress = Number(finRes.rows[0]?.savings || 0);

  // 7. Project Progress (Suku & Freelance)
  const sukuRes = await db.execute({
    sql: `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as done
          FROM suku_tasks WHERE user_id = ?`,
    args: [userId],
  });
  const projectTotal = Number(sukuRes.rows[0]?.total || 0);
  const projectDone = Number(sukuRes.rows[0]?.done || 0);
  const projectProgressPercent = projectTotal > 0 ? Math.round((projectDone / projectTotal) * 100) : 0;

  // 8. Goals Progressed
  const goalsRes = await db.execute({
    sql: `SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND progress > 0`,
    args: [userId],
  });
  const goalsProgressed = Number(goalsRes.rows[0]?.count || 0);

  // 9. Generate Actionable Suggestions for the Following Week
  const suggestions: Array<{
    id: string;
    type: "reschedule" | "balance" | "overload" | "protect_goal" | "sleep";
    title: string;
    description: string;
    rationale: string;
    actionType: "reschedule_task" | "adjust_schedule" | "protect_time";
    payload?: any;
    applied?: boolean;
  }> = [];

  // Suggestion: Reschedule unfinished/missed tasks
  const unfinishedTasks = tasks.filter((t) => t.status === "missed" || (t.status === "upcoming" && t.priority === "high"));
  if (unfinishedTasks.length > 0) {
    const nextMonday = new Date(end);
    nextMonday.setDate(end.getDate() + 1);
    const nextMondayStr = nextMonday.toISOString().split("T")[0];

    suggestions.push({
      id: "sug_reschedule_missed",
      type: "reschedule",
      title: `Reschedule ${unfinishedTasks.length} Unfinished Important Task(s)`,
      description: `Move '${unfinishedTasks[0].title}' to Monday, ${nextMondayStr}.`,
      rationale: "Unfinished high-priority tasks accumulate cognitive burden and derail milestone deadlines.",
      actionType: "reschedule_task",
      payload: {
        taskId: unfinishedTasks[0].id,
        targetDate: nextMondayStr,
      },
      applied: false,
    });
  }

  // Suggestion: Overload check
  const daysMap: Record<string, number> = {};
  for (const t of tasks) {
    daysMap[t.date] = (daysMap[t.date] || 0) + Number(t.duration_minutes || 0);
  }
  const heavyDays = Object.entries(daysMap).filter(([, m]) => m > 600);
  if (heavyDays.length > 0) {
    suggestions.push({
      id: "sug_balance_schedule",
      type: "overload",
      title: "Reduce Overloaded Daily Schedules",
      description: `${heavyDays[0][0]} has ${Math.round(heavyDays[0][1] / 60)} hours scheduled. Consider redistributing 90 minutes to lighter days.`,
      rationale: "Schedules exceeding 10 hours of focused work risk mental fatigue and missed evening routines.",
      actionType: "adjust_schedule",
      applied: false,
    });
  }

  // Suggestion: Protect time for neglected goal
  if (exerciseSessions < 3) {
    suggestions.push({
      id: "sug_protect_health",
      type: "protect_goal",
      title: "Protect 3x Morning Calisthenics Sessions",
      description: "Schedule Monday, Wednesday, and Friday 06:15 AM workout blocks.",
      rationale: "Physical vitality and mobility directly reinforce long-duration cognitive focus.",
      actionType: "protect_time",
      applied: false,
    });
  }

  // Suggestion: Sleep & rest balance
  suggestions.push({
    id: "sug_balance_rest",
    type: "sleep",
    title: "Protect 21:30 Screen Wind-Down Routine",
    description: "Shut down monitors and begin tea/reading at 21:30 to guarantee sleep by 22:00.",
    rationale: "Sleep deficit audit shows 6.0h vs 7.5h target. Winding down 30 minutes earlier is required.",
    actionType: "protect_time",
    applied: false,
  });

  return {
    weekStartDate: weekStartStr,
    weekEndDate: weekEndStr,
    metrics: {
      tasksCompleted,
      tasksMissed,
      tasksUpcoming,
      totalFocusMinutes,
      learningHours,
      exerciseSessions,
      spiritualConsistencyPercent,
      actualSpending,
      savingsProgress,
      projectProgressPercent,
      goalsProgressed,
    },
    tasks,
    suggestions,
  };
}

export async function applyPlannerSuggestion(
  userId = "user_kidus_01",
  suggestion: { id: string; actionType: string; payload?: any }
): Promise<{ success: boolean; message: string }> {
  await ensureReady();

  if (suggestion.actionType === "reschedule_task" && suggestion.payload?.taskId && suggestion.payload?.targetDate) {
    await db.execute({
      sql: "UPDATE daily_tasks SET date = ?, status = 'upcoming' WHERE id = ? AND user_id = ?",
      args: [suggestion.payload.targetDate, suggestion.payload.taskId, userId],
    });
    return { success: true, message: `Task rescheduled to ${suggestion.payload.targetDate}.` };
  }

  return { success: true, message: "Suggestion noted and schedule prioritized." };
}


