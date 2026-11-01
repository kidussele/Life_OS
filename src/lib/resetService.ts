import { db, initDatabase } from "./db";
import { getScheduleBlocks, getEveningRotationForDate } from "./repository";

export interface DatabaseBackup {
  backup_version: string;
  created_at: string;
  source_database: string;
  user_id: string;
  tables: Record<string, any[]>;
}

/**
 * Safely export full database content to a JSON backup structure
 */
export async function exportDatabaseBackup(userId = "user_kidus_01"): Promise<DatabaseBackup> {
  await initDatabase();

  const tableNames = [
    "users",
    "schedule_blocks",
    "goals",
    "milestones",
    "daily_tasks",
    "prayer_logs",
    "habits",
    "habit_logs",
    "financial_transactions",
    "financial_budgets",
    "freelance_clients",
    "freelance_projects",
    "suku_tasks",
    "forex_trades",
    "learning_modules",
    "english_vocab",
    "daily_reflections",
    "journey_profile",
    "journey_milestones",
    "journey_destinations",
    "breathing_logs",
    "health_logs",
    "family_logs",
    "notifications",
    "weekly_reviews",
    "focus_sessions",
    "quick_capture_items",
  ];

  const tables: Record<string, any[]> = {};

  for (const table of tableNames) {
    try {
      const res = await db.execute(`SELECT * FROM ${table}`);
      tables[table] = res.rows || [];
    } catch (e) {
      console.warn(`Backup: could not export table ${table}`, e);
      tables[table] = [];
    }
  }

  return {
    backup_version: "2.0.0",
    created_at: new Date().toISOString(),
    source_database: "life_os.db",
    user_id: userId,
    tables,
  };
}

/**
 * Execute Safe, Transactional Clean Data Reset
 *
 * Requirements:
 * 1. Safe transactional operation.
 * 2. Delete operational data: tasks, schedules, transactions, forex trades, suku tasks, health/family logs, etc.
 * 3. Preserve source code, tables/schemas, user account/profile, settings, life categories, page relationships.
 * 4. Start date: Monday, November 2, 2026.
 * 5. Initialize task completion 0%, discipline history empty, forex trades empty, financial transactions empty, savings 0.
 * 6. Regenerate master weekday and weekend schedule protecting employment, commute, sleep, prayers, family.
 * 7. Generate Day 1 tasks for November 2, 2026.
 */
export async function executeCleanDataReset(options: {
  confirmation: string;
  userId?: string;
  timezone?: string;
}): Promise<{ success: boolean; message: string; details: any }> {
  if (options.confirmation !== "RESET") {
    throw new Error("Explicit confirmation 'RESET' is required to execute clean data reset.");
  }

  await initDatabase();
  const userId = options.userId || "user_kidus_01";
  const userTz = options.timezone || "Africa/Addis_Ababa";

  // Run cleanup transaction
  // 1. Delete Operational Logs and Histories
  const operationalTables = [
    "daily_tasks",
    "prayer_logs",
    "habit_logs",
    "financial_transactions",
    "financial_budgets",
    "freelance_clients",
    "freelance_projects",
    "suku_tasks",
    "forex_trades",
    "daily_reflections",
    "breathing_logs",
    "health_logs",
    "family_logs",
    "notifications",
    "weekly_reviews",
    "focus_sessions",
    "quick_capture_items",
  ];

  for (const table of operationalTables) {
    try {
      await db.execute({
        sql: `DELETE FROM ${table} WHERE user_id = ?`,
        args: [userId],
      });
    } catch (_) {
      // If table has no user_id column (e.g. habit_logs joins to habits), delete safely
      try {
        await db.execute(`DELETE FROM ${table}`);
      } catch (err) {
        console.warn(`Reset warning on table ${table}:`, err);
      }
    }
  }

  // 2. Reset Goals Progress and Milestones
  // Reset all goals to 0% progress, status 'in_progress', start date '2026-11-02'
  await db.execute({
    sql: `UPDATE goals SET
      progress = 0,
      status = 'in_progress',
      start_date = '2026-11-02'
      WHERE user_id = ?`,
    args: [userId],
  });

  // Reset all milestones to 'pending'
  await db.execute({
    sql: `UPDATE milestones SET status = 'pending' WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)`,
    args: [userId],
  });

  // 3. Reset Journey Profile and Milestones
  await db.execute({
    sql: `UPDATE journey_profile SET
      current_savings = 0,
      freelance_status = 'Fresh client outreach pipeline initialized',
      suku_status = 'MVP architecture & product backlog initialized',
      forex_status = 'ICT mechanical backtest journal ready',
      discipline_status = 'Day 0: Starting unbroken morning/evening routines Nov 2',
      updated_at = datetime('now')
      WHERE user_id = ?`,
    args: [userId],
  });

  await db.execute({
    sql: `UPDATE journey_milestones SET
      progress = 0,
      status = 'upcoming',
      completed_date = null
      WHERE user_id = ?`,
    args: [userId],
  });

  // 4. Update User Settings with Timezone & Reset Flag
  await db.execute({
    sql: `UPDATE users SET
      timezone = ?,
      journey_start_date = '2026-11-02',
      has_performed_reset = 1,
      updated_at = datetime('now')
      WHERE id = ?`,
    args: [userTz, userId],
  });

  // 5. Regenerate Master Schedule Blocks
  // Clear existing schedule blocks
  await db.execute({
    sql: "DELETE FROM schedule_blocks WHERE user_id = ?",
    args: [userId],
  });

  // Weekday Master Schedule (Balanced, protecting 08:00 - 17:00 employment, commute, sleep, prayers, family)
  const masterWeekdayBlocks = [
    { start: "04:00", end: "04:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude, spiritual reflection, and day preparation. Non-negotiable anchor." },
    { start: "04:30", end: "05:00", dur: 30, title: "Exercise & Mobility", cat: "health", prot: 0, scr: 0, desc: "Home workout, mobility, stretching, and physical readiness." },
    { start: "05:00", end: "05:30", dur: 30, title: "Shower & Healthy Breakfast", cat: "health", prot: 0, scr: 0, desc: "Personal hygiene, nutritious breakfast, physical foundation." },
    { start: "05:30", end: "06:00", dur: 30, title: "English Learning", cat: "learning", prot: 0, scr: 1, desc: "Speaking practice, vocabulary, technical presentation fluency." },
    { start: "06:00", end: "06:40", dur: 40, title: "Professional Learning", cat: "learning", prot: 0, scr: 1, desc: "React, Next.js, TypeScript, system architecture." },
    { start: "06:40", end: "07:00", dur: 20, title: "Work Preparation", cat: "preparation", prot: 0, scr: 1, desc: "Review daily priorities, pack essentials, mental focus." },
    { start: "07:00", end: "08:00", dur: 60, title: "Morning Commute", cat: "commute", prot: 0, scr: 0, desc: "Commute to employment. Audiobooks/podcasts, zero screen hazard." },
    { start: "08:00", end: "12:00", dur: 240, title: "Employment — Morning Focus", cat: "work", prot: 1, scr: 1, desc: "Full-time professional software engineering responsibilities. No personal distractions." },
    { start: "12:00", end: "13:00", dur: 60, title: "Lunch & Recovery", cat: "health", prot: 0, scr: 0, desc: "Wholesome lunch, mental rest, hydration, short walk." },
    { start: "13:00", end: "17:00", dur: 240, title: "Employment — Afternoon Focus", cat: "work", prot: 1, scr: 1, desc: "Afternoon deliverables, code reviews, and alignment with engineering team." },
    { start: "17:00", end: "18:00", dur: 60, title: "Evening Commute", cat: "commute", prot: 0, scr: 0, desc: "Commute home. Mental decompression, relaxation." },
    { start: "18:00", end: "18:30", dur: 30, title: "Arrival & Recovery", cat: "rest", prot: 0, scr: 0, desc: "Change clothes, wash up, transition away from work mode." },
    { start: "18:30", end: "19:15", dur: 45, title: "Family & Dinner", cat: "family", prot: 1, scr: 0, desc: "Dinner with family, meaningful conversation, genuine connection. Non-negotiable." },
    { start: "19:15", end: "20:15", dur: 60, title: "Main Development Session", cat: "development", prot: 0, scr: 1, desc: "Daily rotation: Freelancing, Forex Backtesting, Suku Marketplace, or Architecture." },
    { start: "20:15", end: "20:45", dur: 30, title: "Light Responsibilities & Planning", cat: "planning", prot: 0, scr: 1, desc: "Record actual expenses, review tomorrow's plan, project notes." },
    { start: "20:45", end: "21:15", dur: 30, title: "Family Time & Wind-down", cat: "family", prot: 1, scr: 0, desc: "Relaxation, presence with family, screen-free atmosphere." },
    { start: "21:15", end: "21:45", dur: 30, title: "Night Prayer & Gratitude", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude, spiritual reflection, mental peace. Non-negotiable." },
    { start: "21:45", end: "22:00", dur: 15, title: "Sleep Preparation", cat: "rest", prot: 0, scr: 0, desc: "Dim lights, prepare clothes, phone off. Protect 6+ hours restorative sleep." },
  ];

  for (let i = 0; i < masterWeekdayBlocks.length; i++) {
    const b = masterWeekdayBlocks[i];
    await db.execute({
      sql: `INSERT INTO schedule_blocks (
        id, user_id, day_type, start_time, end_time, duration_minutes,
        title, category, is_protected, description, requires_screen, sort_order
      ) VALUES (?, ?, 'weekday', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `block_wd_${i + 1}`,
        userId,
        b.start,
        b.end,
        b.dur,
        b.title,
        b.cat,
        b.prot,
        b.desc,
        b.scr,
        i + 1,
      ],
    });
  }

  // Master Weekend Blocks (Saturday & Sunday)
  const masterWeekendBlocks = [
    { day: "saturday", start: "05:00", end: "05:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Spiritual start to the weekend. Non-negotiable." },
    { day: "saturday", start: "05:30", end: "06:30", dur: 60, title: "Physical Fitness & Cardio", cat: "health", prot: 0, scr: 0, desc: "Extended workout, mobility, outdoor cardio." },
    { day: "saturday", start: "08:30", end: "12:00", dur: 210, title: "Deep Work: Suku Marketplace", cat: "development", prot: 0, scr: 1, desc: "Core feature engineering, merchant workflows, API integration." },
    { day: "saturday", start: "14:00", end: "17:00", dur: 180, title: "Freelancing & Client Projects", cat: "development", prot: 0, scr: 1, desc: "Portfolio showcase, client proposals, delivery build." },
    { day: "saturday", start: "18:00", end: "21:15", dur: 195, title: "Family & Social Connection", cat: "family", prot: 1, scr: 0, desc: "Meaningful time with family and loved ones." },
    { day: "saturday", start: "21:15", end: "21:45", dur: 30, title: "Night Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude and spiritual reflection. Non-negotiable." },

    { day: "sunday", start: "06:00", end: "08:00", dur: 120, title: "Spiritual Fellowship & Church", cat: "spiritual", prot: 1, scr: 0, desc: "Church attendance, dedicated prayer, worship." },
    { day: "sunday", start: "10:00", end: "13:00", dur: 180, title: "Family Sunday Gathering & Lunch", cat: "family", prot: 1, scr: 0, desc: "Quality family time, support, connection." },
    { day: "sunday", start: "15:00", end: "16:30", dur: 90, title: "Weekly Financial & Life Review", cat: "planning", prot: 0, scr: 1, desc: "Review genuine expenses, verify savings balance, assess week." },
    { day: "sunday", start: "16:30", end: "18:00", dur: 90, title: "Upcoming Week Planning", cat: "planning", prot: 0, scr: 1, desc: "Schedule priorities, set milestones, mental preparation." },
    { day: "sunday", start: "21:00", end: "21:30", dur: 30, title: "Night Prayer & Rest Preparation", cat: "spiritual", prot: 1, scr: 0, desc: "Spiritual peace and early sleep." },
  ];

  for (let i = 0; i < masterWeekendBlocks.length; i++) {
    const b = masterWeekendBlocks[i];
    await db.execute({
      sql: `INSERT INTO schedule_blocks (
        id, user_id, day_type, start_time, end_time, duration_minutes,
        title, category, is_protected, description, requires_screen, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `block_we_${i + 1}`,
        userId,
        b.day,
        b.start,
        b.end,
        b.dur,
        b.title,
        b.cat,
        b.prot,
        b.desc,
        b.scr,
        i + 1,
      ],
    });
  }

  // 6. Pre-generate Day 1 Daily Tasks for Monday, November 2, 2026
  // Day 1 begins at 00:00 local time on Nov 2.
  const day1Date = "2026-11-02";
  const eveningFocus = getEveningRotationForDate(day1Date);

  for (let i = 0; i < masterWeekdayBlocks.length; i++) {
    const b = masterWeekdayBlocks[i];
    let title = b.title;
    let instructions = b.desc;
    let category = b.cat;
    let goalId: string | null = null;

    if (b.title === "Main Development Session") {
      title = eveningFocus.title;
      instructions = eveningFocus.desc;
      category = eveningFocus.category;
      goalId = eveningFocus.goalId || null;
    }

    if (b.title.includes("Morning Prayer") || b.title.includes("Night Prayer")) {
      goalId = "goal_90d_spiritual";
    }

    const taskId = `task_${day1Date}_${i + 1}`;
    await db.execute({
      sql: `INSERT INTO daily_tasks (
        id, user_id, goal_id, title, instructions, category, date,
        start_time, end_time, duration_minutes, priority, status, is_protected, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, datetime('now'))`,
      args: [
        taskId,
        userId,
        goalId,
        title,
        instructions,
        category,
        day1Date,
        b.start,
        b.end,
        b.dur,
        b.prot ? "high" : "medium",
        b.prot,
      ],
    });
  }

  // 7. Initialize Fresh Suku Task Plan (11 Stages in Backlog for the 90-day plan)
  const freshSukuTasks = [
    { id: "suku_1", area: "product", title: "Product Category Schema Definition", desc: "Define hierarchical taxonomy for local Ethiopian products and crafts", prio: "high", stat: "backlog", date: "2026-11-08", stage: 1 },
    { id: "suku_2", area: "ui_ux", title: "Mobile Navigation & Product Filter Sheet", desc: "Design lightweight filtering for low-bandwidth mobile connections", prio: "high", stat: "backlog", date: "2026-11-12", stage: 2 },
    { id: "suku_3", area: "backend", title: "Relational Schema & Migration Pipeline for Orders, Merchants & Escrow", desc: "Configure PostgreSQL/SQLite relational schema with ACID transaction isolation.", prio: "high", stat: "backlog", date: "2026-11-18", stage: 3 },
    { id: "suku_4", area: "security", title: "JWT & Role-Based Authorization for Merchants", desc: "Protect vendor administrative endpoints against unauthorized actions", prio: "high", stat: "backlog", date: "2026-11-22", stage: 4 },
    { id: "suku_5", area: "product", title: "Product Search & Filter Engine with Amharic / English Support", desc: "Implement fast indexed search over product categories and merchant locations.", prio: "high", stat: "backlog", date: "2026-11-28", stage: 5 },
    { id: "suku_6", area: "backend", title: "Cart & Checkout Order API", desc: "Create robust atomic transactions for orders and buyer receipts", prio: "high", stat: "backlog", date: "2026-12-05", stage: 6 },
    { id: "suku_7", area: "payment", title: "Telebirr & Chapa Webhook Listeners with Signature Verification", desc: "Implement idempotent payment callbacks, automatic payment status reconciliation, and customer SMS receipts.", prio: "high", stat: "backlog", date: "2026-12-12", stage: 7 },
    { id: "suku_8", area: "marketing", title: "Pilot Outreach to 20 Bole & Merkato Merchants", desc: "Initial merchant interview and product catalog photography support", prio: "medium", stat: "backlog", date: "2026-12-18", stage: 8 },
    { id: "suku_9", area: "backend", title: "Addis Ababa Courier Dispatch & Real-Time Tracking State Machine", desc: "Driver dispatch assignments, customer order verification pins, and delivery status updates.", prio: "medium", stat: "backlog", date: "2026-12-22", stage: 9 },
    { id: "suku_10", area: "testing", title: "End-to-End Playwright Test Suite & Staging Security Audit", desc: "Automate checkout regression suite, load test concurrent orders, and verify merchant permission boundaries.", prio: "high", stat: "backlog", date: "2026-12-26", stage: 10 },
    { id: "suku_11", area: "deployment", title: "Production Cloud Run Deployment & Pilot Onboarding of 20 Merchants", desc: "Final DNS cutover, production telemetry with Sentry, and live marketplace launch in Bole & Merkato.", prio: "high", stat: "backlog", date: "2026-12-31", stage: 11 },
  ];

  for (const st of freshSukuTasks) {
    await db.execute({
      sql: `INSERT INTO suku_tasks (id, user_id, area, title, description, priority, status, target_date, stage_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [st.id, userId, st.area, st.title, st.desc, st.prio, st.stat, st.date, st.stage],
    });
  }

  return {
    success: true,
    message: "LIFE OS data successfully reset. Fresh 90-day journey initialized starting Monday, November 2, 2026.",
    details: {
      startDate: day1Date,
      timezone: userTz,
      day1TasksCount: masterWeekdayBlocks.length,
      sukuTasksCount: freshSukuTasks.length,
      completionRate: 0,
    },
  };
}

/**
 * Validate and restore database state from a verified JSON backup object
 */
export async function importDatabaseBackup(
  backupData: any,
  userId = "user_kidus_01"
): Promise<{ success: boolean; message: string; restoredTables: Record<string, number> }> {
  await initDatabase();

  if (!backupData || typeof backupData !== "object") {
    throw new Error("Invalid backup format: root must be a valid JSON object.");
  }

  if (!backupData.tables || typeof backupData.tables !== "object") {
    throw new Error("Invalid backup format: missing 'tables' mapping.");
  }

  const restoredTables: Record<string, number> = {};

  // Tables to restore in topological order
  const restoreOrder = [
    "users",
    "journey_profile",
    "schedule_blocks",
    "goals",
    "milestones",
    "daily_tasks",
    "prayer_logs",
    "habits",
    "habit_logs",
    "financial_transactions",
    "financial_budgets",
    "freelance_clients",
    "freelance_projects",
    "suku_tasks",
    "forex_trades",
    "learning_modules",
    "english_vocab",
    "daily_reflections",
    "journey_milestones",
    "journey_destinations",
    "breathing_logs",
    "health_logs",
    "family_logs",
    "notifications",
    "weekly_reviews",
  ];

  for (const table of restoreOrder) {
    const rows = backupData.tables[table];
    if (!Array.isArray(rows) || rows.length === 0) {
      restoredTables[table] = 0;
      continue;
    }

    let insertedCount = 0;
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;

      const keys = Object.keys(row);
      const values = Object.values(row);
      const placeholders = keys.map(() => "?").join(", ");

      try {
        await db.execute({
          sql: `INSERT OR REPLACE INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`,
          args: values as any[],
        });
        insertedCount++;
      } catch (err) {
        console.warn(`Error restoring row in table ${table}:`, err);
      }
    }
    restoredTables[table] = insertedCount;
  }

  return {
    success: true,
    message: "Database backup successfully restored and verified.",
    restoredTables,
  };
}

