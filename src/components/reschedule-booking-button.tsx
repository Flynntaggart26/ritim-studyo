"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { fetchRescheduleSlots, rescheduleBooking } from "@/actions/teacher";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { addDaysToDateStr, formatMin } from "@/lib/utils";

export function RescheduleBookingButton({
  bookingId,
  currentDate,
  currentStartMin,
  today,
}: {
  bookingId: string;
  currentDate: string;
  currentStartMin: number;
  today: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(currentDate);
  const [slots, setSlots] = useState<number[] | null>(null);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  async function loadSlots(nextDate: string) {
    const currentRequest = ++requestId.current;
    setLoadingSlots(true);
    setSlots(null);
    setSelectedStart(null);
    setError(null);

    const result = await fetchRescheduleSlots(bookingId, nextDate);
    if (currentRequest !== requestId.current) return;
    setLoadingSlots(false);
    if (!result.ok) {
      setError(result.error);
      setSlots([]);
      return;
    }
    setSlots(result.data.slots);
  }

  function openDialog() {
    setDate(currentDate);
    setOpen(true);
    void loadSlots(currentDate);
  }

  async function save() {
    if (selectedStart === null) return;
    if (date === currentDate && selectedStart === currentStartMin) {
      setError("Lütfen mevcut saatten farklı bir saat seçin.");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await rescheduleBooking({ bookingId, date, startMin: selectedStart });
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      await loadSlots(date);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={openDialog}>
        Saati değiştir
      </Button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#342f27]/35 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`reschedule-title-${bookingId}`}
            className="w-full max-w-lg rounded-[1.4rem] border border-[#e1d4bf] bg-[#fbf6ec] p-5 shadow-[0_30px_90px_-40px_rgba(48,39,27,0.45)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Ders programı</p>
                <h2 id={`reschedule-title-${bookingId}`} className="font-display mt-2 text-xl font-semibold text-zinc-100">
                  Randevu saatini değiştir
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Öğrenci bilgileri korunur; yeni saat e-posta ile bildirilir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                aria-label="Pencereyi kapat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e1d4bf] text-zinc-500 transition-colors hover:bg-[#f0e7d8] hover:text-zinc-200 disabled:opacity-50"
              >
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-5">
              <Label htmlFor={`reschedule-date-${bookingId}`}>Yeni tarih</Label>
              <Input
                id={`reschedule-date-${bookingId}`}
                type="date"
                min={today}
                max={addDaysToDateStr(today, 14)}
                value={date}
                disabled={saving}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  setDate(nextDate);
                  if (nextDate) void loadSlots(nextDate);
                }}
              />
            </div>

            <div className="mt-5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`reschedule-date-${bookingId}`} className="mb-0">Yeni başlangıç saati</Label>
                <span className="text-xs text-zinc-500">Ders süresi korunur</span>
              </div>
              {loadingSlots ? (
                <p className="mt-3 text-sm text-zinc-500">Müsait saatler getiriliyor…</p>
              ) : slots && slots.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((startMin) => (
                    <button
                      key={startMin}
                      type="button"
                      aria-pressed={selectedStart === startMin}
                      onClick={() => setSelectedStart(startMin)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        selectedStart === startMin
                          ? "border-[#52685b] bg-[#52685b] text-zinc-50"
                          : "border-[#e1d4bf] bg-[#fffaf0] text-zinc-300 hover:border-[#9cac93] hover:bg-[#f5efe2]"
                      }`}
                    >
                      {formatMin(startMin)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-[#e5dac8] bg-[#f7f0e4] px-4 py-3 text-sm text-zinc-500">
                  Bu tarihte size uygun boş saat bulunmuyor.
                </p>
              )}
            </div>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-[#dfb9a4] bg-[#f7e9df] px-3.5 py-3 text-sm text-[#8d573c]">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#e7dcc9] pt-4">
              <p className="text-xs text-zinc-500">
                Önceki saat: {formatMin(currentStartMin)}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>
                  Vazgeç
                </Button>
                <Button disabled={saving || loadingSlots || selectedStart === null} onClick={save}>
                  {saving ? "Kaydediliyor…" : "Yeni saati kaydet"}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
