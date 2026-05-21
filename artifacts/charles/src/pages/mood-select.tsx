import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Smile, ThumbsUp, Meh, Frown, Coffee } from "lucide-react";

import curiousBonsai from "@assets/Curious_Bonsai_1779333623327.png";

const MOODS = [
  { id: "great", label: "Great", icon: Smile, color: "bg-primary text-primary-foreground hover:bg-primary/90" },
  { id: "good", label: "Good", icon: ThumbsUp, color: "bg-primary/80 text-primary-foreground hover:bg-primary/70" },
  { id: "okay", label: "Okay", icon: Meh, color: "bg-secondary text-secondary-foreground hover:bg-secondary/90" },
  { id: "stressed", label: "Stressed", icon: Frown, color: "bg-accent text-accent-foreground hover:bg-accent/90" },
  { id: "exhausted", label: "Exhausted", icon: Coffee, color: "bg-muted text-muted-foreground hover:bg-muted/90" },
];

export default function MoodSelect() {
  const [, setLocation] = useLocation();
  const { employee, setSelectedMood } = useEmployee();

  useEffect(() => {
    if (!employee) {
      setLocation("/");
    }
  }, [employee, setLocation]);

  if (!employee) return null;

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
    setLocation("/mood/detail");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.05)_0%,_transparent_50%)]" />
      
      <PageTransition className="w-full max-w-4xl px-6 z-10">
        <div className="flex flex-col items-center mb-12">
          <Bonsai 
            src={curiousBonsai} 
            alt="Charles curious about your mood" 
            className="w-48 h-48 mb-6" 
          />
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight text-foreground text-center mb-2">
            Hi {employee.name.split(' ')[0]}. How are you feeling today?
          </h1>
          <p className="text-muted-foreground text-center">
            Select the mood that best matches your energy right now.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {MOODS.map((mood, index) => {
            const Icon = mood.icon;
            return (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectMood(mood.id)}
                className={`glass-card p-6 rounded-2xl flex flex-col items-center justify-center gap-4 transition-all hover:shadow-lg ${mood.id === "great" || mood.id === "good" ? "hover:border-primary/50" : mood.id === "stressed" ? "hover:border-destructive/50" : "hover:border-accent/50"}`}
              >
                <div className={`p-4 rounded-full ${mood.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-medium text-foreground">{mood.label}</span>
              </motion.button>
            );
          })}
        </div>
      </PageTransition>
    </div>
  );
}
