const ADMIN_SESSION_KEY = "charles.admin.authed";
const ADMIN_PASSWORD_OVERRIDE_KEY = "charles.admin.password.override";
const ADMIN_DETAILS_KEY = "charles.admin.details";

export type TempAdminCredentials = { id: string; password: string } | null;

export function getTempAdminCredentials(): TempAdminCredentials {
  const id = (import.meta.env.VITE_ADMIN_ID as string | undefined) ?? "CCE001";
  if (typeof window !== "undefined") {
    const override = window.localStorage.getItem(ADMIN_PASSWORD_OVERRIDE_KEY);
    if (override && override.trim()) return { id, password: override };
  }

  const password = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
  if (!password) return null;
  return { id, password };
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}

export function setAdminAuthed(value: boolean): void {
  if (typeof window === "undefined") return;
  if (value) window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
  else window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export type AdminDetails = { name?: string; email?: string; phone?: string };

export function getAdminDetails(): AdminDetails {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(ADMIN_DETAILS_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AdminDetails;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function setAdminDetails(details: AdminDetails): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_DETAILS_KEY, JSON.stringify(details));
}

export function setAdminPasswordOverride(password: string | null): void {
  if (typeof window === "undefined") return;
  if (!password) window.localStorage.removeItem(ADMIN_PASSWORD_OVERRIDE_KEY);
  else window.localStorage.setItem(ADMIN_PASSWORD_OVERRIDE_KEY, password);
}
