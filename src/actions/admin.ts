"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/guards";
import { authInternal } from "@/lib/auth-internal";
import { sendEmail, studentBookingStatusEmail } from "@/lib/email";
import type { ActionResult } from "./booking";

async function requireAdmin() {
  const session = await getSession();
  const user = session?.user as { id: string; role?: string } | undefined;
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

// --------------------------------------
// Hoca oluşturma
// --------------------------------------
const createTeacherSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı.").max(80),
  email: z.string().trim().email("Geçerli bir e-posta girin.").max(120),
  password: z.string().min(8, "Şifre en az 8 karakter olmalı.").max(72),
  phone: z.string().trim().max(24).optional(),
  title: z.string().trim().max(80).optional(),
  specialties: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(1200).optional(),
});

export async function createTeacher(raw: unknown): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz erişim." };

  const parsed = createTeacherSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz bilgi." };
  }
  const input = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return { ok: false, error: "Bu e-posta adresi zaten kayıtlı." };

  const result = (await authInternal.api.signUpEmail({
    body: { name: input.name, email: input.email, password: input.password },
  })) as { user: { id: string } };

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "TEACHER", phone: input.phone || null },
  });
  await prisma.teacherProfile.create({
    data: {
      userId: result.user.id,
      title: input.title || "Bateri Eğitmeni",
      specialties: input.specialties ?? "",
      bio: input.bio ?? "",
    },
  });

  revalidatePath("/admin/hocalar");
  revalidatePath("/hocalar");
  return { ok: true };
}

// --------------------------------------
// Hoca profil güncelleme / aktif-pasif
// --------------------------------------
export async function updateTeacherProfile(
  profileId: string,
  raw: unknown
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz erişim." };
  const parsed = z
    .object({
      title: z.string().trim().max(80).optional(),
      specialties: z.string().trim().max(160).optional(),
      bio: z.string().trim().max(1200).optional(),
      photoUrl: z.string().trim().max(400).optional(),
    })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Geçersiz bilgi." };

  await prisma.teacherProfile.update({
    where: { id: profileId },
    data: {
      title: parsed.data.title || "Bateri Eğitmeni",
      specialties: parsed.data.specialties ?? "",
      bio: parsed.data.bio ?? "",
      photoUrl: parsed.data.photoUrl || null,
    },
  });
  revalidatePath("/admin/hocalar");
  revalidatePath("/hocalar");
  return { ok: true };
}

export async function toggleTeacherActive(profileId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz erişim." };
  const profile = await prisma.teacherProfile.findUnique({ where: { id: profileId } });
  if (!profile) return { ok: false, error: "Hoca bulunamadı." };
  await prisma.teacherProfile.update({
    where: { id: profileId },
    data: { isActive: !profile.isActive },
  });
  revalidatePath("/admin/hocalar");
  revalidatePath("/hocalar");
  return { ok: true };
}

// --------------------------------------
// Randevu onay / iptal (admin)
// --------------------------------------
export async function setBookingStatusAdmin(
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED"
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "Yetkisiz erişim." };
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { lessonType: true, student: true, teacher: { include: { user: true } } },
  });
  if (!booking) return { ok: false, error: "Randevu bulunamadı." };

  await prisma.booking.update({ where: { id: booking.id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/admin/randevular");

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
