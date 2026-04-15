import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { supabase } from "@/lib/supabase";
import { mentorLandingContentSchema } from "@/types/mentor-landing";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function humanizeSlug(slug: string): string {
  if (typeof slug !== "string" || slug.length === 0) {
    return "";
  }
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

async function resolveSlugParam(
  params: Promise<{ slug: string }> | { slug: string } | undefined
): Promise<string> {
  if (params === undefined) {
    return "";
  }
  const p = await Promise.resolve(params);
  return typeof p.slug === "string" ? p.slug : "";
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const slug = await resolveSlugParam(params);
  if (slug.length === 0) {
    return [
      {
        id: "og",
        alt: "ForgeHouse",
        size,
        contentType,
      },
    ];
  }

  const { data: landingRow } = await supabase
    .from("mentor_landing_pages")
    .select("content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const parsed = landingRow?.content
    ? mentorLandingContentSchema.safeParse(landingRow.content)
    : null;

  const displayName = humanizeSlug(slug) || "ForgeHouse";
  const alt =
    parsed?.success && parsed.data.heroQuote.trim().length > 0
      ? `${displayName} — ${parsed.data.heroQuote.slice(0, 80)} | ForgeHouse`
      : `${displayName} | ForgeHouse`;

  return [
    {
      id: "og",
      alt,
      size,
      contentType,
    },
  ];
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const slug = await resolveSlugParam(params);
  if (slug.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0A0A0B",
            fontFamily: "sans-serif",
            fontSize: 48,
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          ForgeHouse
        </div>
      ),
      { ...size }
    );
  }

  const { data: landingRow } = await supabase
    .from("mentor_landing_pages")
    .select("content")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  const parsed = landingRow?.content
    ? mentorLandingContentSchema.safeParse(landingRow.content)
    : null;

  const name = parsed?.success ? humanizeSlug(slug) : "ForgeHouse";
  const tagline =
    parsed?.success && parsed.data.heroQuote.trim().length > 0
      ? parsed.data.heroQuote
      : parsed?.success
        ? parsed.data.heroDescription.slice(0, 140)
        : "Mentor";
  const bioSnippet =
    parsed?.success && parsed.data.heroDescription.trim().length > 0
      ? parsed.data.heroDescription.length > 120
        ? `${parsed.data.heroDescription.slice(0, 120)}...`
        : parsed.data.heroDescription
      : null;

  let photoDataUri: string | null = null;
  const profile = parsed?.success ? parsed.data.profileImageUrl?.trim() : undefined;
  if (profile && profile.startsWith("/")) {
    try {
      const rel = profile.slice(1);
      const buf = readFileSync(join(process.cwd(), "public", rel));
      const ext = rel.split(".").pop()?.toLowerCase();
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : ext === "gif"
              ? "image/gif"
              : "image/png";
      photoDataUri = `data:${mime};base64,${buf.toString("base64")}`;
    } catch {
      // file not under public or missing
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0A0A0B",
          padding: "60px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            paddingRight: "40px",
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#FFFFFF",
              lineHeight: 1.1,
              marginBottom: "16px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#B8916A",
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: "32px",
            }}
          >
            {tagline}
          </div>
          {bioSnippet ? (
            <div style={{ fontSize: 18, color: "#888888", lineHeight: 1.5 }}>
              {bioSnippet}
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              bottom: "60px",
              left: "60px",
              fontSize: 20,
              color: "#555555",
              fontWeight: 600,
              letterSpacing: "0.05em",
            }}
          >
            FORGEHOUSE
          </div>
        </div>

        {photoDataUri ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "340px",
                height: "340px",
                borderRadius: "170px",
                overflow: "hidden",
                border: "4px solid #B8916A",
                display: "flex",
              }}
            >
              <img
                src={photoDataUri}
                width={340}
                height={340}
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
