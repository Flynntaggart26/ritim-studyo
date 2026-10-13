"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBookingByToken } from "@/actions/booking";
import { Button } from "@/components/ui/button";

export function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!window.confirm("Randevunuzu iptal etmek istediğinize emin misiniz?")) return;
    setLoading(true);
    setError(null);
    const res = await cancelBookingByToken(token);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <Button variant="danger" onClick={handleCancel} disabled={loading}>
        {loading ? "İptal ediliyor…" : "Randevuyu İptal Et"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
