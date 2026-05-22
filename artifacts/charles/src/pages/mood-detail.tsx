import { useState, useEffect, useMemo, type CSSProperties } from "react";
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
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import happyBonsai from "@assets/Sparkle_Happy_Bonsai_1779333623328.png";
import meditationBonsai from "@assets/Meditation_Bonsai_1779333623327.png";
import sadBonsai from "@assets/Sad_Bonsai_1779333623326.png";
import peacefulBonsai from "@assets/Peaceful_Zen_Bonsai_1779333623329.png";
import defaultBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

const TAGS = [
  "Meetings", "Deep Work", "Burnout", "Creative",
  "Need Support", "Social Day", "Quiet Day", "Focus Mode", "High Energy",
];

const MOODS = ["great", "good", "calm", "okay", "stressed", "exhausted"] as const;
type MoodKey = (typeof MOODS)[number];

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
  const { employee, selectedMood, clearSession } = useEmployee();
  const { toast } = useToast();

  const [energy, setEnergy] = useState<number[]>([5]);
  const [focus, setFocus] = useState<number[]>([5]);
  const [stress, setStress] = useState<number[]>([5]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [updateMode, setUpdateMode] = useState(false);
  const [already, setAlready] = useState<null | { employeeName: string; checkedInAt: string; mood: string }>(null);
  const [mood, setMood] = useState<string | null>(null);

  const createCheckin = useCreateCheckin();

  useEffect(() => {
    if (!employee || !selectedMood) setLocation("/");
  }, [employee, selectedMood, setLocation]);

  useEffect(() => {
    if (selectedMood) setMood(selectedMood);
  }, [selectedMood]);

  if (!employee || !selectedMood) return null;

  const activeMood = mood ?? selectedMood;
  const config = MOOD_CONFIG[activeMood] ?? MOOD_CONFIG.okay;
  const alreadyConfig = useMemo(() => {
    if (!already) return null;
    return MOOD_CONFIG[already.mood] ?? MOOD_CONFIG.okay;
  }, [already]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      const result = await createCheckin.mutateAsync({
        data: {
          employeeId: employee.id,
          employeeName: employee.name,
          department: employee.department || null,
          mood: activeMood as "great" | "good" | "okay" | "calm" | "stressed" | "exhausted",
          energyLevel: energy[0],
          focusLevel: focus[0],
          stressLevel: stress[0],
          tags: selectedTags,
          note: note.trim() || null,
          intent: updateMode ? "update" : "create",
        },
      });
      if (result && typeof result === "object" && "alreadyCheckedIn" in result && result.alreadyCheckedIn) {
        setAlready({
          employeeName: result.employeeName,
          checkedInAt: result.checkedInAt,
          mood: result.mood,
        });
        return;
      }

      setLocation("/success");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : null;
      toast({
        title: "Check-in failed",
        description: message ?? "Please try again in a moment.",
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
            {activeMood}
          </h2>
          <p className="text-xs text-center text-muted-foreground italic leading-relaxed max-w-[180px]">
            "{config.message}"
          </p>
        </div>

        {/* Right — Detail form */}
        <div className="w-full md:w-2/3 bg-white/70 backdrop-blur-sm border border-white/80 shadow-xl shadow-black/5 rounded-3xl px-6 py-7 space-y-7">
          {updateMode && (
            <div className="rounded-2xl border border-[#4a7c59]/20 bg-[#dfe7db]/40 px-4 py-3">
              <div className="text-[11px] uppercase tracking-widest text-[#4a7c59] font-semibold">
                Update Mode
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                You’re replacing today’s check-in. Adjust anything, then submit.
              </div>
            </div>
          )}

          {updateMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mood</Label>
                <span className="text-xs text-muted-foreground/80">Pick what feels true right now</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MOODS.map((m: MoodKey) => {
                  const mc = MOOD_CONFIG[m];
                  const isActive = activeMood === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={[
                        "h-10 rounded-xl border text-sm font-medium capitalize transition-all",
                        "flex items-center justify-center",
                        isActive
                          ? "bg-white shadow-sm border-black/[0.08]"
                          : "bg-white/60 hover:bg-white/80 border-black/[0.06] hover:border-black/[0.09]",
                      ].join(" ")}
                      style={isActive ? ({ boxShadow: `0 10px 30px ${mc.accent}1f` } as CSSProperties) : undefined}
                    >
                      <span style={{ color: mc.accent }}>{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                  style={{ "--slider-thumb-color": config.accent } as unknown as CSSProperties}
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
              {updateMode ? "Update Check-in" : "Complete Check-in"}
            </motion.button>
          </div>
        </div>

      </PageTransition>

      {/* Already Checked In Modal */}
      {already && alreadyConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-5 py-10 bg-black/30 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-[32px] bg-[#f5f2ee] border border-black/[0.06] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden"
          >
            <div className="relative px-7 pt-8 pb-6 text-center">
              <div className={`absolute inset-0 opacity-70 pointer-events-none ${alreadyConfig.bg}`} />
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "14%", top: "14%", size: 6, delay: 0.1 },
                  { left: "78%", top: "18%", size: 4, delay: 0.4 },
                  { left: "20%", top: "62%", size: 4, delay: 0.25 },
                  { left: "82%", top: "56%", size: 6, delay: 0.55 },
                  { left: "44%", top: "10%", size: 3, delay: 0.3 },
                  { left: "50%", top: "70%", size: 3, delay: 0.65 },
                ].map((p, idx) => (
                  <motion.span
                    key={idx}
                    className="absolute rounded-full bg-white/70 shadow-[0_10px_30px_rgba(255,255,255,0.35)]"
                    style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -6, 0],
                      scale: [0.9, 1.05, 0.9],
                    }}
                    transition={{
                      duration: 2.6,
                      delay: p.delay,
                      repeat: Infinity,
                      repeatDelay: 1.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <Bonsai
                  src={alreadyConfig.bonsai}
                  alt="Charles"
                  className="w-40 h-40"
                />

                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 border border-white/80 px-3.5 py-1.5 shadow-sm">
                  <Sparkles className="w-4 h-4" style={{ color: alreadyConfig.accent }} />
                  <span className="text-xs font-semibold tracking-wide" style={{ color: alreadyConfig.accent }}>
                    Already checked in today 🌿
                  </span>
                </div>

                <h2 className="mt-4 font-serif text-3xl leading-tight text-[#1f3a2b]">
                  You’re all set.
                </h2>
                <p className="mt-3 text-sm text-[#7a8b7e] leading-relaxed max-w-[320px]">
                  You’ve already shared today’s mood. Take a breath and have a beautiful day.
                </p>

                <div className="mt-6 w-full rounded-2xl bg-white/60 border border-black/[0.05] px-4 py-3 text-left">
                  <div className="text-xs text-muted-foreground">
                    {already.employeeName} checked in at{" "}
                    <span className="font-medium text-foreground">
                      {format(new Date(already.checkedInAt), "h:mm a")}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Mood:</span>
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold text-white capitalize"
                      style={{ backgroundColor: alreadyConfig.accent }}
                    >
                      {already.mood}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-7 pb-7 pt-4 flex flex-col gap-3">
              <motion.button
                type="button"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  clearSession();
                  setLocation("/");
                }}
                className="h-12 rounded-full bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-md shadow-[#4a7c59]/20"
              >
                See you tomorrow
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setAlready(null);
                  setUpdateMode(true);
                  requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
                }}
                className="h-12 rounded-full border border-black/[0.06] bg-white/70 hover:bg-white transition-colors text-sm font-semibold text-[#1f3a2b]"
              >
                Update today’s check-in
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
