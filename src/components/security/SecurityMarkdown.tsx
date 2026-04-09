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
        className="my-6 rounded-xl border border-neutral-200 bg-white p-5 text-sm text-neutral-800 shadow-sm"
        aria-label="High-level system data flow"
      >
        <figcaption className="font-semibold text-neutral-950 mb-3">High-level data flow</figcaption>
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
            <g fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500">
              <rect x="20" y="40" width="170" height="56" rx="14" className="fill-white stroke-neutral-300" />
              <rect x="230" y="40" width="210" height="56" rx="14" className="fill-white stroke-neutral-300" />
              <rect x="480" y="12" width="170" height="44" rx="14" className="fill-white stroke-neutral-300" />
              <rect x="480" y="84" width="170" height="44" rx="14" className="fill-white stroke-neutral-300" />
              <rect x="670" y="48" width="170" height="44" rx="14" className="fill-white stroke-neutral-300" />

              <line x1="190" y1="68" x2="230" y2="68" markerEnd="url(#arrow)" />
              <line x1="440" y1="56" x2="480" y2="34" markerEnd="url(#arrow)" />
              <line x1="440" y1="80" x2="480" y2="106" markerEnd="url(#arrow)" />
              <line x1="650" y1="68" x2="670" y2="70" markerEnd="url(#arrow)" />
            </g>
            <g className="text-neutral-950" fontFamily="ui-sans-serif, system-ui, -apple-system" fontSize="14" fontWeight="600">
              <text x="105" y="74" textAnchor="middle">User client</text>
              <text x="335" y="74" textAnchor="middle">ForgeHouse app</text>
              <text x="565" y="38" textAnchor="middle">Managed database</text>
              <text x="565" y="110" textAnchor="middle">Payment processor</text>
              <text x="755" y="76" textAnchor="middle">AI providers</text>
            </g>
            <g className="text-neutral-600" fontFamily="ui-sans-serif, system-ui, -apple-system" fontSize="12" fontWeight="600">
              <text x="210" y="56" textAnchor="middle">TLS</text>
            </g>
          </svg>
        </div>
        <ul className="mt-4 list-disc list-inside space-y-1 text-neutral-700">
          <li>Traffic between user devices and the application is protected using TLS (HTTPS).</li>
          <li>The application connects to managed services (database, payments, AI) over encrypted channels.</li>
        </ul>
      </figure>
    );
  }
  return (
    <pre className="overflow-x-auto rounded-xl bg-neutral-950 p-4 text-sm my-4 text-neutral-100">
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
          <h1 className="text-3xl font-bold mb-8 text-neutral-950">{children}</h1>
        ),
        h2: ({ children }) => {
          const id = slugifyHeading(textFromNode(children));
          return (
            <h2 id={id} className="scroll-mt-20 text-xl font-semibold text-neutral-950 mb-3 mt-10">
              {children}
            </h2>
          );
        },
        h3: ({ children }) => (
          <h3 className="text-lg font-semibold text-neutral-950 mb-2 mt-6">{children}</h3>
        ),
        p: ({ children }) => <p className="text-neutral-800 leading-relaxed mb-4">{children}</p>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-2 text-neutral-800 mb-4">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-2 text-neutral-800 mb-4">{children}</ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        a: ({ href, children }) => (
          <a href={href} className="text-amber-700 underline-offset-2 hover:underline">
            {children}
          </a>
        ),
        strong: ({ children }) => <strong className="font-semibold text-neutral-950">{children}</strong>,
        hr: () => <hr className="my-10 border-neutral-200" />,
        code: ({ className, children }) => {
          const isBlock = typeof className === "string" && className.startsWith("language-");
          if (isBlock) {
            return <code className={className}>{children}</code>;
          }
          return (
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm text-neutral-900 ring-1 ring-neutral-200">
              {children}
            </code>
          );
        },
        pre: Pre,
        table: ({ children }) => (
          <div className="my-4 w-full overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full min-w-[32rem] border-collapse text-left text-sm text-neutral-800">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-neutral-100 text-neutral-950">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-neutral-200 bg-white">{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-neutral-200 last:border-0">{children}</tr>,
        th: ({ children }) => (
          <th className="border-b border-neutral-200 px-3 py-2 font-semibold first:pl-4 last:pr-4">{children}</th>
        ),
        td: ({ children }) => (
          <td className="align-top px-3 py-2 first:pl-4 last:pr-4">{children}</td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
