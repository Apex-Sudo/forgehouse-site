import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#FAFAF8]">
      <AdminSidebar
        userName={session.user.name ?? session.user.email ?? "Admin"}
        userEmail={session.user.email ?? ""}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
