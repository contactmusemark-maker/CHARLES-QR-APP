import { useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { 
  useGetCheckinSummary, 
  useGetCheckinTrends, 
  getGetCheckinSummaryQueryKey,
  getGetCheckinTrendsQueryKey
} from "@workspace/api-client-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Loader2, LogOut, AlertTriangle, Heart, Zap, Focus, ShieldAlert, QrCode } from "lucide-react";

import studyBonsai from "@assets/Study_-_Work_Bonsai_1779333623328.png";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { employee, clearSession } = useEmployee();

  useEffect(() => {
    if (!employee || (employee.id.toUpperCase() !== "CCE001" || employee.name.toUpperCase() !== "WILLIAM")) {
      setLocation("/");
    }
  }, [employee, setLocation]);

  const { data: summary, isLoading: isLoadingSummary } = useGetCheckinSummary({}, { 
    query: { queryKey: getGetCheckinSummaryQueryKey({}) } 
  });
  
  const { data: trends, isLoading: isLoadingTrends } = useGetCheckinTrends({
    query: { queryKey: getGetCheckinTrendsQueryKey() }
  });

  const handleSignOut = () => {
    clearSession();
    setLocation("/");
  };

  const moodChartData = useMemo(() => {
    if (!summary?.moodBreakdown) return [];
    return Object.entries(summary.moodBreakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: value
    }));
  }, [summary]);

  if (!employee) return null;

  return (
    <div className="min-h-screen w-full bg-background/50">
      
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Bonsai src={studyBonsai} alt="Charles working" className="w-10 h-10" floating={false} />
            <h1 className="text-xl font-serif font-medium tracking-tight">Charles Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </span>
            <Button variant="outline" size="sm" onClick={() => setLocation("/poster")} className="rounded-full border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#4a7c59]/10">
              <QrCode className="w-4 h-4 mr-2" />
              QR Poster
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <PageTransition className="space-y-8">
          
          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Wellness Score</CardTitle>
                <Heart className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.teamWellnessScore.toFixed(1) || "0.0"}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Out of 10.0</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Energy</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.averageEnergy.toFixed(1) || "0.0"}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Energy level today</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Burnout Risk</CardTitle>
                <ShieldAlert className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.burnoutRiskCount || 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Employees flagged</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded-full">Today</span>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.totalCheckins || 0}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Mood Distribution */}
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-serif">How the team feels today</CardTitle>
                <CardDescription>Distribution of submitted moods</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px]">
                {isLoadingSummary ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} />
                      <Tooltip 
                        cursor={{fill: "hsl(var(--muted)/0.5)"}}
                        contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Wellness Trends */}
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-serif">7-Day Wellness Trend</CardTitle>
                <CardDescription>Average overall wellness score</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[300px]">
                {isLoadingTrends ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: "hsl(var(--muted-foreground))"}} 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return format(date, "MMM d");
                        }}
                      />
                      <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: "hsl(var(--muted-foreground))"}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: "0.5rem", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        labelFormatter={(label) => format(new Date(label), "MMMM d, yyyy")}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="averageWellness" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Bottom Lists Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Employees Needing Support
                </CardTitle>
                <CardDescription>Individuals reporting high stress or exhaustion</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                  <div className="space-y-4">
                    {summary?.needsSupportEmployees && summary.needsSupportEmployees.length > 0 ? (
                      summary.needsSupportEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                          <div>
                            <p className="font-medium">{emp.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs uppercase font-medium text-destructive px-2 py-0.5 bg-destructive/10 rounded-full">
                              {emp.mood}
                            </span>
                            {emp.stressLevel && <span className="text-xs text-muted-foreground">Stress: {emp.stressLevel}/10</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No employees currently flagged for support.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Most Positive Energy Today
                </CardTitle>
                <CardDescription>Individuals reporting great mood and high energy</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                  <div className="space-y-4">
                    {summary?.topPositiveEmployees && summary.topPositiveEmployees.length > 0 ? (
                      summary.topPositiveEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center justify-between p-3 rounded-lg border bg-background/50">
                          <div>
                            <p className="font-medium">{emp.employeeName}</p>
                            <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs uppercase font-medium text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                              {emp.mood}
                            </span>
                            {emp.energyLevel && <span className="text-xs text-muted-foreground">Energy: {emp.energyLevel}/10</span>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Waiting for more check-ins today.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </PageTransition>
      </main>
    </div>
  );
}
