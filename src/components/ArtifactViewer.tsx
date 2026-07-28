"use client";
import { useEffect, useState } from "react";
import type { Artifact } from "@/lib/agent/helper/stream";

interface ArtifactViewerProps {
  artifact: Artifact;
  onClose: () => void;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);
  return isMobile;
}

export default function ArtifactViewer({ artifact, onClose }: ArtifactViewerProps) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-surface border border-border rounded-lg shadow-2xl w-[90vw] max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-background border border-border flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-[19px] leading-tight text-foreground">{artifact.title}</p>
              <p className="mono text-[10px] tracking-[0.08em] uppercase text-faint mt-0.5">PDF Document</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={artifact.url}
              download={`${artifact.title}.pdf`}
              className="mono text-[11px] tracking-[0.06em] uppercase text-accent hover:text-foreground transition"
            >
              Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md text-muted hover:text-accent hover:bg-surface-light transition cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 bg-background">
          {isMobile ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
              <div className="w-16 h-16 rounded-lg bg-surface border border-border flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[22px] leading-tight text-foreground mb-1">{artifact.title}</p>
                <p className="mono text-[11px] tracking-[0.04em] text-muted">PDF preview isn&apos;t supported on mobile browsers.</p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <a
                  href={artifact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono bg-accent text-[#1B1B18] px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-accent-dim transition text-center"
                >
                  Open PDF
                </a>
                <a
                  href={artifact.url}
                  download={`${artifact.title}.pdf`}
                  className="mono bg-transparent text-accent border border-accent/60 px-6 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-accent hover:text-[#1B1B18] transition text-center"
                >
                  Download PDF
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={artifact.url}
              className="w-full h-full border-0"
              title={artifact.title}
            />
          )}
        </div>
      </div>
    </div>
  );
}
