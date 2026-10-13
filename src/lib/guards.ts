import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Sayfa/aksiyon bazlı rol kontrolü. Yetkisizse yönlendirir. */
export async function requireRole(roles: Role | Role[]) {
  const session = await getSession();
  if (!session) redirect("/giris");
  const list = Array.isArray(roles) ? roles : [roles];
  const role = (session.user as { role?: string }).role as Role;
  if (!list.includes(role)) redirect("/");
  return session;
}
