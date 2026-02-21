"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-amber">Forge</span>House
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted">
          <Link href="/agents" className="hover:text-foreground transition">Agents</Link>
          <Link href="/the-forge" className="hover:text-foreground transition">The Forge</Link>
          <Link href="/pricing" className="hover:text-foreground transition">Pricing</Link>
          <Link href="/apply" className="hover:text-foreground transition">Apply</Link>
          <Link href="/chat/apex" className="bg-amber text-white px-5 py-2 rounded-lg font-semibold hover:bg-amber-dark transition">
            Start Chat
          </Link>
        </div>
        <button className="md:hidden text-muted" onClick={() => setOpen(!open)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-background/90 backdrop-blur-xl px-6 py-4 flex flex-col gap-4 text-sm">
          <Link href="/agents" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Agents</Link>
          <Link href="/the-forge" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">The Forge</Link>
          <Link href="/pricing" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Pricing</Link>
          <Link href="/apply" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">Apply</Link>
          <Link href="/chat/apex" onClick={() => setOpen(false)} className="bg-amber text-white px-4 py-2 rounded-lg font-semibold text-center">Start Chat</Link>
        </div>
      )}
    </nav>
  );
}
