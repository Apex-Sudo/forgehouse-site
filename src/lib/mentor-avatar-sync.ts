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
export async function syncAvatarFromProfileImage(
  slug: string,
  content: unknown,
): Promise<void> {
  const image = (content as { profileImageUrl?: string } | undefined)?.profileImageUrl?.trim();
  if (!image) return;

  const { error } = await supabase
    .from("mentors")
    .update({ avatar_url: image })
    .eq("slug", slug);

  // Non-fatal: the profile itself saved fine, so surface it in logs rather than
  // failing the admin's request.
  if (error) console.error("mentors avatar_url sync:", error);
}
