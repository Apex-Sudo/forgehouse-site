import { NextResponse } from "next/server";
import { synthesizeMentorProfile, type SynthesizedProfile } from "@/lib/system-prompt-synthesis";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!.trim();
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!.trim();
const VOYAGE_KEY = process.env.VOYAGE_API_KEY!.trim();

interface KnowledgeChunk {
  chunk_type: "career" | "methodology" | "story" | "belief";
  topic: string;
  content: string;
  metadata: Record<string, unknown>;
}

const CHUNKING_PROMPT = `You are a knowledge extraction specialist. You receive raw data from an expert interview and must produce structured, self-contained knowledge chunks for a vector database.

RULES:
- Each chunk must be SELF-CONTAINED. No "as I mentioned earlier" or references to other chunks.
- Each chunk should be 100-500 words. Long enough for context, short enough for focused retrieval.
- Use the expert's own words and examples wherever possible. Preserve their voice.
- Include specific numbers, metrics, and examples — these are the most valuable parts.
- Every chunk needs enough context that someone reading it in isolation understands the full point.
- NEVER create two chunks about the same topic. One chunk per distinct topic, always.

CHUNK TYPES:
1. "career" — One chunk per distinct role/company. Include: company, role title, dates, industry, key metrics, what they did.
2. "methodology" — One chunk per distinct framework, technique, or approach. Include: what it is, how it works, when to use it, specific examples.
3. "story" — One chunk per specific anecdote or war story. Include: the situation, what happened, what was learned.
4. "belief" — One chunk per strong opinion or principle. Include: the belief, the reasoning, any caveats.

OUTPUT FORMAT:
Return a JSON array of objects. Each object has:
- chunk_type: "career" | "methodology" | "story" | "belief"
- topic: short descriptive title
- content: the full chunk text
- metadata: object with relevant tags

IMPORTANT:
- Deduplicate. If the same topic appears multiple times, merge into one comprehensive chunk.
- Do NOT include the interviewer's questions in the chunks.
- Return ONLY the JSON array, no markdown fencing, no explanation.`;

async function supabaseRequest(
  method: string,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
      ...extraHeaders,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase ${method} ${path}: ${res.status} ${err}`);
  }

  return res;
}

function buildExtractionText(extractionData: any, calibrationData: any): string {
  let text = "";

  if (extractionData?.messages) {
    text += "## Expert's Knowledge (Extraction Session)\n\n";
    const msgs = extractionData.messages as { role: string; content: string }[];
    for (const m of msgs) {
      if (m.role === "user") {
        text += `[Expert]: ${m.content}\n\n`;
      }
    }
  }

  if (calibrationData?.messages) {
    text += "\n## Calibration Feedback\n\n";
    const msgs = calibrationData.messages as { role: string; content: string }[];
    for (const m of msgs) {
      if (m.role === "user") {
        text += `[Expert feedback]: ${m.content}\n\n`;
      }
    }
  }

  return text;
}

function buildFullTranscript(extractionData: any, calibrationData: any): string {
  let text = "";

  if (extractionData?.messages) {
    text += "## Extraction Session (Full Transcript)\n\n";
    const msgs = extractionData.messages as { role: string; content: string }[];
    for (const m of msgs) {
      const label = m.role === "user" ? "Expert" : "Interviewer";
      text += `[${label}]: ${m.content}\n\n`;
    }
  }

  if (calibrationData?.messages) {
    text += "\n## Calibration Session (Full Transcript)\n\n";
    const msgs = calibrationData.messages as { role: string; content: string }[];
    for (const m of msgs) {
      const label = m.role === "user" ? "Expert" : "Calibrator";
      text += `[${label}]: ${m.content}\n\n`;
    }
  }

  return text;
}

async function chunkWithLLM(extractionText: string): Promise<KnowledgeChunk[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 16384,
      messages: [
        { role: "user", content: `${CHUNKING_PROMPT}\n\n---\n\n${extractionText}` },
        { role: "assistant", content: "[" },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const raw: string = data.content[0].text;
  const withPrefix = "[" + raw;
  const cleaned = withPrefix.replace(/^```json?\s*/m, "").replace(/```\s*$/m, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    console.error("[chunkWithLLM] Failed to parse JSON. Raw response:", raw.slice(0, 500));
    throw new Error(`Chunking LLM returned invalid JSON. Start of response: "${raw.slice(0, 100)}"`);
  }
}

async function embedTexts(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);

    const response = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VOYAGE_KEY}`,
      },
      body: JSON.stringify({
        model: "voyage-4-lite",
        input: batch,
        input_type: "document",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Voyage AI error: ${response.status} ${err}`);
    }

    const data = await response.json();
    for (const item of data.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

async function storeChunks(
  mentorSlug: string,
  chunks: KnowledgeChunk[],
  embeddings: number[][]
): Promise<void> {
  // Clear existing chunks for this mentor
  await supabaseRequest(
    "DELETE",
    `/rest/v1/mentor_knowledge?mentor_slug=eq.${encodeURIComponent(mentorSlug)}`
  );

  const rows = chunks.map((chunk, i) => ({
    mentor_slug: mentorSlug,
    chunk_type: chunk.chunk_type,
    topic: chunk.topic,
    content: chunk.content,
    metadata: chunk.metadata,
    embedding: `[${embeddings[i].join(",")}]`,
    source_file: "onboarding-session",
  }));

  const BATCH = 10;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await supabaseRequest("POST", "/rest/v1/mentor_knowledge", batch);
  }
}

async function updateMentorProfile(
  mentorSlug: string,
  profile: SynthesizedProfile,
): Promise<void> {
  await supabaseRequest(
    "PATCH",
    `/rest/v1/mentors?slug=eq.${encodeURIComponent(mentorSlug)}`,
    {
      system_prompt: profile.system_prompt,
      tagline: profile.tagline,
      bio: profile.bio,
      welcome_message: profile.welcome_message,
      default_starters: profile.default_starters,
      starters_hint: profile.starters_hint,
      active: true,
    },
  );
}

export async function POST(req: Request) {
  try {
    const { sessionId, mentorName, extractionData, calibrationData } = await req.json();

    if (!sessionId || !mentorName) {
      return NextResponse.json(
        { error: "Missing required fields: sessionId, mentorName" },
        { status: 400 }
      );
    }

    const slug = mentorName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 50);

    // Step 1: Build extraction text from session data
    const extractionText = buildExtractionText(extractionData, calibrationData);

    if (extractionText.length < 100) {
      return NextResponse.json(
        { error: "Not enough extraction data to build a knowledge base. Complete the extraction phase first." },
        { status: 400 }
      );
    }

    // Step 2: Chunk knowledge AND synthesize system prompt in parallel
    const fullTranscript = buildFullTranscript(extractionData, calibrationData);

    console.log(`[ingest] Starting parallel: chunking + system prompt synthesis for ${slug}...`);
    const [chunks, profile] = await Promise.all([
      chunkWithLLM(extractionText),
      synthesizeMentorProfile(fullTranscript, mentorName, ANTHROPIC_KEY),
    ]);
    console.log(`[ingest] Got ${chunks.length} chunks + synthesized profile`);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "LLM produced no knowledge chunks. Try re-running." },
        { status: 500 }
      );
    }

    // Step 3: Embed with Voyage AI
    console.log(`[ingest] Embedding ${chunks.length} chunks...`);
    const texts = chunks.map((c) => c.content);
    const embeddings = await embedTexts(texts);
    console.log(`[ingest] Got ${embeddings.length} embeddings`);

    // Step 4: Store knowledge chunks
    console.log(`[ingest] Storing chunks in Supabase...`);
    await storeChunks(slug, chunks, embeddings);
    console.log(`[ingest] ${chunks.length} chunks stored for ${slug}`);

    // Step 5: Update mentor record with synthesized profile
    console.log(`[ingest] Updating mentor profile for ${slug}...`);
    await updateMentorProfile(slug, profile);
    console.log(`[ingest] Done! Mentor ${slug} fully configured`);

    return NextResponse.json({
      success: true,
      chunksCreated: chunks.length,
      mentorSlug: slug,
      message: `Knowledge base created: ${chunks.length} chunks embedded and stored. System prompt synthesized.`,
    });
  } catch (error) {
    console.error("[ingest] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
