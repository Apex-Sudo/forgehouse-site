/**
 * Localize mentor avatars.
 *
 * WHY THIS EXISTS
 * ---------------
 * Mentor headshots were stored as hotlinks to LinkedIn's CDN (media.licdn.com).
 * Those URLs are signed and carry an `e=<unix-ts>` expiry roughly 90 days out.
 * When the signature expires the CDN returns 403 and the site silently falls
 * back to /mentors/default-avatar.svg — which is why headshots "disappear"
 * every few months without anyone changing the code.
 *
 * This script downloads each remote headshot ONCE, writes it to
 * public/mentors/<slug>.jpg, and repoints both places the URL is stored
 * (mentors.avatar_url and mentor_landing_pages.content.profileImageUrl) at the
 * local file. Self-hosted images never expire.
 *
 * USAGE
 *   npx tsx scripts/localize-mentor-avatars.ts --dry-run   # report only
 *   npx tsx scripts/localize-mentor-avatars.ts             # download + update DB
 *
 * A signed URL that has already expired cannot be recovered — the signature is
 * part of the URL. Supply a fresh one explicitly:
 *   npx tsx scripts/localize-mentor-avatars.ts --set kathy-leake="https://media.licdn.com/..."
 *
 * Any local file already present under public/mentors/ is left alone unless
 * --force is passed.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local");
  process.exit(1);
}

const AVATAR_DIR = path.resolve(__dirname, "../public/mentors");
const PUBLIC_PREFIX = "/mentors";
const SIZE = 800;

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
};

const argv = process.argv.slice(2);
const DRY_RUN = argv.includes("--dry-run");
const FORCE = argv.includes("--force");

/** --set slug=url (repeatable) supplies a fresh source for an expired signature. */
const overrides = new Map<string, string>();
// Iterate by index: argv.indexOf() would resolve every repeated `--set` back to
// the first one, so only the first override would ever be read.
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (!arg.startsWith("--set")) continue;
  const raw = arg.startsWith("--set=") ? arg.slice(6) : argv[i + 1];
  const eq = raw?.indexOf("=") ?? -1;
  if (!raw || eq < 1) continue;
  overrides.set(raw.slice(0, eq).trim(), raw.slice(eq + 1).trim().replace(/^["']|["']$/g, ""));
}

type Mentor = { slug: string; name: string; avatar_url: string | null };
type LandingPage = { slug: string; content: Record<string, unknown> };

/** A source we can read: an http(s) URL, or a path to a file on this machine. */
const isRemote = (u?: string | null): u is string =>
  !!u && (/^https?:\/\//i.test(u) || /^file:\/\//i.test(u) || fs.existsSync(u));
/** A value already pointing at our own public/ directory. */
const isLocal = (u?: string | null) => !!u && u.startsWith("/mentors/");

/** Decode the `e=` expiry LinkedIn signs into the URL, if present. */
function expiryOf(url: string): Date | null {
  try {
    const e = Number(new URL(url).searchParams.get("e"));
    return Number.isFinite(e) && e > 0 ? new Date(e * 1000) : null;
  } catch {
    return null;
  }
}

async function fetchImage(src: string): Promise<Buffer | null> {
  // Local file: LinkedIn's signed image URLs can't always be passed around
  // (they carry an access token), so --set also accepts a path to an image
  // already saved on this machine.
  if (!/^https?:\/\//i.test(src)) {
    const p = src.replace(/^file:\/\//, "");
    try {
      const buf = fs.readFileSync(p);
      return buf.byteLength > 0 ? buf : null;
    } catch {
      return null;
    }
  }
  try {
    const res = await fetch(src, { redirect: "follow" });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.byteLength > 0 ? buf : null;
  } catch {
    return null;
  }
}

async function main() {
  const [mentors, landingPages] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/mentors?select=slug,name,avatar_url`, { headers }).then(
      (r) => r.json() as Promise<Mentor[]>,
    ),
    fetch(`${SUPABASE_URL}/rest/v1/mentor_landing_pages?select=slug,content`, { headers }).then(
      (r) => r.json() as Promise<LandingPage[]>,
    ),
  ]);

  const landingBySlug = new Map(landingPages.map((p) => [p.slug, p]));
  const slugs = [...new Set([...mentors.map((m) => m.slug), ...landingPages.map((p) => p.slug)])].sort();

  const fixed: string[] = [];
  const skipped: string[] = [];
  const needsFreshSource: { slug: string; expired: string | null }[] = [];

  for (const slug of slugs) {
    const mentor = mentors.find((m) => m.slug === slug);
    const landing = landingBySlug.get(slug);
    const landingImage = landing?.content?.profileImageUrl as string | undefined;

    // Candidate sources, best-first: an explicit override wins, then whichever
    // stored URL is still live. The two tables drift, so try both.
    const candidates = [overrides.get(slug), landingImage, mentor?.avatar_url].filter(isRemote);

    const existingLocal = [".jpg", ".png"].some((e) => fs.existsSync(path.join(AVATAR_DIR, `${slug}${e}`)));
    const alreadyLocal = isLocal(mentor?.avatar_url) && (!landing || isLocal(landingImage) || !landingImage);

    if (alreadyLocal && !FORCE) {
      skipped.push(`${slug} — already self-hosted (${mentor?.avatar_url})`);
      continue;
    }

    if (!candidates.length && !existingLocal) {
      needsFreshSource.push({ slug, expired: null });
      continue;
    }

    let buf: Buffer | null = null;
    let usedUrl = "";
    for (const url of candidates) {
      buf = await fetchImage(url);
      if (buf) {
        usedUrl = url;
        break;
      }
    }

    if (!buf) {
      // Under --force an already-localized mentor has no remote source left to
      // re-fetch. That is not a gap — the local file is the source of truth.
      if (existingLocal) {
        skipped.push(`${slug} — already self-hosted (no remote source to refresh)`);
      } else {
        const exp = candidates.map(expiryOf).find(Boolean);
        needsFreshSource.push({ slug, expired: exp ? exp.toISOString().slice(0, 10) : null });
      }
      continue;
    }

    // Headshots are displayed in portrait containers (aspect-[4/5] and
    // aspect-[374/552]) with `object-cover object-top`, so a square source is
    // cropped at the sides with the head kept — same as the existing
    // colin/kyle/leon images. Match that 800x800 convention.
    //
    // Keep alpha if the source has it: LinkedIn serves some headshots with a
    // transparent circular mask, and flattening those into JPEG turns the
    // corners black — visible, since these containers are rectangles, not
    // circles. PNG for transparent sources mirrors colin-chapman.png.
    const hasAlpha = !!(await sharp(buf).metadata()).hasAlpha;
    const ext = hasAlpha ? "png" : "jpg";
    const publicPath = `${PUBLIC_PREFIX}/${slug}.${ext}`;
    const localTarget = path.join(AVATAR_DIR, `${slug}.${ext}`);

    if (DRY_RUN) {
      fixed.push(`${slug} — would save ${(buf.byteLength / 1024).toFixed(0)}KB → ${publicPath}`);
      continue;
    }

    const resized = sharp(buf).resize(SIZE, SIZE, { fit: "cover", position: "attention" });
    const out = hasAlpha
      ? await resized.png({ compressionLevel: 9 }).toBuffer()
      : await resized.jpeg({ quality: 88, mozjpeg: true }).toBuffer();

    fs.mkdirSync(AVATAR_DIR, { recursive: true });
    fs.writeFileSync(localTarget, out);
    // Drop a stale sibling from a previous run that chose the other format.
    const stale = path.join(AVATAR_DIR, `${slug}.${hasAlpha ? "jpg" : "png"}`);
    if (fs.existsSync(stale) && !["colin-chapman", "kyle-parratt", "leon-freier"].includes(slug)) {
      fs.unlinkSync(stale);
    }

    if (mentor && mentor.avatar_url !== publicPath) {
      await fetch(`${SUPABASE_URL}/rest/v1/mentors?slug=eq.${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ avatar_url: publicPath }),
      });
    }

    if (landing && landingImage !== publicPath) {
      await fetch(`${SUPABASE_URL}/rest/v1/mentor_landing_pages?slug=eq.${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ content: { ...landing.content, profileImageUrl: publicPath } }),
      });
    }

    fixed.push(
      `${slug} — ${(out.byteLength / 1024).toFixed(0)}KB → ${publicPath}  (source: ${usedUrl.slice(0, 60)}…)`,
    );
  }

  const label = DRY_RUN ? "WOULD FIX" : "FIXED";
  console.log(`\n=== ${label} (${fixed.length}) ===`);
  fixed.forEach((l) => console.log("  ✅ " + l));

  if (skipped.length) {
    console.log(`\n=== ALREADY LOCAL (${skipped.length}) ===`);
    skipped.forEach((l) => console.log("  ·  " + l));
  }

  if (needsFreshSource.length) {
    console.log(`\n=== NEEDS A FRESH SOURCE IMAGE (${needsFreshSource.length}) ===`);
    console.log("  The stored signature has expired; it cannot be revived from the URL alone.\n");
    needsFreshSource.forEach(({ slug, expired }) =>
      console.log(`  ❌ ${slug}${expired ? ` — signature expired ${expired}` : " — no source URL stored"}`),
    );
    console.log("\n  Supply a fresh image URL per mentor:");
    console.log(`    npx tsx scripts/localize-mentor-avatars.ts --set ${needsFreshSource[0].slug}="<image-url>"`);
  }

  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
