import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Cold Email Teardown | ForgeHouse",
  description:
    "Paste your cold email and get a line-by-line diagnosis plus a rewrite using the Problem-Impact-Proof framework. Free, no login required.",
  openGraph: {
    title: "Free Cold Email Teardown | ForgeHouse",
    description:
      "Get your cold email torn apart and rewritten. Built on Colin Chapman's Problem-Impact-Proof framework.",
    url: "https://forgehouse.io/tools/cold-email-teardown",
    siteName: "ForgeHouse",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
