import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { AdminTeachersManager } from "@/components/admin-teachers-manager";

export const metadata: Metadata = { title: "Hoca Yönetimi" };

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    include: {
      user: true,
      _count: { select: { bookings: true, lessonTypes: true } },
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });
  return <AdminTeachersManager teachers={teachers} />;
}
