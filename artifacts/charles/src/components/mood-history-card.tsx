import { useMemo } from "react";
import { motion } from "framer-motion";
import { format, formatDistanceToNowStrict, subDays } from "date-fns";
import { Flame, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CheckIn } from "@workspace/api-client-react";
import { formatLocalDateKey } from "@/lib/dates";

const MOOD_COLORS: Record<string, string> = {
  great: "#4a7c59",
  good: "#6faa82",
  calm: "#8ab5a0",
  okay: "#b8a98a",
  stressed: "#d97c5a",
  exhausted: "#8a6a6a",
};

const MOOD_SCORE: Record<string, number> = {
  great: 10,
  good: 8,
  calm: 7,
  okay: 6,
  stressed: 3,
  exhausted: 2,
};

function wellnessScore(c: CheckIn): number | null {
  const e = typeof c.energyLevel === "number" ? c.energyLevel : null;
  const f = typeof c.focusLevel === "number" ? c.focusLevel : null;
  const s = typeof c.stressLevel === "number" ? c.stressLevel : null;
  if (e === null && f === null && s === null) return null;
  const energy = e ?? 5;
  const focus = f ?? 5;
  const stress = s ?? 5;
  return (energy + focus + (10 - stress)) / 3;
}

function computeStreak(checkins: CheckIn[]): number {
  const keys = new Set(checkins.map((c) => formatLocalDateKey(new Date(c.checkedInAt))));
  let streak = 0;
  let cursor = new Date();
  for (let i = 0; i < 365; i += 1) {
    const key = formatLocalDateKey(cursor);
    if (!keys.has(key)) break;
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

function sparkline(points: number[], width = 120, height = 28, padding = 3): string {
  if (points.length === 0) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(0.0001, max - min);
  return points
    .map((p, i) => {
      const x = padding + (i * (width - padding * 2)) / Math.max(1, points.length - 1);
      const y = height - padding - ((p - min) / range) * (height - padding * 2);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function MoodHistoryCard({
  checkins,
  title = "Mood history",
  variant = "employee",
}: {
  checkins: CheckIn[];
  title?: string;
  variant?: "employee" | "admin";
}) {
  const recent = useMemo(() => checkins.slice(0, 7), [checkins]);
  const latest = recent[0];
  const latestMood = latest?.mood ?? null;
  const accent = latestMood ? MOOD_COLORS[latestMood] ?? "#4a7c59" : "#4a7c59";

  const streak = useMemo(() => computeStreak(checkins), [checkins]);

  const averages = useMemo(() => {
    const items = recent;
    const stressValues = items.map((c) => c.stressLevel).filter((v): v is number => typeof v === "number");
    const focusValues = items.map((c) => c.focusLevel).filter((v): v is number => typeof v === "number");
    const stressAvg = stressValues.length ? stressValues.reduce((s, v) => s + v, 0) / stressValues.length : null;
    const focusAvg = focusValues.length ? focusValues.reduce((s, v) => s + v, 0) / focusValues.length : null;
    const wellnessValues = items.map(wellnessScore).filter((v): v is number => typeof v === "number");
    const wellnessAvg = wellnessValues.length ? wellnessValues.reduce((s, v) => s + v, 0) / wellnessValues.length : null;
    return { stressAvg, focusAvg, wellnessAvg };
  }, [recent]);

  const trend = useMemo(() => {
    const points = [...recent]
      .reverse()
      .map((c) => MOOD_SCORE[c.mood] ?? 5);
    if (points.length < 4) return "neutral";
    const last = points.slice(-2).reduce((s, v) => s + v, 0) / 2;
    const prev = points.slice(-4, -2).reduce((s, v) => s + v, 0) / 2;
    if (last > prev + 0.6) return "up";
    if (last < prev - 0.6) return "down";
    return "neutral";
  }, [recent]);

  const wellnessPoints = useMemo(() => {
    const pts = [...recent]
      .reverse()
      .map((c) => wellnessScore(c))
      .filter((v): v is number => typeof v === "number");
    return pts;
  }, [recent]);

  const poly = useMemo(() => sparkline(wellnessPoints), [wellnessPoints]);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  if (!recent.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={[
        "w-full rounded-[28px] border border-white/70 bg-white/55 backdrop-blur-sm shadow-[0_18px_60px_rgba(0,0,0,0.08)] overflow-hidden",
        variant === "admin" ? "" : "max-w-md",
      ].join(" ")}
    >
      <div className="relative px-5 sm:px-6 pt-5 pb-4">
        <div
          className="absolute inset-0 opacity-75 pointer-events-none"
          style={{
            background:
              `radial-gradient(ellipse at 50% 0%, ${accent}1c 0%, transparent 62%),` +
              `radial-gradient(ellipse at 30% 100%, ${accent}12 0%, transparent 60%)`,
          }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#6b7280] font-semibold">
                {title}
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-black/[0.05] text-[#6b7280]">
                <Sparkles className="w-3 h-3" style={{ color: accent }} />
                last 7
              </span>
            </div>
            {latest ? (
              <div className="mt-2 text-sm text-[#1f3a2b] font-medium">
                Latest:{" "}
                <span className="capitalize" style={{ color: accent }}>
                  {latest.mood}
                </span>{" "}
                <span className="text-xs text-[#7a8b7e] font-normal">
                  • {formatDistanceToNowStrict(new Date(latest.checkedInAt), { addSuffix: true })}
                </span>
              </div>
            ) : null}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="h-9 px-3 rounded-2xl bg-white/70 border border-black/[0.05] flex items-center gap-2">
              <Flame className="w-4 h-4" style={{ color: accent }} />
              <div className="text-xs font-semibold tabular-nums text-[#1f3a2b]">
                {streak} <span className="text-[#7a8b7e] font-medium">day</span>
              </div>
            </div>
            <div className="hidden sm:flex h-9 px-3 rounded-2xl bg-white/70 border border-black/[0.05] items-center gap-2">
              <TrendIcon className="w-4 h-4" style={{ color: accent }} />
              <div className="text-xs font-semibold text-[#1f3a2b]">
                {trend === "neutral" ? "steady" : trend}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative mt-4 rounded-2xl bg-white/55 border border-black/[0.05] px-3 py-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {recent.map((c) => {
              const d = new Date(c.checkedInAt);
              const dot = MOOD_COLORS[c.mood] ?? "#4a7c59";
              return (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -2 }}
                  className="shrink-0 w-[92px] rounded-2xl border border-black/[0.05] bg-white/70 px-3 py-2 shadow-[0_10px_26px_rgba(0,0,0,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.22em] uppercase text-[#6b7280] font-semibold">
                      {format(d, "EEE")}
                    </span>
                    <span className="inline-flex items-center justify-center w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dot }} />
                  </div>
                  <div className="mt-1.5 text-[12px] font-semibold capitalize text-[#1f3a2b] leading-tight">
                    {c.mood}
                  </div>
                  <div className="mt-1 text-[10px] text-[#7a8b7e] tabular-nums">
                    {format(d, "h:mm a")}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Sparkline */}
          {poly ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#6b7280] font-semibold">
                Weekly wellness score
              </div>
              <div className="flex items-center gap-2">
                <svg width={120} height={28} viewBox="0 0 120 28" className="shrink-0">
                  <defs>
                    <linearGradient id="wellnessLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={`${accent}55`} />
                      <stop offset="60%" stopColor={`${accent}aa`} />
                      <stop offset="100%" stopColor={`${accent}55`} />
                    </linearGradient>
                  </defs>
                  <polyline
                    fill="none"
                    stroke="url(#wellnessLine)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={poly}
                  />
                </svg>
                <div className="text-xs font-semibold tabular-nums text-[#1f3a2b]">
                  {averages.wellnessAvg ? averages.wellnessAvg.toFixed(1) : "—"}
                  <span className="text-[#7a8b7e] font-medium">/10</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Averages */}
        <div className="relative mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/55 border border-black/[0.05] px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#6b7280] font-semibold">Avg focus</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-[#1f3a2b]">
              {averages.focusAvg ? averages.focusAvg.toFixed(1) : "—"}{" "}
              <span className="text-xs text-[#7a8b7e] font-medium">/10</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/55 border border-black/[0.05] px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#6b7280] font-semibold">Avg stress</div>
            <div className="mt-1 text-sm font-semibold tabular-nums text-[#1f3a2b]">
              {averages.stressAvg ? averages.stressAvg.toFixed(1) : "—"}{" "}
              <span className="text-xs text-[#7a8b7e] font-medium">/10</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

