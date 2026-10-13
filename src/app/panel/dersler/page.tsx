import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { LessonTypesManager } from "@/components/lesson-types-manager";

export const metadata: Metadata = { title: "Ders Tiplerim" };

export default async function TeacherLessonTypesPage() {
  const session = await requireRole("TEACHER");
  const user = session.user as { id: string };
  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return <p className="text-zinc-400">Hoca profili bulunamadı.</p>;

  const lessons = await prisma.lessonType.findMany({
    where: { teacherId: profile.id },
    include: { _count: { select: { bookings: true } } },
    orderBy: { durationMin: "asc" },
  });
  return <LessonTypesManager lessons={lessons} />;
}
