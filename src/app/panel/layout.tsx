import { requireRole } from "@/lib/guards";
import { DashboardShell, type DashboardNavItem } from "@/components/dashboard-shell";

const NAV: DashboardNavItem[] = [
  { href: "/panel", label: "Genel Bakış", icon: "⌂" },
  { href: "/panel/randevular", label: "Ders Programı", icon: "▦" },
  { href: "/panel/musaitlik", label: "Müsaitlik", icon: "◷" },
  { href: "/panel/dersler", label: "Ders Tipleri", icon: "♫" },
];

export default async function TeacherPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("TEACHER");
  return (
    <DashboardShell
      navItems={NAV}
      title="Hoca Paneli"
      userName={session.user.name}
      roleLabel="Eğitmen Yönetimi"
    >
      {children}
    </DashboardShell>
  );
}
