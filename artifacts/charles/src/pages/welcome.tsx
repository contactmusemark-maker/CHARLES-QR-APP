import { useState } from "react";
import { useLocation } from "wouter";
import { useEmployee } from "@/context/employee-context";
import { PageTransition } from "@/components/page-transition";
import { Bonsai } from "@/components/bonsai";
import { motion } from "framer-motion";

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
  "Other",
];

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { setEmployee } = useEmployee();
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [department, setDepartment] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!employeeId.trim()) e.employeeId = "Required";
    if (!employeeName.trim()) e.employeeName = "Required";
    if (!department) e.department = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setEmployee({ id: employeeId.trim(), name: employeeName.trim(), department });

    if (employeeId.trim().toUpperCase() === "CCE001" && employeeName.trim().toUpperCase() === "WILLIAM") {
      setLocation("/admin");
    } else {
      setLocation("/mood");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background overflow-hidden relative px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_hsl(var(--primary)/0.08)_0%,_transparent_60%)]" />

      <PageTransition className="w-full max-w-sm z-10 flex flex-col items-center">

        {/* Mascot */}
        <Bonsai
          src={welcomeBonsai}
          alt="Charles welcoming you"
          className="w-52 h-52 mb-5"
        />

        {/* Brand header */}
        <div className="text-center mb-1">
          <h1 className="text-4xl font-serif tracking-tight text-foreground leading-tight">
            Good morning.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Welcome to the office. Charles is ready to check you in.
          </p>
        </div>

        {/* Brand credit */}
        <div className="flex items-center gap-2 mt-3 mb-8">
          <div className="h-px w-8 bg-[#4a7c59]/40" />
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70 text-center">
            Charles · Chief Executive Officer · ZenByQualCode
          </p>
          <div className="h-px w-8 bg-[#4a7c59]/40" />
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-white/70 backdrop-blur-sm border border-white/80 shadow-xl shadow-black/5 rounded-3xl px-7 py-8 space-y-5"
        >

          {/* Employee ID */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Employee ID
            </label>
            <input
              type="text"
              placeholder="e.g. EMP001"
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setErrors(p => ({ ...p, employeeId: "" })); }}
              autoComplete="off"
              className={`w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/40 transition-all ${errors.employeeId ? "border-red-300 bg-red-50/50" : "border-[#e8e4dd] focus:border-[#4a7c59]/40"}`}
            />
            {errors.employeeId && <p className="text-[11px] text-red-500">{errors.employeeId}</p>}
          </div>

          {/* First Name */}
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

          {/* Submit */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-12 mt-2 rounded-xl bg-[#4a7c59] text-white text-sm font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#4a7c59]/20"
          >
            Check In
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-[11px] text-muted-foreground/50 tracking-wider uppercase">
          Rooted. Calm. Focused.
        </p>
      </PageTransition>
    </div>
  );
}
