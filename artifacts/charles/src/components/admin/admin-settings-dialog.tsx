import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Save, Shield, UserRound, Mail, Phone, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getAdminDetails, getTempAdminCredentials, setAdminDetails, setAdminPasswordOverride } from "@/lib/admin-auth";

export function AdminSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();

  const tempAdmin = useMemo(() => getTempAdminCredentials(), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!open) return;
    const d = getAdminDetails();
    setName(d.name ?? "");
    setEmail(d.email ?? "");
    setPhone(d.phone ?? "");
    setNewPassword("");
    setConfirmPassword("");
    setShowPw(false);
  }, [open]);

  const saveDetails = () => {
    setAdminDetails({
      name: name.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    toast({ title: "Saved", description: "Admin details updated." });
  };

  const savePassword = () => {
    const pw = newPassword.trim();
    if (pw.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (pw !== confirmPassword) {
      toast({ title: "Passwords don’t match", description: "Please retype the password.", variant: "destructive" });
      return;
    }

    setAdminPasswordOverride(pw);
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated", description: "Use the new password next time you log in." });
  };

  const resetPasswordToEnv = () => {
    setAdminPasswordOverride(null);
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Reset", description: "Password reset to the default env value." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,_rgba(74,124,89,0.10)_0%,_transparent_60%)]" />
          <DialogHeader className="relative px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-serif flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#4a7c59]" />
              Settings
            </DialogTitle>
            <DialogDescription className="text-sm">
              Admin ID: <span className="font-mono">{tempAdmin?.id ?? "—"}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="relative px-6 py-5 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* Details */}
            <div className="rounded-3xl border bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                Admin details
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                    <UserRound className="w-3.5 h-3.5 text-[#4a7c59]" />
                    Name
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                    placeholder="Admin name"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#4a7c59]" />
                      Email
                    </div>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                      placeholder="name@company.com"
                    />
                  </label>

                  <label className="space-y-1.5">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#4a7c59]" />
                      Phone
                    </div>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-4 rounded-2xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                      placeholder="+91…"
                    />
                  </label>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <Button
                    type="button"
                    onClick={saveDetails}
                    className="rounded-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save details
                  </Button>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="rounded-3xl border bg-white/70 backdrop-blur-sm px-5 py-4 shadow-sm">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                Reset admin password
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    New password
                  </div>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 pr-12 px-4 rounded-2xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl hover:bg-black/5 flex items-center justify-center"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </label>

                <label className="space-y-1.5">
                  <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Confirm password
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 px-4 rounded-2xl bg-[#f8f6f3] border border-[#e8e4dd] text-sm focus:outline-none focus:ring-2 focus:ring-[#4a7c59]/35"
                    placeholder="••••••••"
                  />
                </label>

                <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetPasswordToEnv}
                    className="rounded-full gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to default
                  </Button>
                  <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      onClick={savePassword}
                      className="w-full rounded-full bg-[#4a7c59] hover:bg-[#3d6b4a] text-white gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Update password
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
