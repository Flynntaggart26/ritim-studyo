"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";
import { LinkButton } from "./ui/button";
import { SignOutButton } from "./sign-out-button";

const NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hocalar", label: "Hocalar" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#konum", label: "Konum" },
];

function roleLink(role: string): { href: string; label: string } {
  if (role === "ADMIN") return { href: "/admin", label: "Yönetim Paneli" };
  if (role === "TEACHER") return { href: "/panel", label: "Hoca Panelim" };
  return { href: "/hesabim", label: "Hesabım" };
}

export function HeaderClient({
  user,
}: {
  user: { name: string; role: string } | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e3d7c5]/90 bg-[#f4eddf]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c8ad] bg-[#eee2cc] font-display text-sm font-semibold text-[#5b705b] transition-colors group-hover:bg-[#e8dbc2]">
            R
          </span>
          <span className="font-display text-base font-semibold tracking-[-0.025em] text-zinc-100 sm:text-lg">
            {site.name.split(" ")[0]}
            <span className="font-normal text-zinc-500"> {site.name.split(" ").slice(1).join(" ")}</span>
          </span>
        </Link>

        {/* Masaüstü menü */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-[#52685b]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href={roleLink(user.role).href}
                className="text-sm font-semibold text-zinc-300 transition-colors hover:text-[#52685b]"
              >
                {roleLink(user.role).label}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/giris"
              className="text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Giriş Yap
            </Link>
          )}
          <LinkButton href="/randevu" size="sm" className="px-4 py-2">
            Randevu Al
          </LinkButton>
        </div>

        {/* Mobil hamburger */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-[#ece2d1] hover:text-zinc-100 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobil menü */}
      <div
        className={cn(
          "overflow-hidden border-t border-[#e3d7c5] transition-all duration-300 md:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-[#eee5d5] hover:text-[#52685b]"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex items-center gap-3 border-t border-[#e3d7c5] pt-3">
            {user ? (
              <>
                <Link
                  href={roleLink(user.role).href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-semibold text-[#52685b]"
                >
                  {roleLink(user.role).label}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <Link
                href="/giris"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-zinc-400"
              >
                Giriş Yap
              </Link>
            )}
            <LinkButton href="/randevu" size="sm" className="ml-auto" onClick={() => setOpen(false)}>
              Randevu Al
            </LinkButton>
          </div>
        </nav>
      </div>
    </header>
  );
}
