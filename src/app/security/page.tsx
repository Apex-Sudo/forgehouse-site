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
    <main className="pt-16 md:pt-[72px]">
      <section className="px-6 pt-16 md:pt-24 pb-24">
        <div className="max-w-[720px] mx-auto">
          <p className="mono text-[13px] text-accent mb-5">Trust &amp; Security</p>
          <SecurityMarkdown content={content} />
        </div>
      </section>
    </main>
  );
}
