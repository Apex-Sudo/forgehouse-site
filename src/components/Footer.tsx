"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat", "/insights", "/account"];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6 text-sm text-muted text-center">
        <img src="/logo.svg" alt="ForgeHouse" className="h-5" />
        <div className="flex gap-6 text-muted">
          <Link href="/the-forge" className="hover:text-foreground transition">The Forge</Link>
          <Link href="/for-mentors" className="hover:text-foreground transition">For Experts</Link>
          <Link href="/privacy" className="hover:text-foreground transition">Privacy</Link>
        </div>
        <p className="text-xs text-muted/50">&copy; {new Date().getFullYear()} ForgeHouse</p>
      </div>
    </footer>
  );
}
