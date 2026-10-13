import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { Card, Badge } from "@/components/ui/card";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { LinkButton } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

export async function TeachersSection() {
  const teachers = await prisma.teacherProfile.findMany({
    where: { isActive: true },
    include: {
      user: true,
      lessonTypes: { where: { isActive: true }, orderBy: { durationMin: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  if (teachers.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <Reveal className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Eğitmenlerimiz</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
            Sizinle aynı ritmi paylaşan hocalar
          </h2>
        </div>
        <LinkButton href="/hocalar" variant="outline">
          Tümünü Gör →
        </LinkButton>
      </Reveal>

      <div className="mt-9 grid gap-4 md:grid-cols-3">
        {teachers.map((t, i) => {
          const minPrice = t.lessonTypes.find((l) => l.price != null)?.price;
          return (
            <Reveal key={t.id} delay={i * 100}>
              <Link href={`/hocalar/${t.id}`} className="block h-full">
                <Card className="group h-full rounded-[1.25rem] border-[#e5dac8] bg-[#faf4e8] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#cdbb9c] hover:shadow-[0_18px_42px_-32px_rgba(92,70,44,0.35)] sm:p-6">
                  <div className="flex items-start justify-between">
                    <TeacherAvatar name={t.user.name} photoUrl={t.photoUrl} size="lg" />
                    {minPrice != null && (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                        {formatPrice(minPrice)}&apos;den itibaren
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-display mt-5 text-xl font-bold text-white transition-colors group-hover:text-amber-400">
                    {t.user.name}
                  </h3>
                  <p className="mt-0.5 text-sm font-medium text-zinc-500">{t.title}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.specialties.split(",").filter(Boolean).map((s) => (
                      <Badge key={s} className="border-zinc-700 bg-zinc-800/60 text-zinc-300">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-amber-400">
                    {t.lessonTypes.length} ders tipi
                    <span className="text-zinc-600">•</span>
                    <span className="transition-transform group-hover:translate-x-1">Profili gör →</span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
