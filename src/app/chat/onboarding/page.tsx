"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { IconUserCircle, IconArrowRight } from "@tabler/icons-react";
import { parseStreamChunk } from "@/lib/agent/helper/stream";
import ChatMessage from "@/components/ChatMessage";
import { useTokenBuffer } from "@/hooks/useTokenBuffer";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hey! I'd love to learn about your business so our mentors can give you the most relevant advice. Let's start simple: what does your company do?",
};

function OnboardingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/chat/colin-chapman";
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
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
        body: JSON.stringify({ messages: updated.slice(0, -1) }),
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

      if (finalContent.includes("[PROFILE_COMPLETE]")) {
        const cleanContent = finalContent.replace("[PROFILE_COMPLETE]", "").trim();
        const apiMessages = updated.slice(0, -1);
        const finalMessages = [...apiMessages, { role: "assistant" as const, content: cleanContent }];
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: cleanContent };
          return copy;
        });
        await extractProfile(finalMessages);
      } else {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: finalContent };
          return copy;
        });
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
      <div className="flex flex-col h-screen items-center justify-center">
        <span className="animate-pulse text-muted text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 py-3">
      <div className="flex-1 flex justify-center min-h-0">
        <div className="w-full max-w-5xl glass-card flex flex-col overflow-hidden shadow-[0_0_24px_rgba(184,145,106,0.12)] border-[rgba(184,145,106,0.2)] h-full">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-foreground/[0.08]">
            <IconUserCircle size={24} className="text-amber shrink-0" />
            <div className="flex-1">
              <h1 className="font-bold text-sm">Set Up Your Profile</h1>
              <p className="text-xs text-muted">Tell us about your business so our mentors can give you tailored advice</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
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
                <div className="bg-amber/10 border border-amber/20 rounded-xl px-5 py-3 text-sm text-amber animate-pulse">
                  Saving your profile...
                </div>
              </div>
            )}

            {profileComplete && (
              <div className="flex justify-center">
                <div className="bg-[#F5F3F0] border border-foreground/[0.08] rounded-2xl px-8 py-6 text-center max-w-md">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-xl">✓</span>
                  </div>
                  <p className="text-foreground font-medium mb-1">You&apos;re all set.</p>
                  <p className="text-sm text-muted mb-5">Colin now knows your business and can give you tailored advice.</p>
                  <button
                    onClick={() => router.push(redirectTo)}
                    className="inline-flex items-center gap-2 bg-amber text-black px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber/90 transition cursor-pointer"
                  >
                    Continue <IconArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          {!profileComplete && (
            <div className="border-t border-foreground/[0.08] px-6 py-4">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell us about your business..."
                  rows={1}
                  className="flex-1 bg-[#F5F3F0] border border-foreground/[0.08] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-amber/40 transition resize-none"
                />
                <button
                  onClick={() => send()}
                  disabled={streaming}
                  className="bg-amber text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-amber/90 transition disabled:opacity-50 cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
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
