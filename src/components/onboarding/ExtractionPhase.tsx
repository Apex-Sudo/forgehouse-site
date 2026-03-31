"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface OnboardingSession {
  id: string;
  mentorName: string;
  email: string;
  currentPhase: "extraction" | "calibration" | "ingestion" | "complete";
  extractionData: any;
  calibrationData: any;
  ingestionData: any;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface ExtractionPhaseProps {
  session: OnboardingSession;
  onUpdate: (updates: Partial<OnboardingSession>) => Promise<void>;
  onAdvance: () => void;
}

export default function ExtractionPhase({ session, onUpdate, onAdvance }: ExtractionPhaseProps) {
  const [messages, setMessages] = useState<Message[]>(session.extractionData?.messages || []);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [uploadedCV, setUploadedCV] = useState<{ filename: string; content: string } | null>(session.extractionData?.cv || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, streaming]);

  // Check if extraction is complete (based on exchange count)
  useEffect(() => {
    const exchangeCount = messages.filter((m) => m.role === "user").length;
    if (exchangeCount >= 60) {
      setShowCompletion(true);
    }
  }, [messages]);

  // Save progress to session (debounced)
  useEffect(() => {
    const saveProgress = async () => {
      if (messages.length > 0 || uploadedCV) {
        await onUpdate({
          extractionData: {
            messages,
            cv: uploadedCV,
            updatedAt: new Date().toISOString()
          }
        });
      }
    };
    
    // Debounce the save to avoid too many requests
    const timer = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timer);
  }, [messages, uploadedCV, onUpdate]);

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
      
      // Immediately save the CV data to the session
      await onUpdate({
        extractionData: {
          messages,
          cv: data,
          updatedAt: new Date().toISOString()
        }
      });
      
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

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        setMessages([...updated, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setMessages([...updated, { role: "assistant", content: assistantContent }]);
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

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...updated, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([...updated, { role: "assistant", content: assistantContent }]);
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

  // Show completion screen when extraction is finished
  if (showCompletion) {
    return (
      <div className="flex flex-col flex-1 min-h-0 bg-[#FAFAF8]">
        {/* Completion Screen */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">Extraction Complete!</h2>
              <p className="text-[#737373] max-w-md mx-auto mb-8">
                Your expertise has been successfully captured. Now you will refine your agent further through additional conversations.
              </p>
              <div className="bg-amber/10 rounded-xl p-6 mb-8 text-left">
                <h3 className="font-bold text-[#1A1A1A] mb-2">What happens next:</h3>
                <ul className="list-disc pl-5 space-y-2 text-[#737373]">
                  <li>Your mentor agent will be trained with this knowledge</li>
                  <li>You will now refine your agent further through additional conversations</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={onAdvance}
                  className="bg-amber text-white px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                >
                  Continue to Calibration →
                </button>
                <button
                  onClick={() => {
                    setMessages([]);
                    setShowCompletion(false);
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

  const showComposer = !showCompletion && messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-[#FAFAF8]">
      <div
        ref={messagesScrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain px-6 py-4 [overflow-anchor:none]"
      >
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="text-center">
              {/* Time estimate */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6 max-w-md mx-auto">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">⏱️</span>
                  <p className="text-[#737373] text-sm">
                    <span className="font-semibold">Time estimate:</span> 1-2 hours to complete thoroughly. Your progress is automatically saved.
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
        </div>
      </div>

      {showComposer && (
        <div
          className="shrink-0 border-t border-[#E5E2DC] bg-white py-3 shadow-[0_-6px_24px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl space-y-3 px-6">
            <div>
              <div className="mb-1 flex justify-between text-xs text-[#999]">
                <span>Progress</span>
                <span>{Math.min(100, Math.round((exchangeCount / 3) * 100))}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#F5F5F5]">
                <div
                  className="h-2 rounded-full bg-amber transition-all duration-300"
                  style={{ width: `${Math.min(100, (exchangeCount / 3) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-[#999]">
                {exchangeCount} of ~3 exchanges completed
              </div>
            </div>

            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thinking..."
                rows={2}
                className="flex-1 resize-none rounded-xl border border-[#E5E2DC] bg-white px-4 py-3 text-[15px] text-[#1A1A1A] placeholder:text-[#C5C0B8] focus:border-amber/50 focus:outline-none"
                disabled={streaming}
              />
              <button
                type="button"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                className="self-end rounded-xl bg-amber px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {streaming ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
