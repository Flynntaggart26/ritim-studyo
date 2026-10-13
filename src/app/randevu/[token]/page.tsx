import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { CancelBookingButton } from "@/components/booking/cancel-booking-button";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { formatDateTr, formatMin, toDateStr, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils";

export const metadata: Metadata = { title: "Randevu Yönetimi" };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function ManageBookingPage({ params }: Props) {
  const { token } = await params;
  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { teacher: { include: { user: true } }, lessonType: true, student: true },
  });

  if (!booking) {
    return (
      <div className="bg-stage mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <Card className="p-10">
          <h1 className="font-display text-2xl font-semibold text-zinc-100">Randevu bulunamadı</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Bu bağlantı geçersiz veya randevu silinmiş olabilir.
          </p>
          <LinkButton href="/randevu" className="mt-6">Yeni Randevu Al</LinkButton>
        </Card>
      </div>
    );
  }

  const isPast = booking.date < toDateStr(new Date());
  const studentName = booking.student?.name ?? booking.guestName ?? "Öğrenci";

  return (
    <div className="bg-stage mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent px-7 py-5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-extrabold text-white">Randevu Detayı</h1>
            <Badge className={STATUS_COLORS[booking.status]}>
              {isPast && booking.status !== "CANCELLED" ? "Tamamlandı" : STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </div>

        <div className="space-y-5 p-7">
          <div className="flex items-center gap-4">
            <TeacherAvatar name={booking.teacher.user.name} photoUrl={booking.teacher.photoUrl} size="md" />
            <div>
              <div className="font-display font-bold text-white">{booking.teacher.user.name}</div>
              <div className="text-sm text-zinc-500">{booking.teacher.title}</div>
            </div>
          </div>

          <div className="grid gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-sm sm:grid-cols-2">
            <Detail label="Öğrenci" value={studentName} />
            <Detail label="Ders" value={booking.lessonType.title} />
            <Detail label="Tarih" value={formatDateTr(booking.date)} />
            <Detail label="Saat" value={`${formatMin(booking.startMin)} – ${formatMin(booking.endMin)}`} />
            {booking.lessonType.materials && (
              <div className="sm:col-span-2">
                <Detail label="Getirilmesi gerekenler" value={booking.lessonType.materials} />
              </div>
            )}
            {booking.notes && (
              <div className="sm:col-span-2">
                <Detail label="Notunuz" value={booking.notes} />
              </div>
            )}
          </div>

          {booking.status === "PENDING" && !isPast && (
            <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-200/90">
              Randevunuz hoca onayı bekliyor. Onaylandığında size bilgi verilecektir.
            </p>
          )}

          {booking.status === "CANCELLED" && (
            <p className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-4 text-sm text-zinc-400">
              Bu randevu iptal edilmiştir.
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-zinc-800 pt-5">
            {!isPast && booking.status !== "CANCELLED" && (
              <CancelBookingButton token={booking.manageToken} />
            )}
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white">
              ← Ana Sayfa
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-0.5 font-medium text-zinc-100">{value}</div>
    </div>
  );
}
