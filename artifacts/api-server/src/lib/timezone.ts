export function parseTzOffsetMinutes(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  if (!Number.isFinite(n)) return null;
  // Valid offsets are within ±14 hours.
  if (n < -14 * 60 || n > 14 * 60) return null;
  return Math.trunc(n);
}

export function parseYyyyMmDd(value: string): { year: number; month: number; day: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Convert a local date (YYYY-MM-DD) in a client timezone (represented by
 * `Date.getTimezoneOffset()` minutes) into an inclusive UTC range.
 */
export function localDateToUtcRange(dateStr: string, tzOffsetMinutes: number): { start: Date; end: Date } {
  const parsed = parseYyyyMmDd(dateStr);
  if (!parsed) throw new Error(`Invalid date: "${dateStr}"`);

  const { year, month, day } = parsed;
  const startUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0, 0) + tzOffsetMinutes * 60_000;
  const endUtcMs = Date.UTC(year, month - 1, day, 23, 59, 59, 999) + tzOffsetMinutes * 60_000;
  return { start: new Date(startUtcMs), end: new Date(endUtcMs) };
}

export function formatLocalDateKey(date: Date): string {
  // Uses local timezone of the runtime (browser).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getBusinessTimeZone(): string {
  const raw = process.env["BUSINESS_TZ"] ?? "Asia/Kolkata";
  // Basic hardening: allow only common IANA timezone characters.
  const ok = /^[A-Za-z0-9_+\-\/]+$/.test(raw);
  return ok ? raw : "Asia/Kolkata";
}
