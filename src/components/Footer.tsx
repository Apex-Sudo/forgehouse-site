"use client";
import { usePathname } from "next/navigation";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat"];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="border-t border-white/[0.06] py-16 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-muted">
        <p>Built for founders who think in systems</p>
        <div>
          <span className="text-amber font-bold">Forge</span>
          <span className="font-bold text-foreground">House</span>
        </div>
        <p className="text-muted/50">&copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
