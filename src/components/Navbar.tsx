"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Wordmark from "@/components/brand/Wordmark";

const NAV_LINKS = [
  { href: "/mentors", label: "Modules" },
  { href: "/tools", label: "Tools" },
  { href: "/free-prompts", label: "Free Prompts" },
  { href: "/thinking", label: "Thinking" },
  { href: "/pricing", label: "Pricing" },
];

function UserMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (status === "loading") return null;

  if (!session) {
    const callbackUrl = pathname || "/";
    return (
      <Link
        href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}
        className="mono text-[13px] text-accent hover:text-foreground transition cursor-pointer"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="mono flex items-center gap-2 text-[13px] text-accent hover:text-foreground transition cursor-pointer"
      >
        {session.user?.image ? (
          <Image src={session.user.image} alt="" width={22} height={22} className="rounded-full" />
        ) : null}
        Profile
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-48 bg-surface border border-border rounded-lg shadow-2xl py-1.5 z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="mono block px-4 py-2 text-[12px] text-muted hover:text-accent transition"
          >
            Account
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="mono block px-4 py-2 text-[12px] text-muted hover:text-accent transition"
          >
            Pricing
          </Link>
          <button
            onClick={async () => {
              setOpen(false);
              try {
                const res = await fetch("/api/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } catch {
                /* silent */
              }
            }}
            className="mono block w-full text-left px-4 py-2 text-[12px] text-muted hover:text-accent transition cursor-pointer"
          >
            Billing
          </button>
          <div className="my-1 border-t border-border" />
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="mono block w-full text-left px-4 py-2 text-[12px] text-muted hover:text-accent transition cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const APP_ROUTES = ["/chat", "/insights", "/scenarios", "/account"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const inAppShell = !!session?.user && APP_ROUTES.some((r) => pathname.startsWith(r));
  const chatNowHref = session?.user ? "/chat" : "/mentors";

  // The signed-in app screens carry their own chrome in the sidebar,
  // as in the Figma /chat design — no marketing header there.
  if (inAppShell) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background">
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 h-16 md:h-[72px] flex items-center justify-between">
        <Link href="/" aria-label="Forge House" className="shrink-0">
          <Wordmark size={19} className="text-foreground" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`mono text-[13px] transition ${
                    pathname === link.href
                      ? "text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <UserMenu />
              <Link
                href={chatNowHref}
                className="mono bg-accent text-background px-6 py-2.5 rounded-md text-[13px] tracking-wide hover:bg-accent-dim transition"
              >
                CHAT NOW
              </Link>
            </div>

            <button
              className="md:hidden text-foreground"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-5 flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="mono text-[13px] text-muted hover:text-foreground transition"
            >
              {link.label}
            </Link>
          ))}
          <div onClick={() => setOpen(false)}>
            <UserMenu />
          </div>
          <Link
            href={chatNowHref}
            onClick={() => setOpen(false)}
            className="mono bg-accent text-background px-5 py-2.5 rounded-md text-[13px] tracking-wide text-center"
          >
            CHAT NOW
          </Link>
        </div>
      )}
    </nav>
  );
}
