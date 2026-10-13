import Link from "next/link";
import { Card, Badge } from "@/components/ui/card";
import { BookingActions } from "@/components/booking-actions";
import { RescheduleBookingButton } from "@/components/reschedule-booking-button";
import { addDaysToDateStr, formatDateTr, formatMin, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";

export interface TeacherScheduleEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  lessonTitle: string;
  date: string;
  startMin: number;
  endMin: number;
  status: string;
  isOwn: boolean;
  canEdit: boolean;
  studentName?: string | null;
  studentPhone?: string | null;
  studentEmail?: string | null;
  notes?: string | null;
}

export function TeacherWeeklySchedule({
  bookings,
  weekStart,
  today,
}: {
  bookings: TeacherScheduleEntry[];
  weekStart: string;
  today: string;
}) {
  const days = Array.from({ length: 7 }, (_, index) => addDaysToDateStr(weekStart, index));
  const weekEnd = days[6];
  const previousWeek = addDaysToDateStr(weekStart, -7);
  const nextWeek = addDaysToDateStr(weekStart, 7);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Stüdyo programı</p>
          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.03em] text-zinc-100">Ders programım</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Kendi derslerinizin öğrenci bilgileri görünür; diğer hocaların saatleri yalnızca dolu olarak gösterilir.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WeekLink href={`/panel/randevular?hafta=${previousWeek}`} label="Önceki hafta" direction="previous" />
          <span className="min-w-44 text-center text-xs font-medium text-zinc-500 sm:text-sm">
            {formatDateTr(weekStart, { withYear: true })} – {formatDateTr(weekEnd, { withYear: true })}
          </span>
          <WeekLink href={`/panel/randevular?hafta=${nextWeek}`} label="Sonraki hafta" direction="next" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {days.map((date) => {
          const dayBookings = bookings
            .filter((booking) => booking.date === date)
            .sort((a, b) => a.startMin - b.startMin);
          const isToday = date === today;

          return (
            <Card key={date} className={`rounded-[1.15rem] border p-4 ${isToday ? "border-[#c4b18f] bg-[#f8f0e2]" : "border-[#e5dac8] bg-[#faf4e8]"}`}>
              <div className="flex items-start justify-between gap-3 border-b border-[#e5dac8] pb-3">
                <div>
                  <h3 className="font-display text-sm font-semibold text-zinc-200">{formatDateTr(date, { withYear: true })}</h3>
                  {isToday && <p className="mt-0.5 text-[11px] font-semibold text-[#8f7250]">Bugün</p>}
                </div>
                <span className="rounded-full bg-[#eee5d5] px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                  {dayBookings.length} ders
                </span>
              </div>

              {dayBookings.length === 0 ? (
                <p className="py-5 text-center text-xs text-zinc-500">Bu gün için kayıtlı ders yok.</p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {dayBookings.map((booking) => (
                    booking.isOwn ? (
                      <div key={booking.id} className="rounded-xl border border-[#d5dece] bg-[#f2f3e9] p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-display text-sm font-semibold text-zinc-200">{formatMin(booking.startMin)} – {formatMin(booking.endMin)}</div>
                            <div className="mt-0.5 text-xs text-zinc-500">{booking.lessonTitle}</div>
                          </div>
                          <Badge className={STATUS_COLORS[booking.status]}>{STATUS_LABELS[booking.status]}</Badge>
                        </div>
                        <div className="mt-3 border-t border-[#dce2d7] pt-3">
                          <div className="text-sm font-semibold text-zinc-200">{booking.studentName ?? "Misafir"}</div>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                            {booking.studentPhone && <a href={`tel:${booking.studentPhone.replace(/[^+\d]/g, "")}`} className="hover:text-[#52685b]">{booking.studentPhone}</a>}
                            {booking.studentEmail && <a href={`mailto:${booking.studentEmail}`} className="break-all hover:text-[#52685b]">{booking.studentEmail}</a>}
                          </div>
                          {booking.notes && <p className="mt-2 text-xs text-zinc-500">Not: {booking.notes}</p>}
                        </div>
                        {booking.canEdit && (
                          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#dce2d7] pt-3">
                            <BookingActions bookingId={booking.id} status={booking.status} context="teacher" />
                            <RescheduleBookingButton
                              bookingId={booking.id}
                              currentDate={booking.date}
                              currentStartMin={booking.startMin}
                              today={today}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div key={booking.id} className="flex items-start justify-between gap-3 rounded-xl border border-[#e6dac7] bg-[#f7f0e4] px-3.5 py-3">
                        <div>
                          <div className="font-display text-sm font-semibold text-zinc-200">{formatMin(booking.startMin)} – {formatMin(booking.endMin)}</div>
                          <div className="mt-0.5 text-xs text-zinc-500">{booking.lessonTitle}</div>
                          <div className="mt-1 text-xs font-medium text-[#8a765b]">{booking.teacherName}</div>
                        </div>
                        <Badge className="border-[#dfd2bc] bg-[#f1e8d8] text-[#806b4f]">Dolu</Badge>
                      </div>
                    )
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function WeekLink({ href, label, direction }: { href: string; label: string; direction: "previous" | "next" }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e1d4bf] bg-[#faf4e8] text-zinc-500 transition-colors hover:border-[#c8b391] hover:bg-[#f3eadb] hover:text-zinc-200"
    >
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {direction === "previous" ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
      </svg>
    </Link>
  );
}
