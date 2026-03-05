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
      <button
        onClick={() => signIn("linkedin")}
        className="text-muted hover:text-foreground transition text-sm cursor-pointer"
      >
        Sign In
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition"
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
          <div className="w-7 h-7 rounded-full bg-white/[0.1] flex items-center justify-center text-xs font-semibold">
            {session.user?.name?.[0] ?? "?"}
          </div>
        )}
        <span className="hidden sm:inline">{session.user?.name?.split(" ")[0]}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-background border border-white/[0.08] rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={async () => {
              setOpen(false);
              try {
                const res = await fetch("/api/portal", { method: "POST" });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } catch { /* silent */ }
            }}
            className="w-full text-left px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-white/[0.04] transition"
          >
            Manage Subscription
          </button>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full text-left px-4 py-2 text-sm text-muted hover:text-foreground hover:bg-white/[0.04] transition"
          >
            Sign Out
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-amber">Forge</span>House
        </Link>
        {inAppShell ? (
          <div className="hidden md:flex items-center gap-4 text-sm text-muted">
            <UserMenu />
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-8 text-sm text-muted">
              <Link href="/mentors" className="hover:text-foreground transition">Mentors</Link>
              <Link href="/tools" className="hover:text-foreground transition">Tools</Link>
              <Link href="/thinking" className="hover:text-foreground transition">Thinking</Link>
              <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
              <UserMenu />
              <Link href="/chat/apex" className="bg-amber text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-dark transition">
                Start Chat
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
        <div className="md:hidden border-t border-white/[0.06] bg-background/90 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/mentors" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Mentors</Link>
          <Link href="/tools" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Tools</Link>
          <Link href="/thinking" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Thinking</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Pricing</Link>
          <div onClick={() => setOpen(false)}><UserMenu /></div>
          <Link href="/chat/apex" onClick={() => setOpen(false)} className="bg-amber text-white px-4 py-2 rounded-lg font-semibold text-center">Start Chat</Link>
        </div>
      )}
    </nav>
  );
}
