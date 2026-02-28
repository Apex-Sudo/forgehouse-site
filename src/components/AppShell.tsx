"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AppShellProvider, useAppShell } from "./AppShellContext";
import Sidebar from "./Sidebar";
import { IconMenu2 } from "@tabler/icons-react";

const APP_ROUTES = ["/chat", "/insights", "/scenarios", "/account"];

function isAppRoute(pathname: string) {
  return APP_ROUTES.some((r) => pathname.startsWith(r));
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { setSidebarOpen } = useAppShell();
  const showShell = !!session?.user && isAppRoute(pathname);

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen pt-16">
      <Sidebar />
      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-[18px] left-16 z-50 md:hidden text-muted hover:text-foreground p-1"
      >
        <IconMenu2 size={20} />
      </button>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShellProvider>
      <AppShellInner>{children}</AppShellInner>
    </AppShellProvider>
  );
}

export { isAppRoute };
