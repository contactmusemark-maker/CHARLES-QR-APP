import { useEffect } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

import starBonsai from "@assets/Star_Holder_Bonsai_1779333623330.png";

const QUOTES = [
  "Peace comes from within. Do not seek it without.",
  "What you think, you become. What you feel, you attract.",
  "Smile, breathe and go slowly.",
  "The mind is everything. What you think you become.",
  "To understand everything is to forgive everything."
];

export default function Success() {
  const [, setLocation] = useLocation();
  const { employee, clearSession } = useEmployee();

  useEffect(() => {
    if (!employee) {
      setLocation("/");
    }
  }, [employee, setLocation]);

  if (!employee) return null;

  const handleComplete = () => {
    clearSession();
    setLocation("/");
  };

  const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.15)_0%,_transparent_50%)]" />
      
      <PageTransition className="w-full max-w-md px-6 z-10 text-center flex flex-col items-center">
        <Bonsai 
          src={starBonsai} 
          alt="Charles holding a star" 
          className="w-56 h-56 mb-8" 
        />
        
        <h1 className="text-3xl font-serif tracking-tight text-foreground mb-2">
          Checked in successfully.
        </h1>
        
        <div className="glass-card p-4 rounded-xl inline-flex flex-col items-center justify-center gap-1 mb-8 shadow-sm">
          <span className="text-sm font-medium">{employee.name}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">{employee.id}</span>
          <span className="text-xs text-primary font-medium mt-1">{format(new Date(), "h:mm a")}</span>
        </div>

        <div className="max-w-sm mb-12">
          <p className="text-muted-foreground italic font-serif text-lg leading-relaxed">
            "{randomQuote}"
          </p>
        </div>

        <Button 
          onClick={handleComplete}
          className="w-full max-w-xs h-12 rounded-full text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Start My Day
        </Button>
      </PageTransition>
    </div>
  );
}
