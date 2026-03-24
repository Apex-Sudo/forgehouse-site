import { supabase } from "../supabase";

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

export async function retrieveKnowledge(
  query: string,
  mentorSlug: string,
  limit = 5,
  threshold = 0.3
): Promise<string[]> {
  const embedding = await embedQuery(query);

  const { data, error } = await supabase.rpc("match_mentor_knowledge", {
    query_embedding: embedding,
    p_mentor_slug: mentorSlug,
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error("Knowledge retrieval error:", error);
    return [];
  }

  return (data ?? []).map(
    (row: { content: string; topic: string; similarity: number }) =>
      `[${row.topic}]\n${row.content}`
  );
}
