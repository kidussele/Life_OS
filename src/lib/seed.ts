import { db, initDatabase } from "./db";
import bcrypt from "bcryptjs";

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
      wake_time, bed_time, sleep_target_hours, morning_prayer_time, night_prayer_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
    ],
  });

  // 2. Schedule Blocks (Weekday)
  const weekdayBlocks = [
    { start: "04:00", end: "04:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Prayer, gratitude, reflection, and spiritual preparation. Non-negotiable." },
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
    { start: "18:30", end: "19:15", dur: 45, title: "Family & Dinner", cat: "family", prot: 1, scr: 0, desc: "Dinner with family, meaningful conversation, connection." },
    { start: "19:15", end: "20:15", dur: 60, title: "Main Development Session", cat: "development", prot: 0, scr: 1, desc: "Weekly rotation: Freelancing, Forex Backtesting, Suku Marketplace, or Software Architecture." },
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
    { day: "saturday", start: "05:00", end: "05:30", dur: 30, title: "Morning Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Spiritual start to the weekend." },
    { day: "saturday", start: "05:30", end: "06:30", dur: 60, title: "Physical Fitness & Cardio", cat: "health", prot: 0, scr: 0, desc: "Extended weekend workout or run." },
    { day: "saturday", start: "08:30", end: "12:00", dur: 210, title: "Deep Work: Suku Marketplace", cat: "development", prot: 0, scr: 1, desc: "Core feature engineering, API endpoints, marketplace UI." },
    { day: "saturday", start: "14:00", end: "17:00", dur: 180, title: "Freelancing & Client Projects", cat: "development", prot: 0, scr: 1, desc: "Portfolio work, client deliverables, outreach." },
    { day: "saturday", start: "18:00", end: "21:15", dur: 195, title: "Family & Social Connection", cat: "family", prot: 1, scr: 0, desc: "Meaningful time with family and friends." },
    { day: "saturday", start: "21:15", end: "21:45", dur: 30, title: "Night Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Gratitude and spiritual closure." },
    
    { day: "sunday", start: "06:00", end: "08:00", dur: 120, title: "Spiritual Fellowship & Prayer", cat: "spiritual", prot: 1, scr: 0, desc: "Church attendance, dedicated prayer, worship." },
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

  // 3. Goals Hierarchy (Vision -> 90-day -> Monthly -> Weekly)
  const goals = [
    {
      id: "goal_vision_fin",
      title: "Achieve Complete Financial Independence",
      desc: "Reach 150,000+ ETB monthly recurring income across software development, Suku marketplace, and freelancing, while maintaining emergency savings and supporting family.",
      cat: "financial",
      reason: "Build long-term security, eliminate money stress, provide abundantly for my family, and gain sovereign control of my time.",
      tier: "vision",
      parent: null,
      start: "2026-01-01",
      deadline: "2027-12-31",
      priority: "high",
      progress: 25,
      status: "in_progress",
      criteria: "Sustainable net cashflow of 150,000 ETB/mo with 6 months emergency savings (180,000 ETB).",
    },
    {
      id: "goal_90d_freelance",
      title: "Land First 3 High-Value Software Clients",
      desc: "Package full-stack Next.js/React development services, build live portfolio with case studies, and secure 3 paid clients.",
      cat: "freelancing",
      reason: "Generate immediate supplementary income beyond the 30,000 ETB salary.",
      tier: "90_day",
      parent: "goal_vision_fin",
      start: "2026-10-01",
      deadline: "2026-12-31",
      priority: "high",
      progress: 40,
      status: "in_progress",
      criteria: "Sign contracts for 3 freelance projects totaling at least 90,000 ETB in client revenue.",
    },
    {
      id: "goal_90d_suku",
      title: "Launch Suku Ethiopian Marketplace MVP",
      desc: "Complete vendor onboarding, product listing catalogue, secure checkout flow, and initial Addis Ababa merchant pilot.",
      cat: "business",
      reason: "Create an enduring digital commerce platform for local Ethiopian merchants and customers.",
      tier: "90_day",
      parent: "goal_vision_fin",
      start: "2026-10-15",
      deadline: "2027-01-15",
      priority: "high",
      progress: 60,
      status: "in_progress",
      criteria: "Production deployment with 20 active merchants, 100 listed products, and zero critical security flaws.",
    },
    {
      id: "goal_90d_forex",
      title: "Master ICT Methodology & Complete 100 Demo Backtests",
      desc: "Backtest MSS, Order Blocks, and Silver Bullet on EURUSD & GBPUSD with strict 1:2+ R:R, logging all trades without risking real capital.",
      cat: "forex",
      reason: "Build proven psychological discipline and mechanical consistency before risking real money or taking prop challenges.",
      tier: "90_day",
      parent: "goal_vision_fin",
      start: "2026-10-01",
      deadline: "2026-12-31",
      priority: "medium",
      progress: 45,
      status: "in_progress",
      criteria: "100 logged backtest/demo trades with positive expectancy, maximum 3% drawdown, and 100% adherence to risk rules.",
    },
    {
      id: "goal_90d_spiritual",
      title: "30-Day Unbroken Morning & Night Prayer Consistency",
      desc: "Protect 04:00 AM morning prayer and 21:15 PM night prayer as sacred, non-negotiable appointments.",
      cat: "spiritual",
      reason: "Spiritual groundedness and gratitude are the bedrock of my peace, discipline, and purpose in life.",
      tier: "90_day",
      parent: null,
      start: "2026-10-01",
      deadline: "2026-12-31",
      priority: "high",
      progress: 80,
      status: "in_progress",
      criteria: "Complete both 30-min prayer sessions 60 days consecutively with recorded reflections.",
    },
    {
      id: "goal_monthly_savings",
      title: "Establish Initial 15,000 ETB Emergency Fund",
      desc: "Disciplined allocation of salary and freelance proceeds to build an untouchable emergency cushion.",
      cat: "financial",
      reason: "Break the cycle of zero savings and establish financial peace of mind.",
      tier: "monthly",
      parent: "goal_vision_fin",
      start: "2026-11-02",
      deadline: "2026-11-30",
      priority: "high",
      progress: 20,
      status: "in_progress",
      criteria: "15,000 ETB verified balance in designated emergency savings account.",
    },
  ];

  for (const g of goals) {
    await db.execute({
      sql: `INSERT INTO goals (
        id, user_id, title, description, category, reason, tier,
        parent_goal_id, start_date, deadline, priority, progress, status, completion_criteria
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        g.id,
        userId,
        g.title,
        g.desc,
        g.cat,
        g.reason,
        g.tier,
        g.parent,
        g.start,
        g.deadline,
        g.priority,
        g.progress,
        g.status,
        g.criteria,
      ],
    });
  }

  // Milestones for Suku & Freelancing
  const milestones = [
    { id: "m_suku_1", goal_id: "goal_90d_suku", title: "Vendor Storefront UI & Responsive Grid", date: "2026-11-05", status: "completed", sort: 1 },
    { id: "m_suku_2", goal_id: "goal_90d_suku", title: "Cart & Checkout Order API Integration", date: "2026-11-15", status: "pending", sort: 2 },
    { id: "m_suku_3", goal_id: "goal_90d_suku", title: "Merchant Dashboard & Product Management", date: "2026-11-25", status: "pending", sort: 3 },
    { id: "m_suku_4", goal_id: "goal_90d_suku", title: "Security Audit & Telebirr/Chapa Gateway", date: "2026-12-10", status: "pending", sort: 4 },
    { id: "m_free_1", goal_id: "goal_90d_freelance", title: "Complete Personal Portfolio Site with 3 Case Studies", date: "2026-11-07", status: "completed", sort: 1 },
    { id: "m_free_2", goal_id: "goal_90d_freelance", title: "Outreach to 15 Local Businesses Needing Web Upgrades", date: "2026-11-14", status: "pending", sort: 2 },
    { id: "m_free_3", goal_id: "goal_90d_freelance", title: "Send 5 Proposals & Close 1st Client", date: "2026-11-21", status: "pending", sort: 3 },
  ];

  for (const m of milestones) {
    await db.execute({
      sql: `INSERT INTO milestones (id, goal_id, title, target_date, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [m.id, m.goal_id, m.title, m.date, m.status, m.sort],
    });
  }

  // 4. Daily Tasks for Today (Initial date: 2026-11-02)
  const today = new Date().toISOString().split("T")[0]; // Use current local date
  const todayTasks = [
    {
      id: `task_today_1`,
      title: "Morning Prayer & Gratitude Reflection",
      inst: "Dedicate 30 quiet minutes for spiritual devotion, thanking God for life and wisdom, praying for family and discipline.",
      cat: "spiritual",
      start: "04:00",
      end: "04:30",
      dur: 30,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: "goal_90d_spiritual",
    },
    {
      id: `task_today_2`,
      title: "Morning Home Workout & Mobility Routine",
      inst: "Dynamic warmup (5m), pushups/pullups circuit (15m), core planks (5m), cooldown stretching (5m).",
      cat: "health",
      start: "04:30",
      end: "05:00",
      dur: 30,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_3`,
      title: "Shower & Healthy Breakfast",
      inst: "Personal hygiene, high-protein breakfast, hydration, physical readiness.",
      cat: "health",
      start: "05:00",
      end: "05:30",
      dur: 30,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_4`,
      title: "English Practice: Technical Pitch & Pronunciation",
      inst: "Shadowing exercise: 15 min listening to native tech podcast. 15 min recording speaking notes on software design.",
      cat: "learning",
      start: "05:30",
      end: "06:00",
      dur: 30,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_5`,
      title: "Professional Study: Next.js 15 Server Actions & Caching",
      inst: "Study Next.js caching architecture, unstable_cache, and clean relational query patterns.",
      cat: "learning",
      start: "06:00",
      end: "06:40",
      dur: 40,
      priority: "high",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_6`,
      title: "Work Preparation & Mental Transition",
      inst: "Pack essentials, review high-impact priorities, check commute route, set calm focused mindset.",
      cat: "preparation",
      start: "06:40",
      end: "07:00",
      dur: 20,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_7`,
      title: "Morning Commute & Audio Learning",
      inst: "Listen to English podcast or software architecture audio. Zero screen hazard while in transit.",
      cat: "commute",
      start: "07:00",
      end: "08:00",
      dur: 60,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_8`,
      title: "Employment Focus Session (Morning)",
      inst: "Execute core company responsibilities with 100% presence and high standard.",
      cat: "work",
      start: "08:00",
      end: "12:00",
      dur: 240,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: null,
    },
    {
      id: `task_today_9`,
      title: "Lunch & Recovery",
      inst: "Wholesome meal, step away from computer screen, 15 min fresh air walk, mental recharge.",
      cat: "health",
      start: "12:00",
      end: "13:00",
      dur: 60,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_10`,
      title: "Employment Focus Session (Afternoon)",
      inst: "Complete work tickets, conduct code reviews, and plan tomorrow's deliverables.",
      cat: "work",
      start: "13:00",
      end: "17:00",
      dur: 240,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: null,
    },
    {
      id: `task_today_11`,
      title: "Evening Commute & Mental Transition",
      inst: "Transition mentally from work to personal development. Relax breathing, listen to audio or light music.",
      cat: "commute",
      start: "17:00",
      end: "18:00",
      dur: 60,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_12`,
      title: "Arrival & Recovery",
      inst: "Change clothes, wash up, hydrate, transition peacefully into evening routine.",
      cat: "rest",
      start: "18:00",
      end: "18:30",
      dur: 30,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_13`,
      title: "Family Time & Dinner Together",
      inst: "Put phone away. Enjoy dinner, check in on family members, listen and support.",
      cat: "family",
      start: "18:30",
      end: "19:15",
      dur: 45,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: null,
    },
    {
      id: `task_today_14`,
      title: "Main Development: Freelancing & Portfolio Showcase",
      inst: "Build client demonstration components, optimize portfolio case studies, refine service proposals.",
      cat: "freelancing",
      start: "19:15",
      end: "20:15",
      dur: 60,
      priority: "high",
      status: "upcoming",
      prot: 0,
      goal: "goal_90d_freelance",
    },
    {
      id: `task_today_15`,
      title: "Light Responsibilities & Planning",
      inst: "Record today's transportation and food expenses in LIFE OS, verify ETB balance.",
      cat: "planning",
      start: "20:15",
      end: "20:45",
      dur: 30,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: "goal_monthly_savings",
    },
    {
      id: `task_today_16`,
      title: "Family Time & Wind-down",
      inst: "Spend quality time with family. Dim room lighting, disconnect from high-stimulus screens.",
      cat: "family",
      start: "20:45",
      end: "21:15",
      dur: 30,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: null,
    },
    {
      id: `task_today_17`,
      title: "Night Prayer & Spiritual Reflection",
      inst: "Quiet gratitude, confession, peace, and spiritual renewal. Non-negotiable 30 minutes.",
      cat: "spiritual",
      start: "21:15",
      end: "21:45",
      dur: 30,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: "goal_90d_spiritual",
    },
    {
      id: `task_today_18`,
      title: "Sleep Preparation & Screen Wind-down",
      inst: "Prep clothes for 04:00 AM, dim room lights, prepare for restful sleep.",
      cat: "rest",
      start: "21:45",
      end: "22:00",
      dur: 15,
      priority: "medium",
      status: "upcoming",
      prot: 0,
      goal: null,
    },
    {
      id: `task_today_19`,
      title: "Quality Sleep & Physical Recovery",
      inst: "Target 10:00 PM to 4:00 AM deep restorative sleep for next-day peak cognitive performance.",
      cat: "rest",
      start: "22:00",
      end: "04:00",
      dur: 360,
      priority: "high",
      status: "upcoming",
      prot: 1,
      goal: null,
    },
  ];

  for (const t of todayTasks) {
    await db.execute({
      sql: `INSERT INTO daily_tasks (
        id, user_id, goal_id, title, instructions, category, date,
        start_time, end_time, duration_minutes, priority, status, is_protected
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        t.id,
        userId,
        t.goal,
        t.title,
        t.inst,
        t.cat,
        today,
        t.start,
        t.end,
        t.dur,
        t.priority,
        t.status,
        t.prot,
      ],
    });
  }

  // 5. Prayer Logs
  await db.execute({
    sql: `INSERT INTO prayer_logs (
      id, user_id, date, prayer_type, scheduled_time, duration_minutes,
      completed, completed_at, reflection_notes, gratitude_notes, spiritual_focus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      `pl_m_${today}`,
      userId,
      today,
      "morning",
      "04:00",
      30,
      1,
      `${today} 04:32:00`,
      "Prayed for clarity, patience at work, and mental discipline. Felt calm and strengthened.",
      "Thankful for good health, family safety, and another day of purposeful work.",
      "Steadfastness and integrity",
    ],
  });

  await db.execute({
    sql: `INSERT INTO prayer_logs (
      id, user_id, date, prayer_type, scheduled_time, duration_minutes,
      completed, completed_at, reflection_notes, gratitude_notes, spiritual_focus
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      `pl_n_${today}`,
      userId,
      today,
      "night",
      "21:15",
      30,
      0,
      null,
      null,
      null,
      "Peace and gratitude before rest",
    ],
  });

  // 6. Habits & Habit Logs
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

    // Initialize all habits as pending for clean start
    const isCompletedMorning = 0;
    await db.execute({
      sql: `INSERT INTO habit_logs (id, habit_id, date, completed) VALUES (?, ?, ?, ?)`,
      args: [`hl_${h.id}_${today}`, h.id, today, isCompletedMorning],
    });
  }

  // 7. Financial Transactions & Budgets (30,000 ETB salary, 10,000 ETB family contribution)
  const initialTransactions = [
    {
      id: "tx_1",
      date: `${today.substring(0, 7)}-01`,
      type: "income",
      cat: "salary",
      amount: 30000,
      desc: "Monthly Employment Salary",
      bucket: "personal",
    },
    {
      id: "tx_2",
      date: `${today.substring(0, 7)}-02`,
      type: "expense",
      cat: "family_contribution",
      amount: 10000,
      desc: "Monthly Family Contribution Support",
      bucket: "personal",
    },
    {
      id: "tx_3",
      date: `${today.substring(0, 7)}-03`,
      type: "expense",
      cat: "transportation",
      amount: 2200,
      desc: "Monthly Commute & Taxi pass",
      bucket: "personal",
    },
    {
      id: "tx_4",
      date: `${today.substring(0, 7)}-04`,
      type: "expense",
      cat: "food",
      amount: 3500,
      desc: "Groceries & daily sustenance",
      bucket: "personal",
    },
    {
      id: "tx_5",
      date: `${today.substring(0, 7)}-05`,
      type: "savings_transfer",
      cat: "emergency_fund",
      amount: 3000,
      desc: "Emergency Fund Allocation",
      bucket: "personal",
    },
  ];

  for (const tx of initialTransactions) {
    await db.execute({
      sql: `INSERT INTO financial_transactions (id, user_id, date, type, category, amount, currency, description, bucket)
            VALUES (?, ?, ?, ?, ?, ?, 'ETB', ?, ?)`,
      args: [tx.id, userId, tx.date, tx.type, tx.cat, tx.amount, tx.desc, tx.bucket],
    });
  }

  // 8. Freelance Clients & Projects
  await db.execute({
    sql: `INSERT INTO freelance_clients (id, user_id, name, company, contact_info, status, service_offered, estimated_value, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "client_1",
      userId,
      "Dawit Haile",
      "Addis Logistics Tech",
      "dawit@addislogistics.et",
      "proposal_sent",
      "Next.js Customer Portal & Tracking Dashboard",
      45000,
      "Client requested modern tracking dashboard with mobile view. Sent proposal on Friday.",
    ],
  });

  await db.execute({
    sql: `INSERT INTO freelance_projects (id, user_id, client_id, title, description, agreed_price, deadline, status, deliverables)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      "proj_1",
      userId,
      "client_1",
      "Logistics Dispatch Dashboard",
      "Real-time shipment status, vehicle allocation, and driver dispatch UI",
      45000,
      "2026-11-28",
      "planning",
      "1. Figma UI Prototype; 2. Responsive Next.js Frontend; 3. REST API integration",
    ],
  });

  // 9. Suku Marketplace Tasks (11 Milestone Stages)
  const sukuTasks = [
    { id: "suku_1", area: "product", title: "Product Category Schema Definition", desc: "Define hierarchical taxonomy for local Ethiopian products and crafts", prio: "high", stat: "completed", date: "2026-10-25", stage: 1 },
    { id: "suku_2", area: "ui_ux", title: "Mobile Navigation & Product Filter Sheet", desc: "Design lightweight filtering for low-bandwidth mobile connections", prio: "high", stat: "completed", date: "2026-10-30", stage: 2 },
    { id: "suku_db_arch", area: "backend", title: "Relational Schema & Migration Pipeline for Orders, Merchants & Escrow", desc: "Configure PostgreSQL/SQLite relational schema with ACID transaction isolation for order state transitions.", prio: "high", stat: "in_progress", date: "2026-11-05", stage: 3 },
    { id: "suku_4", area: "security", title: "JWT & Role-Based Authorization for Merchants", desc: "Protect vendor administrative endpoints against unauthorized actions", prio: "high", stat: "backlog", date: "2026-11-20", stage: 4 },
    { id: "suku_catalog_search", area: "product", title: "Product Search & Filter Engine with Amharic / English Support", desc: "Implement fast indexed search over product categories, merchant locations, and pricing tiers.", prio: "high", stat: "backlog", date: "2026-11-15", stage: 5 },
    { id: "suku_3", area: "backend", title: "Cart & Checkout Order API", desc: "Create robust atomic transactions for orders and buyer receipts", prio: "high", stat: "in_progress", date: "2026-11-10", stage: 6 },
    { id: "suku_payment_gateway", area: "payment", title: "Telebirr & Chapa Webhook Listeners with Signature Verification", desc: "Implement idempotent payment callbacks, automatic payment status reconciliation, and customer SMS receipts.", prio: "high", stat: "backlog", date: "2026-11-25", stage: 7 },
    { id: "suku_5", area: "marketing", title: "Pilot Outreach to 20 Bole & Merkato Merchants", desc: "Initial merchant interview and product catalog photography support", prio: "medium", stat: "backlog", date: "2026-12-01", stage: 8 },
    { id: "suku_delivery_dispatch", area: "backend", title: "Addis Ababa Courier Dispatch & Real-Time Tracking State Machine", desc: "Driver dispatch assignments, customer order verification pins, and delivery status updates.", prio: "medium", stat: "backlog", date: "2026-12-10", stage: 9 },
    { id: "suku_testing_qa", area: "testing", title: "End-to-End Playwright Test Suite & Staging Security Audit", desc: "Automate checkout regression suite, load test concurrent orders, and verify merchant permission boundaries.", prio: "high", stat: "backlog", date: "2026-12-20", stage: 10 },
    { id: "suku_mvp_launch", area: "deployment", title: "Production Cloud Run Deployment & Pilot Onboarding of 20 Merchants", desc: "Final DNS cutover, production telemetry with Sentry, and live marketplace launch in Bole & Merkato.", prio: "high", stat: "backlog", date: "2026-12-31", stage: 11 },
  ];

  for (const st of sukuTasks) {
    await db.execute({
      sql: `INSERT INTO suku_tasks (id, user_id, area, title, description, priority, status, target_date, stage_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [st.id, userId, st.area, st.title, st.desc, st.prio, st.stat, st.date, st.stage],
    });
  }

  // 10. Forex Trades (ICT Methodology - Demo & Backtesting)
  const forexTrades = [
    {
      id: "fx_1",
      acc: "demo",
      pair: "EURUSD",
      dir: "BUY",
      model: "ICT Silver Bullet (NY AM FVG + Liquidity Sweep)",
      sess: "NY AM",
      entry: 1.0825,
      sl: 1.0812,
      tp: 1.0855,
      exit: 1.0855,
      rr: 2.3,
      r: 2.3,
      outcome: "win",
      emo: "disciplined",
      rules: 1,
      notes: "Asian high was swept at 09:30 AM NY. MSS occurred with displacement. Entered on 5m FVG retest. Took TP at buy-side liquidity.",
      date: "2026-10-28",
    },
    {
      id: "fx_2",
      acc: "backtest",
      pair: "GBPUSD",
      dir: "SELL",
      model: "ICT Bearish Order Block + MSS",
      sess: "London",
      entry: 1.2980,
      sl: 1.2995,
      tp: 1.2935,
      exit: 1.2935,
      rr: 3.0,
      r: 3.0,
      outcome: "win",
      emo: "calm",
      rules: 1,
      notes: "Clean London open sweep of previous day high. Strong bearish candle closed below swing low. Sold at 15m Bearish OB.",
      date: "2026-10-29",
    },
    {
      id: "fx_3",
      acc: "demo",
      pair: "EURUSD",
      dir: "SELL",
      model: "ICT OTE (Optimal Trade Entry 62-79% Fib)",
      sess: "NY AM",
      entry: 1.0840,
      sl: 1.0852,
      tp: 1.0810,
      exit: 1.0852,
      rr: 2.5,
      r: -1.0,
      outcome: "loss",
      emo: "disciplined",
      rules: 1,
      notes: "Price pushed through OTE due to high-impact US news release. Respected 1R stop loss cleanly without moving it. Good discipline.",
      date: "2026-10-31",
    },
  ];

  for (const ft of forexTrades) {
    await db.execute({
      sql: `INSERT INTO forex_trades (
        id, user_id, account_type, pair, direction, setup_model, session,
        entry_price, stop_loss, take_profit, exit_price, risk_reward_ratio,
        result_r, outcome, emotional_state, rules_followed, notes, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        ft.id,
        userId,
        ft.acc,
        ft.pair,
        ft.dir,
        ft.model,
        ft.sess,
        ft.entry,
        ft.sl,
        ft.tp,
        ft.exit,
        ft.rr,
        ft.r,
        ft.outcome,
        ft.emo,
        ft.rules,
        ft.notes,
        ft.date,
      ],
    });
  }

  // 11. English Vocabulary & Learning
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
            VALUES (?, ?, ?, ?, ?, 3)`,
      args: [`vocab_${i + 1}`, userId, v.word, v.def, v.ex],
    });
  }

  // 12. Initial Daily Reflection
  await db.execute({
    sql: `INSERT INTO daily_reflections (id, user_id, date, morning_intention, evening_wins, evening_improvements, energy_rating, discipline_rating)
          VALUES (?, ?, ?, ?, ?, ?, 4, 5)`,
    args: [
      `refl_${today}`,
      userId,
      today,
      "Stay calm, follow the schedule with excellence, protect prayer time, and make tangible progress on Suku.",
      "Completed morning prayer with deep peace, executed full workout, zero procrastination at employment.",
      "Ensure prompt wind-down tonight at 21:45 to avoid staying up past 22:00.",
    ],
  });

  // 13. System Notifications
  const initialNotifications = [
    {
      id: "notif_1",
      title: "Schedule Advisory: Sleep Target Warning",
      msg: "Your current schedule (04:00 AM wake - 22:00 PM sleep) provides 6.0 hours of sleep. Health experts recommend 7.5+ hours. Consider adjusting bedtime to 21:00 or wake to 05:00 in Settings.",
      cat: "advisory",
      time: "04:00",
    },
    {
      id: "notif_2",
      title: "Sacred Focus: Night Prayer at 21:15",
      msg: "Your 30-minute evening prayer session begins at 21:15. All conflicting tasks are protected.",
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
