"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconArrowLeft, IconPaperclip } from "@tabler/icons-react";
import ClipButton from "@/components/ui/ClipButton";
import { readNdjsonStream } from "@/lib/agent/helper/stream";
import { stripMeta } from "@/lib/extraction/coverage-meta";
import type { Coverage, ModuleType } from "@/lib/extraction/modules";

type Message = { role: "user" | "assistant"; content: string };

interface ModuleDetail {
  type: ModuleType;
  label: string;
  detail: string;
  minutes: number;
  acceptsArtifacts: boolean;
  status: string;
  messages: Message[];
  coverage: Coverage;
  artifacts: { name: string; chars: number; uploadedAt: string }[];
  exchanges: number;
}

export default function ModuleChat({
  onboardingId,
  moduleType,
  onBack,
  onChanged,
}: {
  onboardingId: string;
  moduleType: ModuleType;
  onBack: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<ModuleDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const openedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const send = useCallback(
    async (text?: string) => {
      if (streaming) return;
      setError(null);
      setStreaming(true);
      setStreamText("");

      const trimmed = text?.trim();
      if (trimmed) {
        setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
        setInput("");
      }
      scrollToBottom();

      try {
        const res = await fetch("/api/module-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ onboardingId, moduleType, message: trimmed }),
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Something went wrong. Try again.");
        }

        const full = await readNdjsonStream(res.body, (acc) => {
          setStreamText(stripMeta(acc));
          scrollToBottom();
        });

        const clean = stripMeta(full).trim();
        if (clean) {
          setMessages((prev) => [...prev, { role: "assistant", content: clean }]);
        }
        setStreamText("");
        onChanged();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setStreaming(false);
        scrollToBottom();
      }
    },
    [onboardingId, moduleType, streaming, scrollToBottom, onChanged]
  );

  // Load the transcript, and open the session if it hasn't started.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/onboarding/${onboardingId}/modules/${moduleType}`
        );
        if (!res.ok) throw new Error("Could not load this session.");
        const data = (await res.json()) as ModuleDetail;
        if (cancelled) return;
        setDetail(data);
        setMessages(data.messages ?? []);
        scrollToBottom();
        if ((data.messages ?? []).length === 0 && !openedRef.current) {
          openedRef.current = true;
          void send();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not load session.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // send is intentionally excluded: this must run once per module.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboardingId, moduleType]);

  const finish = async () => {
    await fetch(`/api/onboarding/${onboardingId}/modules/${moduleType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    onChanged();
    onBack();
  };

  const onFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed.");

      const res = await fetch(
        `/api/onboarding/${onboardingId}/modules/${moduleType}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add_artifact",
            artifact: { name: file.name, text: upData.content },
          }),
        }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Could not attach that file.");
      }
      setDetail((prev) =>
        prev
          ? {
              ...prev,
              artifacts: [
                ...prev.artifacts,
                {
                  name: file.name,
                  chars: (upData.content ?? "").length,
                  uploadedAt: new Date().toISOString(),
                },
              ],
            }
          : prev
      );
      void send(`I've attached "${file.name}". Let's walk through it.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-surface px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-start justify-between gap-4">
          <div className="min-w-0">
            <button
              onClick={onBack}
              className="mono mb-2 inline-flex cursor-pointer items-center gap-1.5 text-[11px] uppercase tracking-[0.06em] text-muted transition hover:text-accent"
            >
              <IconArrowLeft size={14} stroke={1.75} />
              All sessions
            </button>
            <h1 className="text-[24px] leading-none text-foreground">
              {detail?.label ?? "Session"}
            </h1>
            <p className="mono mt-2 text-[11px] tracking-[0.04em] text-muted">
              ~{detail?.minutes ?? 30} min · you can stop any time, progress saves
            </p>
          </div>
          {detail && detail.exchanges > 0 && (
            <span className="mono shrink-0 rounded-sm bg-accent/15 px-2.5 py-1 text-[10px] uppercase tracking-[0.06em] text-accent">
              {messages.filter((m) => m.role === "user").length} replies
            </span>
          )}
        </div>
      </div>

      {/* Transcript */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto fh-scroll px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {detail && messages.length === 0 && !streaming && (
            <p className="mono text-[12px] text-faint">Starting the session…</p>
          )}

          {messages.map((m, i) =>
            m.role === "assistant" ? (
              <div key={i} className="flex justify-start">
                <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-accent px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap text-[#1B1B18]">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end">
                <div className="max-w-[75%] rounded-lg rounded-br-sm border border-border px-5 py-3 text-[15px] leading-relaxed whitespace-pre-wrap text-right text-foreground">
                  {m.content}
                </div>
              </div>
            )
          )}

          {streaming && (
            <div className="flex justify-start">
              {streamText ? (
                <div className="max-w-[80%] rounded-lg rounded-bl-sm bg-accent px-5 py-3.5 text-[15px] leading-relaxed whitespace-pre-wrap text-[#1B1B18]">
                  {streamText}
                </div>
              ) : (
                <div className="flex gap-1.5 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent fh-dot" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent fh-dot [animation-delay:200ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent fh-dot [animation-delay:400ms]" />
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="mono text-[11px] tracking-[0.04em] text-[#F2777A]">{error}</p>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border bg-surface px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {detail?.acceptsArtifacts && detail.artifacts.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {detail.artifacts.map((a) => (
                <span
                  key={`${a.name}-${a.uploadedAt}`}
                  className="mono rounded-sm border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.04em] text-muted"
                >
                  {a.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-stretch gap-2.5">
            {detail?.acceptsArtifacts && (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,.md,.csv,.pdf,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onFile(f);
                  }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || streaming}
                  title="Attach a document"
                  className="shrink-0 rounded-md border border-border px-3 text-muted transition hover:border-accent/40 hover:text-accent disabled:opacity-40 cursor-pointer"
                >
                  <IconPaperclip size={18} stroke={1.75} />
                </button>
              </>
            )}

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim()) void send(input);
                }
              }}
              rows={2}
              disabled={streaming}
              placeholder="Type your answer…"
              className="flex-1 resize-none rounded-md border border-border bg-background px-4 py-3 text-[15px] text-foreground placeholder:text-faint transition focus:border-accent/60 focus:outline-none disabled:opacity-60"
            />

            <button
              onClick={() => input.trim() && send(input)}
              disabled={streaming || !input.trim()}
              className="mono shrink-0 cursor-pointer rounded-md border border-accent/70 bg-transparent px-7 text-[12px] uppercase tracking-[0.08em] text-accent transition hover:bg-accent hover:text-[#1B1B18] disabled:opacity-40"
            >
              Send
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="mono text-[10px] tracking-[0.04em] text-faint">
              {uploading ? "Reading your document…" : "Shift + Enter for a new line"}
            </p>
            {messages.filter((m) => m.role === "user").length >= 3 && (
              <div className="w-[200px]">
                <ClipButton onClick={finish} variant="tan">
                  I&apos;m done for now
                </ClipButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
