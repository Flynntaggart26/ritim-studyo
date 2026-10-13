import { requireRole } from "@/lib/guards";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell";

const NAV: DashboardNavItem[] = [
  { href: "/admin", label: "Genel Bakış", icon: "⌂" },
  { href: "/admin/hocalar", label: "Hoca Yönetimi", icon: "♟" },
  { href: "/admin/randevular", label: "Tüm Randevular", icon: "▦" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ADMIN");
  return (
    <DashboardShell
      navItems={NAV}
      title="Yönetim Paneli"
      userName={session.user.name}
      roleLabel="Stüdyo Yönetimi"
    >
      {children}
    </DashboardShell>
  );
}
