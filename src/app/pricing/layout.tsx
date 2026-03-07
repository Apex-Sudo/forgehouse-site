import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ForgeHouse",
  description: "Free to start. Pay when you find your mentor. Platform access $47/mo, individual mentors from $1/mo.",
  openGraph: {
    title: "Pricing — ForgeHouse",
    description: "Free to start. Pay when you find your mentor. Platform access $47/mo, individual mentors from $1/mo.",
    url: "https://forgehouse.io/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
