import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format, subDays, addDays, startOfWeek, endOfWeek } from "date-fns";
import {
  useGetCheckinSummary,
  useGetCheckinTrends,
  useListCheckins,
  getGetCheckinSummaryQueryKey,
  getGetCheckinTrendsQueryKey,
  getListCheckinsQueryKey,
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
  ReferenceLine,
} from "recharts";
import {
  Loader2,
  LogOut,
  AlertTriangle,
  Heart,
  Zap,
  ShieldAlert,
  QrCode,
  CalendarIcon,
  Mail,
  Copy,
  Download,
  CheckCheck,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

import studyBonsai from "@assets/Study_-_Work_Bonsai_1779333623328.png";
import { isAdminAuthed, setAdminAuthed } from "@/lib/admin-auth";

const MOOD_COLORS: Record<string, string> = {
  Great: "#4a7c59",
  Good: "#6faa82",
  Calm: "#8ab5a0",
  Okay: "#b8a98a",
  Stressed: "#d97c5a",
  Exhausted: "#8a6a6a",
};

const MOOD_EMOJI: Record<string, string> = {
  great: "Thriving",
  good: "Good",
  okay: "Steady",
  stressed: "Stressed",
  exhausted: "Exhausted",
  none: "—",
};

function generateWeeklyReport(
  trends: { date: string; totalCheckins: number; dominantMood: string; averageWellness: number }[],
  summary: {
    totalCheckins: number;
    teamWellnessScore: number;
    burnoutRiskCount: number;
    averageEnergy: number;
    averageFocus: number;
    averageStress: number;
    topPositiveEmployees?: { employeeName: string; employeeId: string; mood: string; energyLevel?: number | null }[];
    needsSupportEmployees?: { employeeName: string; employeeId: string; mood: string; stressLevel?: number | null }[];
    moodBreakdown: Record<string, number>;
  } | undefined
): string {
  const weekStart = format(subDays(new Date(), 6), "MMMM d");
  const weekEnd = format(new Date(), "MMMM d, yyyy");
  const avgWellness = trends.length > 0
    ? (trends.reduce((s, d) => s + d.averageWellness, 0) / trends.filter(d => d.totalCheckins > 0).length || 0).toFixed(1)
    : "0.0";
  const totalCheckins = trends.reduce((s, d) => s + d.totalCheckins, 0);
  const peakDay = [...trends].sort((a, b) => b.totalCheckins - a.totalCheckins)[0];
  const bestDay = [...trends].sort((a, b) => b.averageWellness - a.averageWellness)[0];

  const moodLines = summary?.moodBreakdown
    ? Object.entries(summary.moodBreakdown)
        .sort((a, b) => b[1] - a[1])
        .map(([mood, count]) => `   ${mood.charAt(0).toUpperCase() + mood.slice(1).padEnd(12)} ${count} employee${count !== 1 ? "s" : ""}`)
        .join("\n")
    : "   No data available";

  const topPerformers = summary?.topPositiveEmployees?.length
    ? summary.topPositiveEmployees.map(e => `   • ${e.employeeName} (${e.employeeId}) — ${e.mood}${e.energyLevel ? `, energy ${e.energyLevel}/10` : ""}`).join("\n")
    : "   No data available";

  const atRisk = summary?.needsSupportEmployees?.length
    ? summary.needsSupportEmployees.map(e => `   • ${e.employeeName} (${e.employeeId}) — ${e.mood}${e.stressLevel ? `, stress ${e.stressLevel}/10` : ""}`).join("\n")
    : "   All clear — no burnout flags this week";

  const dayByDay = trends
    .map(d => {
      const label = format(new Date(d.date + "T12:00:00"), "EEE MMM d");
      const bar = d.averageWellness > 0 ? "█".repeat(Math.round(d.averageWellness)) : "—";
      return `   ${label.padEnd(13)} ${bar} ${d.averageWellness.toFixed(1)} (${d.totalCheckins} check-in${d.totalCheckins !== 1 ? "s" : ""})`;
    })
    .join("\n");

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CHARLES — WEEKLY WELLNESS DIGEST
  ${weekStart} – ${weekEnd}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEEK AT A GLANCE
   Total check-ins      ${totalCheckins}
   Avg wellness score   ${avgWellness} / 10
   Burnout flags        ${summary?.burnoutRiskCount ?? 0} employee${(summary?.burnoutRiskCount ?? 0) !== 1 ? "s" : ""}
   Avg energy           ${summary?.averageEnergy?.toFixed(1) ?? "—"} / 10
   Avg focus            ${summary?.averageFocus?.toFixed(1) ?? "—"} / 10
   Avg stress           ${summary?.averageStress?.toFixed(1) ?? "—"} / 10

DAY-BY-DAY WELLNESS (scale 0–10)
${dayByDay}

PEAK CHECK-IN DAY
   ${peakDay ? `${format(new Date(peakDay.date + "T12:00:00"), "EEEE, MMMM d")} — ${peakDay.totalCheckins} check-ins` : "—"}

BEST WELLNESS DAY
   ${bestDay && bestDay.averageWellness > 0 ? `${format(new Date(bestDay.date + "T12:00:00"), "EEEE, MMMM d")} — ${bestDay.averageWellness.toFixed(1)}/10` : "—"}

TODAY'S MOOD BREAKDOWN
${moodLines}

MOST POSITIVE ENERGY
${topPerformers}

EMPLOYEES NEEDING SUPPORT
${atRisk}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Rooted. Calm. Focused.
  Generated by Charles on ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const { employee, clearSession } = useEmployee();
  const employeeOk =
    Boolean(employee) &&
    employee!.id.toUpperCase() === "CCE001" &&
    employee!.name.toUpperCase() === "WILLIAM";
  const adminOk = isAdminAuthed();
  const allowed = adminOk || employeeOk;

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const dateParam = format(selectedDate, "yyyy-MM-dd");
  const isToday = dateParam === format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!allowed) {
      setLocation("/");
    }
  }, [allowed, setLocation]);

  const { data: summary, isLoading: isLoadingSummary } = useGetCheckinSummary(
    { date: dateParam },
    { query: { queryKey: getGetCheckinSummaryQueryKey({ date: dateParam }), enabled: allowed } }
  );

  const { data: trends, isLoading: isLoadingTrends } = useGetCheckinTrends({
    query: { queryKey: getGetCheckinTrendsQueryKey(), enabled: allowed },
  });

  const { data: checkins, isLoading: isLoadingCheckins } = useListCheckins(
    { date: dateParam },
    { query: { queryKey: getListCheckinsQueryKey({ date: dateParam }), enabled: allowed } }
  );

  const handleSignOut = () => {
    clearSession();
    setAdminAuthed(false);
    setLocation("/");
  };

  const moodChartData = useMemo(() => {
    if (!summary?.moodBreakdown) return [];
    return Object.entries(summary.moodBreakdown).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      count: value,
      fill: MOOD_COLORS[key.charAt(0).toUpperCase() + key.slice(1)] ?? "#888",
    }));
  }, [summary]);

  const trendChartData = useMemo(() => {
    return (trends ?? []).map((d) => ({
      ...d,
      shortDate: format(new Date(d.date + "T12:00:00"), "MMM d"),
    }));
  }, [trends]);

  const weeklyReport = useMemo(
    () => (trends ? generateWeeklyReport(trends, summary) : ""),
    [trends, summary]
  );

  const handleCopyReport = useCallback(() => {
    navigator.clipboard.writeText(weeklyReport).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [weeklyReport]);

  const handleDownloadReport = useCallback(() => {
    const blob = new Blob([weeklyReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `charles-wellness-report-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [weeklyReport]);

  const handleEmailReport = useCallback(() => {
    const subject = encodeURIComponent(`Charles Weekly Wellness Digest — w/e ${format(new Date(), "MMMM d, yyyy")}`);
    const body = encodeURIComponent(weeklyReport);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }, [weeklyReport]);

  const wellnessTrend = useMemo(() => {
    if (!trends || trends.length < 2) return "neutral";
    const recent = trends.slice(-3).filter(d => d.totalCheckins > 0);
    const older = trends.slice(0, 4).filter(d => d.totalCheckins > 0);
    if (!recent.length || !older.length) return "neutral";
    const recentAvg = recent.reduce((s, d) => s + d.averageWellness, 0) / recent.length;
    const olderAvg = older.reduce((s, d) => s + d.averageWellness, 0) / older.length;
    if (recentAvg > olderAvg + 0.5) return "up";
    if (recentAvg < olderAvg - 0.5) return "down";
    return "neutral";
  }, [trends]);

  if (!allowed) return null;

  return (
    <div className="min-h-screen w-full bg-background/50">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto gap-3">
          {/* Left: brand */}
          <div className="flex items-center gap-3 shrink-0">
            <Bonsai src={studyBonsai} alt="Charles working" className="w-12 h-12 md:w-14 md:h-14 shrink-0" floating={false} />
            <span className="text-base font-serif font-medium tracking-tight whitespace-nowrap">Charles Admin</span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Date nav: ← [Date clickable] → */}
            <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg p-0.5 border border-border/50">
              <button
                onClick={() => setSelectedDate(d => subDays(d, 1))}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Clickable date — opens calendar picker */}
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2 h-7 rounded-md hover:bg-background transition-colors group">
                    <CalendarIcon className="w-3 h-3 text-muted-foreground/70 group-hover:text-[#4a7c59] transition-colors" />
                    <span className="text-xs font-medium whitespace-nowrap tabular-nums group-hover:text-[#4a7c59] transition-colors">
                      {isToday ? "Today" : format(selectedDate, "MMM d")}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto max-w-[calc(100vw-1.5rem)] p-2 shadow-xl rounded-2xl border-border/50" align="center" sideOffset={8}>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }}
                    disabled={(d) => d > new Date()}
                    initialFocus
                    className="rounded-2xl"
                  />
                  {!isToday && (
                    <div className="px-1 pb-1">
                      <button
                        onClick={() => { setSelectedDate(new Date()); setCalendarOpen(false); }}
                        className="w-full h-8 rounded-xl bg-[#4a7c59] text-white text-xs font-semibold hover:bg-[#3d6b4a] transition-colors"
                      >
                        Jump to Today
                      </button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <button
                onClick={() => setSelectedDate(d => addDays(d, 1))}
                disabled={isToday}
                className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-background transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next day"
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="h-7 px-2.5 text-[11px] font-semibold rounded-lg bg-[#4a7c59] text-white hover:bg-[#3d6b4a] transition-colors"
              >
                Today
              </button>
            )}

            <Button variant="outline" size="sm" onClick={() => setReportOpen(true)}
              className="h-8 rounded-lg gap-1.5 text-xs px-3 border-blue-200 text-blue-700 hover:bg-blue-50">
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Report</span>
            </Button>

            <Button variant="outline" size="sm" onClick={() => setLocation("/poster")}
              className="h-8 rounded-lg gap-1.5 text-xs px-3 border-[#4a7c59]/30 text-[#4a7c59] hover:bg-[#4a7c59]/10">
              <QrCode className="w-3.5 h-3.5" />
              <span className="hidden md:inline">QR</span>
            </Button>

            <Button variant="ghost" size="sm" onClick={handleSignOut}
              className="h-8 rounded-lg gap-1.5 text-xs px-3">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-8 py-8 max-w-7xl mx-auto">
        <PageTransition className="space-y-6">

          {/* Date context banner (when viewing past) */}
          {!isToday && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span>Viewing data for <strong>{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong></span>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="ml-auto text-xs underline underline-offset-2 hover:text-amber-900"
              >
                Back to today
              </button>
            </div>
          )}

          {/* Top Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wellness Score</CardTitle>
                <Heart className="h-4 w-4 text-[#4a7c59]" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.teamWellnessScore?.toFixed(1) ?? "—"}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Out of 10.0</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Energy</CardTitle>
                <Zap className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.averageEnergy?.toFixed(1) ?? "—"}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Energy level</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Burnout Risk</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className={`text-3xl font-serif ${(summary?.burnoutRiskCount ?? 0) > 0 ? "text-red-600" : ""}`}>
                    {summary?.burnoutRiskCount ?? 0}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Flagged</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Check-ins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <div className="text-3xl font-serif">{summary?.totalCheckins ?? 0}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{isToday ? "Today" : "That day"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Mood Distribution */}
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-serif">How the team feels</CardTitle>
                <CardDescription>
                  {isToday ? "Today's mood distribution" : `Mood distribution — ${format(selectedDate, "MMM d")}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-[260px]">
                {isLoadingSummary ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : moodChartData.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    No check-ins for this day yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 13 }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56} fill="#4a7c59" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* 7-Day Wellness Trend */}
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg font-serif">7-Day Wellness Trend</CardTitle>
                  <CardDescription>Average wellness score per day</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium mt-0.5">
                  {wellnessTrend === "up" && <><TrendingUp className="w-4 h-4 text-[#4a7c59]" /><span className="text-[#4a7c59]">Improving</span></>}
                  {wellnessTrend === "down" && <><TrendingDown className="w-4 h-4 text-red-500" /><span className="text-red-500">Declining</span></>}
                  {wellnessTrend === "neutral" && <><Minus className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">Stable</span></>}
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-[260px]">
                {isLoadingTrends ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                      <ReferenceLine y={7} stroke="#4a7c59" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: "Good", position: "insideTopRight", fontSize: 11, fill: "#4a7c59" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: "0.75rem", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: 13 }}
                        formatter={(v: number) => [`${v.toFixed(1)} / 10`, "Wellness"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageWellness"
                        stroke="#4a7c59"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#4a7c59", strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Check-in Log for selected date */}
          <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                {isToday ? "Today's Check-ins" : `Check-ins — ${format(selectedDate, "MMMM d, yyyy")}`}
              </CardTitle>
              <CardDescription>All employee submissions for this day</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCheckins ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !checkins || checkins.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No check-ins recorded for this day.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground uppercase tracking-wider">
                        <th className="text-left py-2 pr-4 font-medium">Employee</th>
                        <th className="text-left py-2 pr-4 font-medium">ID</th>
                        <th className="text-left py-2 pr-4 font-medium">Mood</th>
                        <th className="text-center py-2 pr-4 font-medium">Energy</th>
                        <th className="text-center py-2 pr-4 font-medium">Focus</th>
                        <th className="text-center py-2 pr-4 font-medium">Stress</th>
                        <th className="text-left py-2 pr-4 font-medium">Tags</th>
                        <th className="text-left py-2 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {checkins.map((c) => {
                        const moodColor = MOOD_COLORS[c.mood.charAt(0).toUpperCase() + c.mood.slice(1)];
                        return (
                          <tr key={c.id} className="hover:bg-white/40 transition-colors">
                            <td className="py-3 pr-4 font-medium">{c.employeeName}</td>
                            <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{c.employeeId}</td>
                            <td className="py-3 pr-4">
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: moodColor }}
                              >
                                {c.mood.charAt(0).toUpperCase() + c.mood.slice(1)}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-center text-muted-foreground">{c.energyLevel ?? "—"}</td>
                            <td className="py-3 pr-4 text-center text-muted-foreground">{c.focusLevel ?? "—"}</td>
                            <td className="py-3 pr-4 text-center">
                              <span className={c.stressLevel && c.stressLevel >= 7 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                                {c.stressLevel ?? "—"}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              <div className="flex flex-wrap gap-1">
                                {c.tags?.length ? c.tags.map((t) => (
                                  <span key={t} className="px-1.5 py-0.5 bg-secondary rounded text-[11px] text-secondary-foreground">{t}</span>
                                )) : <span className="text-muted-foreground">—</span>}
                              </div>
                            </td>
                            <td className="py-3 text-muted-foreground text-xs whitespace-nowrap">
                              {format(new Date(c.checkedInAt), "h:mm a")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                Department Wellness
              </CardTitle>
              <CardDescription>Wellness score and mood per team</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !summary?.departmentBreakdown?.length ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No department data for this day.
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.departmentBreakdown.map((dept) => {
                    const pct = Math.round((dept.averageWellness / 10) * 100);
                    const moodColor = MOOD_COLORS[dept.dominantMood.charAt(0).toUpperCase() + dept.dominantMood.slice(1)] ?? "#888";
                    return (
                      <div key={dept.department} className="flex items-center gap-4 p-3 rounded-xl border bg-background/40">
                        <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${moodColor}20` }}>
                          <Building2 className="w-4 h-4" style={{ color: moodColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium truncate">{dept.department}</span>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span
                                className="text-[11px] font-medium px-2 py-0.5 rounded-full text-white"
                                style={{ backgroundColor: moodColor }}
                              >
                                {dept.dominantMood}
                              </span>
                              <span className="text-xs text-muted-foreground tabular-nums">{dept.count} {dept.count === 1 ? "person" : "people"}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundColor: moodColor }}
                            />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[11px] text-muted-foreground">Wellness</span>
                            <span className="text-[11px] font-medium tabular-nums">{dept.averageWellness.toFixed(1)}/10</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bottom Lists Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Needs Support
                </CardTitle>
                <CardDescription>High stress or exhaustion reported</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                  <div className="space-y-3">
                    {summary?.needsSupportEmployees?.length ? (
                      summary.needsSupportEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => setLocation(`/admin/employee/${emp.employeeId}`)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border bg-background/50 hover:bg-background/80 hover:border-[#d97c5a]/30 transition-all text-left group"
                        >
                          <div>
                            <p className="font-medium text-sm group-hover:text-[#d97c5a] transition-colors flex items-center gap-1">
                              {emp.employeeName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </p>
                            <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-red-600 px-2 py-0.5 bg-red-50 rounded-full capitalize">
                              {emp.mood}
                            </span>
                            {emp.stressLevel && <span className="text-xs text-muted-foreground">Stress: {emp.stressLevel}/10</span>}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No flags for this day.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-white/40 bg-white/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#4a7c59]" />
                  Positive Energy
                </CardTitle>
                <CardDescription>Great mood and high energy</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSummary ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                  <div className="space-y-3">
                    {summary?.topPositiveEmployees?.length ? (
                      summary.topPositiveEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => setLocation(`/admin/employee/${emp.employeeId}`)}
                          className="w-full flex items-center justify-between p-3 rounded-xl border bg-background/50 hover:bg-background/80 hover:border-[#4a7c59]/30 transition-all text-left group"
                        >
                          <div>
                            <p className="font-medium text-sm group-hover:text-[#4a7c59] transition-colors flex items-center gap-1">
                              {emp.employeeName}
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                            </p>
                            <p className="text-xs text-muted-foreground">{emp.employeeId}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-medium text-[#4a7c59] px-2 py-0.5 bg-[#4a7c59]/10 rounded-full capitalize">
                              {emp.mood}
                            </span>
                            {emp.energyLevel && <span className="text-xs text-muted-foreground">Energy: {emp.energyLevel}/10</span>}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No data for this day.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </PageTransition>
      </main>

      {/* Weekly Report Modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Weekly Wellness Digest
            </DialogTitle>
            <DialogDescription>
              {format(subDays(new Date(), 6), "MMMM d")} – {format(new Date(), "MMMM d, yyyy")} · 7-day summary
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap bg-muted/40 rounded-xl p-4 border text-foreground/80">
              {weeklyReport}
            </pre>
          </div>

          <div className="shrink-0 px-6 py-4 border-t flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              onClick={handleCopyReport}
            >
              {copied ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full gap-2"
              onClick={handleDownloadReport}
            >
              <Download className="w-4 h-4" />
              Download .txt
            </Button>
            <Button
              size="sm"
              className="rounded-full gap-2 bg-blue-600 hover:bg-blue-700 text-white ml-auto"
              onClick={handleEmailReport}
            >
              <Mail className="w-4 h-4" />
              Open in Mail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
