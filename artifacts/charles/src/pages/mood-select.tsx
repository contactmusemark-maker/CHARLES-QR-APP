import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { useEffect } from "react";
import { Smile, ThumbsUp, Meh, Frown, Coffee, Leaf } from "lucide-react";

import curiousBonsai from "@assets/Curious_Bonsai_1779333623327.png";

const MOODS = [
  {
    id: "great",
    label: "Great",
    icon: Smile,
    bg: "bg-[#4a7c59]",
    text: "text-white",
    ring: "hover:ring-[#4a7c59]/40",
    description: "Thriving",
  },
  {
    id: "good",
    label: "Good",
    icon: ThumbsUp,
    bg: "bg-[#6faa82]",
    text: "text-white",
    ring: "hover:ring-[#6faa82]/40",
    description: "Positive",
  },
  {
    id: "calm",
    label: "Calm",
    icon: Leaf,
    bg: "bg-[#8ab5a0]",
    text: "text-white",
    ring: "hover:ring-[#8ab5a0]/40",
    description: "Peaceful",
  },
  {
    id: "okay",
    label: "Okay",
    icon: Meh,
    bg: "bg-[#b8a98a]",
    text: "text-white",
    ring: "hover:ring-[#b8a98a]/40",
    description: "Steady",
  },
  {
    id: "stressed",
    label: "Stressed",
    icon: Frown,
    bg: "bg-[#d97c5a]",
    text: "text-white",
    ring: "hover:ring-[#d97c5a]/40",
    description: "Tense",
  },
  {
    id: "exhausted",
    label: "Exhausted",
    icon: Coffee,
    bg: "bg-[#8a6a6a]",
    text: "text-white",
    ring: "hover:ring-[#8a6a6a]/40",
    description: "Drained",
  },
];

export default function MoodSelect() {
  const [, setLocation] = useLocation();
  const { employee, setSelectedMood } = useEmployee();

  useEffect(() => {
    if (!employee) setLocation("/");
  }, [employee, setLocation]);

  if (!employee) return null;

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setLocation("/mood/detail");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_hsl(var(--primary)/0.06)_0%,_transparent_60%)]" />

      <PageTransition className="w-full max-w-2xl z-10">
        <div className="flex flex-col items-center mb-10">
          <Bonsai
            src={curiousBonsai}
            alt="Charles curious about your mood"
            className="w-44 h-44 mb-5"
          />
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-foreground text-center mb-2">
            Hi {employee.name.split(" ")[0]}. How are you feeling?
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Pick the mood that best matches where you are right now.
          </p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {MOODS.map((mood, index) => {
            const Icon = mood.icon;
            return (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelectMood(mood.id)}
                className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm hover:shadow-lg transition-all ring-2 ring-transparent ${mood.ring}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mood.bg} shadow-md`}>
                  <Icon className={`w-6 h-6 ${mood.text}`} strokeWidth={2} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">{mood.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{mood.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          Your responses help build a healthier workplace.
        </p>
      </PageTransition>
    </div>
  );
}
