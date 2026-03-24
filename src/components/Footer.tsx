"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat", "/insights", "/account"];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="py-16 px-6" style={{ background: "#1A1A1A" }}>
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-sm text-center">
        <img src="/logo.svg" alt="ForgeHouse" className="h-5 brightness-0 invert" />
        <div className="flex gap-6 text-[#666]">
          <Link href="/the-forge" className="hover:text-white transition">The Forge</Link>
          <Link href="/for-mentors" className="hover:text-white transition">For Experts</Link>
          <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
        </div>
        <p className="text-xs text-[#444]">&copy; {new Date().getFullYear()} ForgeHouse</p>
      </div>
    </footer>
  );
}
