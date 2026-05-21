import { Router } from "express";
import { db, checkinsTable } from "@workspace/db";
import { desc, eq, gte, lte, sql } from "drizzle-orm";
import {
  ListCheckinsQueryParams,
  CreateCheckinBody,
  GetCheckinSummaryQueryParams,
} from "@workspace/api-zod";

const router = Router();

function getDateRange(dateStr?: string): { start: Date; end: Date } {
  const d = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// GET /checkins
router.get("/checkins", async (req, res) => {
  const parsed = ListCheckinsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }

  const { start, end } = getDateRange(parsed.data.date);

  const checkins = await db
    .select()
    .from(checkinsTable)
    .where(
      sql`${checkinsTable.checkedInAt} >= ${start} AND ${checkinsTable.checkedInAt} <= ${end}`
    )
    .orderBy(desc(checkinsTable.checkedInAt));

  return res.json(
    checkins.map((c) => ({
      ...c,
      checkedInAt: c.checkedInAt.toISOString(),
    }))
  );
});

// POST /checkins
router.post("/checkins", async (req, res) => {
  const parsed = CreateCheckinBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request body", details: parsed.error.issues });
  }

  const data = parsed.data;
  const [created] = await db
    .insert(checkinsTable)
    .values({
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      mood: data.mood,
      energyLevel: data.energyLevel ?? null,
      focusLevel: data.focusLevel ?? null,
      stressLevel: data.stressLevel ?? null,
      tags: data.tags ?? [],
      note: data.note ?? null,
    })
    .returning();

  return res.status(201).json({
    ...created,
    checkedInAt: created.checkedInAt.toISOString(),
  });
});

// GET /checkins/summary
router.get("/checkins/summary", async (req, res) => {
  const parsed = GetCheckinSummaryQueryParams.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid query params" });
  }

  const { start, end } = getDateRange(parsed.data.date);

  const checkins = await db
    .select()
    .from(checkinsTable)
    .where(
      sql`${checkinsTable.checkedInAt} >= ${start} AND ${checkinsTable.checkedInAt} <= ${end}`
    )
    .orderBy(desc(checkinsTable.checkedInAt));

  const totalCheckins = checkins.length;

  const moodBreakdown: Record<string, number> = {};
  let totalEnergy = 0, energyCount = 0;
  let totalFocus = 0, focusCount = 0;
  let totalStress = 0, stressCount = 0;

  for (const c of checkins) {
    moodBreakdown[c.mood] = (moodBreakdown[c.mood] ?? 0) + 1;
    if (c.energyLevel != null) { totalEnergy += c.energyLevel; energyCount++; }
    if (c.focusLevel != null) { totalFocus += c.focusLevel; focusCount++; }
    if (c.stressLevel != null) { totalStress += c.stressLevel; stressCount++; }
  }

  const averageEnergy = energyCount > 0 ? Math.round((totalEnergy / energyCount) * 10) / 10 : 0;
  const averageFocus = focusCount > 0 ? Math.round((totalFocus / focusCount) * 10) / 10 : 0;
  const averageStress = stressCount > 0 ? Math.round((totalStress / stressCount) * 10) / 10 : 0;

  // Wellness score: based on mood weights + low stress bonus
  const moodWeights: Record<string, number> = { great: 10, good: 8, okay: 6, stressed: 3, exhausted: 2 };
  const totalMoodScore = checkins.reduce((sum, c) => sum + (moodWeights[c.mood] ?? 5), 0);
  const moodAvg = totalCheckins > 0 ? totalMoodScore / totalCheckins : 0;
  const stressPenalty = averageStress > 7 ? 1.5 : averageStress > 5 ? 0.5 : 0;
  const teamWellnessScore = Math.max(0, Math.min(10, moodAvg - stressPenalty));

  const burnoutMoods = ["stressed", "exhausted"];
  const burnoutRiskCount = checkins.filter(
    (c) => burnoutMoods.includes(c.mood) || (c.stressLevel != null && c.stressLevel >= 8)
  ).length;

  const positiveMoods = ["great", "good"];
  const topPositiveEmployees = checkins
    .filter((c) => positiveMoods.includes(c.mood))
    .slice(0, 3)
    .map((c) => ({ ...c, checkedInAt: c.checkedInAt.toISOString() }));

  const needsSupportEmployees = checkins
    .filter((c) => burnoutMoods.includes(c.mood) || (c.stressLevel != null && c.stressLevel >= 8))
    .slice(0, 5)
    .map((c) => ({ ...c, checkedInAt: c.checkedInAt.toISOString() }));

  return res.json({
    totalCheckins,
    moodBreakdown,
    averageEnergy,
    averageFocus,
    averageStress,
    teamWellnessScore: Math.round(teamWellnessScore * 10) / 10,
    burnoutRiskCount,
    topPositiveEmployees,
    needsSupportEmployees,
  });
});

// GET /checkins/trends
router.get("/checkins/trends", async (req, res) => {
  const days: Array<{ date: string; totalCheckins: number; dominantMood: string; averageWellness: number }> = [];

  const moodWeights: Record<string, number> = { great: 10, good: 8, okay: 6, stressed: 3, exhausted: 2 };

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const { start, end } = getDateRange(dateStr);

    const dayCheckins = await db
      .select()
      .from(checkinsTable)
      .where(
        sql`${checkinsTable.checkedInAt} >= ${start} AND ${checkinsTable.checkedInAt} <= ${end}`
      );

    const moodCounts: Record<string, number> = {};
    let totalWellness = 0;

    for (const c of dayCheckins) {
      moodCounts[c.mood] = (moodCounts[c.mood] ?? 0) + 1;
      totalWellness += moodWeights[c.mood] ?? 5;
    }

    const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "none";
    const averageWellness = dayCheckins.length > 0
      ? Math.round((totalWellness / dayCheckins.length) * 10) / 10
      : 0;

    days.push({ date: dateStr, totalCheckins: dayCheckins.length, dominantMood, averageWellness });
  }

  return res.json(days);
});

export default router;
