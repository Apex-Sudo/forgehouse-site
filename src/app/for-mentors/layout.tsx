import type { Metadata } from "next";
import "./mentors.css";

export const metadata: Metadata = {
  title: "For Mentors — Turn Your Expertise Into a 24/7 AI Agent | ForgeHouse",
  description: "Your thinking, available anytime. We build an AI agent from your real expertise. You earn revenue while you sleep.",
  openGraph: {
    title: "For Mentors — Turn Your Expertise Into a 24/7 AI Agent",
    description: "Your thinking, available anytime. We build an AI agent from your real expertise. You earn revenue while you sleep.",
    url: "https://forgehouse.io/for-mentors",
  },
};

export default function ForMentorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
