import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const { data: mentor } = await supabase
    .from("mentors")
    .select("name, tagline")
    .eq("slug", params.slug)
    .single();

  return [
    {
      id: "og",
      alt: mentor
        ? `${mentor.name} - ${mentor.tagline} | ForgeHouse`
        : "ForgeHouse Mentor",
      size,
      contentType,
    },
  ];
}

export default async function OGImage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: mentor } = await supabase
    .from("mentors")
    .select("name, tagline, avatar_url, bio")
    .eq("slug", params.slug)
    .single();

  const name = mentor?.name ?? "ForgeHouse Mentor";
  const tagline = mentor?.tagline ?? "";
  const avatarFile = mentor?.avatar_url?.replace("/mentors/", "") ?? "";

  let photoDataUri: string | null = null;
  try {
    const buf = readFileSync(join(process.cwd(), "public", "mentors", avatarFile));
    photoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    // photo not available
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
          {mentor?.bio && (
            <div style={{ fontSize: 18, color: "#888888", lineHeight: 1.5 }}>
              {mentor.bio.length > 120
                ? mentor.bio.slice(0, 120) + "..."
                : mentor.bio}
            </div>
          )}
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

        {photoDataUri && (
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
        )}
      </div>
    ),
    { ...size }
  );
}
