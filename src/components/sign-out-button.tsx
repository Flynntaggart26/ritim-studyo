"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {loading ? "Çıkılıyor…" : "Çıkış Yap"}
    </Button>
  );
}
