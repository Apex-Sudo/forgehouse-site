"use client";
import { useState } from "react";
import type { Artifact } from "@/lib/agent/helper/stream";
import ArtifactViewer from "./ArtifactViewer";

export default function ArtifactCard({ artifact }: { artifact: Artifact }) {
  const [showViewer, setShowViewer] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3 bg-[#FAFAF8] border border-[#E5E2DC] rounded-xl px-4 py-3 mt-3 max-w-sm">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#1A1A1A] truncate">{artifact.title}</p>
          <p className="text-xs text-[#888]">PDF Document</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setShowViewer(true)}
            className="text-xs text-[#B8916A] hover:text-[#A07B56] font-medium transition cursor-pointer"
          >
            Preview
          </button>
          <span className="text-[#DDD]">|</span>
          <a
            href={artifact.url}
            download={`${artifact.title}.pdf`}
            className="text-xs text-[#B8916A] hover:text-[#A07B56] font-medium transition"
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
