import { db, initDatabase } from "./db";
import bcrypt from "bcryptjs";
import { CANONICAL_9_GOALS, CANONICAL_MILESTONES } from "./resetService";

export async function seedInitialData() {
  await initDatabase();

  const userCheck = await db.execute({
    sql: "SELECT id FROM users LIMIT 1",
    args: [],
  });

  if (userCheck.rows.length > 0) {
    return; // Already seeded
  }

  const userId = "user_kidus_01";
  const passwordHash = await bcrypt.hash("discipline2026", 10);

  // 1. Create User Profile
  await db.execute({
    sql: `INSERT INTO users (
      id, email, password_hash, name, title, monthly_salary, currency,
      wake_time, bed_time, sleep_target_hours, morning_prayer_time, night_prayer_time,
      timezone, journey_start_date, has_performed_reset
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      userId,
      "kidus@lifeos.local",
      passwordHash,
      "Kidus Seleshi",
      "Computer Science Graduate & Full-Stack Engineer",
      30000,
      "ETB",
      "04:00",
      "22:00",
      7.5,
      "04:00",
      "21:15",
      "Africa/Addis_Ababa",
      "2026-11-02",
      1,
    ],
  });

  // 2. Schedule Blocks (19 Weekday Blocks)
  const weekdayBlocks = [
    { start: "04:00", end: "04:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Prayer, gratitude, reflection, and spiritual preparation. Non-negotiable anchor." },
    { start: "04:30", end: "05:00", dur: 30, title: "Exercise & Mobility", cat: "health", prot: 0, scr: 0, desc: "Home workout, mobility, stretching, core or light cardio." },
    { start: "05:00", end: "05:30", dur: 30, title: "Shower & Healthy Breakfast", cat: "health", prot: 0, scr: 0, desc: "Personal hygiene, nutritious breakfast, physical readiness." },
    { start: "05:30", end: "06:00", dur: 30, title: "English Learning", cat: "learning", prot: 0, scr: 1, desc: "Speaking practice, vocabulary, listening comprehension, pronunciation." },
    { start: "06:00", end: "06:40", dur: 40, title: "Professional Learning", cat: "learning", prot: 0, scr: 1, desc: "React, Next.js, TypeScript, UI/UX, software architecture." },
    { start: "06:40", end: "07:00", dur: 20, title: "Work Preparation", cat: "preparation", prot: 0, scr: 1, desc: "Check priorities, gather essentials, mental transition." },
    { start: "07:00", end: "08:00", dur: 60, title: "Morning Commute", cat: "commute", prot: 0, scr: 0, desc: "Commute to employment. Audiobooks/podcasts, zero screen hazard." },
    { start: "08:00", end: "12:00", dur: 240, title: "Employment — Morning Focus", cat: "work", prot: 1, scr: 1, desc: "Full-time professional responsibilities. No personal distractions." },
    { start: "12:00", end: "13:00", dur: 60, title: "Lunch & Recovery", cat: "health", prot: 0, scr: 0, desc: "Wholesome lunch, mental break, short walk." },
    { start: "13:00", end: "17:00", dur: 240, title: "Employment — Afternoon Focus", cat: "work", prot: 1, scr: 1, desc: "Finish responsibilities, align with team, prepare handoff." },
    { start: "17:00", end: "18:00", dur: 60, title: "Evening Commute", cat: "commute", prot: 0, scr: 0, desc: "Commute home. Mental decompression and relaxation." },
    { start: "18:00", end: "18:30", dur: 30, title: "Arrival & Recovery", cat: "rest", prot: 0, scr: 0, desc: "Change clothes, wash up, decompress." },
    { start: "18:30", end: "19:15", dur: 45, title: "Family & Dinner", cat: "family", prot: 1, scr: 0, desc: "Dinner with family, meaningful conversation, connection. Non-negotiable." },
    { start: "19:15", end: "20:15", dur: 60, title: "Main Development Session", cat: "development", prot: 0, scr: 1, desc: "Daily rotation: Freelancing, Forex Backtesting, Suku Marketplace, or Architecture." },
    { start: "20:15", end: "20:45", dur: 30, title: "Light Responsibilities & Planning", cat: "planning", prot: 0, scr: 1, desc: "Record expenses, review tomorrow's plan, project notes." },
    { start: "20:45", end: "21:15", dur: 30, title: "Family Time & Wind-down", cat: "family", prot: 1, scr: 0, desc: "Relaxation, family presence, zero demanding work." },
    { start: "21:15", end: "21:45", dur: 30, title: "Night Prayer & Gratitude", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude, spiritual reflection, mental review. Non-negotiable." },
    { start: "21:45", end: "22:00", dur: 15, title: "Sleep Preparation", cat: "rest", prot: 0, scr: 0, desc: "Prepare clothes for tomorrow, turn off screens, dim lights." },
    { start: "22:00", end: "04:00", dur: 360, title: "Quality Sleep & Physical Recovery", cat: "rest", prot: 1, scr: 0, desc: "Deep restorative physical recovery. Target 10:00 PM to 4:00 AM." },
  ];

  for (let i = 0; i < weekdayBlocks.length; i++) {
    const b = weekdayBlocks[i];
    await db.execute({
      sql: `INSERT INTO schedule_blocks (
        id, user_id, day_type, start_time, end_time, duration_minutes,
        title, category, is_protected, description, requires_screen, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        `block_wd_${i + 1}`,
        userId,
        "weekday",
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

  // Saturday & Sunday Blocks
  const weekendBlocks = [
    { day: "saturday", start: "05:00", end: "05:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Spiritual start to the weekend. Non-negotiable." },
    { day: "saturday", start: "05:30", end: "06:30", dur: 60, title: "Physical Fitness & Cardio", cat: "health", prot: 0, scr: 0, desc: "Extended weekend workout or run." },
    { day: "saturday", start: "08:30", end: "12:00", dur: 210, title: "Deep Work: Suku Marketplace", cat: "development", prot: 0, scr: 1, desc: "Core feature engineering, API endpoints, marketplace UI." },
    { day: "saturday", start: "14:00", end: "17:00", dur: 180, title: "Freelancing & Client Projects", cat: "development", prot: 0, scr: 1, desc: "Portfolio work, client deliverables, outreach." },
    { day: "saturday", start: "18:00", end: "21:15", dur: 195, title: "Family & Social Connection", cat: "family", prot: 1, scr: 0, desc: "Meaningful time with family and friends." },
    { day: "saturday", start: "21:15", end: "21:45", dur: 30, title: "Night Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude and spiritual closure. Non-negotiable." },
    
    { day: "sunday", start: "06:00", end: "08:00", dur: 120, title: "Spiritual Fellowship & Church", cat: "spiritual", prot: 1, scr: 0, desc: "Church attendance, dedicated prayer, worship." },
    { day: "sunday", start: "10:00", end: "13:00", dur: 180, title: "Family Sunday Gathering & Lunch", cat: "family", prot: 1, scr: 0, desc: "Quality family time, support, connection." },
    { day: "sunday", start: "15:00", end: "16:30", dur: 90, title: "Weekly Financial & Life Review", cat: "planning", prot: 0, scr: 1, desc: "Review budget, update transactions, analyze habits." },
    { day: "sunday", start: "16:30", end: "18:00", dur: 90, title: "Upcoming Week Planning", cat: "planning", prot: 0, scr: 1, desc: "Schedule priorities, set milestones, prepare mentally." },
    { day: "sunday", start: "21:00", end: "21:30", dur: 30, title: "Night Prayer & Rest Preparation", cat: "spiritual", prot: 1, scr: 0, desc: "Spiritual peace and early sleep." },
  ];

  for (let i = 0; i < weekendBlocks.length; i++) {
    const b = weekendBlocks[i];
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

  // 3. Goals Hierarchy (Canonical 9 Life Categories, Starting Nov 2, 2026, 0% Progress)
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

  // 4. Milestones for Canonical Goals (All status: 'pending')
  for (const m of CANONICAL_MILESTONES) {
    await db.execute({
      sql: `INSERT INTO milestones (id, goal_id, title, target_date, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [m.id, m.goal_id, m.title, m.date, m.status, m.sort],
    });
  }

  // 5. Daily Tasks for Day 1: Monday, November 2, 2026 (All status: 'upcoming')
  const day1Date = "2026-11-02";
  for (let i = 0; i < weekdayBlocks.length; i++) {
    const b = weekdayBlocks[i];
    let goalId: string | null = null;
    if (b.title.includes("Morning Prayer") || b.title.includes("Night Prayer")) {
      goalId = "goal_90d_spiritual";
    } else if (b.title.includes("Exercise") || b.title.includes("Workout")) {
      goalId = "goal_90d_health";
    } else if (b.title.includes("Learning")) {
      goalId = "goal_90d_learning";
    } else if (b.title.includes("Family")) {
      goalId = "goal_90d_family";
    }

    await db.execute({
      sql: `INSERT INTO daily_tasks (
        id, user_id, goal_id, title, instructions, category, date,
        start_time, end_time, duration_minutes, priority, status, is_protected, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, datetime('now'))`,
      args: [
        `task_${day1Date}_${i + 1}`,
        userId,
        goalId,
        b.title,
        b.desc,
        b.cat,
        day1Date,
        b.start,
        b.end,
        b.dur,
        b.prot ? "high" : "medium",
        b.prot,
      ],
    });
  }

  // 6. Habits Catalog (11 Daily Disciplines)
  const initialHabits = [
    { id: "h_wake", name: "04:00 AM Wake-up", cat: "health" },
    { id: "h_m_prayer", name: "Morning Prayer (30 min)", cat: "spiritual" },
    { id: "h_exercise", name: "Daily Exercise & Stretching", cat: "health" },
    { id: "h_english", name: "English Learning & Speaking", cat: "learning" },
    { id: "h_prof_learn", name: "Professional Code Study (40 min)", cat: "learning" },
    { id: "h_work", name: "Employment Focus & Attendance", cat: "work" },
    { id: "h_dev_session", name: "Evening Development Session (60 min)", cat: "development" },
    { id: "h_fin_track", name: "Daily Financial Expense Tracking", cat: "financial" },
    { id: "h_family", name: "Meaningful Family Time", cat: "family" },
    { id: "h_n_prayer", name: "Night Prayer (30 min)", cat: "spiritual" },
    { id: "h_sleep", name: "Sleep Preparation by 22:00", cat: "health" },
  ];

  for (const h of initialHabits) {
    await db.execute({
      sql: `INSERT INTO habits (id, user_id, name, category, target_frequency, is_active) VALUES (?, ?, ?, ?, 'daily', 1)`,
      args: [h.id, userId, h.name, h.cat],
    });
  }

  // 7. Suku Marketplace Backlog (11 Stages, all 'backlog')
  const sukuTasks = [
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

  for (const st of sukuTasks) {
    await db.execute({
      sql: `INSERT INTO suku_tasks (id, user_id, area, title, description, priority, status, target_date, stage_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [st.id, userId, st.area, st.title, st.desc, st.prio, st.stat, st.date, st.stage],
    });
  }

  // 8. Reference English Vocabulary (Static Reference)
  const vocab = [
    { word: "Pragmatic", def: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.", ex: "In software engineering, we take a pragmatic approach to architecture." },
    { word: "Unwavering", def: "Steady or resolute; not wavering or hesitating.", ex: "He approached his morning prayer and daily disciplines with unwavering devotion." },
    { word: "Displacement", def: "In ICT trading: a sudden, aggressive move in price showing institutional sponsorship.", ex: "Wait for the displacement candle before marking the Fair Value Gap." },
    { word: "Tenacity", def: "The quality or fact of being able to grip something firmly; determination.", ex: "Building Suku and mastering software required consistent tenacity." },
  ];

  for (let i = 0; i < vocab.length; i++) {
    const v = vocab[i];
    await db.execute({
      sql: `INSERT INTO english_vocab (id, user_id, word_phrase, definition, example_sentence, mastery_level)
            VALUES (?, ?, ?, ?, ?, 1)`,
      args: [`vocab_${i + 1}`, userId, v.word, v.def, v.ex],
    });
  }

  // 9. Journey Profile Baseline
  await db.execute({
    sql: `INSERT INTO journey_profile (
      id, user_id, education, employment_status, monthly_salary, currency,
      current_savings, family_contribution, freelance_status, suku_status,
      forex_status, english_status, discipline_status, bio_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "prof_kidus_01",
      userId,
      "Computer Science Graduate",
      "Full-time Software Engineer",
      30000,
      "ETB",
      0,
      10000,
      "Fresh client outreach pipeline initialized",
      "MVP architecture & product backlog initialized",
      "0 / 100 ICT mechanical backtest trades logged",
      "Daily technical shadowing & English vocabulary",
      "Day 1: 4:00 AM wake up, prayer anchors, zero distraction focus",
      "Committed to personal discipline, family honor, and absolute financial independence.",
    ],
  });

  // 10. System Advisory Notifications
  const initialNotifications = [
    {
      id: "notif_1",
      title: "Schedule Advisory: Sleep Target Window",
      msg: "Your daily schedule targets 10:00 PM to 4:00 AM (6.0 hours). Protect your evening wind-down at 21:45 to maximize restorative sleep.",
      cat: "advisory",
      time: "04:00",
    },
    {
      id: "notif_2",
      title: "Sacred Anchor: Morning & Night Prayers",
      msg: "Your 30-minute spiritual devotion sessions begin at 04:00 AM and 21:15 PM daily. Non-negotiable anchors.",
      cat: "spiritual",
      time: "21:15",
    },
  ];

  for (const n of initialNotifications) {
    await db.execute({
      sql: `INSERT INTO notifications (id, user_id, title, message, category, time, is_read)
            VALUES (?, ?, ?, ?, ?, ?, 0)`,
      args: [n.id, userId, n.title, n.msg, n.cat, n.time],
    });
  }
}
