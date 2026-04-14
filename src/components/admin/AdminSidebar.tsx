"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconLayoutDashboard,
  IconUsers,
  IconChevronRight,
} from "@tabler/icons-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <IconLayoutDashboard size={20} stroke={1.5} />,
  },
  {
    label: "Mentor Onboarding",
    href: "/admin/onboarding",
    icon: <IconUsers size={20} stroke={1.5} />,
  },
];

interface AdminSidebarProps {
  userName: string;
  userEmail: string;
}

export default function AdminSidebar({
  userName,
  userEmail,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-[#E5E2DC] bg-white">
      <div className="border-b border-[#E5E2DC] px-5 py-5">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#1A1A1A]">ForgeHouse</span>
          <span className="rounded bg-amber/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-amber/10 text-amber"
                      : "text-[#737373] hover:bg-[#F5F3F0] hover:text-[#1A1A1A]"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {active && (
                    <IconChevronRight size={16} stroke={1.5} className="text-amber/60" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[#E5E2DC] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber/10 text-xs font-bold text-amber">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#1A1A1A]">
              {userName}
            </p>
            <p className="truncate text-xs text-[#999]">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
