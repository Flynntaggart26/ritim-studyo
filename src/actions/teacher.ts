"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/guards";
import { sendEmail, studentBookingRescheduledEmail, studentBookingStatusEmail } from "@/lib/email";
import { addDaysToDateStr, isValidDateStr, studioMinutes, toDateStr, weekdayFromDateStr } from "@/lib/utils";
import { BOOKING_DAYS_AHEAD, getAvailableSlots, validateSlot } from "@/lib/slots";
import type { ActionResult } from "./booking";

async function getTeacherProfile() {
  const session = await getSession();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "TEACHER") return null;
  return prisma.teacherProfile.findUnique({ where: { userId: user.id } });
}

// --------------------------------------
// Müsaitlik yönetimi
// --------------------------------------
const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMin: z.number().int().min(0).max(1439),
  endMin: z.number().int().min(1).max(1440),
});

export async function addAvailability(raw: unknown): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const parsed = availabilitySchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Geçersiz saat aralığı." };
  const { dayOfWeek, startMin, endMin } = parsed.data;
  if (startMin >= endMin) return { ok: false, error: "Başlangıç saati bitişten önce olmalı." };

  const duplicate = await prisma.availability.findFirst({
    where: { teacherId: profile.id, dayOfWeek, startMin, endMin },
  });
  if (duplicate) return { ok: false, error: "Bu aralık zaten ekli." };

  await prisma.availability.create({
    data: { teacherId: profile.id, dayOfWeek, startMin, endMin },
  });
  revalidatePath("/panel/musaitlik");
  return { ok: true };
}

export async function deleteAvailability(id: string): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const window = await prisma.availability.findFirst({ where: { id, teacherId: profile.id } });
  if (!window) return { ok: true };
  const upcomingBookings = await prisma.booking.findMany({
    where: {
      teacherId: profile.id,
      date: { gte: toDateStr(new Date()) },
      status: { not: "CANCELLED" },
    },
    select: { date: true, startMin: true, endMin: true },
  });
  const hasBooking = upcomingBookings.some((booking) => {
    const dayOfWeek = weekdayFromDateStr(booking.date);
    return dayOfWeek === window.dayOfWeek && window.startMin < booking.endMin && booking.startMin < window.endMin;
  });
  if (hasBooking) {
    return { ok: false, error: "Bu aralıkta yaklaşan randevular var. Önce ilgili randevuları iptal edin." };
  }
  await prisma.availability.deleteMany({ where: { id, teacherId: profile.id } });
  revalidatePath("/panel/musaitlik");
  return { ok: true };
}

// --------------------------------------
// Kapalı (bloklu) günler
// --------------------------------------
export async function addBlockedDate(raw: unknown): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const parsed = z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      reason: z.string().trim().max(120).optional(),
    })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Geçersiz tarih." };
  const { date, reason } = parsed.data;
  if (!isValidDateStr(date)) return { ok: false, error: "Geçersiz tarih." };
  if (date < toDateStr(new Date())) return { ok: false, error: "Geçmiş bir tarih seçilemez." };

  const exists = await prisma.blockedDate.findFirst({
    where: { teacherId: profile.id, date },
  });
  if (exists) return { ok: false, error: "Bu tarih zaten kapalı olarak işaretli." };

  const booking = await prisma.booking.findFirst({
    where: { teacherId: profile.id, date, status: { not: "CANCELLED" } },
  });
  if (booking) return { ok: false, error: "Bu tarihte yaklaşan bir randevunuz var. Önce randevuyu iptal edin." };

  await prisma.blockedDate.create({
    data: { teacherId: profile.id, date, reason: reason || null },
  });
  revalidatePath("/panel/musaitlik");
  return { ok: true };
}

export async function deleteBlockedDate(id: string): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  await prisma.blockedDate.deleteMany({ where: { id, teacherId: profile.id } });
  revalidatePath("/panel/musaitlik");
  return { ok: true };
}

// --------------------------------------
// Ders tipleri yönetimi
// --------------------------------------
const lessonTypeSchema = z.object({
  title: z.string().trim().min(2, "Ders adı en az 2 karakter olmalı.").max(80),
  description: z.string().trim().max(600).optional(),
  durationMin: z.number().int().min(15).max(240),
  materials: z.string().trim().max(300).optional(),
  price: z.number().int().min(0).max(100000).nullable().optional(),
});

export async function createLessonType(raw: unknown): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const parsed = lessonTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz ders bilgisi." };
  }
  await prisma.lessonType.create({
    data: {
      teacherId: profile.id,
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      durationMin: parsed.data.durationMin,
      materials: parsed.data.materials ?? "",
      price: parsed.data.price ?? null,
    },
  });
  revalidatePath("/panel/dersler");
  return { ok: true };
}

export async function updateLessonType(id: string, raw: unknown): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const parsed = lessonTypeSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz ders bilgisi." };
  }
  const result = await prisma.lessonType.updateMany({
    where: { id, teacherId: profile.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description ?? "",
      durationMin: parsed.data.durationMin,
      materials: parsed.data.materials ?? "",
      price: parsed.data.price ?? null,
    },
  });
  if (result.count === 0) return { ok: false, error: "Ders bulunamadı." };
  revalidatePath("/panel/dersler");
  return { ok: true };
}

export async function toggleLessonType(id: string): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const lesson = await prisma.lessonType.findFirst({ where: { id, teacherId: profile.id } });
  if (!lesson) return { ok: false, error: "Ders bulunamadı." };
  await prisma.lessonType.update({ where: { id }, data: { isActive: !lesson.isActive } });
  revalidatePath("/panel/dersler");
  return { ok: true };
}

export async function deleteLessonType(id: string): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const lesson = await prisma.lessonType.findFirst({
    where: { id, teacherId: profile.id },
    include: { _count: { select: { bookings: true } } },
  });
  if (!lesson) return { ok: false, error: "Ders bulunamadı." };
  if (lesson._count.bookings > 0) {
    return { ok: false, error: "Bu derse ait randevular olduğu için silinemez. Pasife alabilirsiniz." };
  }
  await prisma.lessonType.delete({ where: { id } });
  revalidatePath("/panel/dersler");
  return { ok: true };
}

// --------------------------------------
// Randevu onay / iptal (hoca)
// --------------------------------------
export async function setBookingStatusTeacher(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED"
): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId: profile.id, status: { not: "CANCELLED" } },
    include: { lessonType: true, student: true, teacher: { include: { user: true } } },
  });
  if (!booking) return { ok: false, error: "Randevu bulunamadı." };
  const today = toDateStr(new Date());
  if (booking.date < today || (booking.date === today && booking.startMin <= studioMinutes())) {
    return { ok: false, error: "Geçmiş veya başlamış bir randevuyu değiştiremezsiniz." };
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status } });
  revalidatePath("/panel");
  revalidatePath("/panel/randevular");

  const email = booking.student?.email ?? booking.guestEmail;
  if (email) {
    const m = studentBookingStatusEmail({
      teacherName: booking.teacher.user.name,
      lessonTitle: booking.lessonType.title,
      date: booking.date,
      startMin: booking.startMin,
      endMin: booking.endMin,
      studentName: booking.student?.name ?? booking.guestName ?? "Öğrenci",
      studentPhone: booking.student?.phone ?? booking.guestPhone,
      notes: booking.notes,
      manageToken: booking.manageToken,
      status,
    });
    await sendEmail(email, m.subject, m.html);
  }
  return { ok: true };
}

// --------------------------------------
// Hoca randevuyu kendi programında taşıyabilir
// --------------------------------------
const rescheduleSchema = z.object({
  bookingId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMin: z.number().int().min(0).max(1439),
});

function getRescheduleDateError(date: string): string | null {
  if (!isValidDateStr(date)) return "Geçersiz tarih.";
  const today = toDateStr(new Date());
  if (date < today) return "Geçmiş bir tarihe randevu taşınamaz.";
  if (date > addDaysToDateStr(today, BOOKING_DAYS_AHEAD)) {
    return `En fazla ${BOOKING_DAYS_AHEAD} gün sonrasına taşıyabilirsiniz.`;
  }
  return null;
}

export async function fetchRescheduleSlots(
  bookingId: string,
  date: string
): Promise<ActionResult<{ slots: number[]; durationMin: number }>> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };
  if (!bookingId) return { ok: false, error: "Randevu bulunamadı." };

  const dateError = getRescheduleDateError(date);
  if (dateError) return { ok: false, error: dateError };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId: profile.id, status: { not: "CANCELLED" } },
    select: { date: true, startMin: true, endMin: true },
  });
  if (!booking) return { ok: false, error: "Bu randevu size ait değil veya artık etkin değil." };

  const today = toDateStr(new Date());
  if (booking.date < today || (booking.date === today && booking.startMin <= studioMinutes())) {
    return { ok: false, error: "Başlamış veya geçmiş bir dersi taşıyamazsınız." };
  }

  const durationMin = booking.endMin - booking.startMin;
  const availableSlots = await getAvailableSlots({
    teacherId: profile.id,
    date,
    durationMin,
    excludeBookingId: bookingId,
  });
  const slots = availableSlots.filter((slot) => date !== booking.date || slot !== booking.startMin);
  return { ok: true, data: { slots, durationMin } };
}

export async function rescheduleBooking(
  raw: unknown
): Promise<ActionResult> {
  const profile = await getTeacherProfile();
  if (!profile) return { ok: false, error: "Yetkisiz erişim." };

  const parsed = rescheduleSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Yeni tarih ve saati kontrol edin." };
  const { bookingId, date, startMin } = parsed.data;
  const dateError = getRescheduleDateError(date);
  if (dateError) return { ok: false, error: dateError };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, teacherId: profile.id, status: { not: "CANCELLED" } },
    include: { lessonType: true, student: true, teacher: { include: { user: true } } },
  });
  if (!booking) return { ok: false, error: "Bu randevu size ait değil veya artık etkin değil." };
  if (booking.date === date && booking.startMin === startMin) {
    return { ok: false, error: "Lütfen mevcut saatten farklı bir saat seçin." };
  }

  const today = toDateStr(new Date());
  if (booking.date < today || (booking.date === today && booking.startMin <= studioMinutes())) {
    return { ok: false, error: "Başlamış veya geçmiş bir dersi taşıyamazsınız." };
  }

  const durationMin = booking.endMin - booking.startMin;
  const endMin = startMin + durationMin;
  const slotCheck = await validateSlot({
    teacherId: profile.id,
    date,
    startMin,
    durationMin,
    excludeBookingId: booking.id,
  });
  if (!slotCheck.ok) return { ok: false, error: slotCheck.error };

  let updated;
  try {
    updated = await prisma.$transaction(async (tx) => {
      const current = await tx.booking.findFirst({
        where: { id: booking.id, teacherId: profile.id, status: { not: "CANCELLED" } },
      });
      if (!current) throw new Error("BOOKING_NOT_AVAILABLE");
      if (
        current.date !== booking.date ||
        current.startMin !== booking.startMin ||
        current.endMin !== booking.endMin
      ) {
        throw new Error("BOOKING_CHANGED");
      }

      const dayOfWeek = weekdayFromDateStr(date);
      const [window, blocked, conflict] = await Promise.all([
        tx.availability.findFirst({
          where: {
            teacherId: profile.id,
            dayOfWeek,
            startMin: { lte: startMin },
            endMin: { gte: endMin },
          },
        }),
        tx.blockedDate.findFirst({ where: { teacherId: profile.id, date } }),
        tx.booking.findFirst({
          where: {
            date,
            status: { not: "CANCELLED" },
            id: { not: booking.id },
            startMin: { lt: endMin },
            endMin: { gt: startMin },
          },
        }),
      ]);
      if (!window || blocked) throw new Error("TEACHER_UNAVAILABLE");
      if (conflict) throw new Error("ROOM_CONFLICT");

      return tx.booking.update({
        where: { id: booking.id },
        data: { date, startMin, endMin },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "BOOKING_NOT_AVAILABLE") {
        return { ok: false, error: "Randevu iptal edilmiş veya artık taşınamıyor." };
      }
      if (error.message === "BOOKING_CHANGED") {
        return { ok: false, error: "Randevu başka bir işlemde değişti. Sayfayı yenileyip tekrar deneyin." };
      }
      if (error.message === "TEACHER_UNAVAILABLE") {
        return { ok: false, error: "Bu saat sizin müsaitlik programınızda değil." };
      }
      if (error.message === "ROOM_CONFLICT" || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034")) {
        return { ok: false, error: "Bu saatte başka bir ders var. Lütfen başka saat seçin." };
      }
    }
    throw error;
  }

  const studentEmail = booking.student?.email ?? booking.guestEmail;
  if (studentEmail) {
    const mail = studentBookingRescheduledEmail({
      teacherName: booking.teacher.user.name,
      lessonTitle: booking.lessonType.title,
      date: updated.date,
      startMin: updated.startMin,
      endMin: updated.endMin,
      studentName: booking.student?.name ?? booking.guestName ?? "Öğrenci",
      studentPhone: booking.student?.phone ?? booking.guestPhone,
      notes: booking.notes,
      manageToken: booking.manageToken,
      previousDate: booking.date,
      previousStartMin: booking.startMin,
      previousEndMin: booking.endMin,
    });
    await sendEmail(studentEmail, mail.subject, mail.html);
  }

  revalidatePath("/panel");
  revalidatePath("/panel/randevular");
  revalidatePath(`/randevu/${booking.manageToken}`);
  return { ok: true };
}
