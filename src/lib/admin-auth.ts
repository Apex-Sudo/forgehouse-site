import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin") {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { session } as const;
}
