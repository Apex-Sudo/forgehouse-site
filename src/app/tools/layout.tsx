import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Sales & GTM Tools | ForgeHouse",
  description: "Free diagnostic tools for founders: ICP builder, cold email teardown, pipeline diagnosis, and outbound planner. No signup required.",
  openGraph: {
    title: "Free Sales & GTM Tools | ForgeHouse",
    description: "Free diagnostic tools for founders: ICP builder, cold email teardown, pipeline diagnosis, and outbound planner. No signup required.",
    url: "https://forgehouse.io/tools",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
