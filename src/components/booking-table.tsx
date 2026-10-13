import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { BookingActions } from "@/components/booking-actions";
import { formatDateTr, formatMin, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export type BookingWithRelations = Prisma.BookingGetPayload<{
  include: {
    teacher: { include: { user: true } };
    lessonType: true;
    student: true;
  };
}>;

export function BookingTable({
  bookings,
  context,
  showTeacher = false,
  readOnly = false,
}: {
  bookings: BookingWithRelations[];
  context: "teacher" | "admin";
  showTeacher?: boolean;
  readOnly?: boolean;
}) {
  if (bookings.length === 0) {
    return <Card className="p-8 text-center text-sm text-zinc-500">Gösterilecek randevu bulunmuyor.</Card>;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => {
        const studentName = b.student?.name ?? b.guestName ?? "Misafir";
        const phone = b.student?.phone ?? b.guestPhone;
        const email = b.student?.email ?? b.guestEmail;
        return (
          <Card key={b.id} className="p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="min-w-[135px]">
                <div className="font-semibold text-white">{formatDateTr(b.date)}</div>
                <div className="mt-0.5 text-sm font-semibold text-amber-400">
                  {formatMin(b.startMin)} – {formatMin(b.endMin)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-zinc-100">{b.lessonType.title}</div>
                <div className="mt-0.5 text-sm text-zinc-400">
                  {studentName}{phone ? ` · ${phone}` : ""}
                </div>
                {email && <div className="text-xs text-zinc-500">{email}</div>}
                {b.notes && <div className="mt-1 text-xs text-zinc-500">Not: {b.notes}</div>}
              </div>
              {showTeacher && (
                <div className="text-sm text-zinc-400">{b.teacher.user.name}</div>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Badge className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</Badge>
                {!readOnly && <BookingActions bookingId={b.id} status={b.status} context={context} />}
                <Link
                  href={`/randevu/${b.manageToken}`}
                  className="text-xs font-medium text-zinc-500 hover:text-amber-400"
                  target="_blank"
                >
                  Detay ↗
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
