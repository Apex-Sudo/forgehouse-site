"use client";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

function UserMenu() {
  const { data: session, status } = useSession();
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
    return (
      <a
        href="/sign-in"
        className="text-muted hover:text-foreground transition text-sm cursor-pointer"
      >
        Sign In
      </a>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition cursor-pointer"
      >
        {session.user?.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-foreground/[0.08] flex items-center justify-center text-xs font-semibold">
            {session.user?.name?.[0] ?? "?"}
          </div>
        )}
        <span className="hidden sm:inline">{session.user?.name?.split(" ")[0]}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-foreground/[0.06] rounded-xl shadow-lg py-1.5 z-50">
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Account
          </Link>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] transition"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Pricing
          </Link>
          <button
            onClick={async () => {
              setOpen(false);
              try {
                const res = await fetch("/api/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } catch { /* silent */ }
            }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] transition cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><path d="M2 10h20"/></svg>
            Billing
          </button>
          <div className="my-1 border-t border-foreground/[0.06]" />
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-foreground/[0.04] transition cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const APP_ROUTES = ["/chat", "/insights", "/scenarios", "/account", "/pricing"];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();
  const inAppShell = !!session?.user && APP_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-amber/[0.08]">
      <div className={`${inAppShell ? "" : "max-w-6xl mx-auto"} px-6 h-16 flex items-center justify-between relative`}>
        <Link href="/">
          <img src="/logo.svg" alt="ForgeHouse" className="h-6" />
        </Link>
        {inAppShell ? null : (
          <>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted absolute left-1/2 -translate-x-1/2">
              <Link href="/mentors" className="hover:text-foreground transition font-medium">Modules</Link>
              <Link href="/tools" className="hover:text-foreground transition font-medium">Tools</Link>
              <Link href="/thinking" className="hover:text-foreground transition font-medium">Thinking</Link>
              <Link href="/pricing" className="hover:text-foreground transition font-medium">Pricing</Link>
              <UserMenu />
            </div>
            <div className="hidden md:flex items-center">
              <Link href="/mentors" className="bg-amber text-background px-5 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition">
                Chat Now
              </Link>
            </div>
            <button className="md:hidden text-muted" onClick={() => setOpen(!open)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </>
        )}
      </div>
      {open && (
        <div className="md:hidden border-t border-amber/[0.08] bg-background/90 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/mentors" onClick={() => setOpen(false)} className="text-muted hover:text-foreground font-medium">Modules</Link>
          <Link href="/tools" onClick={() => setOpen(false)} className="text-muted hover:text-foreground font-medium">Tools</Link>
          <Link href="/thinking" onClick={() => setOpen(false)} className="text-muted hover:text-foreground font-medium">Thinking</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-muted hover:text-foreground font-medium">Pricing</Link>
          <div onClick={() => setOpen(false)}><UserMenu /></div>
          <Link href="/mentors" onClick={() => setOpen(false)} className="bg-amber text-background px-4 py-2 rounded-md font-semibold text-center">Chat Now</Link>
        </div>
      )}
    </nav>
  );
}
