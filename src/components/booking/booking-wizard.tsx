"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchSlots, createBooking } from "@/actions/booking";
import { Card, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Label } from "@/components/ui/input";
import { TeacherAvatar } from "@/components/teacher-avatar";
import { cn, formatMin, formatDateTr, formatPrice } from "@/lib/utils";

export interface WizardLesson {
  id: string;
  title: string;
  durationMin: number;
  price: number | null;
  materials: string;
  description: string;
}

export interface WizardTeacher {
  id: string;
  name: string;
  title: string;
  specialties: string;
  photoUrl: string | null;
  lessons: WizardLesson[];
}

export interface WizardDate {
  value: string;
  dayName: string;
  dayNum: number;
  monthName: string;
  isWeekend: boolean;
}

const STEPS = ["Hoca", "Ders", "Tarih & Saat", "Bilgiler"];

export function BookingWizard({
  teachers,
  dates,
  initialTeacherId,
  initialLessonTypeId,
  user,
}: {
  teachers: WizardTeacher[];
  dates: WizardDate[];
  initialTeacherId: string | null;
  initialLessonTypeId: string | null;
  user: { name: string; email: string; phone: string } | null;
}) {
  const [step, setStep] = useState(initialTeacherId ? (initialLessonTypeId ? 2 : 1) : 0);
  const [teacherId, setTeacherId] = useState<string | null>(initialTeacherId);
  const [lessonTypeId, setLessonTypeId] = useState<string | null>(initialLessonTypeId);
  const [date, setDate] = useState<string | null>(null);
  const [startMin, setStartMin] = useState<number | null>(null);

  const [slotResult, setSlotResult] = useState<{ key: string; slots: number[] } | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToken, setSuccessToken] = useState<string | null>(null);

  const slotRequest = useRef(0);

  const teacher = teachers.find((t) => t.id === teacherId) ?? null;
  const lesson = teacher?.lessons.find((l) => l.id === lessonTypeId) ?? null;
  const slotKey = teacherId && lessonTypeId && date ? `${teacherId}:${lessonTypeId}:${date}` : null;
  const slots = slotKey && slotResult?.key === slotKey ? slotResult.slots : null;
  const slotsLoading = slotKey !== null && slots === null;

  // Tarih veya ders değişince saatleri yükle
  useEffect(() => {
    if (!teacherId || !lessonTypeId || !date) {
      slotRequest.current += 1;
      return;
    }
    const req = ++slotRequest.current;
    const key = `${teacherId}:${lessonTypeId}:${date}`;
    fetchSlots({ teacherId, lessonTypeId, date })
      .then((res) => {
        if (req !== slotRequest.current) return;
        setSlotResult({ key, slots: res.slots });
      })
      .catch(() => {
        if (req !== slotRequest.current) return;
        setSlotResult({ key, slots: [] });
      });
  }, [teacherId, lessonTypeId, date]);

  async function handleSubmit() {
    if (!teacherId || !lessonTypeId || !date || startMin == null) return;
    setSubmitting(true);
    setError(null);
    const res = await createBooking({
      teacherId,
      lessonTypeId,
      date,
      startMin,
      guestName: guestName || undefined,
      guestPhone: guestPhone || undefined,
      guestEmail: guestEmail || undefined,
      notes: notes || undefined,
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.error);
      // Saat dolmuş olabilir — listeyi tazele
      if (teacherId && lessonTypeId && date) {
        const fresh = await fetchSlots({ teacherId, lessonTypeId, date });
        setSlotResult({ key: `${teacherId}:${lessonTypeId}:${date}`, slots: fresh.slots });
      }
      return;
    }
    setSuccessToken(res.data.token);
  }

  // ---------- BAŞARI EKRANI ----------
  if (successToken) {
    const manageUrl = typeof window !== "undefined" ? `${window.location.origin}/randevu/${successToken}` : `/randevu/${successToken}`;
    return (
      <Card className="mx-auto mt-12 max-w-xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9e2d2] text-[#52685b]">
          <svg aria-hidden="true" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="m5 12 4 4L19 6" />
          </svg>
        </div>
        <h2 className="font-display mt-5 text-3xl font-semibold tracking-[-0.03em] text-zinc-100">Randevu talebiniz alındı</h2>
        <p className="mt-3 leading-relaxed text-zinc-400">
          <span className="font-semibold text-white">{teacher?.name}</span> ile{" "}
          <span className="font-semibold text-amber-400">
            {date ? formatDateTr(date) : ""} {startMin != null ? formatMin(startMin) : ""}
          </span>{" "}
          için randevu talebiniz oluşturuldu. Hocanız onayladığında{" "}
          {user || guestEmail ? "e-posta ile bilgilendirileceksiniz." : "size ulaşılacaktır."}
        </p>
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-left">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Randevu yönetim bağlantınız
          </div>
          <div className="mt-1.5 break-all text-sm text-zinc-300">{manageUrl}</div>
          <p className="mt-2 text-xs text-zinc-500">
            Randevunuzu görüntülemek veya iptal etmek için bu bağlantıyı saklayın.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => navigator.clipboard.writeText(manageUrl)}
          >
            📋 Bağlantıyı Kopyala
          </Button>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white">
            ← Ana Sayfa
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="mt-12">
      {/* Adım göstergesi */}
      <div className="mx-auto flex max-w-2xl items-center">
        {STEPS.map((label, i) => (
          <div key={label} className={cn("flex items-center", i < STEPS.length - 1 && "flex-1")}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  i < step && "border-amber-500 bg-amber-500 text-zinc-950",
                  i === step && "border-amber-500 bg-amber-500/15 text-amber-400",
                  i > step && "border-zinc-700 text-zinc-500"
                )}
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className={cn("mt-1.5 text-[11px] font-semibold", i === step ? "text-amber-400" : "text-zinc-500")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < step ? "bg-amber-500" : "bg-zinc-800")} />
            )}
          </div>
        ))}
      </div>

      {/* ---------- ADIM 1: HOCA ---------- */}
      {step === 0 && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTeacherId(t.id);
                setLessonTypeId(null);
                setDate(null);
                setStartMin(null);
                setStep(1);
              }}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/50"
            >
              <div className="flex items-center gap-4">
                <TeacherAvatar name={t.name} photoUrl={t.photoUrl} size="lg" />
                <div>
                  <div className="font-display text-lg font-bold text-white group-hover:text-amber-400">
                    {t.name}
                  </div>
                  <div className="text-sm text-zinc-500">{t.title}</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {t.specialties.split(",").filter(Boolean).map((s) => (
                  <Badge key={s} className="border-zinc-700 bg-zinc-800/60 text-zinc-300">
                    {s.trim()}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 text-sm font-semibold text-amber-400">{t.lessons.length} ders tipi →</div>
            </button>
          ))}
        </div>
      )}

      {/* ---------- ADIM 2: DERS TİPİ ---------- */}
      {step === 1 && teacher && (
        <div className="mx-auto mt-10 max-w-3xl">
          <WizardBack onClick={() => setStep(0)} label={`Hoca: ${teacher.name}`} />
          <div className="mt-4 space-y-4">
            {teacher.lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLessonTypeId(l.id);
                  setDate(null);
                  setStartMin(null);
                  setStep(2);
                }}
                className="group w-full rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-left transition-all duration-200 hover:border-amber-500/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-display text-lg font-bold text-white group-hover:text-amber-400">
                    {l.title}
                  </div>
                  <div className="flex gap-2">
                    <Badge className="border-zinc-700 bg-zinc-800/60 text-zinc-300">⏱ {l.durationMin} dk</Badge>
                    {l.price != null && (
                      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">{formatPrice(l.price)}</Badge>
                    )}
                  </div>
                </div>
                {l.description && <p className="mt-2 text-sm text-zinc-400">{l.description}</p>}
                {l.materials && <p className="mt-2 text-xs text-zinc-500">Gerekli ekipman: {l.materials}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------- ADIM 3: TARİH & SAAT ---------- */}
      {step === 2 && teacher && lesson && (
        <div className="mx-auto mt-10 max-w-3xl">
          <WizardBack onClick={() => setStep(1)} label={`${teacher.name} • ${lesson.title} (${lesson.durationMin} dk)`} />

          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-400">
              Gün Seçin
            </h3>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
              {dates.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    setDate(d.value);
                    setStartMin(null);
                  }}
                  className={cn(
                    "flex w-[68px] shrink-0 flex-col items-center rounded-xl border px-2 py-3 transition-all",
                    date === d.value
                      ? "border-amber-500 bg-amber-500 text-zinc-950"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-amber-500/40"
                  )}
                >
                  <span className={cn("text-[11px] font-semibold uppercase", date === d.value ? "text-zinc-900" : d.isWeekend ? "text-amber-500/80" : "text-zinc-500")}>
                    {d.dayName}
                  </span>
                  <span className="font-display mt-0.5 text-xl font-extrabold">{d.dayNum}</span>
                  <span className={cn("text-[11px]", date === d.value ? "text-zinc-900" : "text-zinc-500")}>
                    {d.monthName}
                  </span>
                </button>
              ))}
            </div>

            <h3 className="font-display mt-6 text-sm font-bold uppercase tracking-wider text-zinc-400">
              Saat Seçin
            </h3>
            {!date ? (
              <p className="mt-3 text-sm text-zinc-500">Saatleri görmek için önce bir gün seçin.</p>
            ) : slotsLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                Müsait saatler yükleniyor…
              </div>
            ) : slots && slots.length === 0 ? (
              <p className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-400">
                Bu gün için müsait saat bulunmuyor. Başka bir gün deneyin.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {(slots ?? []).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setStartMin(s);
                      setStep(3);
                    }}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                      startMin === s
                        ? "border-amber-500 bg-amber-500 text-zinc-950"
                        : "border-zinc-800 bg-zinc-950/60 text-zinc-200 hover:border-amber-500/50 hover:text-amber-400"
                    )}
                  >
                    {formatMin(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------- ADIM 4: BİLGİLER ---------- */}
      {step === 3 && teacher && lesson && date && startMin != null && (
        <div className="mx-auto mt-10 max-w-3xl">
          <WizardBack onClick={() => setStep(2)} label="Tarih & saat seçimine dön" />

          <div className="mt-4 grid gap-5 md:grid-cols-5">
            {/* Özet */}
            <Card className="h-fit p-6 md:col-span-2">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-zinc-400">
                Randevu Özeti
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                <SummaryRow label="Hoca" value={teacher.name} />
                <SummaryRow label="Ders" value={lesson.title} />
                <SummaryRow label="Tarih" value={formatDateTr(date)} />
                <SummaryRow label="Saat" value={`${formatMin(startMin)} – ${formatMin(startMin + lesson.durationMin)}`} />
                {lesson.price != null && <SummaryRow label="Ücret" value={formatPrice(lesson.price) ?? ""} highlight />}
              </div>
              <p className="mt-4 rounded-lg bg-zinc-950/60 p-3 text-xs leading-relaxed text-zinc-500">
                💡 Ödeme stüdyoda yapılır. Hocanız randevunuzu onayladığında bilgilendirilirsiniz.
              </p>
            </Card>

            {/* Form */}
            <Card className="p-6 md:col-span-3">
              {user ? (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4 text-sm">
                  <span className="font-semibold text-emerald-400">{user.name}</span>
                  <span className="text-zinc-400"> olarak randevu alıyorsunuz.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="guestName">Ad Soyad *</Label>
                    <Input id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Adınız Soyadınız" />
                  </div>
                  <div>
                    <Label htmlFor="guestPhone">Telefon *</Label>
                    <Input id="guestPhone" type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="0532 000 00 00" />
                  </div>
                  <div>
                    <Label htmlFor="guestEmail">E-posta (isteğe bağlı — onay bildirimi için)</Label>
                    <Input id="guestEmail" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="ornek@eposta.com" />
                  </div>
                </div>
              )}
              <div className="mt-4">
                <Label htmlFor="notes">Notunuz (isteğe bağlı)</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Hocanıza iletmek istediğiniz bir not var mı?" />
              </div>

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm font-medium text-red-400">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                className="mt-5 w-full"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Randevu oluşturuluyor…" : "Randevu talebi oluştur"}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function WizardBack({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-amber-400">
      ← <span>{label}</span>
    </button>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-zinc-500">{label}</span>
      <span className={cn("text-right font-semibold", highlight ? "text-amber-400" : "text-zinc-100")}>{value}</span>
    </div>
  );
}
