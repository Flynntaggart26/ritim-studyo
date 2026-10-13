"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

function homeFor(role?: string): string {
  if (role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/panel";
  return "/hesabim";
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn.email({ email, password });
    setLoading(false);
    if (res.error) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      return;
    }
    const role = (res.data?.user as { role?: string } | undefined)?.role;
    router.push(homeFor(role));
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">E-posta</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="password">Şifre</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm font-medium text-red-400">{error}</div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Giriş yapılıyor…" : "Giriş Yap"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-amber-400 hover:text-amber-300">
          Öğrenci kaydı oluşturun
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await signUp.email({ name, email, password, phone: phone || undefined });
    setLoading(false);
    if (res.error) {
      setError(
        res.error.message?.toLowerCase().includes("exist")
          ? "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı deneyin."
          : "Kayıt oluşturulamadı. Bilgilerinizi kontrol edin."
      );
      return;
    }
    router.push("/hesabim");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Ad Soyad</Label>
        <Input id="name" required minLength={2} value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="reg-email">E-posta</Label>
        <Input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@eposta.com" autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="reg-phone">Telefon (isteğe bağlı)</Label>
        <Input id="reg-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0532 000 00 00" autoComplete="tel" />
      </div>
      <div>
        <Label htmlFor="reg-password">Şifre (en az 8 karakter)</Label>
        <Input id="reg-password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </div>
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm font-medium text-red-400">{error}</div>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Hesap oluşturuluyor…" : "Öğrenci Hesabı Oluştur"}
      </Button>
      <p className="text-center text-sm text-zinc-500">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-amber-400 hover:text-amber-300">
          Giriş yapın
        </Link>
      </p>
    </form>
  );
}
