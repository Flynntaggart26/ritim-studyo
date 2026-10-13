import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { BookingTable } from "@/components/booking-table";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Tüm Randevular" };

interface Props {
  searchParams: Promise<{ hoca?: string; durum?: string }>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const params = await searchParams;
  const status = ["PENDING", "CONFIRMED", "CANCELLED"].includes(params.durum ?? "") ? params.durum : undefined;
  const teacherId = params.hoca || undefined;
  const [teachers, bookings] = await Promise.all([
    prisma.teacherProfile.findMany({ include: { user: true }, orderBy: { createdAt: "asc" } }),
    prisma.booking.findMany({
      where: { ...(status ? { status } : {}), ...(teacherId ? { teacherId } : {}) },
      include: { teacher: { include: { user: true } }, lessonType: true, student: true },
      orderBy: [{ date: "desc" }, { startMin: "desc" }],
    }),
  ]);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-white">Tüm Randevular</h2>
      <p className="mt-1 text-sm text-zinc-500">Stüdyodaki tüm randevuları filtreleyin ve yönetin.</p>
      <Card className="mt-4 p-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="filter-teacher" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Hoca</label>
            <select id="filter-teacher" name="hoca" defaultValue={teacherId ?? ""} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100">
              <option value="">Tüm hocalar</option>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Durum</label>
            <select id="filter-status" name="durum" defaultValue={status ?? ""} className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-zinc-100">
              <option value="">Tüm durumlar</option>
              <option value="PENDING">Onay bekleyen</option>
              <option value="CONFIRMED">Onaylanan</option>
              <option value="CANCELLED">İptal edilen</option>
            </select>
          </div>
          <Button type="submit">Filtrele</Button>
          {(teacherId || status) && <a href="/admin/randevular" className="pb-2 text-sm text-zinc-500 hover:text-white">Filtreyi Temizle</a>}
        </form>
      </Card>
      <p className="mt-4 text-xs text-zinc-500">{bookings.length} randevu</p>
      <div className="mt-3"><BookingTable bookings={bookings} context="admin" showTeacher /></div>
    </div>
  );
}
