import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/guards";
import { getBookableDates } from "@/lib/slots";
import { parseDate, weekdayFromDateStr } from "@/lib/utils";
import { BookingWizard, type WizardTeacher, type WizardDate } from "@/components/booking/booking-wizard";

export const metadata: Metadata = { title: "Randevu Al" };

interface Props {
  searchParams: Promise<{ hoca?: string; ders?: string }>;
}

export default async function BookingPage({ searchParams }: Props) {
  const { hoca, ders } = await searchParams;

  const [teachers, session] = await Promise.all([
    prisma.teacherProfile.findMany({
      where: { isActive: true },
      include: {
        user: true,
        lessonTypes: { where: { isActive: true }, orderBy: { durationMin: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    getSession(),
  ]);

  const wizardTeachers: WizardTeacher[] = teachers.map((t) => ({
    id: t.id,
    name: t.user.name,
    title: t.title,
    specialties: t.specialties,
    photoUrl: t.photoUrl,
    lessons: t.lessonTypes.map((l) => ({
      id: l.id,
      title: l.title,
      durationMin: l.durationMin,
      price: l.price,
      materials: l.materials,
      description: l.description,
    })),
  }));

  const dates: WizardDate[] = getBookableDates().map((d) => {
    const dt = parseDate(d);
    return {
      value: d,
      dayName: new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", weekday: "short" }).format(dt),
      dayNum: Number(d.slice(-2)),
      monthName: new Intl.DateTimeFormat("tr-TR", { timeZone: "UTC", month: "short" }).format(dt),
      isWeekend: [0, 6].includes(weekdayFromDateStr(d)),
    };
  });

  const user = session?.user as
    | { name?: string; email?: string; phone?: string; role?: string }
    | undefined;
  const studentUser =
    user && user.role === "STUDENT"
      ? { name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "" }
      : null;

  // Ön seçim doğrulama
  const preTeacher = wizardTeachers.find((t) => t.id === hoca);
  const preLesson = preTeacher?.lessons.find((l) => l.id === ders);

  return (
    <div className="bg-stage bg-grid mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-amber-400">
          Online Randevu
        </p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
          Dersini Ayırt
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-zinc-400">
          Hocanı seç, ders tipini belirle, müsait saatleri görüp saniyeler içinde randevunu oluştur.
        </p>
      </div>

      <BookingWizard
        teachers={wizardTeachers}
        dates={dates}
        initialTeacherId={preTeacher?.id ?? null}
        initialLessonTypeId={preLesson?.id ?? null}
        user={studentUser}
      />
    </div>
  );
}
