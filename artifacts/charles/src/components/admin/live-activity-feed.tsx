import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNowStrict } from "date-fns";
import { Radio, Sparkles, ShieldAlert, MessageSquareText } from "lucide-react";
import type { CheckIn } from "@workspace/api-client-react";

type ActivityKind = "checkin" | "note" | "high_stress";

type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  createdAt: Date;
  employeeName: string;
  mood?: string;
  detail?: string;
};

function buildEvents(checkins: CheckIn[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (const c of checkins) {
    const createdAt = new Date(c.checkedInAt);
    const baseId = String(c.id);
    events.push({
      id: `checkin:${baseId}`,
      kind: "checkin",
      createdAt,
      employeeName: c.employeeName,
      mood: c.mood,
    });

    const note = typeof c.note === "string" ? c.note.trim() : "";
    if (note) {
      events.push({
        id: `note:${baseId}`,
        kind: "note",
        createdAt,
        employeeName: c.employeeName,
        mood: c.mood,
        detail: note,
      });
    }

    if ((c.stressLevel ?? 0) >= 8) {
      events.push({
        id: `stress:${baseId}`,
        kind: "high_stress",
        createdAt,
        employeeName: c.employeeName,
        mood: c.mood,
        detail: `Stress ${c.stressLevel}/10`,
      });
    }
  }
  return events.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function LiveActivityFeed({
  checkins,
  accent = "#4a7c59",
  isLive = false,
  resetKey,
}: {
  checkins: CheckIn[];
  accent?: string;
  isLive?: boolean;
  resetKey: string;
}) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const seenCheckinIdsRef = useRef<Set<number>>(new Set());

  // Reset when switching date
  useEffect(() => {
    setEvents(buildEvents(checkins).slice(0, 24));
    seenCheckinIdsRef.current = new Set(checkins.map((c) => c.id));
  }, [resetKey]);

  // Live prepend when new check-ins arrive
  useEffect(() => {
    if (!isLive) {
      setEvents(buildEvents(checkins).slice(0, 24));
      seenCheckinIdsRef.current = new Set(checkins.map((c) => c.id));
      return;
    }

    const newOnes = checkins.filter((c) => !seenCheckinIdsRef.current.has(c.id));
    if (!newOnes.length) return;

    const added = buildEvents(newOnes);
    setEvents((prev) => [...added, ...prev].slice(0, 24));
    for (const c of newOnes) seenCheckinIdsRef.current.add(c.id);
  }, [checkins, isLive]);

  const headerLabel = useMemo(() => (isLive ? "LIVE" : "Activity"), [isLive]);

  return (
    <div className="rounded-[28px] border border-white/40 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-border/40">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-lg font-serif flex items-center gap-2">
              Live activity
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-white/70 border border-black/[0.05] text-[#6b7280]">
                <Radio className="w-3 h-3" style={{ color: accent }} />
                {headerLabel}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Newest first • auto refresh</div>
          </div>

          <div className="shrink-0 w-9 h-9 rounded-2xl bg-white/70 border border-black/[0.05] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" style={{ color: accent }} />
          </div>
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto no-scrollbar">
        {events.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No activity yet.
          </div>
        ) : (
          <div className="p-3 space-y-2">
            <AnimatePresence initial={false}>
              {events.map((e) => {
                const icon =
                  e.kind === "high_stress" ? (
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  ) : e.kind === "note" ? (
                    <MessageSquareText className="w-4 h-4" style={{ color: accent }} />
                  ) : (
                    <Sparkles className="w-4 h-4" style={{ color: accent }} />
                  );

                const mood = e.mood ? e.mood.charAt(0).toUpperCase() + e.mood.slice(1) : null;
                const when = formatDistanceToNowStrict(e.createdAt, { addSuffix: true });

                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.99 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-2xl border bg-white/70 px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-white/80 border border-black/[0.06] flex items-center justify-center shadow-sm">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-[#1f3a2b] truncate">
                          {e.employeeName}
                          {e.kind === "checkin" ? " checked in" : e.kind === "note" ? " added a note" : " stress level high"}
                          {mood ? (
                            <span className="text-xs font-medium text-[#7a8b7e]"> • {mood}</span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-xs text-[#7a8b7e] flex items-center justify-between gap-2">
                          <span className="truncate">{e.detail ? `“${e.detail}”` : "—"}</span>
                          <span className="shrink-0 tabular-nums">{when}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
