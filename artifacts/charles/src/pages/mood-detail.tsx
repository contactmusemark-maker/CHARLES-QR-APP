import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateCheckin } from "@workspace/api-client-react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import happyBonsai from "@assets/Sparkle_Happy_Bonsai_1779333623328.png";
import meditationBonsai from "@assets/Meditation_Bonsai_1779333623327.png";
import sadBonsai from "@assets/Sad_Bonsai_1779333623326.png";
import peacefulBonsai from "@assets/Peaceful_Zen_Bonsai_1779333623329.png";
import defaultBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

const TAGS = [
  "Meetings", "Deep Work", "Burnout", "Creative",
  "Need Support", "Social Day", "Quiet Day", "Focus Mode", "High Energy",
];

const MOOD_CONFIG: Record<string, {
  bonsai: string;
  bg: string;
  accent: string;
  message: string;
}> = {
  great: {
    bonsai: happyBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.12)_0%,_transparent_60%)]",
    accent: "#4a7c59",
    message: "Love that energy! Charles is thriving alongside you.",
  },
  good: {
    bonsai: happyBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(111,170,130,0.10)_0%,_transparent_60%)]",
    accent: "#6faa82",
    message: "Glad to hear it. Let's make today count.",
  },
  calm: {
    bonsai: meditationBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(138,181,160,0.10)_0%,_transparent_60%)]",
    accent: "#8ab5a0",
    message: "Calm is a superpower. Protect your peace today.",
  },
  okay: {
    bonsai: meditationBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(184,169,138,0.10)_0%,_transparent_60%)]",
    accent: "#b8a98a",
    message: "Taking it one step at a time. Charles is here for you.",
  },
  stressed: {
    bonsai: sadBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(217,124,90,0.08)_0%,_transparent_60%)]",
    accent: "#d97c5a",
    message: "Take a deep breath. Acknowledge it, then let it pass.",
  },
  exhausted: {
    bonsai: peacefulBonsai,
    bg: "bg-[radial-gradient(ellipse_at_50%_0%,_rgba(138,106,106,0.08)_0%,_transparent_60%)]",
    accent: "#8a6a6a",
    message: "You don't have to rush. Rest is part of the work.",
  },
};

export default function MoodDetail() {
  const [, setLocation] = useLocation();
  const { employee, selectedMood } = useEmployee();
  const { toast } = useToast();

  const [energy, setEnergy] = useState<number[]>([5]);
  const [focus, setFocus] = useState<number[]>([5]);
  const [stress, setStress] = useState<number[]>([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const createCheckin = useCreateCheckin();

  useEffect(() => {
    if (!employee || !selectedMood) setLocation("/");
  }, [employee, selectedMood, setLocation]);

  if (!employee || !selectedMood) return null;

  const config = MOOD_CONFIG[selectedMood] ?? MOOD_CONFIG.okay;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      await createCheckin.mutateAsync({
        data: {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department || null,
          mood: selectedMood as "great" | "good" | "okay" | "calm" | "stressed" | "exhausted",
          energyLevel: energy[0],
          focusLevel: focus[0],
          stressLevel: stress[0],
          tags: selectedTags,
          note: note.trim() || null,
        },
      });
      setLocation("/success");
    } catch {
      toast({
        title: "Check-in failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative py-12">
      <div className={`absolute inset-0 pointer-events-none opacity-60 transition-colors duration-1000 ${config.bg}`} />

      <PageTransition className="w-full max-w-2xl px-6 z-10 flex flex-col md:flex-row gap-6 items-start">

        {/* Left — Bonsai + mood label */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:sticky md:top-12">
          <Bonsai
            src={config.bonsai}
            alt="Charles reacting to your mood"
            className="w-44 h-44 mb-4"
          />
          <h2
            className="text-2xl font-serif text-center capitalize mb-1"
            style={{ color: config.accent }}
          >
            {selectedMood}
          </h2>
          <p className="text-xs text-center text-muted-foreground italic leading-relaxed max-w-[180px]">
            "{config.message}"
          </p>
        </div>

        {/* Right — Detail form */}
        <div className="w-full md:w-2/3 bg-white/70 backdrop-blur-sm border border-white/80 shadow-xl shadow-black/5 rounded-3xl px-6 py-7 space-y-7">

          {/* Sliders */}
          <div className="space-y-5">
            {[
              { label: "Energy Level", value: energy, setValue: setEnergy },
              { label: "Focus Level", value: focus, setValue: setFocus },
              { label: "Stress Level", value: stress, setValue: setStress },
            ].map(({ label, value, setValue }) => (
              <div key={label} className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</Label>
                  <span className="text-sm font-medium tabular-nums" style={{ color: config.accent }}>
                    {value[0]}<span className="text-muted-foreground/60 text-xs">/10</span>
                  </span>
                </div>
                <Slider
                  value={value}
                  onValueChange={setValue}
                  max={10}
                  min={1}
                  step={1}
                  className="[&_[role=slider]]:border-0"
                  style={{ "--slider-thumb-color": config.accent } as React.CSSProperties}
                />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Today's Focus
            </Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <motion.button
                  key={tag}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    selectedTags.includes(tag)
                      ? "border-transparent text-white shadow-sm"
                      : "bg-transparent border-border text-muted-foreground hover:border-foreground/30"
                  }`}
                  style={selectedTags.includes(tag) ? { backgroundColor: config.accent } : {}}
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Anything Charles should know? <span className="normal-case font-normal">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Jot down any thoughts..."
              className="resize-none h-20 text-sm bg-[#f8f6f3] border-[#e8e4dd] focus-visible:ring-[#4a7c59]/30 rounded-xl"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setLocation("/mood")}
              className="h-11 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Back
            </button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={createCheckin.isPending}
              className="flex-1 h-11 rounded-xl text-white text-sm font-semibold tracking-wide transition-colors disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
              style={{ backgroundColor: config.accent }}
            >
              {createCheckin.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Complete Check-in
            </motion.button>
          </div>
        </div>

      </PageTransition>
    </div>
  );
}
