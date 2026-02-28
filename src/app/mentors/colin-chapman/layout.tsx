import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Colin Chapman | GTM & Outbound for B2B Tech Founders",
  description:
    "25 years of B2B sales distilled into an AI agent. Get outbound strategy, ICP clarity, and pipeline diagnosis from Colin's frameworks, anytime.",
  openGraph: {
    title: "Colin Chapman | GTM & Outbound for B2B Tech Founders",
    description:
      "25 years of B2B sales distilled into an AI agent. Get outbound strategy, ICP clarity, and pipeline diagnosis from Colin's frameworks, anytime.",
    url: "https://forgehouse.io/mentors/colin-chapman",
    type: "profile",
    siteName: "ForgeHouse",
  },
  twitter: {
    card: "summary_large_image",
    title: "Colin Chapman | GTM & Outbound for B2B Tech Founders",
    description:
      "25 years of B2B sales distilled into an AI agent. Get outbound strategy, ICP clarity, and pipeline diagnosis from Colin's frameworks, anytime.",
  },
};

export default function ColinChapmanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
