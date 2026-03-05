import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Outbound Week Planner | ForgeHouse",
  description:
    "Get a concrete Mon-Fri outbound action plan with daily tasks, templates, and targets. Free, no login required.",
  openGraph: {
    title: "Free Outbound Week Planner | ForgeHouse",
    description: "A concrete Mon-Fri outbound plan built for founders. Daily tasks, templates, targets.",
    url: "https://forgehouse.io/tools/outbound-planner",
    siteName: "ForgeHouse",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
