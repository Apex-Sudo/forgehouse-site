import { redirect } from "next/navigation";

export default async function LegacyOnboardingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/onboarding?session=${encodeURIComponent(id)}`);
}
