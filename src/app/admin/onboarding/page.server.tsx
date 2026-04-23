import { requireAdminRoute } from "@/lib/admin-route-guard";
import AdminOnboardingPage from "./page";

export default async function AdminOnboardingPageServer() {
  await requireAdminRoute();
  return <AdminOnboardingPage />;
}