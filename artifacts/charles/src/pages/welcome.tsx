import { useState } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import welcomeBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { setEmployee } = useEmployee();
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !employeeName.trim()) return;

    setEmployee({ id: employeeId, name: employeeName });

    if (employeeId.toUpperCase() === "CCE001" && employeeName.toUpperCase() === "WILLIAM") {
      setLocation("/admin");
    } else {
      setLocation("/mood");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_50%,_hsl(var(--primary)/0.1)_0%,_transparent_50%)]" />
      
      <PageTransition className="w-full max-w-md px-6 z-10">
        <div className="flex flex-col items-center mb-8">
          <Bonsai 
            src={welcomeBonsai} 
            alt="Charles the Bonsai welcoming you" 
            className="w-64 h-64 mb-6" 
          />
          <h1 className="text-4xl font-serif tracking-tight text-foreground text-center mb-2">
            Good morning.
          </h1>
          <p className="text-muted-foreground text-center">
            Welcome to the office. Charles is ready to check you in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-3xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-xs uppercase tracking-wider text-muted-foreground">
                Employee ID
              </Label>
              <Input
                id="employeeId"
                placeholder="e.g. EMP001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="bg-white/50 border-0 border-b-2 border-transparent focus-visible:border-primary focus-visible:ring-0 rounded-none px-0 h-12 text-lg transition-colors"
                autoComplete="off"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employeeName" className="text-xs uppercase tracking-wider text-muted-foreground">
                First Name
              </Label>
              <Input
                id="employeeName"
                placeholder="What should Charles call you?"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="bg-white/50 border-0 border-b-2 border-transparent focus-visible:border-primary focus-visible:ring-0 rounded-none px-0 h-12 text-lg transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-full text-base font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={!employeeId.trim() || !employeeName.trim()}
          >
            Check In
          </Button>
        </form>
      </PageTransition>
    </div>
  );
}
