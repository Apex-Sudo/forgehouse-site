/**
 * Incremental, merge-aware ingestion pipeline for mentor extraction sessions.
 *
 * On each run the script:
 *  1. Parses the new extraction session file
 *  2. Fetches any existing knowledge chunks for this mentor from Supabase
 *  3. Sends BOTH to the LLM so it can produce a COMPLETE merged knowledge base
 *  4. Embeds the full merged set with Voyage AI
 *  5. Replaces ALL chunks for the mentor in Supabase
 *
 * This means running session 2 after session 1 produces ~18 merged chunks
 * (not 30 duplicates), and re-running the same session is idempotent.
 *
 * Usage:
 *   npx tsx scripts/ingest-knowledge.ts \
 *     --file ~/Downloads/colin-extraction-session1-2026-02-20.txt \
 *     --mentor colin-chapman
 *
 * Requires: ANTHROPIC_API_KEY, VOYAGE_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY in .env.local
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { config } from "dotenv";

config({ path: resolve(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY!.trim();
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY!.trim();
const VOYAGE_KEY = process.env.VOYAGE_API_KEY!.trim();

// ---------------------------------------------------------------------------
// 1. Parser — extract blocks from extraction session format
// ---------------------------------------------------------------------------

interface Exchange {
  role: "user" | "assistant";
  content: string;
}

function parseExtractionFile(text: string): {
  pdfContent: string;
  exchanges: Exchange[];
} {
  const bodyStart = text.indexOf("[USER]");
  const body = bodyStart >= 0 ? text.slice(bodyStart) : text;

  const blocks = body.split(/\n---\n/);
  const exchanges: Exchange[] = [];
  let pdfContent = "";

  for (const block of blocks) {
    const trimmed = block.trim();
    if (trimmed.startsWith("[USER]")) {
      const content = trimmed.replace(/^\[USER\]\s*/, "").trim();
      if (
        content.includes("[Uploaded file:") &&
        content.includes("Career Highlights")
      ) {
        pdfContent = content.replace(/^\[Uploaded file:.*?\]\s*/s, "").trim();
      } else {
        exchanges.push({ role: "user", content });
      }
    } else if (trimmed.startsWith("[ASSISTANT]")) {
      const content = trimmed.replace(/^\[ASSISTANT\]\s*/, "").trim();
      exchanges.push({ role: "assistant", content });
    }
  }

  return { pdfContent, exchanges };
}

// ---------------------------------------------------------------------------
// 2. Supabase helpers
// ---------------------------------------------------------------------------

interface KnowledgeChunk {
  chunk_type: "career" | "methodology" | "story" | "belief";
  topic: string;
  content: string;
  metadata: Record<string, unknown>;
}

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

async function fetchExistingChunks(
  mentorSlug: string
): Promise<{ chunks: KnowledgeChunk[]; sourceFiles: string[] }> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/mentor_knowledge?select=chunk_type,topic,content,metadata,source_file&mentor_slug=eq.${encodeURIComponent(mentorSlug)}&order=chunk_type,topic`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch existing chunks: ${res.status} ${err}`);
  }

  const rows: {
    chunk_type: string;
    topic: string;
    content: string;
    metadata: Record<string, unknown>;
    source_file: string;
  }[] = await res.json();

  const sourceFiles = [...new Set(rows.map((r) => r.source_file))];
  const chunks: KnowledgeChunk[] = rows.map((r) => ({
    chunk_type: r.chunk_type as KnowledgeChunk["chunk_type"],
    topic: r.topic,
    content: r.content,
    metadata: r.metadata,
  }));

  return { chunks, sourceFiles };
}

// ---------------------------------------------------------------------------
// 3. LLM Chunker — merge-aware (two-mode: fresh extraction vs incremental)
// ---------------------------------------------------------------------------

const FRESH_CHUNKING_PROMPT = `You are a knowledge extraction specialist. You receive raw data from an expert interview and must produce structured, self-contained knowledge chunks for a vector database.

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
- topic: short descriptive title (e.g. "ICP Definition - Role-Specific Approach")
- content: the full chunk text
- metadata: object with relevant tags (e.g. {"company": "Missing Link", "industry": "Corporate Training"})

IMPORTANT:
- Deduplicate. If the same topic appears in both the career PDF and conversation, merge into one comprehensive chunk.
- Do NOT include the interviewer's questions in the chunks.
- Return ONLY the JSON array, no markdown fencing, no explanation.`;

const INCREMENTAL_CHUNKING_PROMPT = `You are a knowledge extraction specialist. You maintain a structured knowledge base for an expert in a vector database.

You will receive:
1. An EXISTING KNOWLEDGE BASE — numbered chunks already stored in the database
2. NEW SESSION DATA — a fresh interview/extraction to integrate

Your job is to produce ONLY the changes needed: updated versions of existing chunks that gained new info, and brand new chunks for topics not yet covered.

INSTRUCTIONS:
- Review each existing chunk against the new session data.
- If an existing chunk's topic is discussed in the new session with additional details, examples, or metrics, produce an UPDATED version that merges the best from both. Set "action" to "update" and "replaces_chunk" to the exact number of the existing chunk being replaced (e.g. 1, 2, 3...).
- If the new session covers a topic NOT in any existing chunk, produce a NEW chunk. Set "action" to "new" and "replaces_chunk" to null.
- Do NOT return existing chunks that have no new information. They will be kept automatically.
- NEVER split one existing chunk into two. If you update a chunk, it stays as one chunk.

CHUNK RULES:
- Each chunk must be SELF-CONTAINED. 100-500 words.
- Use the expert's own words. Preserve their voice.
- Include specific numbers, metrics, and examples.

CHUNK TYPES:
1. "career" — One chunk per distinct role/company.
2. "methodology" — One chunk per distinct framework/technique/approach.
3. "story" — One chunk per specific anecdote or war story.
4. "belief" — One chunk per strong opinion or principle.

OUTPUT FORMAT:
Return a JSON array. Each object has:
- action: "update" | "new"
- replaces_chunk: number (the existing chunk number being replaced) or null (for new chunks)
- chunk_type: "career" | "methodology" | "story" | "belief"
- topic: short descriptive title
- content: the full chunk text
- metadata: object with relevant tags

IMPORTANT:
- Do NOT include the interviewer's questions in chunk content.
- Return ONLY the JSON array, no markdown fencing, no explanation.`;

interface IncrementalChunk extends KnowledgeChunk {
  action: "update" | "new";
  replaces_chunk: number | null;
}

async function chunkFresh(
  pdfContent: string,
  exchanges: Exchange[]
): Promise<KnowledgeChunk[]> {
  const userExchanges = exchanges
    .filter((e) => e.role === "user")
    .map((e, i) => `[Exchange ${i + 1}] ${e.content}`)
    .join("\n\n");

  let input = "";
  if (pdfContent) {
    input += `## STRUCTURED CAREER DATA (from PDF)\n\n${pdfContent}\n\n`;
  }
  input += `## CONVERSATIONAL EXTRACTION (expert's answers only)\n\n${userExchanges}`;

  console.log(`Sending ${input.length} chars to Anthropic for fresh chunking...`);

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
        { role: "user", content: `${FRESH_CHUNKING_PROMPT}\n\n---\n\n${input}` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/^```json?\s*/m, "").replace(/```\s*$/m, "").trim();
  const chunks: KnowledgeChunk[] = JSON.parse(cleaned);

  console.log(`Got ${chunks.length} chunks from LLM`);
  return chunks;
}

async function chunkIncremental(
  pdfContent: string,
  exchanges: Exchange[],
  existingChunks: KnowledgeChunk[]
): Promise<KnowledgeChunk[]> {
  const userExchanges = exchanges
    .filter((e) => e.role === "user")
    .map((e, i) => `[Exchange ${i + 1}] ${e.content}`)
    .join("\n\n");

  const existingFormatted = existingChunks
    .map(
      (c, i) =>
        `### Chunk ${i + 1} [${c.chunk_type}] "${c.topic}"\n${c.content}`
    )
    .join("\n\n");

  let input = `## EXISTING KNOWLEDGE BASE (${existingChunks.length} chunks)\n\n${existingFormatted}\n\n`;
  input += `## NEW SESSION DATA\n\n`;
  if (pdfContent) {
    input += `### Structured Career Data (from PDF)\n\n${pdfContent}\n\n`;
  }
  input += `### Conversational Extraction (expert's answers only)\n\n${userExchanges}`;

  console.log(
    `Sending ${input.length} chars to Anthropic (${existingChunks.length} existing + new session)...`
  );

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
        { role: "user", content: `${INCREMENTAL_CHUNKING_PROMPT}\n\n---\n\n${input}` },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${err}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  const cleaned = text.replace(/^```json?\s*/m, "").replace(/```\s*$/m, "").trim();
  const incremental: IncrementalChunk[] = JSON.parse(cleaned);

  // Programmatic merge: start with all existing chunks, apply updates and additions
  const merged = [...existingChunks];
  const replacedIndices = new Set<number>();

  let updateCount = 0;
  let newCount = 0;

  for (const item of incremental) {
    if (item.action === "update" && item.replaces_chunk != null) {
      const idx = item.replaces_chunk - 1; // 1-indexed -> 0-indexed
      if (idx >= 0 && idx < merged.length) {
        merged[idx] = {
          chunk_type: item.chunk_type,
          topic: item.topic,
          content: item.content,
          metadata: item.metadata,
        };
        replacedIndices.add(idx);
        updateCount++;
      }
    } else if (item.action === "new") {
      merged.push({
        chunk_type: item.chunk_type,
        topic: item.topic,
        content: item.content,
        metadata: item.metadata,
      });
      newCount++;
    }
  }

  console.log(
    `Merge result: ${updateCount} updated, ${newCount} new, ${existingChunks.length - replacedIndices.size} unchanged → ${merged.length} total`
  );

  return merged;
}

async function chunkWithLLM(
  pdfContent: string,
  exchanges: Exchange[],
  existingChunks: KnowledgeChunk[]
): Promise<KnowledgeChunk[]> {
  if (existingChunks.length === 0) {
    return chunkFresh(pdfContent, exchanges);
  }
  return chunkIncremental(pdfContent, exchanges, existingChunks);
}

// ---------------------------------------------------------------------------
// 4. Voyage AI Embedder
// ---------------------------------------------------------------------------

async function embedTexts(texts: string[]): Promise<number[][]> {
  const BATCH_SIZE = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    console.log(
      `Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)} (${batch.length} texts)...`
    );

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
      throw new Error(`Voyage API error: ${response.status} ${err}`);
    }

    const data = await response.json();
    for (const item of data.data) {
      allEmbeddings.push(item.embedding);
    }
  }

  return allEmbeddings;
}

// ---------------------------------------------------------------------------
// 5. Supabase Inserter — replaces ALL chunks for the mentor
// ---------------------------------------------------------------------------

async function replaceAllChunks(
  mentorSlug: string,
  sourceFiles: string[],
  chunks: KnowledgeChunk[],
  embeddings: number[][]
): Promise<void> {
  console.log(
    `Clearing ALL existing chunks for mentor: ${mentorSlug}...`
  );
  await supabaseRequest(
    "DELETE",
    `/rest/v1/mentor_knowledge?mentor_slug=eq.${encodeURIComponent(mentorSlug)}`
  );

  console.log(`Inserting ${chunks.length} merged chunks...`);

  const sourceFilesJson = JSON.stringify(sourceFiles);

  const rows = chunks.map((chunk, i) => ({
    mentor_slug: mentorSlug,
    chunk_type: chunk.chunk_type,
    topic: chunk.topic,
    content: chunk.content,
    metadata: { ...chunk.metadata, source_files: sourceFilesJson },
    embedding: `[${embeddings[i].join(",")}]`,
    source_file: sourceFiles[sourceFiles.length - 1],
  }));

  const BATCH = 10;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    await supabaseRequest("POST", "/rest/v1/mentor_knowledge", batch);
    console.log(
      `  Inserted ${Math.min(i + BATCH, rows.length)}/${rows.length}`
    );
  }

  console.log("Done inserting.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const mentorIdx = args.indexOf("--mentor");

  if (fileIdx === -1 || mentorIdx === -1) {
    console.error(
      "Usage: npx tsx scripts/ingest-knowledge.ts --file <path> --mentor <slug>"
    );
    process.exit(1);
  }

  const filePath = resolve(args[fileIdx + 1]);
  const mentorSlug = args[mentorIdx + 1];
  const sourceFile = filePath.split("/").pop()!;

  console.log(
    `\n=== Ingesting ${sourceFile} for mentor: ${mentorSlug} ===\n`
  );

  // Step 1: Parse new file
  console.log("Step 1: Parsing extraction file...");
  const rawText = readFileSync(filePath, "utf-8");
  const { pdfContent, exchanges } = parseExtractionFile(rawText);
  const userCount = exchanges.filter((e) => e.role === "user").length;
  console.log(
    `  PDF content: ${pdfContent.length} chars, Exchanges: ${exchanges.length} (${userCount} user)`
  );

  // Step 2: Fetch existing knowledge base
  console.log("\nStep 2: Fetching existing knowledge base...");
  const existing = await fetchExistingChunks(mentorSlug);
  console.log(
    `  Found ${existing.chunks.length} existing chunks from sources: ${existing.sourceFiles.join(", ") || "(none)"}`
  );

  // Step 3: LLM chunking with merge awareness
  console.log("\nStep 3: Chunking + merging with Anthropic...");
  const chunks = await chunkWithLLM(pdfContent, exchanges, existing.chunks);
  for (const c of chunks) {
    console.log(`  [${c.chunk_type}] ${c.topic} (${c.content.length} chars)`);
  }

  // Step 4: Embed the complete merged set
  console.log("\nStep 4: Embedding with Voyage AI...");
  const texts = chunks.map((c) => c.content);
  const embeddings = await embedTexts(texts);
  console.log(
    `  Got ${embeddings.length} embeddings, dim=${embeddings[0]?.length}`
  );

  // Step 5: Replace all chunks for this mentor
  const allSourceFiles = [
    ...new Set([...existing.sourceFiles, sourceFile]),
  ];
  console.log("\nStep 5: Replacing all chunks in Supabase...");
  await replaceAllChunks(mentorSlug, allSourceFiles, chunks, embeddings);

  console.log(
    `\n=== Done! ${chunks.length} chunks (merged from ${allSourceFiles.length} source(s)) for ${mentorSlug} ===\n`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
