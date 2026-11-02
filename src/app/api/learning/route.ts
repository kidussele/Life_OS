import { NextResponse } from "next/server";
import { getEnglishVocab, createEnglishVocab } from "@/lib/repository";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const vocab = await getEnglishVocab("user_kidus_01");

    // Real study minutes from completed daily_tasks
    const englishRes = await db.execute({
      sql: `SELECT COALESCE(SUM(duration_minutes), 0) as mins FROM daily_tasks
            WHERE user_id = 'user_kidus_01' AND status = 'completed'
            AND (title LIKE '%English%' OR title LIKE '%Speaking%' OR title LIKE '%Communication%')`,
      args: [],
    });
    const englishMinutes = Number(englishRes.rows[0]?.mins || 0);
    const englishHours = Math.round((englishMinutes / 60) * 10) / 10;
    const englishPercent = Math.min(100, Math.round((englishHours / 45) * 100));

    const softwareRes = await db.execute({
      sql: `SELECT COALESCE(SUM(duration_minutes), 0) as mins FROM daily_tasks
            WHERE user_id = 'user_kidus_01' AND status = 'completed'
            AND (title LIKE '%Code%' OR title LIKE '%Software%' OR title LIKE '%Study%' OR title LIKE '%Architecture%')`,
      args: [],
    });
    const softwareMinutes = Number(softwareRes.rows[0]?.mins || 0);
    const softwareHours = Math.round((softwareMinutes / 60) * 10) / 10;
    const softwarePercent = Math.min(100, Math.round((softwareHours / 60) * 100));

    const streakRes = await db.execute({
      sql: `SELECT COUNT(DISTINCT date) as days FROM daily_tasks
            WHERE user_id = 'user_kidus_01' AND status = 'completed' AND category = 'learning'`,
      args: [],
    });
    const studyStreak = Number(streakRes.rows[0]?.days || 0);

    const projectRes = await db.execute({
      sql: `SELECT COUNT(*) as count FROM milestones
            WHERE user_id = 'user_kidus_01' AND goal_id = 'goal_learning' AND status = 'completed'`,
      args: [],
    });
    const completedProjects = Number(projectRes.rows[0]?.count || 0);

    const totalHours = englishHours + softwareHours;
    const overallProgress = Math.min(100, Math.round((totalHours / 105) * 100));

    return NextResponse.json({
      vocab,
      stats: {
        englishHours,
        englishTargetHours: 45,
        englishPercent,
        softwareHours,
        softwareTargetHours: 60,
        softwarePercent,
        overallProgress,
        studyStreak,
        completedProjects,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await createEnglishVocab({
      user_id: "user_kidus_01",
      ...body,
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
