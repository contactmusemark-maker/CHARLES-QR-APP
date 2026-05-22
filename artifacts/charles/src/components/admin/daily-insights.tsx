import { useMemo, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { Brain, Sparkles, Tag, Building2, ShieldAlert, Gauge } from "lucide-react";
import type { CheckIn, CheckInSummary } from "@workspace/api-client-react";
import { format } from "date-fns";

function avg(values: number[]): number | null {
  if (!values.length) return null;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function moodScore(mood: string): number {
  const m: Record<string, number> = { great: 10, good: 8, calm: 7, okay: 6, stressed: 3, exhausted: 2 };
  return m[mood] ?? 5;
}

export function DailyInsights({
  date,
  checkins,
  summary,
  accent = "#4a7c59",
}: {
  date: Date;
  checkins: CheckIn[];
  summary?: CheckInSummary;
  accent?: string;
}) {
  const insights = useMemo(() => {
    const items = checkins ?? [];

    const tagsCount: Record<string, number> = {};
    for (const c of items) {
      for (const t of c.tags ?? []) tagsCount[t] = (tagsCount[t] ?? 0) + 1;
    }
    const topTag = Object.entries(tagsCount).sort((a, b) => b[1] - a[1])[0] ?? null;

    const stressSpikes = items.filter((c) => (c.stressLevel ?? 0) >= 8).length;

    const focusAfter2 = avg(
      items
        .filter((c) => new Date(c.checkedInAt).getHours() >= 14)
        .map((c) => c.focusLevel)
        .filter((v): v is number => typeof v === "number"),
    );
    const focusBefore2 = avg(
      items
        .filter((c) => new Date(c.checkedInAt).getHours() < 14)
        .map((c) => c.focusLevel)
        .filter((v): v is number => typeof v === "number"),
    );

    const deptStress: Record<string, number[]> = {};
    for (const c of items) {
      const dept = (c.department ?? "").trim();
      if (!dept) continue;
      if (!deptStress[dept]) deptStress[dept] = [];
      if (typeof c.stressLevel === "number") deptStress[dept]!.push(c.stressLevel);
    }
    const stressByDept = Object.entries(deptStress)
      .map(([dept, values]) => ({ dept, value: avg(values) ?? 0 }))
      .sort((a, b) => b.value - a.value)[0];

    const calmDept = (summary?.departmentBreakdown ?? [])
      .slice()
      .sort((a, b) => b.averageWellness - a.averageWellness)[0];

    const moodStable = (() => {
      const breakdown = summary?.moodBreakdown ?? {};
      const total = Object.values(breakdown).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0);
      if (!total) return null;
      const top = Object.values(breakdown).reduce((m, v) => Math.max(m, typeof v === "number" ? v : 0), 0);
      const pct = top / total;
      if (pct >= 0.6) return "strong";
      if (pct >= 0.4) return "moderate";
      return "mixed";
    })();

    const list: Array<{ title: string; text: string; Icon: React.ComponentType<{ className?: string; style?: CSSProperties }> }> = [];

    list.push({
      title: "Team mood today",
      text:
        moodStable === "strong"
          ? "Mood is consistent across the team."
          : moodStable === "moderate"
            ? "Mood is mostly stable with a few outliers."
            : moodStable === "mixed"
              ? "Mood is mixed today—worth a gentle check-in."
              : "Not enough data yet.",
      Icon: Brain,
    });

    if (calmDept?.department) {
      list.push({
        title: "Most calm department",
        text: `${calmDept.department} is leading wellness today (${calmDept.averageWellness.toFixed(1)}/10).`,
        Icon: Building2,
      });
    }

    if (stressByDept?.dept && stressByDept.value > 0) {
      list.push({
        title: "Highest stress department",
        text: `${stressByDept.dept} shows elevated stress (avg ${stressByDept.value.toFixed(1)}/10).`,
        Icon: ShieldAlert,
      });
    }

    if (topTag) {
      list.push({
        title: "Most selected tag",
        text: `“${topTag[0]}” appears most often (${topTag[1]}x).`,
        Icon: Tag,
      });
    }

    if (typeof focusAfter2 === "number" && typeof focusBefore2 === "number") {
      const delta = focusAfter2 - focusBefore2;
      if (Math.abs(delta) >= 0.6) {
        list.push({
          title: "Focus timing signal",
          text: delta > 0 ? "Focus improves after 2 PM." : "Focus dips after 2 PM.",
          Icon: Gauge,
        });
      }
    }

    if (stressSpikes > 0) {
      list.push({
        title: "Stress spikes",
        text: `${stressSpikes} check-in${stressSpikes === 1 ? "" : "s"} reported high stress (8+).`,
        Icon: ShieldAlert,
      });
    }

    return list.slice(0, 5);
  }, [checkins, summary]);

  const score = summary?.teamWellnessScore ?? null;
  const moodBreakdown = summary?.moodBreakdown ?? {};
  const dominantMood = useMemo(() => {
    let best: { k: string; v: number } | null = null;
    for (const [k, v] of Object.entries(moodBreakdown)) {
      if (typeof v !== "number") continue;
      if (!best || v > best.v) best = { k, v };
    }
    return best?.k ?? null;
  }, [moodBreakdown]);

  return (
    <div className="rounded-[28px] border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <div
        className="px-6 pt-6 pb-4 border-b border-border/40"
        style={{
          background:
            `radial-gradient(ellipse at 50% 0%, ${accent}18 0%, transparent 62%),` +
            `linear-gradient(to bottom, rgba(255,255,255,0.38), transparent)`,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-lg font-serif">Daily Wellness Insights</div>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-black/[0.05] text-[#6b7280]">
                <Sparkles className="w-3 h-3" style={{ color: accent }} />
                AI
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {format(date, "EEEE, MMMM d")} • {checkins.length} check-in{checkins.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-white/70 border border-black/[0.05] flex items-center justify-center">
              <div
                className="h-7 w-7 rounded-full"
                style={{
                  background: score
                    ? `conic-gradient(${accent} ${Math.round((score / 10) * 360)}deg, rgba(0,0,0,0.06) 0deg)`
                    : "rgba(0,0,0,0.06)",
                }}
              />
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Wellness</div>
              <div className="text-sm font-semibold tabular-nums" style={{ color: accent }}>
                {score ? score.toFixed(1) : "—"}/10
              </div>
            </div>
          </div>
        </div>

        {dominantMood ? (
          <div className="mt-3 text-[11px] text-muted-foreground">
            Dominant mood: <span className="capitalize font-semibold" style={{ color: accent }}>{dominantMood}</span>
          </div>
        ) : null}
      </div>

      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map(({ title, text, Icon }, idx) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + idx * 0.04, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            className="rounded-2xl border bg-white/70 px-4 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/80 border border-black/[0.06] flex items-center justify-center shadow-sm">
                <Icon className="w-4 h-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-[#1f3a2b]">{title}</div>
                <div className="mt-1 text-xs text-[#7a8b7e] leading-relaxed">{text}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
