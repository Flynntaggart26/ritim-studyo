"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAvailability, deleteAvailability, addBlockedDate, deleteBlockedDate } from "@/actions/teacher";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { DAY_NAMES, formatDateTr, formatMin } from "@/lib/utils";

type Window = { id: string; dayOfWeek: number; startMin: number; endMin: number };
type Blocked = { id: string; date: string; reason: string | null };
const DAYS = [1, 2, 3, 4, 5, 6, 0];
const TIMES = Array.from({ length: 36 }, (_, i) => 6 * 60 + i * 30).filter((m) => m <= 23 * 60 + 30);

export function AvailabilityManager({
  windows,
  blockedDates,
}: {
  windows: Window[];
  blockedDates: Blocked[];
}) {
  const router = useRouter();
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startMin, setStartMin] = useState(14 * 60);
  const [endMin, setEndMin] = useState(20 * 60);
  const [blockDate, setBlockDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setBusy(true);
    setError(null);
    setMessage(null);
    const res = await action();
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? "İşlem tamamlanamadı.");
      return;
    }
    setMessage(success);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-white">Haftalık Müsaitlik</h2>
          <p className="mt-1 text-sm text-zinc-500">Ders verebileceğiniz haftalık saat aralıklarını ekleyin.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day) => {
            const dayWindows = windows.filter((w) => w.dayOfWeek === day).sort((a, b) => a.startMin - b.startMin);
            return (
              <Card key={day} className="p-4">
                <h3 className="font-display font-bold text-white">{DAY_NAMES[day]}</h3>
                <div className="mt-3 space-y-2">
                  {dayWindows.length === 0 ? (
                    <p className="text-xs text-zinc-600">Müsaitlik eklenmedi</p>
                  ) : dayWindows.map((w) => (
                    <div key={w.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2">
                      <span className="text-sm font-medium text-amber-300">{formatMin(w.startMin)} – {formatMin(w.endMin)}</span>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => run(() => deleteAvailability(w.id), "Müsaitlik aralığı kaldırıldı.")}
                        className="text-xs text-zinc-500 hover:text-red-400 disabled:opacity-50"
                        aria-label="Müsaitlik aralığını sil"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-4 p-5">
          <h3 className="font-display font-bold text-white">Yeni Saat Aralığı Ekle</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="availability-day">Gün</Label>
              <Select id="availability-day" value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
                {DAYS.map((d) => <option key={d} value={d}>{DAY_NAMES[d]}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="availability-start">Başlangıç</Label>
              <Select id="availability-start" value={startMin} onChange={(e) => setStartMin(Number(e.target.value))}>
                {TIMES.map((m) => <option key={m} value={m}>{formatMin(m)}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="availability-end">Bitiş</Label>
              <Select id="availability-end" value={endMin} onChange={(e) => setEndMin(Number(e.target.value))}>
                {TIMES.map((m) => <option key={m} value={m}>{formatMin(m)}</option>)}
                <option value={1440}>24:00</option>
              </Select>
            </div>
            <Button
              disabled={busy || startMin >= endMin}
              onClick={() => run(() => addAvailability({ dayOfWeek, startMin, endMin }), "Müsaitlik aralığı eklendi.")}
            >
              + Ekle
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="font-display text-xl font-bold text-white">Kapalı Günler</h2>
          <p className="mt-1 text-sm text-zinc-500">Tatil veya özel günlerde randevu alınmasını engelleyin.</p>
        </div>
        <Card className="p-5">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
            <div>
              <Label htmlFor="blocked-date">Tarih</Label>
              <Input id="blocked-date" type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="blocked-reason">Not (isteğe bağlı)</Label>
              <Input id="blocked-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Örn. Yıllık izin" />
            </div>
            <Button
              disabled={busy || !blockDate}
              onClick={() => run(() => addBlockedDate({ date: blockDate, reason }), "Kapalı gün eklendi.")}
            >
              Tarihi Kapat
            </Button>
          </div>
          {blockedDates.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
              {blockedDates.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">{formatDateTr(b.date, { withYear: true })}</div>
                    {b.reason && <div className="text-xs text-zinc-500">{b.reason}</div>}
                  </div>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => deleteBlockedDate(b.id), "Kapalı gün kaldırıldı.")}
                    className="text-xs font-medium text-zinc-500 hover:text-red-400"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {(error || message) && (
        <div className={`rounded-xl border p-3 text-sm ${error ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"}`}>
          {error ?? message}
        </div>
      )}
    </div>
  );
}
