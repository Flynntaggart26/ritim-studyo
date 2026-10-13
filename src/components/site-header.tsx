import { getSession } from "@/lib/guards";
import { HeaderClient } from "./header-client";

export async function SiteHeader() {
  const session = await getSession();
  const user = session?.user as { name?: string; role?: string } | undefined;
  return (
    <HeaderClient
      user={user ? { name: user.name ?? "Kullanıcı", role: user.role ?? "STUDENT" } : null}
    />
  );
}
