"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, validateSlot } from "@/lib/slots";
import { getSession } from "@/lib/guards";
import {
  sendEmail,
  teacherNewBookingEmail,
  studentBookingCreatedEmail,
  teacherBookingCancelledEmail,
} from "@/lib/email";

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | { ok: false; error: string };

// --------------------------------------
// Müsait saatleri getir (randevu sihirbazı)
// --------------------------------------
export async function fetchSlots(input: {
  teacherId: string;
  date: string;
  lessonTypeId: string;
}): Promise<{ ok: boolean; slots: number[] }> {
  try {
    const lesson = await prisma.lessonType.findUnique({
      where: { id: input.lessonTypeId },
      select: { durationMin: true, teacherId: true, isActive: true },
    });
    if (!lesson || !lesson.isActive || lesson.teacherId !== input.teacherId) {
      return { ok: false, slots: [] };
    }
    const slots = await getAvailableSlots({
      teacherId: input.teacherId,
      date: input.date,
      durationMin: lesson.durationMin,
    });
    return { ok: true, slots };
  } catch {
    return { ok: false, slots: [] };
  }
}

// --------------------------------------
// Randevu oluştur (misafir veya üye)
// --------------------------------------
const createSchema = z.object({
  teacherId: z.string().min(1),
  lessonTypeId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMin: z.number().int().min(0).max(1410),
  guestName: z.string().trim().max(80).optional(),
  guestPhone: z.string().trim().max(24).optional(),
  guestEmail: z.string().trim().email().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional(),
});

export async function createBooking(raw: unknown): Promise<ActionResult<{ token: string }>> {
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Form bilgileri geçersiz. Lütfen kontrol edin." };
  const input = parsed.data;

  const session = await getSession();
  const user = session?.user as { id: string; role?: string; name?: string; email?: string } | undefined;

  const lesson = await prisma.lessonType.findUnique({
    where: { id: input.lessonTypeId },
    include: { teacher: { include: { user: true } } },
  });
  if (!lesson || !lesson.isActive || lesson.teacherId !== input.teacherId) {
    return { ok: false, error: "Ders seçimi geçersiz." };
  }
  if (!lesson.teacher.isActive) {
    return { ok: false, error: "Bu hoca şu anda randevu kabul etmiyor." };
  }

  let studentId: string | null = null;
  let guestName: string | null = null;
  let guestPhone: string | null = null;
  let guestEmail: string | null = null;

  if (user && user.role === "STUDENT") {
    studentId = user.id;
  } else {
    if (!input.guestName || input.guestName.trim().length < 2) {
      return { ok: false, error: "Lütfen adınızı ve soyadınızı girin." };
    }
    const digits = (input.guestPhone ?? "").replace(/\D/g, "");
    if (digits.length < 10) {
      return { ok: false, error: "Lütfen geçerli bir telefon numarası girin (örn. 0532 000 00 00)." };
    }
    guestName = input.guestName.trim();
    guestPhone = input.guestPhone?.trim() ?? null;
    guestEmail = input.guestEmail?.trim() || null;

    // E-posta kayıtlı bir üyeye aitse randevuyu o hesaba bağla
    if (guestEmail) {
      const existing = await prisma.user.findUnique({ where: { email: guestEmail } });
      if (existing) studentId = existing.id;
    }
  }

  const durationMin = lesson.durationMin;
  const endMin = input.startMin + durationMin;

  const check = await validateSlot({
    teacherId: input.teacherId,
    date: input.date,
    startMin: input.startMin,
    durationMin,
  });
  if (!check.ok) return { ok: false, error: check.error };

  // Çakışmayı son kez işlem içinde kontrol et (tek oda kuralı)
  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      const conflict = await tx.booking.findFirst({
        where: {
          date: input.date,
          status: { not: "CANCELLED" },
          startMin: { lt: endMin },
          endMin: { gt: input.startMin },
        },
      });
      if (conflict) throw new Error("CONFLICT");
      return tx.booking.create({
        data: {
          teacherId: input.teacherId,
          lessonTypeId: input.lessonTypeId,
          studentId,
          guestName,
          guestPhone,
          guestEmail,
          date: input.date,
          startMin: input.startMin,
          endMin,
          notes: input.notes?.trim() || null,
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (e) {
    if (e instanceof Error && e.message === "CONFLICT") {
      return { ok: false, error: "Bu saat az önce başkası tarafından alındı. Lütfen başka bir saat seçin." };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2034") {
      return { ok: false, error: "Bu saat az önce başkası tarafından alındı. Lütfen başka bir saat seçin." };
    }
    throw e;
  }

  // Bildirimler
  const studentUser = studentId
    ? await prisma.user.findUnique({ where: { id: studentId } })
    : null;
  const mailData = {
    teacherName: lesson.teacher.user.name,
    lessonTitle: lesson.title,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
    studentName: studentUser?.name ?? guestName ?? "Öğrenci",
    studentPhone: studentUser?.phone ?? guestPhone,
    notes: booking.notes,
    manageToken: booking.manageToken,
  };

  // Hocaya yeni randevu bildirimi
  const teacherMail = teacherNewBookingEmail(mailData);
  await sendEmail(lesson.teacher.user.email, teacherMail.subject, teacherMail.html);

  // Öğrenciye/misafire onay e-postası (e-posta varsa)
  const studentEmail = studentUser?.email ?? guestEmail;
  if (studentEmail) {
    const m = studentBookingCreatedEmail({ ...mailData, to: studentEmail });
    await sendEmail(studentEmail, m.subject, m.html);
  }

  return { ok: true, data: { token: booking.manageToken } };
}

// --------------------------------------
// Misafir randevu iptali (yönetim bağlantısı ile)
// --------------------------------------
export async function cancelBookingByToken(token: string): Promise<ActionResult> {
  if (!token) return { ok: false, error: "Geçersiz bağlantı." };
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { teacher: { include: { user: true } }, lessonType: true, student: true },
  });
  if (!booking) return { ok: false, error: "Randevu bulunamadı." };
  if (booking.status === "CANCELLED") return { ok: true };

  await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });

  const mailData = {
    teacherName: booking.teacher.user.name,
    lessonTitle: booking.lessonType.title,
    date: booking.date,
    startMin: booking.startMin,
    endMin: booking.endMin,
    studentName: booking.student?.name ?? booking.guestName ?? "Öğrenci",
    studentPhone: booking.student?.phone ?? booking.guestPhone,
    notes: booking.notes,
    manageToken: booking.manageToken,
  };
  const m = teacherBookingCancelledEmail(mailData);
  await sendEmail(booking.teacher.user.email, m.subject, m.html);

  return { ok: true };
}
