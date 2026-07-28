"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function textFromNode(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(textFromNode).join("");
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node) && node.props.children !== undefined) {
    return textFromNode(node.props.children);
  }
  return "";
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-");
}

type PreProps = React.ComponentPropsWithoutRef<"pre"> & { children?: React.ReactNode };

function Pre({ children }: PreProps) {
  const arr = React.Children.toArray(children);
  const codeEl = arr[0] as React.ReactElement<{ className?: string }> | undefined;
  const className = codeEl?.props?.className;
  if (typeof className === "string" && className.includes("language-mermaid")) {
    return (
      <figure
        className="my-8 rounded-lg border border-border bg-surface p-5 text-[16px] text-foreground/80"
        aria-label="High-level system data flow"
      >
        <figcaption className="mono text-[11px] tracking-[0.06em] uppercase text-accent mb-4">
          High-level data flow
        </figcaption>
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 860 140"
            role="img"
            aria-label="User client connects to ForgeHouse application, which connects to managed database, payment processor, and AI providers."
            className="min-w-[860px]"
          >
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
              </marker>
            </defs>
            <g fill="none" stroke="currentColor" strokeWidth="2" className="text-muted">
              <rect x="20" y="40" width="170" height="56" rx="6" fill="#181815" stroke="rgba(235,236,236,0.2)" />
              <rect x="230" y="40" width="210" height="56" rx="6" fill="#181815" stroke="#CAED57" />
              <rect x="480" y="12" width="170" height="44" rx="6" fill="#181815" stroke="rgba(235,236,236,0.2)" />
              <rect x="480" y="84" width="170" height="44" rx="6" fill="#181815" stroke="rgba(235,236,236,0.2)" />
              <rect x="670" y="48" width="170" height="44" rx="6" fill="#181815" stroke="rgba(235,236,236,0.2)" />

              <line x1="190" y1="68" x2="230" y2="68" markerEnd="url(#arrow)" />
              <line x1="440" y1="56" x2="480" y2="34" markerEnd="url(#arrow)" />
              <line x1="440" y1="80" x2="480" y2="106" markerEnd="url(#arrow)" />
              <line x1="650" y1="68" x2="670" y2="70" markerEnd="url(#arrow)" />
            </g>
            <g className="mono fill-[#EBECEC]" fontSize="13">
              <text x="105" y="73" textAnchor="middle">User client</text>
              <text x="335" y="73" textAnchor="middle">ForgeHouse app</text>
              <text x="565" y="38" textAnchor="middle">Managed database</text>
              <text x="565" y="110" textAnchor="middle">Payment processor</text>
              <text x="755" y="75" textAnchor="middle">AI providers</text>
            </g>
            <g className="mono fill-[#CAED57]" fontSize="11">
              <text x="210" y="56" textAnchor="middle">TLS</text>
            </g>
          </svg>
        </div>
        <ul className="mt-5 list-disc list-outside pl-5 space-y-2 text-[16px] leading-[1.7] text-foreground/70">
          <li>Traffic between user devices and the application is protected using TLS (HTTPS).</li>
          <li>The application connects to managed services (database, payments, AI) over encrypted channels.</li>
        </ul>
      </figure>
    );
  }
  return (
    <pre className="mono overflow-x-auto rounded-md border border-border bg-background p-4 text-[13px] leading-[1.6] my-6 text-foreground">
      {children}
    </pre>
  );
}

export function SecurityMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-[48px] md:text-[64px] leading-[0.95] tracking-[-0.015em] text-paper mb-8">
            {children}
          </h1>
        ),
        h2: ({ children }) => {
          const id = slugifyHeading(textFromNode(children));
          return (
            <h2 id={id} className="scroll-mt-24 text-[28px] leading-[1.15] tracking-[-0.01em] text-foreground mt-12 mb-3">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => (
          <h3 className="text-[21px] leading-[1.25] text-foreground mt-8 mb-2">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="mono text-[11px] tracking-[0.06em] uppercase text-accent mt-6 mb-2">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-[16px] leading-[1.7] text-foreground/70 mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside pl-5 space-y-2 text-[16px] leading-[1.7] text-foreground/70 mb-5">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside pl-5 space-y-2 text-[16px] leading-[1.7] text-foreground/70 mb-5">
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-[1.7]">{children}</li>,
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition"
          >
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic text-muted">{children}</em>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent pl-6 my-8 text-[18px] italic text-foreground">
            {children}
          </blockquote>
        ),
        hr: () => <hr className="my-10 h-px bg-border border-0" />,
        code: ({ className, children }) => {
          const isBlock = typeof className === "string" && className.startsWith("language-");
          if (isBlock) {
            return <code className={className}>{children}</code>;
          }
          return (
            <code className="mono text-[13px] bg-background border border-border rounded px-1.5 py-0.5 text-accent">
              {children}
            </code>
          );
        },
        pre: Pre,
        table: ({ children }) => (
          <div className="my-6 w-full overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[32rem] border-collapse text-left">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-surface">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-border bg-surface/40">{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border last:border-0">{children}</tr>,
        th: ({ children }) => (
          <th className="mono text-[11px] tracking-[0.06em] uppercase text-muted border-b border-border px-3 py-3 first:pl-4 last:pr-4">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="align-top text-[16px] leading-[1.6] text-foreground/80 px-3 py-3 first:pl-4 last:pr-4">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
