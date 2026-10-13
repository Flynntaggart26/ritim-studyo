import { prisma } from "./prisma";
import {
  addDaysToDateStr,
  isValidDateStr,
  parseDate,
  studioMinutes,
  toDateStr,
  weekdayFromDateStr,
} from "./utils";
import { getAvailableStartMinutes } from "./schedule";

/** Slot'ların üretileceği adım aralığı (dakika) */
export const SLOT_STEP = 30;

/** En fazla kaç gün sonrasına randevu alınabilir */
export const BOOKING_DAYS_AHEAD = 14;

/** Randevu saati seçenekleri için geçerli gün listesi */
export function getBookableDates(): string[] {
  const dates: string[] = [];
  const today = toDateStr(new Date());
  for (let i = 0; i < BOOKING_DAYS_AHEAD; i++) {
    dates.push(addDaysToDateStr(today, i));
  }
  return dates;
}

/**
 * Belirli bir hoca, tarih ve ders süresi için müsait başlangıç saatlerini
 * (dakika cinsinden) döndürür.
 *
 * ÖNEMLİ: Stüdyoda tek oda olduğundan, TÜM hocaların randevuları
 * çakışma kontrolüne dahil edilir.
 */
export async function getAvailableSlots(params: {
  teacherId: string;
  date: string;
  durationMin: number;
  excludeBookingId?: string;
}): Promise<number[]> {
  const { teacherId, date, durationMin, excludeBookingId } = params;
  if (!isValidDateStr(date)) return [];
  const dayDate = parseDate(date);
  if (Number.isNaN(dayDate.getTime())) return [];
  const dayOfWeek = weekdayFromDateStr(date);

  const [windows, dayBookings, blocked] = await Promise.all([
    prisma.availability.findMany({ where: { teacherId, dayOfWeek } }),
    // Tek oda: hangi hocaya olursa olsun o günkü tüm aktif randevular odayı kapatır
    prisma.booking.findMany({
      where: { date, status: { not: "CANCELLED" } },
      select: { id: true, startMin: true, endMin: true, status: true },
    }),
    prisma.blockedDate.findMany({ where: { teacherId, date } }),
  ]);

  if (blocked.length > 0 || windows.length === 0) return [];

  const now = new Date();
  const nowMin = date === toDateStr(now) ? studioMinutes(now) : undefined;
  return getAvailableStartMinutes({
    windows,
    bookings: dayBookings,
    durationMin,
    stepMin: SLOT_STEP,
    nowMin,
    excludeBookingId,
  });
}

/**
 * Randevu oluşturulmadan önce son doğrulama:
 * hoca müsait mi, gün bloklu mu, oda boş mu?
 */
export async function validateSlot(params: {
  teacherId: string;
  date: string;
  startMin: number;
  durationMin: number;
  excludeBookingId?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const { teacherId, date, startMin, durationMin, excludeBookingId } = params;
  const endMin = startMin + durationMin;

  // Geçmişe randevu alınamaz
  if (!isValidDateStr(date)) return { ok: false, error: "Geçersiz tarih." };
  const dayDate = parseDate(date);
  if (Number.isNaN(dayDate.getTime())) return { ok: false, error: "Geçersiz tarih." };
  const now = new Date();
  if (date < toDateStr(now)) return { ok: false, error: "Geçmiş bir tarihe randevu alınamaz." };
  if (date === toDateStr(now) && startMin <= studioMinutes(now)) {
    return { ok: false, error: "Geçmiş bir saate randevu alınamaz." };
  }

  // Randevu ufku
  const maxDate = addDaysToDateStr(toDateStr(now), BOOKING_DAYS_AHEAD);
  if (date > maxDate) {
    return { ok: false, error: `En fazla ${BOOKING_DAYS_AHEAD} gün sonrasına randevu alınabilir.` };
  }

  // Hoca o gün bloklu mu?
  const blocked = await prisma.blockedDate.findFirst({ where: { teacherId, date } });
  if (blocked) return { ok: false, error: "Hoca bu tarihte ders veremiyor." };

  // Hocanın müsaitlik aralığı kapsıyor mu?
  const dayOfWeek = weekdayFromDateStr(date);
  const window = await prisma.availability.findFirst({
    where: { teacherId, dayOfWeek, startMin: { lte: startMin }, endMin: { gte: endMin } },
  });
  if (!window) return { ok: false, error: "Seçilen saat hocanın müsait olduğu aralıkta değil." };

  // Tek oda: herhangi bir hocanın randevusuyla çakışma var mı?
  const conflict = await prisma.booking.findFirst({
    where: {
      date,
      status: { not: "CANCELLED" },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      startMin: { lt: endMin },
      endMin: { gt: startMin },
    },
  });
  if (conflict) return { ok: false, error: "Bu saat az önce başkası tarafından alındı. Lütfen başka bir saat seçin." };

  return { ok: true };
}
