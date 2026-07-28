"use client";
import { useState } from "react";
import type { Artifact } from "@/lib/agent/helper/stream";
import ArtifactViewer from "./ArtifactViewer";

export default function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3 mt-3 max-w-sm">
        <div className="w-10 h-10 rounded-md bg-surface border border-border flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] leading-tight text-foreground truncate">{artifact.title}</p>
          <p className="mono text-[10px] tracking-[0.08em] uppercase text-faint mt-0.5">PDF Document</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowViewer(true)}
            className="mono text-[10px] tracking-[0.06em] uppercase text-accent hover:text-foreground transition cursor-pointer"
          >
            Preview
          </button>
          <span className="text-faint">|</span>
          <a
            href={artifact.url}
            download={`${artifact.title}.pdf`}
            className="mono text-[10px] tracking-[0.06em] uppercase text-accent hover:text-foreground transition"
          >
            Download
          </a>
        </div>
      </div>
      {showViewer && (
        <ArtifactViewer artifact={artifact} onClose={() => setShowViewer(false)} />
      )}
    </>
  );
}
