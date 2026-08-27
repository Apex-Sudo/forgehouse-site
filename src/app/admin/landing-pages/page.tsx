import { redirect } from "next/navigation";

/**
 * "Landing page" was renamed to "profile" — a mentor's page is their profile,
 * not a marketing landing page. Kept as a redirect so existing bookmarks and
 * any links already shared with mentors keep working.
 */
export default function LandingPagesRedirect() {
  redirect("/admin/profiles");
}
