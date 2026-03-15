"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat", "/insights", "/account"];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="py-16 px-6" style={{ background: "#FAFAF8" }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-sm text-center">
        <img src="/logo-dark.svg" alt="ForgeHouse" className="h-5" />
        <div className="flex gap-6 text-[#737373]">
          <Link href="/the-forge" className="hover:text-[#1A1A1A] transition">The Forge</Link>
          <Link href="/for-mentors" className="hover:text-[#1A1A1A] transition">For Experts</Link>
          <Link href="/privacy" className="hover:text-[#1A1A1A] transition">Privacy</Link>
        </div>
        <p className="text-xs text-[#737373]/50">&copy; {new Date().getFullYear()} ForgeHouse</p>
      </div>
    </footer>
  );
}
