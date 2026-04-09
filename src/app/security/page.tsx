import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { SecurityMarkdown } from "@/components/security/SecurityMarkdown";

export const metadata: Metadata = {
  title: "Security | ForgeHouse",
  description: "How ForgeHouse approaches security and data protection.",
};

export default function SecurityPage() {
  const filePath = path.join(process.cwd(), "docs", "SECURITY-WHITEPAPER.md");
  const content = fs.readFileSync(filePath, "utf8");

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <SecurityMarkdown content={content} />
    </main>
  );
}
