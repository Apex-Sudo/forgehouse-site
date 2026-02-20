"use client";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat"];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="border-t border-white/[0.06] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
        <div>
          <span className="text-amber font-bold">Forge</span>
          <span className="font-bold text-foreground">House</span>
        </div>
        <p>Built for founders who think in systems</p>
        <p>&copy; {new Date().getFullYear()} ForgeHouse</p>
      </div>
    </footer>
  );
}
