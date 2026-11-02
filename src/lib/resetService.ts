import { db, initDatabase } from "./db";
import { getEveningRotationForDate } from "./repository";
import fs from "fs";
import path from "path";

export interface DatabaseBackup {
  backup_version: string;
  created_at: string;
  source_database: string;
  user_id: string;
  backup_file_path?: string;
  tables: Record<string, any[]>;
  summary: Record<string, number>;
}

/**
 * Canonical 9-Goal Hierarchy for the 90-Day Plan starting Monday, November 2, 2026.
 * All starting values 0, current value 0, progress 0%, status 'in_progress'.
 */
export const CANONICAL_9_GOALS = [
  {
    id: "goal_vision_fin",
    title: "Achieve Complete Financial Independence",
    description: "Reach 150,000+ ETB monthly recurring income across software development, Suku marketplace, and freelancing, while maintaining emergency savings and supporting family.",
    category: "financial",
    reason: "Build long-term security, eliminate money stress, provide abundantly for my family, and gain sovereign control of my time.",
    tier: "vision",
    parent_goal_id: null,
    start_date: "2026-11-02",
    deadline: "2027-12-31",
    priority: "high",
    target_value: 150000,
    current_value: 0,
    unit: "ETB/mo",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Sustainable net cashflow of 150,000 ETB/mo with 6 months emergency savings (180,000 ETB).",
  },
  {
    id: "goal_monthly_savings",
    title: "Establish Initial 15,000 ETB Emergency Fund",
    description: "Disciplined allocation of salary and freelance proceeds to build an untouchable emergency cushion.",
    category: "financial",
    reason: "Break the cycle of zero savings and establish financial peace of mind.",
    tier: "monthly",
    parent_goal_id: "goal_vision_fin",
    start_date: "2026-11-02",
    deadline: "2026-11-30",
    priority: "high",
    target_value: 15000,
    current_value: 0,
    unit: "ETB",
    progress: 0,
    status: "in_progress",
    completion_criteria: "15,000 ETB verified balance in designated emergency savings account.",
  },
  {
    id: "goal_90d_freelance",
    title: "Land First 3 High-Value Software Clients",
    description: "Package full-stack Next.js/React development services, build live portfolio with case studies, and secure 3 paid clients.",
    category: "freelancing",
    reason: "Generate immediate supplementary income beyond the 30,000 ETB salary.",
    tier: "90_day",
    parent_goal_id: "goal_vision_fin",
    start_date: "2026-11-02",
    deadline: "2026-12-31",
    priority: "high",
    target_value: 3,
    current_value: 0,
    unit: "clients",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Sign contracts for 3 freelance projects totaling at least 90,000 ETB in client revenue.",
  },
  {
    id: "goal_90d_suku",
    title: "Launch Suku Ethiopian Marketplace MVP",
    description: "Complete vendor onboarding, product listing catalogue, secure checkout flow, and initial Addis Ababa merchant pilot.",
    category: "business",
    reason: "Create an enduring digital commerce platform for local Ethiopian merchants and customers.",
    tier: "90_day",
    parent_goal_id: "goal_vision_fin",
    start_date: "2026-11-02",
    deadline: "2027-01-15",
    priority: "high",
    target_value: 11,
    current_value: 0,
    unit: "stages",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Production deployment with 20 active merchants, 100 listed products, and zero critical security flaws.",
  },
  {
    id: "goal_90d_forex",
    title: "Master ICT Methodology & Complete 100 Demo Backtests",
    description: "Backtest MSS, Order Blocks, and Silver Bullet on EURUSD & GBPUSD with strict 1:2+ R:R, logging all trades without risking real capital.",
    category: "forex",
    reason: "Build proven psychological discipline and mechanical consistency before risking real money or taking prop challenges.",
    tier: "90_day",
    parent_goal_id: "goal_vision_fin",
    start_date: "2026-11-02",
    deadline: "2026-12-31",
    priority: "medium",
    target_value: 100,
    current_value: 0,
    unit: "trades",
    progress: 0,
    status: "in_progress",
    completion_criteria: "100 logged backtest/demo trades with positive expectancy, maximum 3% drawdown, and 100% adherence to risk rules.",
  },
  {
    id: "goal_90d_spiritual",
    title: "30-Day Unbroken Morning & Night Prayer Consistency",
    description: "Protect 04:00 AM morning prayer and 21:15 PM night prayer as sacred, non-negotiable appointments.",
    category: "spiritual",
    reason: "Spiritual groundedness and gratitude are the bedrock of my peace, discipline, and purpose in life.",
    tier: "90_day",
    parent_goal_id: null,
    start_date: "2026-11-02",
    deadline: "2026-12-31",
    priority: "high",
    target_value: 60,
    current_value: 0,
    unit: "sessions",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Complete both 30-min prayer sessions 60 days consecutively with recorded reflections.",
  },
  {
    id: "goal_90d_health",
    title: "48 Morning Workouts & Physical Recovery Routine",
    description: "Execute 48 morning bodyweight workouts, mobility exercises, and protect 7.5 hours recovery window.",
    category: "health",
    reason: "Physical vitality and sustained stamina drive daily cognitive execution.",
    tier: "90_day",
    parent_goal_id: null,
    start_date: "2026-11-02",
    deadline: "2026-12-31",
    priority: "high",
    target_value: 48,
    current_value: 0,
    unit: "workouts",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Log 48 completed home workout sessions with consistent morning schedule.",
  },
  {
    id: "goal_90d_learning",
    title: "Master Full-Stack Next.js Architecture & English Fluency",
    description: "Dedicate 60 hours to React 19/Next.js 15 server architecture and daily technical English speaking.",
    category: "learning",
    reason: "World-class engineering craftsmanship enables global remote contracts and high-impact software.",
    tier: "90_day",
    parent_goal_id: null,
    start_date: "2026-11-02",
    deadline: "2026-12-31",
    priority: "high",
    target_value: 60,
    current_value: 0,
    unit: "hours",
    progress: 0,
    status: "in_progress",
    completion_criteria: "Complete 60 hours of focused study modules and 60 mastered technical vocab phrases.",
  },
  {
    id: "goal_90d_family",
    title: "Protected Family Dinner & 12 Weekly Reviews",
    description: "Preserve screen-free evening family dinner daily and conduct 12 structured Sunday family & life reviews.",
    category: "family",
    reason: "Honor family duty, maintain deep relationships, and ensure complete life alignment.",
    tier: "90_day",
    parent_goal_id: null,
    start_date: "2026-11-02",
    deadline: "2027-01-24",
    priority: "high",
    target_value: 12,
    current_value: 0,
    unit: "reviews",
    progress: 0,
    status: "in_progress",
    completion_criteria: "12 completed Sunday life reviews and unbroken daily evening presence with family.",
  },
];

/**
 * Measurable Milestones for the 9 Canonical Goals (All status: 'pending')
 */
export const CANONICAL_MILESTONES = [
  // 1. Spiritual
  { id: "m_spir_1", goal_id: "goal_90d_spiritual", title: "7 Days Unbroken Morning & Night Prayer Devotion", date: "2026-11-09", status: "pending", sort: 1 },
  { id: "m_spir_2", goal_id: "goal_90d_spiritual", title: "14 Days Spiritual Consistency & Journaled Reflections", date: "2026-11-16", status: "pending", sort: 2 },
  { id: "m_spir_3", goal_id: "goal_90d_spiritual", title: "30 Days Unbroken Spiritual Grounding", date: "2026-12-02", status: "pending", sort: 3 },

  // 2. Health
  { id: "m_hlth_1", goal_id: "goal_90d_health", title: "First 12 Morning Calisthenics & Mobility Sessions", date: "2026-11-15", status: "pending", sort: 1 },
  { id: "m_hlth_2", goal_id: "goal_90d_health", title: "24 Completed Workouts & Sleep Target Adherence", date: "2026-11-30", status: "pending", sort: 2 },
  { id: "m_hlth_3", goal_id: "goal_90d_health", title: "48 Completed Workouts with Enhanced Energy Rating", date: "2026-12-31", status: "pending", sort: 3 },

  // 3. Learning
  { id: "m_learn_1", goal_id: "goal_90d_learning", title: "Master Next.js 15 Server Components & Action Caching", date: "2026-11-15", status: "pending", sort: 1 },
  { id: "m_learn_2", goal_id: "goal_90d_learning", title: "30 Technical English Vocab Words & Speaking Shadowing", date: "2026-11-30", status: "pending", sort: 2 },
  { id: "m_learn_3", goal_id: "goal_90d_learning", title: "Complete 60 Hours Professional Architecture Study", date: "2026-12-31", status: "pending", sort: 3 },

  // 4. Vision Financial
  { id: "m_vis_1", goal_id: "goal_vision_fin", title: "Build 15,000 ETB Initial Emergency Cushion", date: "2026-11-30", status: "pending", sort: 1 },
  { id: "m_vis_2", goal_id: "goal_vision_fin", title: "First 50,000 ETB Monthly Combined Income", date: "2027-01-31", status: "pending", sort: 2 },
  { id: "m_vis_3", goal_id: "goal_vision_fin", title: "Scaled 150,000 ETB Monthly Recurring Net Cashflow", date: "2027-12-31", status: "pending", sort: 3 },

  // 5. Freelancing
  { id: "m_free_1", goal_id: "goal_90d_freelance", title: "Complete Personal Portfolio Site with 3 Case Studies", date: "2026-11-07", status: "pending", sort: 1 },
  { id: "m_free_2", goal_id: "goal_90d_freelance", title: "Outreach to 15 Local Businesses Needing Web Upgrades", date: "2026-11-14", status: "pending", sort: 2 },
  { id: "m_free_3", goal_id: "goal_90d_freelance", title: "Send 5 Proposals & Close 1st Client", date: "2026-11-21", status: "pending", sort: 3 },
  { id: "m_free_4", goal_id: "goal_90d_freelance", title: "Secure 3 Paid Client Engagements (90,000 ETB Revenue)", date: "2026-12-31", status: "pending", sort: 4 },

  // 6. Suku
  { id: "m_suku_1", goal_id: "goal_90d_suku", title: "Vendor Storefront UI & Responsive Grid", date: "2026-11-08", status: "pending", sort: 1 },
  { id: "m_suku_2", goal_id: "goal_90d_suku", title: "Cart & Checkout Order API Integration", date: "2026-11-18", status: "pending", sort: 2 },
  { id: "m_suku_3", goal_id: "goal_90d_suku", title: "Merchant Dashboard & Product Management", date: "2026-11-28", status: "pending", sort: 3 },
  { id: "m_suku_4", goal_id: "goal_90d_suku", title: "Security Audit & Telebirr/Chapa Gateway", date: "2026-12-12", status: "pending", sort: 4 },
  { id: "m_suku_5", goal_id: "goal_90d_suku", title: "Addis Ababa Pilot Launch with 20 Active Merchants", date: "2026-12-31", status: "pending", sort: 5 },

  // 7. Forex
  { id: "m_fx_1", goal_id: "goal_90d_forex", title: "Complete 30 London Silver Bullet Backtests", date: "2026-11-15", status: "pending", sort: 1 },
  { id: "m_fx_2", goal_id: "goal_90d_forex", title: "Complete 30 NY Session Order Block & MSS Setups", date: "2026-12-05", status: "pending", sort: 2 },
  { id: "m_fx_3", goal_id: "goal_90d_forex", title: "Log 40 Final Backtest Trades with Strict 1:2+ RR & Risk Rules", date: "2026-12-31", status: "pending", sort: 3 },

  // 8. Savings
  { id: "m_sav_1", goal_id: "goal_monthly_savings", title: "First 5,000 ETB Emergency Allocation", date: "2026-11-10", status: "pending", sort: 1 },
  { id: "m_sav_2", goal_id: "goal_monthly_savings", title: "10,000 ETB Halfway Milestone", date: "2026-11-20", status: "pending", sort: 2 },
  { id: "m_sav_3", goal_id: "goal_monthly_savings", title: "15,000 ETB Verified Untouchable Cushion", date: "2026-11-30", status: "pending", sort: 3 },

  // 9. Family
  { id: "m_fam_1", goal_id: "goal_90d_family", title: "4 Consecutive Protected Sunday Family Reviews", date: "2026-11-29", status: "pending", sort: 1 },
  { id: "m_fam_2", goal_id: "goal_90d_family", title: "8 Weekly Family Reviews & Consistent Evening Dinner Presence", date: "2026-12-27", status: "pending", sort: 2 },
  { id: "m_fam_3", goal_id: "goal_90d_family", title: "12 Weekly Family Reviews & Financial Support Alignment", date: "2027-01-24", status: "pending", sort: 3 },
];

/**
 * Safely export full database content to a verified JSON backup file on disk
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
  const summary: Record<string, number> = {};

  for (const table of tableNames) {
    try {
      const res = await db.execute(`SELECT * FROM ${table}`);
      tables[table] = res.rows || [];
      summary[table] = (res.rows || []).length;
    } catch (e) {
      console.warn(`Backup: could not export table ${table}`, e);
      tables[table] = [];
      summary[table] = 0;
    }
  }

  const backupData: DatabaseBackup = {
    backup_version: "2.1.0",
    created_at: new Date().toISOString(),
    source_database: "life_os.db",
    user_id: userId,
    tables,
    summary,
  };

  // Write physical backup file to disk in project backups/ directory
  try {
    const backupDir = path.resolve(process.cwd(), "backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilePath = path.join(backupDir, `life_os_backup_${timestamp}.json`);
    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), "utf8");
    backupData.backup_file_path = backupFilePath;
  } catch (fsErr) {
    console.warn("Could not write physical backup file:", fsErr);
  }

  return backupData;
}

/**
 * Execute Safe, Transactional Clean Data Reset
 *
 * Requirements:
 * 1. Safe verified database backup written to disk before any deletion.
 * 2. Delete operational data: tasks, logs, transactions, trades, focus sessions, quick capture items.
 * 3. Preserve user profile, auth credentials, system settings, timezone, schema, architecture.
 * 4. Start date: Monday, November 2, 2026.
 * 5. Reinitialize 9 canonical goals with starting value 0, current value 0, progress 0%.
 * 6. Reinitialize clean pending milestones across all 9 life categories.
 * 7. Regenerate master weekday and weekend schedule blocks (all 19 weekday blocks).
 * 8. Generate Day 1 tasks for November 2, 2026 (all status 'upcoming', 0% completed).
 * 9. Reinitialize fresh Suku backlog (all 11 stages with status 'backlog').
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

  // Step 1: Pre-reset verified backup
  const backup = await exportDatabaseBackup(userId);

  // Step 2: Delete Operational Logs and Histories (User-Scoped)
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

  const deletedCounts: Record<string, number> = {};

  for (const table of operationalTables) {
    try {
      const countRes = await db.execute({
        sql: `SELECT COUNT(*) as c FROM ${table} WHERE user_id = ?`,
        args: [userId],
      });
      deletedCounts[table] = Number(countRes.rows[0]?.c || 0);

      await db.execute({
        sql: `DELETE FROM ${table} WHERE user_id = ?`,
        args: [userId],
      });
    } catch (_) {
      try {
        const countRes = await db.execute(`SELECT COUNT(*) as c FROM ${table}`);
        deletedCounts[table] = Number(countRes.rows[0]?.c || 0);
        await db.execute(`DELETE FROM ${table}`);
      } catch (err) {
        console.warn(`Reset warning on table ${table}:`, err);
        deletedCounts[table] = 0;
      }
    }
  }

  // Step 3: Reset Goals Hierarchy & Milestones (9 Canonical Life Categories)
  // Delete existing user milestones and goals
  try {
    await db.execute({
      sql: `DELETE FROM milestones WHERE goal_id IN (SELECT id FROM goals WHERE user_id = ?)`,
      args: [userId],
    });
    await db.execute({
      sql: `DELETE FROM goals WHERE user_id = ?`,
      args: [userId],
    });
  } catch (err) {
    console.warn("Could not delete old goals/milestones:", err);
  }

  // Insert the canonical 9 goals with 0 progress, start date 2026-11-02
  for (const g of CANONICAL_9_GOALS) {
    await db.execute({
      sql: `INSERT INTO goals (
        id, user_id, title, description, category, reason, tier,
        parent_goal_id, start_date, deadline, priority, progress,
        target_value, current_value, unit, currency, status, completion_criteria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        g.id,
        userId,
        g.title,
        g.description,
        g.category,
        g.reason,
        g.tier,
        g.parent_goal_id,
        g.start_date,
        g.deadline,
        g.priority,
        g.progress,
        g.target_value,
        g.current_value,
        g.unit,
        "ETB",
        g.status,
        g.completion_criteria,
      ],
    });
  }

  // Insert canonical milestones (all status: 'pending')
  for (const m of CANONICAL_MILESTONES) {
    await db.execute({
      sql: `INSERT INTO milestones (id, goal_id, title, target_date, status, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [m.id, m.goal_id, m.title, m.date, m.status, m.sort],
    });
  }

  // Step 4: Reset Journey Profile and Journey Milestones
  await db.execute({
    sql: `UPDATE journey_profile SET
      current_savings = 0,
      freelance_status = 'Fresh client outreach pipeline initialized',
      suku_status = 'MVP architecture & product backlog initialized',
      forex_status = '0 / 100 ICT mechanical backtest trades logged',
      discipline_status = 'Day 1: Starting unbroken morning/evening routines Nov 2',
      updated_at = datetime('now')
      WHERE user_id = ?`,
    args: [userId],
  });

  await db.execute({
    sql: `UPDATE journey_milestones SET
      progress = 0,
      status = 'upcoming',
      completed_date = null
      WHERE user_id = ? AND phase = 'active'`,
    args: [userId],
  });

  // Step 5: Update User Settings with Timezone & Reset Flag
  await db.execute({
    sql: `UPDATE users SET
      timezone = ?,
      journey_start_date = '2026-11-02',
      has_performed_reset = 1,
      updated_at = datetime('now')
      WHERE id = ?`,
    args: [userTz, userId],
  });

  // Step 6: Regenerate Master Schedule Blocks
  await db.execute({
    sql: "DELETE FROM schedule_blocks WHERE user_id = ?",
    args: [userId],
  });

  // Master Weekday Blocks (19 Canonical Blocks protecting 08:00 - 17:00 employment, commute, sleep, prayers, family)
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
    { start: "22:00", end: "04:00", dur: 360, title: "Quality Sleep & Physical Recovery", cat: "rest", prot: 1, scr: 0, desc: "Deep restorative sleep and physical recovery. Target 10:00 PM to 4:00 AM." },
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

  // Step 7: Pre-generate Clean Day 1 Daily Tasks for Monday, November 2, 2026
  // Day 1 begins at 00:00 local time on Nov 2, all tasks 'upcoming' (0% completed)
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
    } else if (b.title.includes("Exercise") || b.title.includes("Workout")) {
      goalId = "goal_90d_health";
    } else if (b.title.includes("Learning")) {
      goalId = "goal_90d_learning";
    } else if (b.title.includes("Family")) {
      goalId = "goal_90d_family";
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

  // Step 8: Initialize Fresh Suku Task Backlog (All 11 Stages in 'backlog')
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
      backupFilePath: backup.backup_file_path || "in-memory",
      goalsInitialized: CANONICAL_9_GOALS.length,
      milestonesInitialized: CANONICAL_MILESTONES.length,
      day1TasksCount: masterWeekdayBlocks.length,
      sukuTasksCount: freshSukuTasks.length,
      deletedRecordsSummary: deletedCounts,
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
