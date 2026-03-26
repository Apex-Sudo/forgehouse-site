import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { toolLog } from "@/lib/tool-logger";

const VOYAGE_KEY = process.env.VOYAGE_API_KEY!;

async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOYAGE_KEY}`,
    },
    body: JSON.stringify({
      model: "voyage-4-lite",
      input: [text],
      input_type: "query",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Voyage embedding error: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

const retrieveSchema = z.object({
  query: z
    .string()
    .describe(
      "The search query to find relevant mentor knowledge. Be specific — e.g. 'outbound email sequences for SaaS' rather than just 'outbound'.",
    ),
});

/**
 * Factory: creates a retrieval tool scoped to a specific mentor's knowledge base.
 */
export function createRetrieveKnowledgeTool(mentorSlug: string) {
  return new DynamicStructuredTool({
    name: "retrieveKnowledge",
    description:
      "Search the mentor's knowledge base for relevant expertise, frameworks, and advice. " +
      "Use this whenever the user asks a question you should ground in real knowledge rather than generic advice. " +
      "Returns relevant knowledge chunks that you should weave naturally into your response.",
    schema: retrieveSchema,
    func: async (input) => {
      toolLog("retrieveKnowledge", `Query: "${input.query}" | mentor: ${mentorSlug}`);

      try {
        const embedding = await embedQuery(input.query);

        const { data, error } = await supabase.rpc("match_mentor_knowledge", {
          query_embedding: embedding,
          p_mentor_slug: mentorSlug,
          match_threshold: 0.3,
          match_count: 5,
        });

        if (error) {
          toolLog("retrieveKnowledge", "DB error:", error.message);
          return JSON.stringify({ error: error.message });
        }

        const chunks = (data ?? []).map(
          (row: { content: string; topic: string; similarity: number }) =>
            `[${row.topic}] (relevance: ${row.similarity.toFixed(2)})\n${row.content}`,
        );

        toolLog("retrieveKnowledge", `Found ${chunks.length} chunks`);
        return JSON.stringify({ chunks });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toolLog("retrieveKnowledge", "FAILED:", msg);
        return JSON.stringify({ error: msg });
      }
    },
  });
}
