import type { Metadata } from "next";
import { requireRole } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { toDateStr } from "@/lib/utils";
import { AvailabilityManager } from "@/components/availability-manager";

export const metadata: Metadata = { title: "Müsaitlik Saatlerim" };

export default async function TeacherAvailabilityPage() {
  const session = await requireRole("TEACHER");
  const user = session.user as { id: string };
  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      availabilities: { orderBy: [{ dayOfWeek: "asc" }, { startMin: "asc" }] },
      blockedDates: { where: { date: { gte: toDateStr(new Date()) } }, orderBy: { date: "asc" } },
    },
  });
  if (!profile) return <p className="text-zinc-400">Hoca profili bulunamadı.</p>;

  return <AvailabilityManager windows={profile.availabilities} blockedDates={profile.blockedDates} />;
}
