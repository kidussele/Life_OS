import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const url = process.env.TURSO_DATABASE_URL || `file:${path.resolve(process.cwd(), "life_os.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

let isInitialized = false;

export async function initDatabase() {
  if (isInitialized) return;

  // Run schema migration
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      title TEXT,
      monthly_salary REAL DEFAULT 30000,
      currency TEXT DEFAULT 'ETB',
      wake_time TEXT DEFAULT '04:00',
      bed_time TEXT DEFAULT '22:00',
      sleep_target_hours REAL DEFAULT 7.5,
      morning_prayer_time TEXT DEFAULT '04:00',
      night_prayer_time TEXT DEFAULT '21:15',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedule_blocks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      day_type TEXT NOT NULL, -- 'weekday', 'saturday', 'sunday', 'all'
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      is_protected INTEGER DEFAULT 0,
      description TEXT,
      requires_screen INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      reason TEXT,
      tier TEXT NOT NULL, -- 'vision', '90_day', 'monthly', 'weekly'
      parent_goal_id TEXT,
      start_date TEXT,
      deadline TEXT,
      priority TEXT DEFAULT 'medium',
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'completed', 'on_hold'
      completion_criteria TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      title TEXT NOT NULL,
      target_date TEXT,
      status TEXT DEFAULT 'pending',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      goal_id TEXT,
      title TEXT NOT NULL,
      instructions TEXT,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'upcoming', -- 'upcoming', 'in_progress', 'completed', 'missed', 'rescheduled', 'skipped'
      is_protected INTEGER DEFAULT 0,
      reschedule_reason TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS prayer_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      prayer_type TEXT NOT NULL, -- 'morning', 'night'
      scheduled_time TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      reflection_notes TEXT,
      gratitude_notes TEXT,
      spiritual_focus TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date, prayer_type)
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      target_frequency TEXT DEFAULT 'daily',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_logs (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );

    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL, -- 'income', 'expense', 'savings_transfer'
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'ETB',
      description TEXT,
      bucket TEXT DEFAULT 'personal', -- 'personal', 'business', 'trading'
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS financial_budgets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      month TEXT NOT NULL,
      category TEXT NOT NULL,
      allocated_amount REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS freelance_clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT,
      contact_info TEXT,
      status TEXT DEFAULT 'lead', -- 'lead', 'contacted', 'proposal_sent', 'negotiation', 'active', 'completed', 'lost'
      service_offered TEXT,
      estimated_value REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS freelance_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      client_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      agreed_price REAL DEFAULT 0,
      deadline TEXT,
      status TEXT DEFAULT 'planning', -- 'planning', 'in_progress', 'review', 'delivered', 'paid'
      deliverables TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS suku_tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      area TEXT NOT NULL, -- 'product', 'ui_ux', 'backend', 'testing', 'security', 'deployment', 'marketing', 'launch'
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'backlog', -- 'backlog', 'in_progress', 'completed'
      target_date TEXT,
      stage_id INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS forex_trades (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      account_type TEXT NOT NULL, -- 'backtest', 'demo', 'live', 'prop_firm'
      pair TEXT NOT NULL,
      direction TEXT NOT NULL,
      setup_model TEXT NOT NULL,
      session TEXT,
      entry_price REAL,
      stop_loss REAL,
      take_profit REAL,
      exit_price REAL,
      risk_reward_ratio REAL,
      result_r REAL,
      outcome TEXT DEFAULT 'open', -- 'win', 'loss', 'breakeven', 'open'
      emotional_state TEXT,
      rules_followed INTEGER DEFAULT 1,
      notes TEXT,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_modules (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      title TEXT NOT NULL,
      objective TEXT,
      duration_minutes INTEGER DEFAULT 40,
      completed INTEGER DEFAULT 0,
      notes TEXT,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS english_vocab (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      word_phrase TEXT NOT NULL,
      definition TEXT NOT NULL,
      example_sentence TEXT,
      mastery_level INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS daily_reflections (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      morning_intention TEXT,
      evening_wins TEXT,
      evening_improvements TEXT,
      energy_rating INTEGER DEFAULT 3,
      discipline_rating INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      action_suggested TEXT,
      timestamp TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      category TEXT NOT NULL,
      time TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journey_profile (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      education TEXT DEFAULT 'Computer Science Graduate',
      employment_status TEXT DEFAULT 'Full-time Software Engineer',
      monthly_salary REAL DEFAULT 30000,
      currency TEXT DEFAULT 'ETB',
      current_savings REAL DEFAULT 0,
      family_contribution REAL DEFAULT 10000,
      freelance_status TEXT DEFAULT 'Portfolio building & client outreach',
      suku_status TEXT DEFAULT 'MVP development & merchant onboarding',
      forex_status TEXT DEFAULT 'Demo trading & ICT model testing',
      english_status TEXT DEFAULT 'Daily speaking & technical vocabulary',
      discipline_status TEXT DEFAULT '4:00 AM wake up, daily prayers, workout & focus blocks',
      bio_notes TEXT DEFAULT 'Committed to discipline, family duty, and financial independence.',
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journey_milestones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      target_date TEXT,
      completed_date TEXT,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'upcoming',
      delay_reason TEXT,
      recovery_plan TEXT,
      prerequisite TEXT,
      related_tasks TEXT,
      image_url TEXT,
      image_caption TEXT,
      is_achievement INTEGER DEFAULT 0,
      phase TEXT DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS journey_destinations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      target_year TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS breathing_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      session_type TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      completed INTEGER DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS health_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      sleep_hours REAL DEFAULT 7.0,
      sleep_quality INTEGER DEFAULT 85,
      workout_completed INTEGER DEFAULT 0,
      workout_title TEXT,
      workout_minutes INTEGER DEFAULT 0,
      recovery_score INTEGER DEFAULT 90,
      hydration_glasses INTEGER DEFAULT 6,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE TABLE IF NOT EXISTS family_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      activity_title TEXT NOT NULL,
      category TEXT DEFAULT 'activity',
      duration_minutes INTEGER DEFAULT 30,
      notes TEXT,
      completed INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      week_start_date TEXT NOT NULL,
      week_end_date TEXT NOT NULL,
      completed_tasks_count INTEGER DEFAULT 0,
      missed_tasks_count INTEGER DEFAULT 0,
      total_focus_minutes INTEGER DEFAULT 0,
      wins_reflection TEXT,
      challenges_reflection TEXT,
      adjustments_plan TEXT,
      proposed_schedule TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, week_start_date)
    );

    CREATE TABLE IF NOT EXISTS focus_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      task_id TEXT,
      goal_id TEXT,
      title TEXT NOT NULL,
      target_duration_minutes INTEGER NOT NULL,
      actual_duration_seconds INTEGER DEFAULT 0,
      interrupted INTEGER DEFAULT 0,
      interruption_reason TEXT,
      status TEXT DEFAULT 'completed', -- 'completed', 'interrupted', 'in_progress'
      started_at TEXT NOT NULL,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quick_capture_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL, -- 'task', 'idea', 'expense', 'reminder', 'note', 'project_idea', 'goal', 'problem'
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      assigned_to TEXT,
      is_processed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  try {
    await db.execute("ALTER TABLE suku_tasks ADD COLUMN stage_id INTEGER DEFAULT 1");
  } catch (_) {
    // Column already exists
  }

  try {
    await db.execute("ALTER TABLE freelance_projects ADD COLUMN deliverables_completed INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE freelance_projects ADD COLUMN deliverables_total INTEGER DEFAULT 1");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE freelance_projects ADD COLUMN paid_amount REAL DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE freelance_projects ADD COLUMN paid_at TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Africa/Addis_Ababa'");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE users ADD COLUMN journey_start_date TEXT DEFAULT '2026-11-02'");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE users ADD COLUMN has_performed_reset INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN skip_reason TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN actual_duration_minutes INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN timer_started_at TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN timer_accumulated_seconds INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN depends_on_task_id TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN recurrence TEXT DEFAULT 'none'");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN is_daily_priority INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN habit_id TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE daily_tasks ADD COLUMN schedule_block_id TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE goals ADD COLUMN target_value REAL DEFAULT 100");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE goals ADD COLUMN current_value REAL DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE goals ADD COLUMN unit TEXT DEFAULT '%'");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE goals ADD COLUMN currency TEXT DEFAULT 'ETB'");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN tasks_completed INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN tasks_missed INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN goals_progressed INTEGER DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN actual_spending REAL DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN savings_progress REAL DEFAULT 0");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN suggestions_json TEXT");
  } catch (_) {}

  try {
    await db.execute("ALTER TABLE weekly_reviews ADD COLUMN status TEXT DEFAULT 'draft'");
  } catch (_) {}

  isInitialized = true;
}

