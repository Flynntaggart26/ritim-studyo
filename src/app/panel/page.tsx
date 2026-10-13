import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { BookingTable } from "@/components/booking-table";
import { getStudioWeekRange, toDateStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Hoca Paneli" };

export default async function TeacherDashboardPage() {
  const session = await requireRole("TEACHER");
  const user = session.user as { id: string; name: string };
  const profile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
  if (!profile) return <Card className="p-6">Hoca profili bulunamadı. Lütfen stüdyo yöneticisiyle iletişime geçin.</Card>;

  const today = toDateStr(new Date());
  const { start: weekStart, end: weekEnd } = getStudioWeekRange();

  const [pendingCount, todayCount, weekCount, totalCount, bookings] = await Promise.all([
    prisma.booking.count({ where: { teacherId: profile.id, status: "PENDING", date: { gte: today } } }),
    prisma.booking.count({ where: { teacherId: profile.id, date: today, status: { not: "CANCELLED" } } }),
    prisma.booking.count({ where: { teacherId: profile.id, date: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } } }),
    prisma.booking.count({ where: { teacherId: profile.id } }),
    prisma.booking.findMany({
      where: { teacherId: profile.id, date: { gte: today }, status: { not: "CANCELLED" } },
      include: { teacher: { include: { user: true } }, lessonType: true, student: true },
      orderBy: [{ date: "asc" }, { startMin: "asc" }],
      take: 6,
    }),
  ]);

  const stats = [
    { label: "Onay bekleyen", value: pendingCount },
    { label: "Bugünkü dersler", value: todayCount },
    { label: "Bu haftaki dersler", value: weekCount },
    { label: "Toplam randevu", value: totalCount },
  ];

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-zinc-500">{s.label}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#8da091]" aria-hidden="true" />
            </div>
            <div className="font-display mt-3 text-3xl font-semibold text-[#52685b]">{s.value}</div>
          </Card>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="mt-7 flex items-center gap-3 rounded-2xl border border-[#e0d3bd] bg-[#f4ecde] p-4">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#657d6c]" aria-hidden="true" />
          <div>
            <div className="font-semibold text-zinc-200">{pendingCount} randevu onayınızı bekliyor</div>
            <div className="text-sm text-zinc-500">Randevular bölümünden talebi onaylayabilir veya iptal edebilirsiniz.</div>
          </div>
          <Badge className="ml-auto border-[#d9c9ae] bg-[#fbf6ec] text-[#52685b]">Yeni</Badge>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-white">Yaklaşan Randevular</h2>
      </div>
      <div className="mt-4">
        <BookingTable bookings={bookings} context="teacher" />
      </div>
    </div>
  );
}
