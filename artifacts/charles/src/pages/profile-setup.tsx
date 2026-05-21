import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Camera, Mail, Phone, Building2, BadgeCheck, Loader2 } from "lucide-react";
import { useEmployee } from "@/context/employee-context";
import { MiniLeafMark } from "@/components/mini-leaf-mark";
import { Bonsai } from "@/components/bonsai";
import { useToast } from "@/hooks/use-toast";
import { useUpsertEmployeeProfile } from "@workspace/api-client-react";

import welcomeBonsai from "@assets/Happy_Wave_Bonsai_1779333623327.png";

function resolveApiUrl(path: string): string {
  const base = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "");
  if (base) return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return path;
}

async function compressImage(file: File, maxSize = 640, quality = 0.84): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  if (!blob) throw new Error("Failed to compress image");
  return blob;
}

export default function ProfileSetup() {
  const [, setLocation] = useLocation();
  const { employee, setEmployee, profile, setProfile } = useEmployee();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(employee?.name ?? "");
  const [employeeId, setEmployeeId] = useState(employee?.id ?? "");
  const [department, setDepartment] = useState(employee?.department ?? "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const upsertProfile = useUpsertEmployeeProfile();

  useEffect(() => {
    if (!employee) setLocation("/");
  }, [employee, setLocation]);

  useEffect(() => {
    if (profile) {
      setEmail(profile.email ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || "C";
  }, [fullName]);

  if (!employee) return null;

  const validate = (): string | null => {
    if (!employeeId.trim()) return "Employee ID is required.";
    if (!fullName.trim()) return "Full name is required.";
    if (!department.trim()) return "Department is required.";
    return null;
  };

  const uploadAvatarIfNeeded = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    setIsUploadingAvatar(true);
    try {
      const blob = await compressImage(avatarFile);
      const form = new FormData();
      form.append("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }));

      const resp = await fetch(resolveApiUrl(`/api/profiles/${encodeURIComponent(employeeId.trim())}/avatar`), {
        method: "POST",
        body: form,
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(text || `Avatar upload failed (HTTP ${resp.status})`);
      }

      const data = (await resp.json()) as { url?: string };
      return data.url ?? null;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast({ title: "Missing details", description: error, variant: "destructive" });
      return;
    }

    try {
      const avatarUrl = await uploadAvatarIfNeeded();
      const created = await upsertProfile.mutateAsync({
        employeeId: employeeId.trim(),
        data: {
          fullName: fullName.trim(),
          department: department.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          profileImageUrl: avatarUrl ?? profile?.profileImageUrl ?? null,
        },
      });

      setProfile({
        employeeId: created.employeeId,
        fullName: created.fullName,
        department: created.department ?? null,
        email: created.email ?? null,
        phone: created.phone ?? null,
        profileImageUrl: created.profileImageUrl ?? null,
        createdAt: String(created.createdAt),
        updatedAt: String(created.updatedAt),
      });

      setEmployee({
        id: created.employeeId,
        name: created.fullName,
        department: created.department ?? department.trim(),
      });

      setLocation("/mood");
    } catch (err) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Please try again.";
      toast({ title: "Profile setup failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f0ede8] overflow-hidden relative px-5 sm:px-6 py-12">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.08)_0%,_transparent_60%)]" />
      <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full blur-3xl bg-[#4a7c59]/10 pointer-events-none" />
      <div className="absolute -bottom-36 right-0 w-[520px] h-[520px] rounded-full blur-3xl bg-[#8ab5a0]/14 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl z-10"
      >
        {/* Micro brand */}
        <div className="flex flex-col items-center text-center">
          <MiniLeafMark className="w-7 h-7" />
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#4a7c59]/45" />
            <span className="font-serif text-[12px] tracking-[0.42em] text-[#6b7280] uppercase">
              Profile Setup
            </span>
            <div className="h-px w-12 bg-[#4a7c59]/45" />
          </div>
          <p className="mt-4 font-serif text-[14px] text-[#7a8b7e]">
            Let’s personalize your space with Charles.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          {/* Left: mascot + avatar */}
          <div className="md:col-span-2 flex flex-col items-center md:items-start text-center md:text-left">
            <Bonsai src={welcomeBonsai} alt="Charles" className="w-40 h-40 md:w-44 md:h-44" />

            <div className="mt-5 w-full flex flex-col items-center md:items-start">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Profile photo
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-28 h-28 rounded-[28px] bg-white/70 border border-white/80 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden relative"
              >
                {avatarPreviewUrl ? (
                  <img src={avatarPreviewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[#6b7280]">
                    <div className="w-12 h-12 rounded-full bg-[#dfe7db] text-[#4a7c59] flex items-center justify-center">
                      <span className="font-semibold">{initials}</span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-xs">
                      <Camera className="w-4 h-4" />
                      Upload
                    </div>
                  </div>
                )}

                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-[#4a7c59]" />
                  </div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          {/* Right: form */}
          <div className="md:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] bg-white/70 backdrop-blur-sm border border-white/80 shadow-xl shadow-black/5 px-6 sm:px-7 py-7 space-y-5"
            >
              <div className="flex items-center gap-2 text-sm text-[#6b7280]">
                <BadgeCheck className="w-4 h-4 text-[#4a7c59]" />
                <span className="font-medium">Complete your profile once—then daily check-ins are instant.</span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Employee ID
                  </label>
                  <input
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      inputMode="email"
                      placeholder="optional"
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      placeholder="optional"
                      className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                    />
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={upsertProfile.isPending || isUploadingAvatar}
                className="w-full h-14 rounded-full bg-[#4a7c59] text-white text-[15px] font-semibold tracking-wide hover:bg-[#3d6b4a] transition-colors shadow-[0_16px_44px_rgba(74,124,89,0.24)] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {(upsertProfile.isPending || isUploadingAvatar) && <Loader2 className="w-4 h-4 animate-spin" />}
                Complete Profile
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

