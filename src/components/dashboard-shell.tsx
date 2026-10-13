"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SignOutButton } from "./sign-out-button";

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: string;
}

export function DashboardShell({
  children,
  navItems,
  title,
  userName,
  roleLabel,
}: {
  children: React.ReactNode;
  navItems: DashboardNavItem[];
  title: string;
  userName: string;
  roleLabel: string;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">{roleLabel}</p>
          <h1 className="font-display mt-1 text-2xl font-extrabold text-white">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-400 sm:inline">{userName}</span>
          <SignOutButton />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <nav className="sticky top-24 space-y-1 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-2">
            {navItems.map((item) => {
              const active = item.href === pathname || (item.href !== "/panel" && item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                  )}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          <nav className="mb-5 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {navItems.map((item) => {
              const active = item.href === pathname || (item.href !== "/panel" && item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                    active
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                      : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                  )}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>
          {children}
        </div>
      </div>
    </div>
  );
}
