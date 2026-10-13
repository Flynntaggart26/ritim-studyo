"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setBookingStatusTeacher } from "@/actions/teacher";
import { setBookingStatusAdmin } from "@/actions/admin";
import { Button } from "@/components/ui/button";

export function BookingActions({
  bookingId,
  status,
  context,
}: {
  bookingId: string;
  status: string;
  context: "teacher" | "admin";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function update(nextStatus: "CONFIRMED" | "CANCELLED") {
    if (nextStatus === "CANCELLED" && !window.confirm("Bu randevuyu iptal etmek istediğinize emin misiniz?")) return;
    setBusy(true);
    setError(null);
    const res = context === "teacher"
      ? await setBookingStatusTeacher(bookingId, nextStatus)
      : await setBookingStatusAdmin(bookingId, nextStatus);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  if (status === "CANCELLED") return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "PENDING" && (
        <Button size="sm" variant="success" disabled={busy} onClick={() => update("CONFIRMED")}>
          Onayla
        </Button>
      )}
      <Button size="sm" variant="danger" disabled={busy} onClick={() => update("CANCELLED")}>
        İptal
      </Button>
      {error && <span className="basis-full text-xs text-red-400">{error}</span>}
    </div>
  );
}
