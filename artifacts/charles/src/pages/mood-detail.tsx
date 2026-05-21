import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreateCheckin } from "@workspace/api-client-react";
import { CheckInInputMood } from "@workspace/api-zod/src/generated/types";
import { Loader2 } from "lucide-react";

import happyBonsai from "@assets/Sparkle_Happy_Bonsai_1779333623328.png";
import meditationBonsai from "@assets/Meditation_Bonsai_1779333623327.png";
import sadBonsai from "@assets/Sad_Bonsai_1779333623326.png";
import peacefulBonsai from "@assets/Peaceful_Zen_Bonsai_1779333623329.png";
import defaultBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

const TAGS = [
  "Meetings", "Deep Work", "Burnout", "Creative", "Need Support", "Social Day", "Quiet Day"
];

function getBonsaiForMood(mood: string) {
  switch (mood) {
    case "great":
    case "good":
      return happyBonsai;
    case "okay":
      return meditationBonsai;
    case "stressed":
      return sadBonsai;
    case "exhausted":
      return peacefulBonsai;
    default:
      return defaultBonsai;
  }
}

function getBgColorForMood(mood: string) {
  switch (mood) {
    case "great":
    case "good":
      return "bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]";
    case "okay":
      return "bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--accent)/0.1)_0%,_transparent_50%)]";
    case "stressed":
    case "exhausted":
      return "bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--destructive)/0.05)_0%,_transparent_50%)]";
    default:
      return "bg-[radial-gradient(circle_at_50%_0%,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]";
  }
}

function getMessageForMood(mood: string) {
  switch (mood) {
    case "great": return "That's wonderful to hear. Charles is thrilled!";
    case "good": return "Glad to hear it. Let's make it a productive day.";
    case "okay": return "Taking it one step at a time. Charles is here for you.";
    case "stressed": return "Take a deep breath. It's okay to feel stressed.";
    case "exhausted": return "Remember to take breaks and rest when you can.";
    default: return "Charles is listening.";
  }
}

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
    if (!employee || !selectedMood) {
      setLocation("/");
    }
  }, [employee, selectedMood, setLocation]);

  if (!employee || !selectedMood) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    try {
      await createCheckin.mutateAsync({
        data: {
          employeeId: employee.id,
          employeeName: employee.name,
          mood: selectedMood as CheckInInputMood,
          energyLevel: energy[0],
          focusLevel: focus[0],
          stressLevel: stress[0],
          tags: selectedTags,
          note: note.trim() || undefined,
        }
      });
      setLocation("/success");
    } catch (error) {
      toast({
        title: "Check-in failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative py-12">
      <div className={`absolute inset-0 pointer-events-none opacity-50 transition-colors duration-1000 ${getBgColorForMood(selectedMood)}`} />
      
      <PageTransition className="w-full max-w-2xl px-6 z-10 flex flex-col md:flex-row gap-8 items-start">
        
        <div className="w-full md:w-1/3 flex flex-col items-center sticky top-12">
          <Bonsai 
            src={getBonsaiForMood(selectedMood)} 
            alt="Charles reacting to your mood" 
            className="w-48 h-48 mb-6" 
          />
          <h2 className="text-2xl font-serif text-center text-foreground mb-2 capitalize">{selectedMood}</h2>
          <p className="text-sm text-center text-muted-foreground italic">
            "{getMessageForMood(selectedMood)}"
          </p>
        </div>

        <div className="w-full md:w-2/3 glass-card p-8 rounded-3xl space-y-8">
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Energy Level</Label>
                <span className="text-sm text-muted-foreground">{energy[0]}/10</span>
              </div>
              <Slider value={energy} onValueChange={setEnergy} max={10} min={1} step={1} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Focus Level</Label>
                <span className="text-sm text-muted-foreground">{focus[0]}/10</span>
              </div>
              <Slider value={focus} onValueChange={setFocus} max={10} min={1} step={1} />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Stress Level</Label>
                <span className="text-sm text-muted-foreground">{stress[0]}/10</span>
              </div>
              <Slider value={stress} onValueChange={setStress} max={10} min={1} step={1} />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Today's Focus</Label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <Badge 
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/80 transition-colors py-1.5 px-3"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="note" className="text-sm font-medium">Anything Charles should know? (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Jot down any thoughts..."
              className="resize-none h-24 bg-white/50 border-transparent focus-visible:ring-primary/50"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button variant="outline" className="flex-1 rounded-full" onClick={() => setLocation("/mood")}>
              Back
            </Button>
            <Button 
              className="flex-2 rounded-full w-full" 
              onClick={handleSubmit}
              disabled={createCheckin.isPending}
            >
              {createCheckin.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Complete Check-in
            </Button>
          </div>
        </div>

      </PageTransition>
    </div>
  );
}
