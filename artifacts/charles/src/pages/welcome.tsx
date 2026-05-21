import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, Loader2 } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTempAdminCredentials, setAdminAuthed, type TempAdminCredentials } from "@/lib/admin-auth";
import { useToast } from "@/hooks/use-toast";

import welcomeBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Product",
  "Customer Success",
  "Legal",
  "Psychology",
  "Other",
];

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { setEmployee, setProfile } = useEmployee();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"employee" | "admin">("employee");

  const [employeeStep, setEmployeeStep] = useState<"id" | "details">("id");
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const tempAdmin: TempAdminCredentials = useMemo(() => getTempAdminCredentials(), []);

  const resolveApiUrl = (path: string): string => {
    const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");
    if (base) return `${base}${path.startsWith("/") ? path : `/${path}`}`;
    return path;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!employeeId.trim()) e.employeeId = "Required";
    if (employeeStep === "details") {
      if (!employeeName.trim()) e.employeeName = "Required";
      if (!department) e.department = "Required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const id = employeeId.trim();

    // Step 1: only ID → check for returning user profile
    if (employeeStep === "id") {
      setIsCheckingProfile(true);
      try {
        const resp = await fetch(resolveApiUrl(`/api/profiles/${encodeURIComponent(id)}`), { method: "GET" });

        if (resp.status === 404) {
          setEmployee(null);
          setProfile(null);
          setEmployeeStep("details");
          return;
        }

        if (!resp.ok) {
          const text = await resp.text().catch(() => "");
          throw new Error(text || `Profile lookup failed (HTTP ${resp.status})`);
        }

        const p = (await resp.json()) as {
          employeeId: string;
          fullName: string;
          department?: string | null;
          email?: string | null;
          phone?: string | null;
          profileImageUrl?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };

        setProfile({
          employeeId: p.employeeId,
          fullName: p.fullName,
          department: p.department ?? null,
          email: p.email ?? null,
          phone: p.phone ?? null,
          profileImageUrl: p.profileImageUrl ?? null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        });

        setEmployee({
          id: p.employeeId,
          name: p.fullName,
          department: p.department ?? "Other",
        });

        setLocation("/employee/welcome");
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message?: unknown }).message)
            : "Please try again.";
        toast({ title: "Couldn’t check your profile", description: message, variant: "destructive" });
      } finally {
        setIsCheckingProfile(false);
      }

      return;
    }

    // Step 2: new user details → continue to welcome, then profile setup
    setProfile(null);
    setEmployee({ id, name: employeeName.trim(), department });
    setLocation("/employee/welcome");
  };

  const validateAdmin = () => {
    const e: Record<string, string> = {};
    if (!adminId.trim()) e.adminId = "Required";
    if (!adminPassword) e.adminPassword = "Required";
    setAdminErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdmin()) return;

    if (!tempAdmin) {
      setAdminErrors({ adminPassword: "Admin login is not configured." });
      return;
    }

    const idOk = adminId.trim().toUpperCase() === tempAdmin.id.toUpperCase();
    const pwOk = adminPassword === tempAdmin.password;

    if (!idOk || !pwOk) {
      setAdminErrors({
        adminPassword: "Invalid credentials",
      });
      return;
    }

    setAdminAuthed(true);
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden relative px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />

      <PageTransition className="w-full max-w-sm z-10 flex flex-col items-center">

        {/* Mascot */}
        <Bonsai src={welcomeBonsai} alt="Charles welcoming you" className="w-52 h-52 mb-5" />

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif tracking-tight text-foreground leading-tight">
            Good morning.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Welcome to the office. Charles is ready to check you in.
          </p>
        </div>

        {/* Form card */}
        <div className="w-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-xl shadow-black/5 rounded-3xl px-7 py-7">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "employee" | "admin")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-[#f3f0ea]/80 p-1.5">
              <TabsTrigger className="rounded-xl text-xs font-semibold tracking-wide" value="employee">
                Employee
              </TabsTrigger>
              <TabsTrigger className="rounded-xl text-xs font-semibold tracking-wide" value="admin">
                Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="employee"
              className="mt-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
            >
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Employee ID */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EMP001"
                    value={employeeId}
                    onChange={(e) => {
                      setEmployeeId(e.target.value);
                      setErrors(p => ({ ...p, employeeId: "" }));
                      if (employeeStep === "details") {
                        // If they edit the ID, re-checking is likely.
                        setEmployeeStep("id");
                        setEmployeeName("");
                        setDepartment("");
                      }
                    }}
                    autoComplete="off"
                    className={`w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all ${errors.employeeId ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
                  />
                  {errors.employeeId && <p className="text-[11px] text-red-500">{errors.employeeId}</p>}
                  {employeeStep === "id" ? (
                    <p className="text-[11px] text-muted-foreground">
                      Returning employee? We’ll recognize you instantly.
                    </p>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      First time here—tell Charles a little about you.
                    </p>
                  )}
                </div>

                {employeeStep === "details" && (
                  <>
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="What should Charles call you?"
                        value={employeeName}
                        onChange={(e) => { setEmployeeName(e.target.value); setErrors(p => ({ ...p, employeeName: "" })); }}
                        autoComplete="off"
                        className={`w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all ${errors.employeeName ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
                      />
                      {errors.employeeName && <p className="text-[11px] text-red-500">{errors.employeeName}</p>}
                    </div>

                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Department
                      </label>
                      <select
                        value={department}
                        onChange={(e) => { setDepartment(e.target.value); setErrors(p => ({ ...p, department: "" })); }}
                        className={`w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all appearance-none cursor-pointer ${department ? "text-foreground" : "text-muted-foreground/50"} ${errors.department ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
                      >
                        <option value="" disabled>Select your department</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                      {errors.department && <p className="text-[11px] text-red-500">{errors.department}</p>}
                    </div>
                  </>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isCheckingProfile}
                  className="w-full h-12 mt-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-md shadow-[#4a7c59]/20"
                >
                  {isCheckingProfile ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking…
                    </span>
                  ) : employeeStep === "id" ? (
                    "Continue"
                  ) : (
                    "Continue"
                  )}
                </motion.button>
              </form>
            </TabsContent>

            <TabsContent
              value="admin"
              className="mt-5 data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1"
            >
              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div className="flex items-center gap-2 rounded-2xl border border-[#e8e4dd] bg-[#f8f6f3] px-3 py-2">
                  <Shield className="size-4 text-muted-foreground/70 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-snug">
                    Admin access is protected. Use your admin credentials to open the dashboard.
                  </p>
                </div>

                {/* Admin ID */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Admin ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CCE001"
                    value={adminId}
                    onChange={(e) => { setAdminId(e.target.value); setAdminErrors((p) => ({ ...p, adminId: "", adminPassword: "" })); }}
                    autoComplete="off"
                    className={`w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all ${adminErrors.adminId ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
                  />
                  {adminErrors.adminId && <p className="text-[11px] text-red-500">{adminErrors.adminId}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAdminPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={adminPassword}
                      onChange={(e) => { setAdminPassword(e.target.value); setAdminErrors((p) => ({ ...p, adminPassword: "" })); }}
                      autoComplete="off"
                      className={`w-full h-12 px-4 pr-11 rounded-xl bg-[#f8f6f3] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all ${adminErrors.adminPassword ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-foreground hover:bg-white/60 transition-colors"
                      aria-label={showAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showAdminPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {adminErrors.adminPassword && <p className="text-[11px] text-red-500">{adminErrors.adminPassword}</p>}
                </div>

                {/* Login */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-12 mt-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-md shadow-[#4a7c59]/20"
                >
                  Login
                </motion.button>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Watermark footer */}
        <div className="mt-8 flex flex-col items-center gap-0.5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">
            Rooted. Calm. Focused.
          </p>
          <p className="text-[10px] text-muted-foreground/40 tracking-wider">
            Chief Executive Officer
          </p>
          <p className="text-[10px] font-medium text-muted-foreground/40 tracking-widest uppercase">
            ZenByQualCode
          </p>
        </div>

      </PageTransition>
    </div>
  );
}
