import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bonsai } from "@/components/bonsai";

import meditationBonsai from "@assets/Meditation_Bonsai_1779333623327.png";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning.";
  if (h >= 12 && h < 17) return "Good afternoon.";
  return "Good evening.";
}

const LOADING_LINES = [
  "Preparing your workspace…",
  "Balancing the environment…",
  "Getting Charles ready…",
] as const;

export function SplashScreen({
  onDone,
  minDurationMs = 3000,
}: {
  onDone: () => void;
  minDurationMs?: number;
}) {
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const greeting = useMemo(() => getGreeting(), []);

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), minDurationMs);
    return () => window.clearTimeout(t);
  }, [minDurationMs]);

  useEffect(() => {
    if (done) return;
    const start = performance.now();
    let raf = 0;

      const tick = (now: number) => {
        const elapsed = now - start;
        const p = Math.min(1, elapsed / minDurationMs);
        // Premium easing (slow start, decisive finish)
        const eased = 1 - Math.pow(1 - p, 2.6);
        setProgress(Math.round(eased * 100));
        if (p < 1) raf = requestAnimationFrame(tick);
      };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, minDurationMs]);

  useEffect(() => {
    if (done) return;
    const t = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % LOADING_LINES.length);
    }, 950);
    return () => window.clearInterval(t);
  }, [done]);

  useEffect(() => {
    if (!done) return;
    // Ensure the UI reaches 100% and then exits smoothly.
    setProgress(100);
    setExiting(true);
    const t = window.setTimeout(() => onDone(), 560);
    return () => window.clearTimeout(t);
  }, [done, onDone]);

  const particles = useMemo(
    () => [
      { left: "14%", top: "22%", size: 6, delay: 0.1 },
      { left: "82%", top: "24%", size: 4, delay: 0.45 },
      { left: "20%", top: "66%", size: 4, delay: 0.22 },
      { left: "78%", top: "58%", size: 6, delay: 0.65 },
      { left: "46%", top: "14%", size: 3, delay: 0.3 },
      { left: "54%", top: "72%", size: 3, delay: 0.75 },
    ],
    [],
  );

  const currentLine = LOADING_LINES[lineIndex] ?? LOADING_LINES[0];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={
        exiting
          ? { opacity: 0, filter: "blur(8px)", scale: 0.99 }
          : { opacity: 1, filter: "blur(0px)", scale: 1 }
      }
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => setDone(true)}
      role="presentation"
    >
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-[#f0ede8]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.12)_0%,_transparent_62%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[740px] h-[740px] rounded-full blur-3xl bg-[#4a7c59]/10 pointer-events-none"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-44 right-0 w-[720px] h-[720px] rounded-full blur-3xl bg-[#8ab5a0]/14 pointer-events-none"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_50%,_transparent_40%,_rgba(0,0,0,0.05)_100%)]" />

      {/* Grain */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055] mix-blend-multiply"
        aria-hidden="true"
      >
        <filter id="splashNoise">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#splashNoise)" />
      </svg>

      {/* Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, idx) => (
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
              duration: 3.0,
              delay: p.delay,
              repeat: Infinity,
              repeatDelay: 1.5,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto"
        >
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-2 w-56 h-10 rounded-full blur-2xl bg-black/10 -z-10"
            animate={{ opacity: [0.45, 0.7, 0.45], scale: [0.98, 1.02, 0.98] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Bonsai
            src={meditationBonsai}
            alt="Charles"
            className="w-44 h-44 mx-auto"
            floating
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7"
        >
          <div className="text-[11px] tracking-[0.36em] uppercase text-[#7a8b7e]">
            {greeting}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.42, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[38px] leading-[1.0] tracking-[-0.02em] text-[#1f3a2b]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            CHARLES
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.52, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="mt-3 text-[12px] tracking-[0.28em] uppercase text-[#6b7280]/90"
          >
            Rooted. Calm. Focused.
          </motion.div>
        </motion.div>

        {/* Loading system */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-9"
        >
          <motion.div
            key={lineIndex}
            initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-[12px] text-[#7a8b7e]"
          >
            {currentLine}
          </motion.div>

          <div className="mt-5">
            {/* Premium thin progress */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="h-[3px] w-full rounded-full bg-black/[0.06] overflow-hidden" />
              <motion.div
                className="absolute left-0 top-0 h-[3px] rounded-full shadow-[0_0_18px_rgba(74,124,89,0.22)]"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(74,124,89,0.65) 0%, rgba(138,181,160,0.95) 45%, rgba(74,124,89,0.75) 100%)",
                }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Shimmer */}
              <motion.div
                className="absolute top-[-6px] h-[15px] w-24 rounded-full opacity-50 blur-md"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)",
                }}
                initial={{ left: "-30%" }}
                animate={{ left: "110%" }}
                transition={{
                  duration: 1.15,
                  ease: [0.22, 1, 0.36, 1],
                  repeat: Infinity,
                  repeatDelay: 0.25,
                }}
              />
            </div>

            <div className="mt-3 text-[10px] tracking-[0.26em] uppercase text-[#6b7280]/85 tabular-nums">
              {progress}%
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
