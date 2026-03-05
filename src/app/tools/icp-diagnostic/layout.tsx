import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free ICP Diagnostic | ForgeHouse",
  description:
    "Define your ideal customer profile in 60 seconds. Built on the Jobs-to-be-Done framework by Colin Chapman. Free, no login required.",
  openGraph: {
    title: "Free ICP Diagnostic | ForgeHouse",
    description:
      "Define your ideal customer profile in 60 seconds. Built on the Jobs-to-be-Done framework.",
    url: "https://forgehouse.io/tools/icp-diagnostic",
    siteName: "ForgeHouse",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
