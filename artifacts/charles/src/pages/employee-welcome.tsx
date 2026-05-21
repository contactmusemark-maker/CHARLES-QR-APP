import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Leaf, Sprout, Focus } from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Bonsai } from "@/components/bonsai";
import { MiniLeafMark } from "@/components/mini-leaf-mark";

import welcomeBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

export default function EmployeeWelcome() {
  const [, setLocation] = useLocation();
  const { employee, profile } = useEmployee();

  const firstName = useMemo(() => {
    if (!employee?.name) return "";
    return employee.name.trim().split(/\s+/, 1)[0] ?? "";
  }, [employee?.name]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  useEffect(() => {
    if (!employee) {
      setLocation("/");
      return;
    }
  }, [employee, setLocation]);

  if (!employee) return null;

  return (
    <div className="h-[100svh] w-full flex items-center justify-center bg-[#f0ede8] overflow-hidden relative px-5 sm:px-6 pt-10 sm:pt-14 pb-[calc(env(safe-area-inset-bottom)+22px)] sm:pb-14">
      {/* Ambient background (subtle, clean) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.08)_0%,_transparent_60%)]" />
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full blur-3xl bg-[#4a7c59]/10 pointer-events-none" />
      <div className="absolute -bottom-32 left-10 w-[460px] h-[460px] rounded-full blur-3xl bg-[#b8a98a]/18 pointer-events-none" />
      <div className="absolute -bottom-36 right-0 w-[520px] h-[520px] rounded-full blur-3xl bg-[#8ab5a0]/14 pointer-events-none" />

      {/* Bottom organic waves */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 opacity-70">
        <svg viewBox="0 0 1440 220" className="w-full h-28 sm:h-40" preserveAspectRatio="none">
          <path
            d="M0 140c120-38 240-56 360-54 160 3 240 56 400 56 160 0 240-44 360-58 120-14 240 6 320 23v113H0V140Z"
            fill="#efe7dc"
          />
          <path
            d="M0 170c140-40 280-44 420-16 140 28 220 54 360 54 140 0 240-40 360-58 120-18 240-6 300 2v90H0v-72Z"
            fill="#dfe7db"
            opacity="0.6"
          />
          <path
            d="M0 190c160-30 320-20 480 10 160 30 240 44 360 44 120 0 220-24 330-36 110-12 210-6 270 3v59H0v-80Z"
            fill="#cfdacb"
            opacity="0.28"
          />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl z-10 flex flex-col items-center text-center"
      >
        {/* Micro brand */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col items-center"
        >
          <MiniLeafMark className="w-7 h-7 sm:w-8 sm:h-8" />
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-12 sm:w-14 bg-[#4a7c59]/45" />
            <span className="font-serif text-[12px] tracking-[0.42em] text-[#6b7280] uppercase">
              Charles
            </span>
            <div className="h-px w-12 sm:w-14 bg-[#4a7c59]/45" />
          </div>
          <div className="mt-3 sm:mt-4 h-8 sm:h-10 w-px bg-[#4a7c59]/40" />
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.09, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 sm:mt-9"
        >
          <h1 className="font-serif text-[clamp(28px,6.2vw,38px)] sm:text-[48px] leading-[1.03] tracking-[-0.02em] text-[#1f3a2b]">
            {greeting}, {firstName}.
            <br />
            Take a breath before you begin.
          </h1>
          <p className="mt-4 sm:mt-5 font-serif text-[13px] sm:text-[16px] leading-relaxed text-[#7a8b7e]">
            Take a moment before the day begins.
            <br />
            Your wellbeing matters here.
          </p>
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-7 sm:mt-11"
        >
          {/* Decorative leaves */}
          <Leaf className="absolute -left-8 -top-4 w-4 h-4 sm:w-5 sm:h-5 text-[#4a7c59]/14 rotate-12" />
          <Leaf className="absolute -right-8 -top-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4a7c59]/12 -rotate-6" />
          <Leaf className="absolute -left-10 bottom-5 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4a7c59]/10 rotate-[-14deg]" />

          <div className="absolute inset-0 -z-10 blur-3xl rounded-full bg-[#4a7c59]/10 scale-110" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1 w-48 sm:w-56 h-9 sm:h-10 rounded-full blur-2xl bg-black/10 -z-10" />
          <Bonsai
            src={welcomeBonsai}
            alt="Charles welcoming you"
            className="w-44 h-44 sm:w-64 sm:h-64"
            floating
          />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.19, duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-12 w-full flex flex-col items-center"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            onClick={() => setLocation(profile ? "/mood" : "/profile/setup")}
            className="w-full max-w-sm h-12 sm:h-14 rounded-full bg-[#4a7c59] text-white text-[14px] sm:text-[15px] font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-[0_16px_44px_rgba(74,124,89,0.24)]"
          >
            Begin Check-in
          </motion.button>
        </motion.div>

        {/* Bottom branding */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="mt-7 sm:mt-10"
        >
          <div className="flex items-center justify-center gap-5 sm:gap-8">
            {[
              { label: "ROOTED", Icon: Sprout },
              { label: "CALM", Icon: Leaf },
              { label: "FOCUSED", Icon: Focus },
            ].map(({ label, Icon }) => (
              <div key={label} className="flex flex-col items-center">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#dfe7db] text-[#4a7c59] flex items-center justify-center shadow-[0_10px_28px_rgba(0,0,0,0.06)]">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="mt-2 sm:mt-3 text-[10px] sm:text-[11px] tracking-[0.28em] uppercase text-[#6b7280] font-medium">
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 sm:mt-7 text-[10px] sm:text-[11px] tracking-[0.34em] uppercase text-[#6b7280]/85">
            GROW. BREATHE. ALIGN.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
