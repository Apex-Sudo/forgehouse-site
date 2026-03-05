import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Sales Tools | ForgeHouse",
  description:
    "Free tools built on real mentor frameworks. Define your ICP, fix your cold emails, diagnose your pipeline. No login required.",
  openGraph: {
    title: "Free Sales Tools | ForgeHouse",
    description: "Free tools built on real mentor frameworks. No login required.",
    url: "https://forgehouse.io/tools",
    siteName: "ForgeHouse",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
