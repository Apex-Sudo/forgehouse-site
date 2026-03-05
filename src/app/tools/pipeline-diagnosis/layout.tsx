import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Pipeline Diagnosis | ForgeHouse",
  description:
    "Describe your last 3 lost deals and find the pattern that's killing your pipeline. Free, no login required.",
  openGraph: {
    title: "Free Pipeline Diagnosis | ForgeHouse",
    description: "Find the pattern killing your pipeline. Describe 3 lost deals, get the one fix that saves the most.",
    url: "https://forgehouse.io/tools/pipeline-diagnosis",
    siteName: "ForgeHouse",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
