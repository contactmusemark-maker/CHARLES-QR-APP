import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { Bonsai } from "@/components/bonsai";
import { MiniLeafMark } from "@/components/mini-leaf-mark";

import welcomeBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

const AUTO_CONTINUE_MS = 1800;

export default function EmployeeWelcome() {
  const [, setLocation] = useLocation();
  const { employee } = useEmployee();
  const [autoPending, setAutoPending] = useState(true);
  const autoTimerRef = useRef<number | null>(null);

  const firstName = useMemo(() => {
    if (!employee?.name) return "";
    return employee.name.trim().split(/\s+/, 1)[0] ?? "";
  }, [employee?.name]);

  useEffect(() => {
    if (!employee) {
      setLocation("/");
      return;
    }

    autoTimerRef.current = window.setTimeout(() => {
      setLocation("/mood");
    }, AUTO_CONTINUE_MS);

    return () => {
      if (autoTimerRef.current != null) window.clearTimeout(autoTimerRef.current);
    };
  }, [employee, setLocation]);

  if (!employee) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0ede8] overflow-hidden relative px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.08)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg z-10 flex flex-col items-center text-center"
      >
        {/* Micro brand */}
        <div className="w-full flex flex-col items-center">
          <MiniLeafMark className="w-8 h-8" />
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-14 bg-[#4a7c59]/45" />
            <span className="font-serif text-[12px] tracking-[0.42em] text-[#6b7280] uppercase">
              Charles
            </span>
            <div className="h-px w-14 bg-[#4a7c59]/45" />
          </div>
          <div className="mt-4 h-10 w-px bg-[#4a7c59]/40" />
        </div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.9 }}
          className="mt-8"
        >
          <h1 className="font-serif text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#1f3a2b]">
            Good morning, {firstName}.
            <br />
            Take a breath before you begin.
          </h1>
          <p className="mt-4 font-serif text-[15px] sm:text-[16px] text-[#7a8b7e]">
            A quiet moment to settle in—then we’ll start your check-in.
          </p>
        </motion.div>

        {/* Mascot */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.9 }}
          className="relative mt-10"
        >
          <Leaf className="absolute -left-8 -top-4 w-5 h-5 text-[#4a7c59]/18 rotate-12" />
          <Leaf className="absolute -right-8 -top-2 w-4 h-4 text-[#4a7c59]/14 -rotate-6" />
          <div className="absolute inset-0 -z-10 blur-2xl rounded-full bg-[#4a7c59]/10 scale-110" />
          <Bonsai src={welcomeBonsai} alt="Charles welcoming you" className="w-52 h-52 sm:w-60 sm:h-60" />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.9 }}
          className="mt-10 w-full flex flex-col items-center"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (autoTimerRef.current != null) window.clearTimeout(autoTimerRef.current);
              setAutoPending(false);
              setLocation("/mood");
            }}
            className="w-full max-w-sm h-12 rounded-2xl bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-md shadow-[#4a7c59]/20"
          >
            Begin Check-in
          </motion.button>

          {autoPending && (
            <p className="mt-4 text-xs text-[#6b7280]/80">
              Continuing automatically in a moment…
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
