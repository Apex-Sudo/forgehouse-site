"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/sign-in?callbackUrl=/account";
      return;
    }
    if (!session?.user) return;
    fetch("/api/insights?mentor=colin-chapman")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setIsSubscribed(data.isSubscribed);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, status]);

  // Fetch existing API key when subscribed
  useEffect(() => {
    if (!isSubscribed || loading) return;
    setApiKeyLoading(true);
    fetch("/api/v1/api-key")
      .then(async (r) => {
        if (r.ok) {
          const data = await r.json();
          setApiKey(data.api_key);
        }
      })
      .catch(() => {})
      .finally(() => setApiKeyLoading(false));
  }, [isSubscribed, loading]);

  const generateApiKey = async () => {
    setGeneratingKey(true);
    try {
      const res = await fetch("/api/v1/api-key", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.api_key);
        setApiKeyRevealed(true); // Show it immediately on first generation
      }
    } catch { /* silent */ }
    setGeneratingKey(false);
  };

  const copyApiKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const maskKey = (key: string) => {
    return key.slice(0, 7) + "•".repeat(20) + key.slice(-4);
  };

  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <span className="mono animate-pulse text-muted text-[12px] tracking-[0.04em]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="pt-4 h-full overflow-y-auto bg-background">
      <div className="max-w-[1008px] mx-auto px-6 py-10">
        <p className="mono text-[13px] text-accent mb-4">Settings</p>
        <h1 className="text-[44px] md:text-[56px] leading-[0.92] tracking-[-0.02em] mb-10">Account</h1>

        {/* Profile */}
        <div className="bg-surface border border-border rounded-lg px-6 py-5 mb-[30px]">
          <div className="flex items-center gap-4">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-surface-light border border-border flex items-center justify-center mono text-[16px] text-foreground">
                {session?.user?.name?.[0] ?? "?"}
              </div>
            )}
            <div>
              <p className="text-[22px] leading-none text-foreground">{session?.user?.name}</p>
              <p className="mono text-[12px] text-muted mt-2">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-surface border border-border rounded-lg px-6 py-5 mb-[30px]">
          <h2 className="text-[26px] text-foreground mb-4">Subscription</h2>
          {isSubscribed ? (
            <div>
              <div className="inline-flex items-center gap-2 rounded border border-accent/25 bg-accent/15 px-2.5 py-1 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <p className="mono text-[10px] uppercase tracking-[0.08em] text-accent">Active subscription</p>
              </div>
              <p className="mono text-[12px] text-muted mb-5">
                Subscribed mentors: Colin Chapman
              </p>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch("/api/portal", { method: "POST" });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch { /* silent */ }
                }}
                className="mono border border-border text-foreground text-[12px] tracking-[0.02em] px-4 py-2 rounded-lg hover:bg-surface-light transition cursor-pointer"
              >
                Manage billing
              </button>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center gap-2 rounded border border-border bg-white/8 px-2.5 py-1 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-faint" />
                <p className="mono text-[10px] uppercase tracking-[0.08em] text-muted">Free tier</p>
              </div>
              <p className="text-[16px] leading-[1.45] text-muted mb-6 max-w-[560px]">
                Upgrade to get unlimited conversations, saved insights, and full access to all mentors.
              </p>
              <Link
                href="/pricing"
                className="mono inline-block bg-accent text-[#1B1B18] text-[12px] tracking-[0.02em] px-4 py-2 rounded-lg hover:bg-accent-dim transition"
              >
                View pricing
              </Link>
            </div>
          )}
        </div>

        {/* API Access */}
        {isSubscribed && (
          <div className="bg-surface border border-border rounded-lg px-6 py-5 mb-[30px]">
            <h2 className="text-[26px] text-foreground mb-3">API Access</h2>
            <p className="text-[16px] leading-[1.45] text-muted mb-6 max-w-[640px]">
              Connect your AI agent (OpenClaw, Claude Code, Cursor) directly to ForgeHouse mentors via API or MCP.
            </p>

            {apiKeyLoading ? (
              <span className="mono animate-pulse text-muted text-[12px]">Loading...</span>
            ) : apiKey ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <code className="mono bg-background border border-border rounded-lg px-3 py-2 text-[12px] text-foreground flex-1 overflow-hidden text-ellipsis">
                    {apiKeyRevealed ? apiKey : maskKey(apiKey)}
                  </code>
                  <button
                    onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
                    className="mono border border-border text-foreground text-[11px] tracking-[0.02em] px-3 py-2 rounded-lg hover:bg-surface-light transition cursor-pointer"
                  >
                    {apiKeyRevealed ? "Hide" : "Reveal"}
                  </button>
                  <button
                    onClick={copyApiKey}
                    className="mono border border-border text-foreground text-[11px] tracking-[0.02em] px-3 py-2 rounded-lg hover:bg-surface-light transition cursor-pointer"
                  >
                    {apiKeyCopied ? "Copied!" : "Copy"}
                  </button>
                </div>
                <button
                  onClick={generateApiKey}
                  disabled={generatingKey}
                  className="mono text-[11px] text-muted hover:text-foreground transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generatingKey ? "Generating..." : "Regenerate key"} (revokes current)
                </button>

                {/* Quick start */}
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="mono text-[11px] uppercase tracking-[0.06em] text-faint mb-3">Quick start</p>

                  <div className="mb-4">
                    <p className="mono text-[11px] uppercase tracking-[0.06em] text-faint mb-2">cURL:</p>
                    <pre className="mono bg-background border border-border rounded-lg p-3 text-[11px] leading-[1.7] text-muted overflow-x-auto whitespace-pre-wrap break-all">
{`curl -X POST https://forgehouse.io/api/v1/chat \\
  -H "Authorization: Bearer ${apiKeyRevealed ? apiKey : "fh_..."}" \\
  -H "Content-Type: application/json" \\
  -d '{"mentor":"colin-chapman","message":"Your question here","stream":false}'`}
                    </pre>
                  </div>

                  <div>
                    <p className="mono text-[11px] uppercase tracking-[0.06em] text-faint mb-2">MCP (OpenClaw / Claude Code / Cursor):</p>
                    <pre className="mono bg-background border border-border rounded-lg p-3 text-[11px] leading-[1.7] text-muted overflow-x-auto whitespace-pre-wrap break-all">
{`{
  "mcpServers": {
    "forgehouse": {
      "command": "npx",
      "args": ["-y", "@forgehouse/mcp-server"],
      "env": {
        "FORGEHOUSE_API_KEY": "${apiKeyRevealed ? apiKey : "fh_..."}"
      }
    }
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={generateApiKey}
                disabled={generatingKey}
                className="mono bg-accent text-[#1B1B18] text-[12px] tracking-[0.02em] px-4 py-2 rounded-lg hover:bg-accent-dim transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {generatingKey ? "Generating..." : "Generate API key"}
              </button>
            )}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mono text-[12px] tracking-[0.02em] text-muted hover:text-foreground transition cursor-pointer"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
