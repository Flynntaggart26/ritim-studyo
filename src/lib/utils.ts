export const STUDIO_TIME_ZONE = "Europe/Istanbul";

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Dakikayı "14:30" formatına çevirir */
export function formatMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Verilen anı stüdyo saat dilimindeki "YYYY-MM-DD" tarihine çevirir. */
export function toDateStr(d: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: STUDIO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

/** Dakika cinsinden stüdyo yerel saati (00:00–23:59). */
export function studioMinutes(d: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: STUDIO_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Number(values.hour) * 60 + Number(values.minute);
}

/** Tarihe saat diliminden bağımsız şekilde gün ekler. */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

/** Tarih stringinin haftanın hangi gününe geldiğini verir (0=Pazar). */
export function weekdayFromDateStr(dateStr: string): number {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getStudioWeekRange(now: Date = new Date()) {
  const today = toDateStr(now);
  const weekday = weekdayFromDateStr(today);
  const monday = addDaysToDateStr(today, -((weekday + 6) % 7));
  return { start: monday, end: addDaysToDateStr(monday, 6) };
}

/** "YYYY-MM-DD" → UTC öğle vakti Date (takvim tarihi kaymasın diye). */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12));
}

export function isValidDateStr(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** "2026-10-13" → "13 Ekim Salı" (Türkçe uzun tarih) */
export function formatDateTr(dateStr: string, opts?: { withYear?: boolean }): string {
  const d = parseDate(dateStr);
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    weekday: "long",
    ...(opts?.withYear ? { year: "numeric" } : {}),
  }).format(d);
}

export const DAY_NAMES = [
  "Pazar",
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
] as const;

export const DAY_NAMES_SHORT = [
  "Paz",
  "Pzt",
  "Sal",
  "Çar",
  "Per",
  "Cum",
  "Cmt",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Onay Bekliyor",
  CONFIRMED: "Onaylandı",
  CANCELLED: "İptal Edildi",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CONFIRMED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function formatPrice(price: number | null | undefined): string | null {
  if (price == null) return null;
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

/** Telefon numarasını görüntülemek için hafif format */
export function displayPhone(phone: string | null | undefined): string {
  return phone ?? "—";
}
