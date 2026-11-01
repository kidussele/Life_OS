import { db, initDatabase } from "./db";

export interface JourneyProfile {
  id: string;
  user_id: string;
  education: string;
  employment_status: string;
  monthly_salary: number;
  currency: string;
  current_savings: number;
  family_contribution: number;
  freelance_status: string;
  suku_status: string;
  forex_status: string;
  english_status: string;
  discipline_status: string;
  bio_notes: string;
  updated_at: string;
}

export interface JourneyMilestone {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  target_date: string;
  completed_date?: string | null;
  progress: number;
  status: "completed" | "in_progress" | "upcoming" | "delayed" | "not_started";
  delay_reason?: string | null;
  recovery_plan?: string | null;
  prerequisite?: string | null;
  related_tasks?: string | null;
  image_url: string;
  image_caption?: string | null;
  is_achievement: number;
  phase: "starting" | "completed" | "active" | "upcoming" | "destination";
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface JourneyDestination {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  image_url: string;
  target_year: string;
  sort_order: number;
  created_at: string;
}

export interface BreathingLog {
  id: string;
  user_id: string;
  session_type: string;
  duration_seconds: number;
  completed: number;
  notes?: string | null;
  created_at: string;
}

export async function seedJourneyDataIfEmpty(userId = "user_kidus_01") {
  await initDatabase();

  // Check profile
  const profileCheck = await db.execute({
    sql: "SELECT id FROM journey_profile WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  if (profileCheck.rows.length === 0) {
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
        "Active freelance client outreach & portfolio build",
        "MVP architecture & merchant onboarding pipeline",
        "Demo trading & ICT market model backtesting",
        "Daily technical shadowing & English vocabulary",
        "4:00 AM wake up, prayer anchors, 0 screen commute",
        "Committed to personal discipline, family honor, and absolute financial independence.",
      ],
    });
  }

  // Check milestones
  const milestoneCheck = await db.execute({
    sql: "SELECT id FROM journey_milestones WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  if (milestoneCheck.rows.length === 0) {
    const milestones: Partial<JourneyMilestone>[] = [
      // Starting Point / Completed Baseline
      {
        id: "jm_start_1",
        title: "B.Sc. in Computer Science Graduation",
        description: "Successfully graduated with strong academic foundation in algorithms, software systems, and engineering.",
        category: "career",
        target_date: "2025-07-15",
        completed_date: "2025-07-15",
        progress: 100,
        status: "completed",
        is_achievement: 1,
        phase: "starting",
        image_url: "/journey/cs_graduate.jpg",
        image_caption: "Graduation milestone & CS foundation",
        sort_order: 1,
      },
      {
        id: "jm_start_2",
        title: "Full-Time Software Engineer Employment",
        description: "Secured professional employment with 30,000 ETB salary. Providing 10,000 ETB monthly family contribution.",
        category: "career",
        target_date: "2025-09-01",
        completed_date: "2025-09-01",
        progress: 100,
        status: "completed",
        is_achievement: 1,
        phase: "starting",
        image_url: "/journey/employment.jpg",
        image_caption: "Full-time software engineering role",
        sort_order: 2,
      },
      {
        id: "jm_start_3",
        title: "4:00 AM Non-Negotiable Routine & Prayer Anchors",
        description: "Established daily early morning spiritual prayer, physical exercise, and focused learning blocks.",
        category: "spiritual",
        target_date: "2026-10-01",
        completed_date: "2026-10-01",
        progress: 100,
        status: "completed",
        is_achievement: 1,
        phase: "starting",
        image_url: "/journey/prayer_spiritual.jpg",
        image_caption: "Morning & evening spiritual anchors",
        sort_order: 3,
      },

      // Active / In Progress (Current Position Q4 Sprint)
      {
        id: "jm_act_1",
        title: "Build & Deploy Freelance Portfolio Website",
        description: "Showcase Next.js full-stack projects, live demos, client testimonials, and clear pricing service packages.",
        category: "freelancing",
        target_date: "2026-11-15",
        progress: 50,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "Case studies written, responsive hero finalized, domain setup",
        image_url: "/journey/freelance_portfolio.jpg",
        image_caption: "Freelancing portfolio development",
        sort_order: 4,
      },
      {
        id: "jm_act_2",
        title: "Master React 19 & Next.js Server Architecture",
        description: "Deep dive into Server Actions, streaming, caching strategies, and robust enterprise database patterns.",
        category: "learning",
        target_date: "2026-11-20",
        progress: 40,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "40 min daily morning learning session, clean architecture exercises",
        image_url: "/journey/coding_mastery.jpg",
        image_caption: "Software architecture and frontend mastery",
        sort_order: 5,
      },
      {
        id: "jm_act_3",
        title: "Complete Suku Marketplace Merchant MVP",
        description: "Multi-vendor merchant catalog, order management, and secure Ethiopian payment gateway integration flow.",
        category: "business",
        target_date: "2026-12-05",
        progress: 30,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "Admin merchant portal, product schema, Telebirr payment mock testing",
        image_url: "/journey/suku_mvp.jpg",
        image_caption: "Suku multi-vendor marketplace MVP",
        sort_order: 6,
      },
      {
        id: "jm_act_4",
        title: "Log 50 Backtested ICT Trading Setups (Demo)",
        description: "Strict demo execution of ICT 2022 mentorship setups with 1% risk management and detailed journal documentation.",
        category: "forex",
        target_date: "2026-12-10",
        progress: 25,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "London session analysis, New York killzone entries, 0 live capital risk",
        image_url: "/journey/forex_trading.jpg",
        image_caption: "Forex demo backtesting journal",
        sort_order: 7,
      },
      {
        id: "jm_act_5",
        title: "First Emergency Reserve Tranche (50,000 ETB)",
        description: "Systematic monthly savings to build initial 50,000 ETB emergency liquidity reserve.",
        category: "financial",
        target_date: "2026-12-31",
        progress: 10,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "Allocate 20% of monthly salary, reduce non-essential expenses",
        image_url: "/journey/emergency_fund.jpg",
        image_caption: "Emergency reserve savings milestone",
        sort_order: 8,
      },
      {
        id: "jm_act_6",
        title: "30-Day English Technical Shadowing Streak",
        description: "Daily 30-minute spoken shadowing and technical vocabulary expansion for frictionless international communication.",
        category: "learning",
        target_date: "2026-11-30",
        progress: 45,
        status: "in_progress",
        is_achievement: 0,
        phase: "active",
        related_tasks: "Software engineering podcasts shadowing, 5 daily new idioms",
        image_url: "/journey/english_mastery.jpg",
        image_caption: "English communication fluency",
        sort_order: 9,
      },

      // Delayed Milestone with Recovery Plan
      {
        id: "jm_del_1",
        title: "Commercial Gym Heavy Compound Program",
        description: "Structured progressive overload strength program (Squat, Bench, Deadlift).",
        category: "health",
        target_date: "2026-10-25",
        progress: 15,
        status: "delayed",
        delay_reason: "Prioritized morning commute energy and home mobility calisthenics during daily job schedule.",
        recovery_plan: "Maintain 30 min daily calisthenics & core at 4:30 AM; schedule Saturday morning gym trial.",
        is_achievement: 0,
        phase: "active",
        image_url: "/journey/fitness_health.jpg",
        image_caption: "Physical fitness & compound strength",
        sort_order: 10,
      },

      // Upcoming Milestones (Next Horizon)
      {
        id: "jm_up_1",
        title: "Sign First International Freelance Client ($500+)",
        description: "Secure and deliver high-value client contract via Upwork or direct outreach.",
        category: "freelancing",
        target_date: "2026-12-20",
        progress: 0,
        status: "upcoming",
        prerequisite: "Deploy freelance portfolio and send 25 customized project proposals.",
        is_achievement: 0,
        phase: "upcoming",
        image_url: "/journey/workspace.jpg",
        image_caption: "Client delivery milestone",
        sort_order: 11,
      },
      {
        id: "jm_up_2",
        title: "Launch Suku Pilot with 5 Live Addis Merchants",
        description: "Onboard initial verified sellers, test live orders, gather direct merchant feedback.",
        category: "business",
        target_date: "2027-01-20",
        progress: 0,
        status: "upcoming",
        prerequisite: "Complete merchant portal and finalize vendor delivery logistics.",
        is_achievement: 0,
        phase: "upcoming",
        image_url: "/journey/suku_launch.jpg",
        image_caption: "Live merchant pilot launch",
        sort_order: 12,
      },
      {
        id: "jm_up_3",
        title: "Pass $10,000 Prop Firm Evaluation Phase",
        description: "Achieve 8% profit target with strict max daily loss under 4% following verified demo edge.",
        category: "forex",
        target_date: "2027-02-28",
        progress: 0,
        status: "upcoming",
        prerequisite: "Maintain positive expectancy on 60 demo trades with strict 1% risk.",
        is_achievement: 0,
        phase: "upcoming",
        image_url: "/journey/prop_firm.jpg",
        image_caption: "Prop firm evaluation milestone",
        sort_order: 13,
      },
      {
        id: "jm_up_4",
        title: "6-Month Full Living Reserve (180,000 ETB)",
        description: "Accumulate 6 months of living expenses and family support in cash reserves.",
        category: "financial",
        target_date: "2027-06-30",
        progress: 0,
        status: "upcoming",
        prerequisite: "Combine full-time salary savings with freelance income streams.",
        is_achievement: 0,
        phase: "upcoming",
        image_url: "/journey/wealth_reserve.jpg",
        image_caption: "6-month cash security reserve",
        sort_order: 14,
      },
    ];

    for (const m of milestones) {
      await db.execute({
        sql: `INSERT INTO journey_milestones (
          id, user_id, title, description, category, target_date, completed_date,
          progress, status, delay_reason, recovery_plan, prerequisite, related_tasks,
          image_url, image_caption, is_achievement, phase, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          m.id!,
          userId,
          m.title!,
          m.description!,
          m.category!,
          m.target_date!,
          m.completed_date || null,
          m.progress || 0,
          m.status || "upcoming",
          m.delay_reason || null,
          m.recovery_plan || null,
          m.prerequisite || null,
          m.related_tasks || null,
          m.image_url!,
          m.image_caption || null,
          m.is_achievement || 0,
          m.phase || "active",
          m.sort_order || 0,
        ],
      });
    }
  }

  // Check Destinations (12 Future Ambitions)
  const destCheck = await db.execute({
    sql: "SELECT id FROM journey_destinations WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  if (destCheck.rows.length === 0) {
    const destinations: Partial<JourneyDestination>[] = [
      {
        id: "jd_1",
        title: "Total Financial Independence",
        category: "financial",
        description: "Passive cash flow and diversified enterprise revenue completely exceeding all living costs.",
        image_url: "/journey/financial_growth.jpg",
        target_year: "2028–2029",
        sort_order: 1,
      },
      {
        id: "jd_2",
        title: "Stable Additional Income Streams",
        category: "financial",
        description: "Multiple consistent monthly revenue sources beyond full-time employment.",
        image_url: "/journey/wealth_reserve.jpg",
        target_year: "2027",
        sort_order: 2,
      },
      {
        id: "jd_3",
        title: "High-Caliber International Freelance Roster",
        category: "freelancing",
        description: "Long-term relationships with global tech clients generating $2,000+ monthly.",
        image_url: "/journey/freelance_portfolio.jpg",
        target_year: "2027",
        sort_order: 3,
      },
      {
        id: "jd_4",
        title: "Growing Software Agency & Products",
        category: "business",
        description: "Expanding software engineering agency delivering enterprise web solutions.",
        image_url: "/journey/software_business.jpg",
        target_year: "2028",
        sort_order: 4,
      },
      {
        id: "jd_5",
        title: "Thriving Suku Ethiopian Marketplace",
        category: "business",
        description: "Leading national e-commerce platform empowering hundreds of local artisans and merchants.",
        image_url: "/journey/suku_launch.jpg",
        target_year: "2027–2028",
        sort_order: 5,
      },
      {
        id: "jd_6",
        title: "Consistent & Disciplined Forex Trader",
        category: "forex",
        description: "Funded prop firm trader operating with mechanical ICT model discipline and capital preservation.",
        image_url: "/journey/forex_trading.jpg",
        target_year: "2027",
        sort_order: 6,
      },
      {
        id: "jd_7",
        title: "Principal Software Engineer & Architect",
        category: "career",
        description: "Mastery of distributed systems, high-scale performance, and modern cloud architecture.",
        image_url: "/journey/coding_mastery.jpg",
        target_year: "2028",
        sort_order: 7,
      },
      {
        id: "jd_8",
        title: "Effortless Global English Communication",
        category: "learning",
        description: "Articulate, persuasive, and fluent international negotiations, presentations, and technical writing.",
        image_url: "/journey/english_mastery.jpg",
        target_year: "2027",
        sort_order: 8,
      },
      {
        id: "jd_9",
        title: "Peak Physical Fitness & High-Energy Lifestyle",
        category: "health",
        description: "Athletic endurance, muscular strength, spotless health biomarkers, and natural energy.",
        image_url: "/journey/fitness_health.jpg",
        target_year: "Ongoing",
        sort_order: 9,
      },
      {
        id: "jd_10",
        title: "Strong, Financially Uplifted Family",
        category: "family",
        description: "Full financial security for parents and loved ones, meaningful presence, and family pride.",
        image_url: "/journey/family_harmony.jpg",
        target_year: "Ongoing",
        sort_order: 10,
      },
      {
        id: "jd_11",
        title: "Unwavering Spiritual Foundation",
        category: "spiritual",
        description: "Consistent morning and night prayer anchors, deep gratitude, humility, and moral integrity.",
        image_url: "/journey/prayer_spiritual.jpg",
        target_year: "Lifelong",
        sort_order: 11,
      },
      {
        id: "jd_12",
        title: "Generational Wealth & Sound Investments",
        category: "financial",
        description: "Real estate holdings, business equities, and enduring multi-generational financial peace.",
        image_url: "/journey/wealth_reserve.jpg",
        target_year: "2029+",
        sort_order: 12,
      },
    ];

    for (const d of destinations) {
      await db.execute({
        sql: `INSERT INTO journey_destinations (
          id, user_id, title, category, description, image_url, target_year, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          d.id!,
          userId,
          d.title!,
          d.category!,
          d.description!,
          d.image_url!,
          d.target_year!,
          d.sort_order || 0,
        ],
      });
    }
  }
}

export async function getJourneyData(userId = "user_kidus_01") {
  await seedJourneyDataIfEmpty(userId);

  const profileRes = await db.execute({
    sql: "SELECT * FROM journey_profile WHERE user_id = ? LIMIT 1",
    args: [userId],
  });

  const milestonesRes = await db.execute({
    sql: "SELECT * FROM journey_milestones WHERE user_id = ? ORDER BY sort_order ASC, target_date ASC",
    args: [userId],
  });

  const destinationsRes = await db.execute({
    sql: "SELECT * FROM journey_destinations WHERE user_id = ? ORDER BY sort_order ASC",
    args: [userId],
  });

  const breathingRes = await db.execute({
    sql: "SELECT * FROM breathing_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
    args: [userId],
  });

  return {
    profile: profileRes.rows[0] as unknown as JourneyProfile,
    milestones: milestonesRes.rows as unknown as JourneyMilestone[],
    destinations: destinationsRes.rows as unknown as JourneyDestination[],
    breathingHistory: breathingRes.rows as unknown as BreathingLog[],
  };
}

export async function updateJourneyProfile(userId = "user_kidus_01", data: Partial<JourneyProfile>) {
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  args.push(userId);

  await db.execute({
    sql: `UPDATE journey_profile SET ${fields.join(", ")} WHERE user_id = ?`,
    args,
  });
}

export async function createJourneyMilestone(data: Partial<JourneyMilestone>, userId = "user_kidus_01") {
  const id = data.id || `jm_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO journey_milestones (
      id, user_id, title, description, category, target_date, completed_date,
      progress, status, delay_reason, recovery_plan, prerequisite, related_tasks,
      image_url, image_caption, is_achievement, phase, sort_order
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      userId,
      data.title || "New Milestone",
      data.description || "",
      data.category || "career",
      data.target_date || new Date().toISOString().split("T")[0],
      data.completed_date || null,
      data.progress || 0,
      data.status || "upcoming",
      data.delay_reason || null,
      data.recovery_plan || null,
      data.prerequisite || null,
      data.related_tasks || null,
      data.image_url || "/journey/workspace.jpg",
      data.image_caption || null,
      data.is_achievement || 0,
      data.phase || "active",
      data.sort_order || 99,
    ],
  });
  return id;
}

export async function updateJourneyMilestone(id: string, data: Partial<JourneyMilestone>) {
  const fields: string[] = [];
  const args: any[] = [];

  for (const [key, val] of Object.entries(data)) {
    if (key !== "id" && key !== "user_id") {
      fields.push(`${key} = ?`);
      args.push(val);
    }
  }

  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  args.push(id);

  await db.execute({
    sql: `UPDATE journey_milestones SET ${fields.join(", ")} WHERE id = ?`,
    args,
  });
}

export async function deleteJourneyMilestone(id: string) {
  await db.execute({
    sql: "DELETE FROM journey_milestones WHERE id = ?",
    args: [id],
  });
}

export async function logBreathingSession(data: {
  userId?: string;
  session_type: string;
  duration_seconds: number;
  completed?: number;
  notes?: string;
}) {
  const id = `bl_${Date.now()}`;
  await db.execute({
    sql: `INSERT INTO breathing_logs (
      id, user_id, session_type, duration_seconds, completed, notes
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      data.userId || "user_kidus_01",
      data.session_type,
      data.duration_seconds,
      data.completed !== undefined ? data.completed : 1,
      data.notes || null,
    ],
  });
  return id;
}
