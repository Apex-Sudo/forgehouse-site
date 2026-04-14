"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatMessage from "@/components/ChatMessage";
import {
  EXTRACTION_EXCHANGE_ESCAPE_HATCH,
  parseExtractionAssistantPayload,
  stripExtractionMetaForDisplay,
} from "@/lib/extraction-meta";
import { readNdjsonStream } from "@/lib/agent/helper/stream";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ExtractionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<{ filename: string; content: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [llmMarkedComplete, setLlmMarkedComplete] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load saved extraction session
  useEffect(() => {
    if (status === "authenticated") {
      const saved = localStorage.getItem("fh-extraction-session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed)) {
            setMessages(parsed as Message[]);
          } else if (
            parsed &&
            typeof parsed === "object" &&
            "messages" in parsed &&
            Array.isArray((parsed as { messages: Message[] }).messages)
          ) {
            const { messages: savedMsgs, llmMarkedComplete: savedLlm } = parsed as {
              messages: Message[];
              llmMarkedComplete?: boolean;
            };
            setMessages(savedMsgs);
            setLlmMarkedComplete(Boolean(savedLlm));
          }
        } catch (e) {
          console.error("Failed to parse saved extraction session", e);
        }
      }
    }
  }, [status]);

  // Save on every update
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        "fh-extraction-session",
        JSON.stringify({ messages, llmMarkedComplete }),
      );
    }
  }, [messages, llmMarkedComplete]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in?callbackUrl=/extraction");
    }
  }, [status, router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Upload failed" }));
        alert(err.error || "Failed to upload CV");
        return;
      }

      const data = await res.json();
      setUploadedCV(data);
      
      // Send a message to the assistant about the uploaded CV
      const cvMsg: Message = { 
        role: "user", 
        content: `I've uploaded my CV/resume: ${data.filename}. Please use this information to inform our conversation.` 
      };
      const updated = [...messages, cvMsg];
      setMessages(updated);
      setStreaming(true);

      // Process the CV with the extraction chat API
      try {
        const res = await fetch("/api/extraction-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updated, cvContent: data.content }),
        });

        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          setMessages([...updated, { role: "assistant", content: `Error: ${err.error || "Something went wrong."}` }]);
          setStreaming(false);
          return;
        }

        setMessages([...updated, { role: "assistant", content: "" }]);

        const assistantContent = await readNdjsonStream(res.body, (accumulated) => {
          const visible = stripExtractionMetaForDisplay(accumulated);
          setMessages([...updated, { role: "assistant", content: visible }]);
        });
        const parsed = parseExtractionAssistantPayload(assistantContent);
        setMessages([...updated, { role: "assistant", content: parsed.display }]);
        if (parsed.complete) {
          setLlmMarkedComplete(true);
        }
      } catch {
        setMessages([...updated, { role: "assistant", content: "Error: Connection failed. Please try again." }]);
      } finally {
        setStreaming(false);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload CV");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch("/api/extraction-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: updated,
          cvContent: uploadedCV?.content 
        }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setMessages([...updated, { role: "assistant", content: `Error: ${err.error || "Something went wrong."}` }]);
        setStreaming(false);
        return;
      }

      setMessages([...updated, { role: "assistant", content: "" }]);

      const assistantContent = await readNdjsonStream(res.body, (accumulated) => {
        const visible = stripExtractionMetaForDisplay(accumulated);
        setMessages([...updated, { role: "assistant", content: visible }]);
      });
      const parsed = parseExtractionAssistantPayload(assistantContent);
      setMessages([...updated, { role: "assistant", content: parsed.display }]);
      if (parsed.complete) {
        setLlmMarkedComplete(true);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Error: Connection failed. Please try again." }]);
    } finally {
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const exchangeCount = messages.filter((m) => m.role === "user").length;
  const hitExchangeEscapeHatch =
    exchangeCount >= EXTRACTION_EXCHANGE_ESCAPE_HATCH && !streaming;
  const showCompletion = llmMarkedComplete || hitExchangeEscapeHatch;

  const completionSubtext = llmMarkedComplete
    ? hitExchangeEscapeHatch
      ? "The guide signaled you are ready, and you have also reached the depth where you can move on whenever you like."
      : "The guide signaled your expertise is captured well enough to proceed."
    : "You have reached the minimum conversation depth—you can finish here or restart to add more.";

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#999]">Loading...</p>
      </div>
    );
  }

  // Show completion screen when extraction is finished
  if (showCompletion) {
    return (
      <div className="flex flex-col h-screen bg-[#FAFAF8]">
        {/* Header */}
        <div className="border-b border-[#E5E2DC] bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#1A1A1A]">Mentor Extraction Complete</h1>
              <p className="text-sm text-[#999]">
                {session?.user?.name ? `Session with ${session.user.name}` : "Building your mentor agent"}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Screen */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Extraction complete</h2>
              <p className="text-[#737373] max-w-md mx-auto mb-8">
                {completionSubtext}
              </p>
              <div className="bg-amber/10 rounded-xl p-6 mb-8 text-left">
                <ul className="list-disc pl-5 space-y-2 text-[#737373]">
                  <li>Your mentor agent will be trained with this knowledge</li>
                  <li>You'll receive an email notification when your agent is ready</li>
                  <li>You can refine your agent further through additional conversations</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push("/mentors")}
                  className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                >
                  {llmMarkedComplete ? "Continue when ready" : "I have said enough — done"}
                </button>
                <button
                  onClick={() => {
                    setMessages([]);
                    setLlmMarkedComplete(false);
                    localStorage.removeItem("fh-extraction-session");
                  }}
                  className="border border-[#E5E2DC] text-[#1A1A1A] px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#F5F5F5] transition"
                >
                  Restart Extraction
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAF8]">
      {/* Header */}
      <div className="border-b border-[#E5E2DC] bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#1A1A1A]">Mentor Extraction</h1>
            <p className="text-sm text-[#999]">
              {session?.user?.name ? `Session with ${session.user.name}` : "Building your mentor agent"}
              {exchangeCount > 0 && ` · ${exchangeCount} exchanges`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1.5 rounded-full bg-amber/10 text-amber font-medium">
              {exchangeCount < 10
                ? "Phase 1: Foundation"
                : exchangeCount < 20
                ? "Phase 2: Frameworks"
                : exchangeCount < 30
                ? "Phase 3: Patterns"
                : exchangeCount < EXTRACTION_EXCHANGE_ESCAPE_HATCH
                ? "Phase 4: Pressure testing"
                : "Depth target met"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🔧</span>
              </div>
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Ready to extract your expertise</h2>
              
              {/* Time estimate */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">⏱️</span>
                  <p className="text-[#737373] text-sm">
                    <span className="font-semibold">Time estimate:</span> 1-2 hours to complete thoroughly. 
                    You can pause and return anytime - your progress is automatically saved.
                  </p>
                </div>
              </div>
              
              {/* CV Upload */}
              <div className="mb-8 max-w-md mx-auto">
                <div className="border-2 border-dashed border-[#E5E2DC] rounded-xl p-6">
                  <h3 className="font-bold text-[#1A1A1A] mb-2">Speed up with your CV/Resume</h3>
                  <p className="text-[#737373] text-sm mb-4">
                    Upload your CV to skip surface-level questions and dive straight into your expertise.
                  </p>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    disabled={isUploading}
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className={`w-full py-2 rounded-lg text-sm font-medium ${
                      isUploading 
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                        : "bg-[#F5F5F5] text-[#1A1A1A] hover:bg-[#E5E2DC]"
                    }`}
                  >
                    {isUploading ? "Uploading..." : "Upload CV/Resume"}
                  </button>
                  
                  {uploadedCV && (
                    <div className="mt-3 text-xs text-green-600 flex items-center justify-center">
                      <span>✓ Uploaded: {uploadedCV.filename}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-[#737373] max-w-md mx-auto mb-8">
                This conversation will map how you think, diagnose problems, and help people.
                No prep needed. Just talk naturally.
              </p>
              <button
                onClick={() =>
                  sendMessage("Let's get started.")
                }
                className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
              >
                Start Extraction →
              </button>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Progress Bar */}
      {messages.length > 0 && (
        <div className="px-6 py-2 bg-white border-t border-[#E5E2DC]">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between text-xs text-[#999] mb-1">
              <span>Progress</span>
              <span>{Math.min(100, Math.round((exchangeCount / EXTRACTION_EXCHANGE_ESCAPE_HATCH) * 100))}%</span>
            </div>
            <div className="w-full bg-[#F5F5F5] rounded-full h-2">
              <div 
                className="bg-amber h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(100, (exchangeCount / EXTRACTION_EXCHANGE_ESCAPE_HATCH) * 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-[#999] mt-1">
              {exchangeCount} of ~{EXTRACTION_EXCHANGE_ESCAPE_HATCH} exchanges (finish earlier if the guide marks you ready)
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {messages.length > 0 && (
        <div className="border-t border-[#E5E2DC] bg-white px-6 py-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share your thinking..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-[#E5E2DC] px-4 py-3 text-[15px] focus:outline-none focus:border-amber/50 placeholder:text-[#C5C0B8]"
              disabled={streaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="self-end bg-amber text-white px-5 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40"
            >
              {streaming ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
