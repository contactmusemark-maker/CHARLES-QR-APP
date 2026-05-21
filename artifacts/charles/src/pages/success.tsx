import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { motion } from "framer-motion";
import { format } from "date-fns";

import superheroBonsai from "@assets/Superhero_Bonsai_1779333623329.png";

const QUOTES = [
  "Small steps every day create lasting growth.",
  "Protect your peace while building your future.",
  "Calm minds create strong work.",
  "Growth happens quietly.",
  "You are doing better than you think.",
  "The present moment is where excellence lives.",
  "Steady progress outlasts every shortcut.",
];

export default function Success() {
  const [, setLocation] = useLocation();
  const { employee, clearSession } = useEmployee();

  useEffect(() => {
    if (!employee) setLocation("/");
  }, [employee, setLocation]);

  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  if (!employee) return null;

  const handleComplete = () => {
    clearSession();
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden relative px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_30%,_hsl(var(--primary)/0.12)_0%,_transparent_60%)]" />

      <PageTransition className="w-full max-w-sm z-10 flex flex-col items-center text-center">

        {/* Superhero bonsai */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        >
          <Bonsai
            src={superheroBonsai}
            alt="Charles the superhero celebrating"
            className="w-52 h-52 mb-6"
          />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-2"
        >
          <h1 className="text-3xl font-serif tracking-tight text-foreground">
            Checked in successfully.
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Thanks for showing up honestly today.
          </p>
        </motion.div>

        {/* Employee card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="w-full mt-6 mb-6"
        >
          <div className="bg-white/70 backdrop-blur-sm border border-white/80 shadow-lg shadow-black/5 rounded-2xl px-6 py-5 flex flex-col items-center gap-1">
            <span className="text-base font-semibold text-foreground">{employee.name}</span>
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">{employee.id}</span>
            {employee.department && (
              <span className="text-xs text-[#4a7c59] font-medium mt-0.5 px-3 py-0.5 bg-[#4a7c59]/10 rounded-full">
                {employee.department}
              </span>
            )}
            <span className="text-xs text-muted-foreground mt-1">{format(new Date(), "EEEE, MMMM d · h:mm a")}</span>
          </div>
        </motion.div>

        {/* Daily quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.52, duration: 0.6 }}
          className="mb-8 max-w-xs"
        >
          <p className="text-muted-foreground font-serif text-base italic leading-relaxed">
            "{randomQuote}"
          </p>
        </motion.div>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleComplete}
          className="w-full max-w-xs h-12 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-md shadow-[#4a7c59]/20"
        >
          Start My Day
        </motion.button>

        <p className="mt-6 text-[11px] text-muted-foreground/50 tracking-wider uppercase">
          Always growing. Always grounded.
        </p>
      </PageTransition>
    </div>
  );
}
