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

export async function requireAdminOrMentor() {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 } as const;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin" && role !== "mentor") {
    return { error: "Forbidden", status: 403 } as const;
  }
  return { session } as const;
}

// Export helper functions for checking roles
export function isAdmin(session: any) {
  return (session?.user as any)?.role === 'admin';
}

export function isMentor(session: any) {
  return (session?.user as any)?.role === 'mentor';
}

export function isAdminOrMentor(session: any) {
  return isAdmin(session) || isMentor(session);
}
