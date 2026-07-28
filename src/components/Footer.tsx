"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Monogram from "@/components/brand/Monogram";

const HIDDEN_ROUTES = ["/contribute", "/calibrate", "/chat", "/insights", "/account", "/onboard", "/admin", "/extraction"];

const FOOTER_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/for-mentors", label: "MENTOR'S PAGE" },
  { href: "/pricing", label: "PRICING" },
  { href: "/#faq", label: "FAQ" },
  { href: "/privacy", label: "PRIVACY POLICY" },
  { href: "/apply", label: "CONTACT" },
];

export default function Footer() {
  const pathname = usePathname();
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  if (hidden) return null;

  return (
    <footer className="px-6 md:px-10 pb-12">
      <div className="max-w-[1280px] mx-auto">
        <div className="h-px bg-border" />
        <div className="pt-10 flex items-start justify-between gap-8">
          <Link href="/" aria-label="Forge House" className="text-foreground">
            <Monogram size={30} />
          </Link>
          <nav className="flex flex-col items-end gap-1.5">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="mono text-[11px] tracking-[0.08em] text-muted hover:text-accent transition"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
