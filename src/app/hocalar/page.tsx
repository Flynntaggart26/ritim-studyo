import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { Reveal } from "@/components/reveal";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Hocalarımız" };

export default async function TeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    where: { isActive: true },
    include: {
      user: true,
      lessonTypes: { where: { isActive: true }, orderBy: { durationMin: "asc" } },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
      <div className="bg-stage mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
      <Reveal>
        <p className="eyebrow">Eğitmen kadromuz</p>
        <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
          Hocalarımız
        </h1>
        <p className="mt-4 max-w-2xl text-zinc-400">
          Her biri kendi alanında uzman eğitmenlerimizi tanıyın; tarzınıza ve seviyenize
          uygun hocayı seçin, müsait saatlerini görün ve hemen randevu alın.
        </p>
      </Reveal>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t, i) => {
          const prices = t.lessonTypes.map((l) => l.price).filter((p): p is number => p != null);
          const minPrice = prices.length ? Math.min(...prices) : null;
          return (
            <Reveal key={t.id} delay={i * 90}>
              <Link href={`/hocalar/${t.id}`} className="block h-full">
                <Card className="group flex h-full flex-col p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-500/40">
                  <div className="flex items-center gap-4">
                    <TeacherAvatar name={t.user.name} photoUrl={t.photoUrl} size="lg" />
                    <div>
                      <h2 className="font-display text-xl font-bold text-white transition-colors group-hover:text-amber-400">
                        {t.user.name}
                      </h2>
                      <p className="text-sm text-zinc-500">{t.title}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {t.specialties.split(",").filter(Boolean).map((s) => (
                      <Badge key={s} className="border-zinc-700 bg-zinc-800/60 text-zinc-300">
                        {s.trim()}
                      </Badge>
                    ))}
                  </div>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
                    {t.bio}
                  </p>
                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4 text-sm">
                    <span className="text-zinc-500">
                      {minPrice != null ? (
                        <>
                          <span className="font-semibold text-amber-400">{formatPrice(minPrice)}</span>
                          &apos;den itibaren
                        </>
                      ) : (
                        `${t.lessonTypes.length} ders tipi`
                      )}
                    </span>
                    <span className="font-semibold text-amber-400 transition-transform group-hover:translate-x-1">
                      İncele →
                    </span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
