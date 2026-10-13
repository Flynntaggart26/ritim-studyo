import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { BookingTable } from "@/components/booking-table";
import { TeacherWeeklySchedule } from "@/components/teacher-weekly-schedule";
import { getStudioWeekRange, isValidDateStr, parseDate, studioMinutes, toDateStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Ders Programım" };

interface Props {
  searchParams: Promise<{ hafta?: string }>;
}

export default async function TeacherBookingsPage({ searchParams }: Props) {
  const session = await requireRole("TEACHER");
  const user = session.user as { id: string };
  const { hafta } = await searchParams;
  const anchor = hafta && isValidDateStr(hafta) ? parseDate(hafta) : new Date();
  const { start: weekStart, end: weekEnd } = getStudioWeekRange(anchor);
  const today = toDateStr(new Date());
  const currentMinute = studioMinutes();

  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return <p className="text-zinc-400">Hoca profili bulunamadı.</p>;

  const [weekBookings, archive] = await Promise.all([
    prisma.booking.findMany({
      where: {
        date: { gte: weekStart, lte: weekEnd },
        status: { not: "CANCELLED" },
      },
      include: {
        teacher: { include: { user: true } },
        lessonType: true,
        student: true,
      },
      orderBy: [{ date: "asc" }, { startMin: "asc" }],
    }),
    prisma.booking.findMany({
      where: {
        teacherId: profile.id,
        OR: [{ date: { lt: today } }, { status: "CANCELLED" }],
      },
      include: { teacher: { include: { user: true } }, lessonType: true, student: true },
      orderBy: [{ date: "desc" }, { startMin: "desc" }],
    }),
  ]);

  // The shared studio calendar receives no student-identifying fields for other teachers' bookings.
  const scheduleEntries = weekBookings.map((booking) => {
    const isOwn = booking.teacherId === profile.id;
    return {
      id: booking.id,
      teacherId: booking.teacherId,
      teacherName: booking.teacher.user.name,
      lessonTitle: booking.lessonType.title,
      date: booking.date,
      startMin: booking.startMin,
      endMin: booking.endMin,
      status: booking.status,
      isOwn,
      canEdit: booking.date > today || (booking.date === today && booking.startMin > currentMinute),
      ...(isOwn
        ? {
            studentName: booking.student?.name ?? booking.guestName ?? "Misafir",
            studentPhone: booking.student?.phone ?? booking.guestPhone,
            studentEmail: booking.student?.email ?? booking.guestEmail,
            notes: booking.notes,
          }
        : {}),
    };
  });

  return (
    <div className="space-y-9">
      <TeacherWeeklySchedule bookings={scheduleEntries} weekStart={weekStart} today={today} />

      {archive.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-zinc-100">Geçmiş ve iptal edilen dersler</h2>
          <div className="mt-3 opacity-85">
            <BookingTable bookings={archive} context="teacher" readOnly />
          </div>
        </section>
      )}
    </div>
  );
}
