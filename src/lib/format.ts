import { format, parseISO, differenceInCalendarDays } from "date-fns";

export function ksh(amount: number | string | null | undefined) {
  const n = typeof amount === "string" ? Number(amount) : (amount ?? 0);
  return `KSh ${Math.round(n).toLocaleString("en-KE")}`;
}

export function fmtDate(d: string | Date | null | undefined, pattern = "EEE, d MMM") {
  if (!d) return "—";
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, pattern);
}

export function fmtDateTime(d: string | Date | null | undefined) {
  return fmtDate(d, "d MMM yyyy · HH:mm");
}

export function fmtRange(a: string, b: string) {
  return `${fmtDate(a, "d MMM")} – ${fmtDate(b, "d MMM yyyy")}`;
}

export function nightsBetween(a: string, b: string) {
  if (!a || !b) return 0;
  return Math.max(differenceInCalendarDays(parseISO(b), parseISO(a)), 0);
}

export function isoDate(d: Date) {
  return format(d, "yyyy-MM-dd");
}

export function initials(name?: string | null) {
  if (!name) return "G";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}
