const ADMIN_SESSION_KEY = "charles.admin.authed";

export type TempAdminCredentials = { id: string; password: string } | null;

export function getTempAdminCredentials(): TempAdminCredentials {
  const id = (import.meta.env.VITE_ADMIN_ID as string | undefined) ?? "CCE001";
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
