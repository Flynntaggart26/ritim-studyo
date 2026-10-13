import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/guards";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = { title: "Öğrenci Kaydı" };

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    const role = (session.user as { role?: string }).role;
    redirect(role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/panel" : "/hesabim");
  }

  return (
    <div className="bg-stage bg-grid mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#e9e2d2] font-display text-lg font-semibold text-[#52685b]">R</span>
        <h1 className="font-display mt-4 text-3xl font-semibold tracking-[-0.03em] text-zinc-100">Öğrenci hesabı</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Hesap oluşturun, randevularınızı tek yerden takip edin.
        </p>
      </div>
      <Card className="mt-8 p-7">
        <RegisterForm />
      </Card>
    </div>
  );
}
