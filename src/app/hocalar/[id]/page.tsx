import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/card";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { LinkButton } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { DAY_NAMES, formatMin, formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const t = await prisma.teacherProfile.findUnique({
    where: { id },
    include: { user: true },
  });
  return { title: t ? `${t.user.name} — ${t.title}` : "Hoca" };
}

export default async function TeacherDetailPage({ params }: Props) {
  const { id } = await params;
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id },
    include: {
      user: true,
      lessonTypes: { where: { isActive: true }, orderBy: { durationMin: "asc" } },
      availabilities: { orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }] },
    },
  });

  if (!teacher || !teacher.isActive) notFound();

  const dayOrder = [1, 2, 3, 4, 5, 6, 0];
  const availabilityByDay = dayOrder
    .map((d) => ({
      day: d,
      windows: teacher.availabilities.filter((a) => a.dayOfWeek === d),
    }))
    .filter((x) => x.windows.length > 0);

  return (
    <div className="bg-stage mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <Link href="/hocalar" className="text-sm font-medium text-zinc-400 transition-colors hover:text-amber-400">
        ← Tüm Hocalar
      </Link>

      {/* Profil başlığı */}
      <Reveal>
        <Card className="mt-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-amber-500/25 via-orange-500/15 to-transparent" />
          <div className="-mt-12 flex flex-col gap-6 p-7 sm:flex-row sm:items-end">
            <TeacherAvatar name={teacher.user.name} photoUrl={teacher.photoUrl} size="xl" className="ring-4 ring-zinc-900" />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-semibold tracking-[-0.03em] text-zinc-100">{teacher.user.name}</h1>
              <p className="mt-1 font-medium text-amber-400">{teacher.title}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {teacher.specialties.split(",").filter(Boolean).map((s) => (
                  <Badge key={s} className="border-amber-500/30 bg-amber-500/10 text-amber-300">
                    {s.trim()}
                  </Badge>
                ))}
              </div>
            </div>
            <LinkButton href={`/randevu?hoca=${teacher.id}`} size="lg">
              Randevu Al
            </LinkButton>
          </div>
          {teacher.bio && (
            <p className="border-t border-zinc-800 px-7 py-5 leading-relaxed text-zinc-400">{teacher.bio}</p>
          )}
        </Card>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Ders tipleri */}
        <div className="lg:col-span-2">
          <Reveal>
            <h2 className="font-display text-xl font-semibold text-zinc-100">Ders seçenekleri</h2>
          </Reveal>
          <div className="mt-5 space-y-4">
            {teacher.lessonTypes.map((lt, i) => (
              <Reveal key={lt.id} delay={i * 80}>
                <Card className="group p-6 transition-all duration-300 hover:border-amber-500/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-zinc-100">{lt.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className="border-zinc-700 bg-zinc-800/60 text-zinc-300">
                          ⏱ {lt.durationMin} dakika
                        </Badge>
                        {lt.price != null && (
                          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                            {formatPrice(lt.price)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <LinkButton href={`/randevu?hoca=${teacher.id}&ders=${lt.id}`} size="sm">
                      Bu Dersi Seç →
                    </LinkButton>
                  </div>
                  {lt.description && (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-400">{lt.description}</p>
                  )}
                  {lt.materials && (
                    <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm">
                      <span className="font-semibold text-zinc-300">Getirilmesi gerekenler: </span>
                      <span className="text-zinc-400">{lt.materials}</span>
                    </div>
                  )}
                </Card>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Haftalık müsaitlik */}
        <Reveal delay={120}>
          <Card className="h-fit p-6">
            <h2 className="font-display flex items-center gap-2 text-lg font-bold text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                <rect x="3" y="4" width="18" height="17" rx="3" />
                <path d="M8 2v4M16 2v4M3 9h18" />
              </svg>
              Haftalık Müsaitlik
            </h2>
            {availabilityByDay.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                Bu hoca henüz müsait saat eklememiş.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {availabilityByDay.map(({ day, windows }) => (
                  <li key={day} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5">
                    <span className="text-sm font-semibold text-zinc-200">{DAY_NAMES[day]}</span>
                    <span className="text-right text-xs leading-relaxed text-amber-400">
                      {windows.map((w) => `${formatMin(w.startMin)}–${formatMin(w.endMin)}`).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              Kesin boş saatler randevu ekranında anlık olarak gösterilir.
            </p>
            <LinkButton href={`/randevu?hoca=${teacher.id}`} className="mt-5 w-full">
              Müsait Saatleri Gör
            </LinkButton>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
