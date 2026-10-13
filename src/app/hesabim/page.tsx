import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { formatDateTr, formatMin, toDateStr, STATUS_LABELS, STATUS_COLORS, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Hesabım" };

export default async function AccountPage() {
  const session = await requireRole("STUDENT");
  const user = session.user as { id: string; name?: string; email?: string; phone?: string };

  const bookings = await prisma.booking.findMany({
    where: { studentId: user.id },
    include: { teacher: { include: { user: true } }, lessonType: true },
    orderBy: [{ date: "desc" }, { startMin: "desc" }],
  });

  const today = toDateStr(new Date());
  const upcoming = bookings.filter((b) => b.date >= today && b.status !== "CANCELLED");
  const past = bookings.filter((b) => !(b.date >= today && b.status !== "CANCELLED"));

  return (
    <div className="bg-stage mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
            Öğrenci Hesabı
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
            Merhaba, {user.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {user.email} {user.phone ? `• ${user.phone}` : ""}
          </p>
        </div>
        <LinkButton href="/randevu">+ Yeni Randevu</LinkButton>
      </div>

      <h2 className="font-display mt-10 text-xl font-bold text-white">Yaklaşan Dersler</h2>
      {upcoming.length === 0 ? (
        <Card className="mt-4 p-8 text-center">
          <p className="text-zinc-400">Yaklaşan dersiniz bulunmuyor.</p>
          <LinkButton href="/randevu" variant="outline" size="sm" className="mt-4">
            Hemen Randevu Al
          </LinkButton>
        </Card>
      ) : (
        <div className="mt-4 space-y-3">
          {upcoming.map((b) => (
            <BookingRow key={b.id} booking={b} />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display mt-10 text-xl font-bold text-white">Geçmiş & İptal Edilen</h2>
          <div className="mt-4 space-y-3 opacity-75">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

type BookingRowProps = {
  booking: {
    id: string;
    date: string;
    startMin: number;
    endMin: number;
    status: string;
    manageToken: string;
    teacher: { user: { name: string }; photoUrl: string | null };
    lessonType: { title: string };
  };
};

function BookingRow({ booking: b }: BookingRowProps) {
  const isPast = b.date < toDateStr(new Date());
  return (
    <Link href={`/randevu/${b.manageToken}`} className="block">
      <Card className="flex flex-wrap items-center gap-4 p-5 transition-all hover:border-amber-500/40">
        <TeacherAvatar name={b.teacher.user.name} photoUrl={b.teacher.photoUrl} size="md" />
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-white">{b.lessonType.title}</div>
          <div className="text-sm text-zinc-500">{b.teacher.user.name}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-zinc-200">{formatDateTr(b.date)}</div>
          <div className="text-sm text-amber-400">
            {formatMin(b.startMin)} – {formatMin(b.endMin)}
          </div>
        </div>
        <Badge className={cn(STATUS_COLORS[b.status])}>
          {isPast && b.status !== "CANCELLED" ? "Tamamlandı" : STATUS_LABELS[b.status]}
        </Badge>
        <span className="text-zinc-600 transition-transform group-hover:translate-x-1">→</span>
      </Card>
    </Link>
  );
}
