import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { isAdminOrMentor, isAdmin, isMentor } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!isAdminOrMentor(session)) {
    redirect("/");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  const userIsAdmin = isAdmin(session);
  const userIsMentor = isMentor(session);

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#FAFAF8]">
      <AdminSidebar
        userName={session.user.name ?? session.user.email ?? "Admin"}
        userEmail={session.user.email ?? ""}
        userRole={role}
        isAdmin={userIsAdmin}
        isMentor={userIsMentor}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
