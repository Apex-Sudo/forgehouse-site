import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireAdmin } from "@/lib/admin-auth";
import { mentorLandingAiSystemPrompt } from "@/lib/mentor-landing-ai-prompt";
import {
  mentorLandingContentSchema,
  mentorLandingSlugSchema,
} from "@/types/mentor-landing";

type MentorBrief = {
  slug: string;
  name: string;
  tagline: string;
  bio: string | null;
};

function extractJsonObject(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

export async function POST(req: Request) {
  const authResult = await requireAdmin();
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const slugRaw = (body as { slug?: unknown }).slug;
  const notesRaw = (body as { notes?: unknown }).notes;
  const slugParse = mentorLandingSlugSchema.safeParse(
    typeof slugRaw === "string" ? slugRaw : ""
  );
  if (!slugParse.success) {
    return NextResponse.json(
      { error: slugParse.error.flatten().formErrors.join(", ") },
      { status: 400 }
    );
  }
  const slug = slugParse.data;

  if (typeof notesRaw !== "string" || notesRaw.trim().length < 20) {
    return NextResponse.json(
      { error: "notes must be a string with at least 20 characters" },
      { status: 400 }
    );
  }
  const notes = notesRaw.trim();

  let mentorBrief: MentorBrief | null = null;
  const { data: mentorRow } = await supabase
    .from("mentors")
    .select("slug, name, tagline, bio")
    .eq("slug", slug)
    .maybeSingle();

  if (mentorRow) {
    mentorBrief = {
      slug: mentorRow.slug,
      name: mentorRow.name,
      tagline: mentorRow.tagline ?? "",
      bio: mentorRow.bio,
    };
  }

  const currentContent = (body as { currentContent?: unknown }).currentContent;

  const userParts: string[] = [
    `Target URL slug: ${slug}`,
    mentorBrief
      ? `Mentor record:\n- name: ${mentorBrief.name}\n- tagline: ${mentorBrief.tagline}\n- bio: ${mentorBrief.bio ?? "(none)"}`
      : "No mentor row exists for this slug yet — infer a professional tone from the notes only.",
    "",
    "Source notes and instructions from the admin:",
    notes,
  ];

  if (currentContent !== undefined && currentContent !== null) {
    userParts.push(
      "",
      "Existing draft JSON to refine or replace (you may overhaul completely if notes ask for it):",
      JSON.stringify(currentContent)
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: mentorLandingAiSystemPrompt(),
      messages: [{ role: "user", content: userParts.join("\n") }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const text =
      textBlock && textBlock.type === "text" ? textBlock.text : "";
    const jsonStr = extractJsonObject(text);
    if (!jsonStr) {
      return NextResponse.json(
        { error: "Model did not return parseable JSON", raw: text.slice(0, 500) },
        { status: 422 }
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        { error: "JSON.parse failed on model output", raw: jsonStr.slice(0, 500) },
        { status: 422 }
      );
    }

    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>;
      for (const key of [
        "reviews",
        "reviewRating",
        "reviewSource",
        "companies",
        "externalLink",
      ] as const) {
        if (o[key] === null) delete o[key];
      }
    }

    const validated = mentorLandingContentSchema.safeParse(parsed);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Output failed schema validation",
          details: validated.error.flatten(),
        },
        { status: 422 }
      );
    }

    let content = validated.data;
    const featuredIdx = content.reviews?.findIndex((r) => r.featured) ?? -1;
    if (content.reviews && content.reviews.length > 0 && featuredIdx >= 0) {
      content = {
        ...content,
        reviews: content.reviews.map((r, i) =>
          i === featuredIdx ? { ...r, featured: true } : { ...r, featured: false }
        ),
      };
    }

    return NextResponse.json({ content });
  } catch (e) {
    console.error("mentor landing ai-draft:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI request failed" },
      { status: 500 }
    );
  }
}
