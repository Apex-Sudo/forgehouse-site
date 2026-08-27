import { supabase } from "@/lib/supabase";

/**
 * A mentor's headshot is set in one place — their profile — and is their photo
 * everywhere on the site.
 *
 * The storage is split for historical reasons: the profile page reads
 * `mentor_landing_pages.content.profileImageUrl`, while the homepage advisory
 * board, the /mentors grid, chat, insights and the OG image all read
 * `mentors.avatar_url`. Without this write-through the two drift apart
 * silently, and changing the image in the admin appears to do nothing outside
 * the profile page itself.
 *
 * A profile can legitimately have no `mentors` row — someone with a published
 * profile but no trained agent yet. That is not an error; there is simply
 * nothing to keep in sync.
 */
/**
 * Hosts next/image is allowed to optimise, mirroring `images.remotePatterns`
 * in next.config.ts. Keep the two in step.
 *
 * This matters because the two surfaces render differently: the profile page
 * uses a plain <img> and will display any URL, while the homepage advisory
 * board and /mentors grid go through next/image, which returns 400 for a host
 * that isn't listed here. Syncing an unlisted host would therefore leave the
 * profile page looking correct and every other surface broken — the exact
 * split this sync exists to prevent.
 */
const RENDERABLE_HOSTS = [
  /\.licdn\.com$/,
  /^lh3\.googleusercontent\.com$/,
  /^i\.postimg\.cc$/,
];

function isRenderableByNextImage(url: string): boolean {
  if (url.startsWith("/")) return true; // served from public/
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== "https:") return false;
    return RENDERABLE_HOSTS.some((re) => re.test(hostname));
  } catch {
    return false;
  }
}

export async function syncAvatarFromProfileImage(
  slug: string,
  content: unknown,
): Promise<void> {
  const image = (content as { profileImageUrl?: string } | undefined)?.profileImageUrl?.trim();
  if (!image) return;

  if (!isRenderableByNextImage(image)) {
    console.warn(
      `mentors avatar_url sync skipped for "${slug}": ${image} is not a local path ` +
        `and its host is not in next.config images.remotePatterns, so next/image ` +
        `would 400 on it. Self-host the file under public/mentors/ or add the host.`,
    );
    return;
  }

  const { error } = await supabase
    .from("mentors")
    .update({ avatar_url: image })
    .eq("slug", slug);

  // Non-fatal: the profile itself saved fine, so surface it in logs rather than
  // failing the admin's request.
  if (error) console.error("mentors avatar_url sync:", error);
}
