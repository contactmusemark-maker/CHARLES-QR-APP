import { useRoute, useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { useEffect } from "react";
import { useGetEmployeeHistory, getGetEmployeeHistoryQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  ArrowLeft, Loader2, AlertTriangle, TrendingUp, TrendingDown, Minus, Building2, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOOD_COLORS: Record<string, string> = {
  great: "#4a7c59",
  good: "#6faa82",
  calm: "#8ab5a0",
  okay: "#b8a98a",
  stressed: "#d97c5a",
  exhausted: "#8a6a6a",
};

const MOOD_LABELS: Record<string, string> = {
  great: "Thriving",
  good: "Positive",
  calm: "Peaceful",
  okay: "Steady",
  stressed: "Tense",
  exhausted: "Drained",
};

const MOOD_SCORE: Record<string, number> = {
  great: 10, good: 8, calm: 7, okay: 6, stressed: 3, exhausted: 2,
};

export default function EmployeeTrend() {
  const [, setLocation] = useLocation();
  const { employee } = useEmployee();
  const [, params] = useRoute("/admin/employee/:employeeId");
  const employeeId = params?.employeeId ?? "";

  useEffect(() => {
    if (!employee || employee.id.toUpperCase() !== "CCE001" || employee.name.toUpperCase() !== "WILLIAM") {
      setLocation("/");
    }
  }, [employee, setLocation]);

  const { data: history, isLoading } = useGetEmployeeHistory(
    employeeId,
    { query: { queryKey: getGetEmployeeHistoryQueryKey(employeeId), enabled: !!employeeId } }
  );

  if (!employee) return null;

  const checkins = history?.checkins ?? [];
  const chartData = [...checkins]
    .reverse()
    .map((c) => ({
      date: format(new Date(c.checkedInAt), "MMM d"),
      mood: c.mood,
      moodScore: MOOD_SCORE[c.mood] ?? 5,
      energy: c.energyLevel ?? null,
      focus: c.focusLevel ?? null,
      stress: c.stressLevel ?? null,
      color: MOOD_COLORS[c.mood] ?? "#888",
    }));

  const avgWellness = history?.averageWellness ?? 0;
  const trendDir = chartData.length >= 4
    ? (chartData.slice(-2).reduce((s, d) => s + d.moodScore, 0) / 2) -
      (chartData.slice(-4, -2).reduce((s, d) => s + d.moodScore, 0) / 2)
    : 0;

  const burnoutDays = history?.burnoutDays ?? 0;

  return (
    <div className="min-h-screen bg-background/50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-4 md:px-6 max-w-7xl mx-auto">
          <button
            onClick={() => setLocation("/admin")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
          </button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{history?.employeeName ?? employeeId}</span>
              <span className="text-xs text-muted-foreground font-mono">{employeeId}</span>
              {history?.department && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#4a7c59]/10 text-[#4a7c59] font-medium">
                  {history.department}
                </span>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <PageTransition className="space-y-6">

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : checkins.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-base font-medium">No check-ins yet</p>
              <p className="text-sm mt-1 opacity-70">This employee hasn't submitted any check-ins.</p>
            </div>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Wellness score */}
                <Card className="bg-white/60 border-white/40 shadow-sm">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Avg Wellness</p>
                    <p className="text-3xl font-bold text-foreground">{avgWellness.toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">out of 10</p>
                  </CardContent>
                </Card>

                {/* Trend */}
                <Card className="bg-white/60 border-white/40 shadow-sm">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Trend</p>
                    <div className="flex items-center gap-2 mt-1">
                      {trendDir > 0.5 ? (
                        <><TrendingUp className="w-6 h-6 text-[#4a7c59]" /><span className="text-sm font-semibold text-[#4a7c59]">Improving</span></>
                      ) : trendDir < -0.5 ? (
                        <><TrendingDown className="w-6 h-6 text-[#d97c5a]" /><span className="text-sm font-semibold text-[#d97c5a]">Declining</span></>
                      ) : (
                        <><Minus className="w-6 h-6 text-muted-foreground" /><span className="text-sm font-semibold text-muted-foreground">Stable</span></>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Burnout risk days */}
                <Card className={`shadow-sm border-white/40 ${burnoutDays > 2 ? "bg-red-50/80" : "bg-white/60"}`}>
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Burnout Flags</p>
                    <div className="flex items-center gap-2 mt-1">
                      {burnoutDays > 0 && <AlertTriangle className="w-5 h-5 text-[#d97c5a]" />}
                      <p className="text-3xl font-bold text-foreground">{burnoutDays}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">high-stress days</p>
                  </CardContent>
                </Card>

                {/* Total check-ins */}
                <Card className="bg-white/60 border-white/40 shadow-sm">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Check-ins</p>
                    <p className="text-3xl font-bold text-foreground">{checkins.length}</p>
                    <p className="text-xs text-muted-foreground">total sessions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Mood Journey chart */}
              <Card className="bg-white/60 border-white/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-serif">Mood Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload as typeof chartData[0];
                          return (
                            <div className="bg-white border border-border rounded-xl shadow-lg px-3 py-2 text-xs">
                              <p className="font-semibold" style={{ color: d.color }}>{d.mood.charAt(0).toUpperCase() + d.mood.slice(1)} — {MOOD_LABELS[d.mood]}</p>
                              <p className="text-muted-foreground">{d.date}</p>
                            </div>
                          );
                        }}
                      />
                      <ReferenceLine y={7} stroke="#4a7c59" strokeDasharray="3 3" strokeOpacity={0.4} />
                      <ReferenceLine y={4} stroke="#d97c5a" strokeDasharray="3 3" strokeOpacity={0.4} />
                      <Line
                        type="monotone"
                        dataKey="moodScore"
                        stroke="#4a7c59"
                        strokeWidth={2.5}
                        dot={(props) => {
                          const { cx, cy, payload } = props as { cx: number; cy: number; payload: typeof chartData[0] };
                          return <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill={payload.color} stroke="white" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><span className="inline-block w-5 h-px border-t-2 border-dashed border-[#4a7c59]/50" /> Good zone (≥7)</span>
                    <span className="flex items-center gap-1"><span className="inline-block w-5 h-px border-t-2 border-dashed border-[#d97c5a]/50" /> Watch zone (≤4)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Energy / Focus / Stress charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: "energy" as const, label: "Energy", color: "#6faa82" },
                  { key: "focus" as const, label: "Focus", color: "#8ab5a0" },
                  { key: "stress" as const, label: "Stress", color: "#d97c5a" },
                ].map(({ key, label, color }) => (
                  <Card key={key} className="bg-white/60 border-white/40 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={110}>
                        <LineChart data={chartData} margin={{ top: 4, right: 6, left: -28, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 9, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (!active || !payload?.length) return null;
                              const val = payload[0].value as number | null;
                              return (
                                <div className="bg-white border border-border rounded-lg px-2 py-1 text-xs shadow">
                                  <span style={{ color }}>{label}: {val ?? "—"}/10</span>
                                </div>
                              );
                            }}
                          />
                          <Line type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Check-in log */}
              <Card className="bg-white/60 border-white/40 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-serif">Full Check-in History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {checkins.map((c) => (
                      <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 border border-border/50">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: MOOD_COLORS[c.mood] ?? "#888" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium capitalize">{c.mood}</span>
                            {c.energyLevel && <span className="text-xs text-muted-foreground">⚡ {c.energyLevel}/10</span>}
                            {c.focusLevel && <span className="text-xs text-muted-foreground">🎯 {c.focusLevel}/10</span>}
                            {c.stressLevel && (
                              <span className={`text-xs ${c.stressLevel >= 7 ? "text-[#d97c5a] font-medium" : "text-muted-foreground"}`}>
                                🔥 {c.stressLevel}/10
                              </span>
                            )}
                            {(c.tags ?? []).map((t) => (
                              <span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>
                            ))}
                          </div>
                          {c.note && <p className="text-xs text-muted-foreground italic mt-0.5 truncate">"{c.note}"</p>}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                          {format(new Date(c.checkedInAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </PageTransition>
      </main>
    </div>
  );
}
