"use client";
import { useState } from "react";

interface Message {
  role: "agent" | "user";
  text: string;
}

export default function ChatApex() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "agent", text: "What's the decision you're trying to make?" },
  ]);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", text: input.trim() },
      { role: "agent", text: "This is a preview. Apex isn't connected yet — but when it is, this is where the real conversation starts." },
    ]);
    setInput("");
  };

  return (
    <div className="pt-16 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">🔺</span>
        <div>
          <h1 className="font-bold">Apex</h1>
          <p className="text-xs text-muted">Decision-making partner</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] md:max-w-[60%] px-5 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-amber text-background"
                  : "bg-surface border border-border text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your message..."
            className="flex-1 bg-surface border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-amber/60 transition"
          />
          <button
            onClick={send}
            className="bg-amber text-background px-6 py-3 font-semibold text-sm hover:bg-amber-dark transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
