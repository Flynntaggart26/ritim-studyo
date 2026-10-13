import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { BookingTable } from "@/components/booking-table";
import { LinkButton } from "@/components/ui/button";
import { getStudioWeekRange, toDateStr } from "@/lib/utils";

export const metadata: Metadata = { title: "Yönetim Paneli" };

export default async function AdminDashboardPage() {
  const today = toDateStr(new Date());
  const { start: weekStart, end: weekEnd } = getStudioWeekRange();

  const [teacherCount, studentCount, weekCount, pendingCount, bookings] = await Promise.all([
    prisma.teacherProfile.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count({ where: { date: { gte: weekStart, lte: weekEnd }, status: { not: "CANCELLED" } } }),
    prisma.booking.count({ where: { date: { gte: today }, status: "PENDING" } }),
    prisma.booking.findMany({
      include: { teacher: { include: { user: true } }, lessonType: true, student: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const stats = [
    { label: "Aktif hoca", value: teacherCount },
    { label: "Öğrenci hesabı", value: studentCount },
    { label: "Bu haftaki dersler", value: weekCount },
    { label: "Onay bekleyen", value: pendingCount },
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

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-white">Son Randevu Hareketleri</h2>
        <div className="flex gap-2">
          <LinkButton href="/admin/hocalar" variant="outline" size="sm">Hocaları Yönet</LinkButton>
          <LinkButton href="/admin/randevular" size="sm">Tüm Randevular →</LinkButton>
        </div>
      </div>
      <div className="mt-4">
        <BookingTable bookings={bookings} context="admin" showTeacher />
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
        <h3 className="font-display font-bold text-white">Site içeriği</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Stüdyo adı, adres, telefon ve galeri görselleri <code className="text-amber-400">src/lib/site.ts</code> dosyasından düzenlenir.
        </p>
        <Link href="/#konum" className="mt-3 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300">Herkese açık siteyi görüntüle →</Link>
      </div>
    </div>
  );
}
