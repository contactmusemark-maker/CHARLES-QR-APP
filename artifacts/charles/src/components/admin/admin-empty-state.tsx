import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Clock3, Sparkles } from "lucide-react";
import { Bonsai } from "@/components/bonsai";

const QUOTES = [
  "Small rituals make strong days.",
  "Breathe in. Breathe out. Begin again.",
  "Calm teams build extraordinary things.",
  "Your wellbeing is part of the work.",
  "Today is a chance to grow gently.",
];

export function AdminEmptyState({
  date,
  accent = "#4a7c59",
  isToday = false,
  mascotSrc,
}: {
  date: Date;
  accent?: string;
  isToday?: boolean;
  mascotSrc: string;
}) {
  const [now, setNow] = useState(() => new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 7000);
    return () => window.clearInterval(t);
  }, []);

  const headline = isToday ? "No check-ins yet today 🌱" : "No check-ins for this day 🌱";
  const sub = isToday
    ? "Charles is waiting for the team to check in."
    : "No submissions were recorded for this date.";

  const quote = useMemo(() => QUOTES[quoteIndex] ?? QUOTES[0], [quoteIndex]);

  return (
    <div className="relative w-full rounded-[28px] border border-white/50 bg-white/55 backdrop-blur-sm shadow-[0_26px_90px_rgba(0,0,0,0.08)] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-80"
        style={{
          background:
            `radial-gradient(ellipse at 50% 0%, ${accent}22 0%, transparent 62%),` +
            `radial-gradient(ellipse at 20% 100%, ${accent}14 0%, transparent 60%)`,
        }}
      />

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[
          { left: "14%", top: "18%", size: 6, delay: 0.1 },
          { left: "82%", top: "22%", size: 4, delay: 0.45 },
          { left: "22%", top: "64%", size: 4, delay: 0.25 },
          { left: "78%", top: "58%", size: 6, delay: 0.65 },
          { left: "48%", top: "12%", size: 3, delay: 0.3 },
        ].map((p, idx) => (
          <motion.span
            key={idx}
            className="absolute rounded-full bg-white/70 shadow-[0_10px_30px_rgba(255,255,255,0.35)]"
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -7, 0],
              scale: [0.9, 1.05, 0.9],
            }}
            transition={{
              duration: 2.8,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 1.25,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative px-6 sm:px-8 py-8 sm:py-10 flex flex-col items-center text-center">
        <Bonsai src={mascotSrc} alt="Charles" className="w-44 h-44 sm:w-52 sm:h-52" />

        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/75 border border-black/[0.05] px-3.5 py-1.5 shadow-sm">
          <Sparkles className="w-4 h-4" style={{ color: accent }} />
          <span className="text-xs font-semibold tracking-wide" style={{ color: accent }}>
            {isToday ? "LIVE" : "ARCHIVE"}
          </span>
        </div>

        <h2 className="mt-4 font-serif text-3xl sm:text-4xl leading-tight text-[#1f3a2b]">
          {headline}
        </h2>
        <p className="mt-3 text-sm sm:text-[15px] text-[#7a8b7e] leading-relaxed max-w-[460px]">
          {sub}
        </p>

        <div className="mt-6 w-full max-w-md rounded-2xl bg-white/70 border border-black/[0.05] px-4 py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock3 className="w-4 h-4" style={{ color: accent }} />
            <span className="tabular-nums font-medium text-[#1f3a2b]">
              {format(now, "h:mm:ss a")}
            </span>
            <span className="text-[#7a8b7e]">•</span>
            <span className="text-[#7a8b7e]">{format(date, "EEEE, MMMM d, yyyy")}</span>
          </div>

          <div className="mt-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-[12px] sm:text-[13px] text-[#7a8b7e] italic"
              >
                “{quote}”
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

