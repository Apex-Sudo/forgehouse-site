"use client";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconUserCircle, IconArrowRight } from "@tabler/icons-react";
import { parseStreamChunk } from "@/lib/agent/helper/stream";
import { useTokenBuffer } from "@/hooks/useTokenBuffer";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hey! I'd love to learn about your business so our mentors can give you the most relevant advice. Let's start simple: what does your company do?",
};

function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/chat/colin-chapman";
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const tokenBuffer = useTokenBuffer((content) => {
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { role: "assistant", content };
      return copy;
    });
  });

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in?callbackUrl=/chat/onboarding");
    }
  }, [status, router]);

  const extractProfile = async (allMessages: Message[]) => {
    setExtracting(true);
    try {
      await fetch("/api/profile/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: allMessages }),
      });
    } catch {
      // Silent fail, profile extraction is best-effort
    }
    setExtracting(false);
    setProfileComplete(true);
  };

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || streaming || profileComplete) return;

    const userMsg: Message = { role: "user", content: text };
    const updated = [...messages, userMsg, { role: "assistant" as const, content: "" }];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/onboarding-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: err.error || "Something went wrong." };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let ndjsonBuffer = "";
      tokenBuffer.reset();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = decoder.decode(value, { stream: true });
        const { events, remaining } = parseStreamChunk(raw, ndjsonBuffer);
        ndjsonBuffer = remaining;

        for (const event of events) {
          if (event.type === "text") {
            tokenBuffer.push(event.content);
          } else if (event.type === "error") {
            tokenBuffer.push(`\n[Error: ${event.message}]`);
          }
        }
      }

      const finalContent = tokenBuffer.flush();
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: finalContent };
        return copy;
      });

      if (finalContent.includes("[PROFILE_COMPLETE]")) {
        const cleanContent = finalContent.replace("[PROFILE_COMPLETE]", "").trim();
        const finalMessages = [...messages, userMsg, { role: "assistant" as const, content: cleanContent }];
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: cleanContent };
          return copy;
        });
        await extractProfile(finalMessages);
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: "Connection error. Please try again." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-background">
        <span className="mono animate-pulse text-muted text-[11px] tracking-[0.1em] uppercase">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background px-5 py-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col h-full min-h-0 gap-4">
        {/* Eyebrow */}
        <div className="flex justify-end shrink-0">
          <span className="mono text-[12px] tracking-[0.1em] uppercase text-muted">Trained Experts</span>
        </div>

        {/* Header card */}
        <div className="bg-surface border border-accent/60 rounded-lg px-7 py-6 flex items-start gap-4 shrink-0">
          <IconUserCircle size={26} stroke={1.3} className="text-accent shrink-0 mt-1.5" />
          <div className="flex-1 min-w-0">
            <h1 className="text-[40px] leading-[0.95] uppercase text-foreground">Set Up Your Profile</h1>
            <p className="text-[19px] italic leading-tight text-accent mt-1.5">
              Tell us about your business so our mentors can give you tailored advice
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 min-h-0 overflow-y-auto fh-scroll bg-surface rounded-lg px-7 py-7 space-y-6">
          {messages.map((m, i) => (
            <ChatMessage
              key={i}
              role={m.role}
              content={m.content}
              isStreaming={streaming && i === messages.length - 1 && m.role === "assistant"}
            />
          ))}

          {extracting && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 bg-background border border-border rounded-md px-5 py-3">
                <svg className="animate-spin h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="mono text-muted text-[11px] tracking-[0.06em] uppercase">Saving your profile...</span>
              </div>
            </div>
          )}

          {profileComplete && (
            <div className="flex justify-center">
              <div className="bg-background border border-accent/40 rounded-lg px-8 py-7 text-center max-w-md">
                <div className="w-12 h-12 rounded-full border border-accent/50 flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent text-xl">✓</span>
                </div>
                <p className="text-[26px] leading-none text-foreground mb-2">You&apos;re all set.</p>
                <p className="mono text-[11px] leading-relaxed tracking-[0.02em] text-muted mb-6">Colin now knows your business and can give you tailored advice.</p>
                <button
                  onClick={() => router.push(redirectTo)}
                  className="mono inline-flex items-center gap-2 bg-accent text-[#1B1B18] px-5 py-3 rounded-md text-[12px] tracking-[0.06em] uppercase hover:bg-accent-dim transition cursor-pointer"
                >
                  Continue <IconArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {!profileComplete && (
          <div className="shrink-0">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell us about your business..."
                rows={1}
                className="flex-1 bg-surface border border-border rounded-md px-5 py-3.5 text-[15px] text-foreground placeholder:text-faint focus:outline-none focus:border-accent/50 transition resize-none"
              />
              <button
                onClick={() => send()}
                disabled={streaming}
                className="mono shrink-0 bg-transparent text-accent border border-accent/70 px-7 rounded-md text-[12px] tracking-[0.08em] uppercase hover:bg-accent hover:text-[#1B1B18] transition disabled:opacity-40 cursor-pointer"
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnboardingChat() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}
