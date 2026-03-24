export type Artifact = {
  id: string;
  type: "pdf";
  title: string;
  url: string;
  createdAt: string;
};

export type TextEvent = { type: "text"; content: string };
export type ArtifactEvent = { type: "artifact"; artifact: Artifact };
export type ErrorEvent = { type: "error"; message: string };

export type StreamEvent = TextEvent | ArtifactEvent | ErrorEvent;

export function encodeEvent(event: StreamEvent): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(JSON.stringify(event) + "\n");
}

export function parseStreamLine(line: string): StreamEvent | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed) as StreamEvent;
  } catch {
    return null;
  }
}

/**
 * Parses a raw NDJSON text chunk that may contain partial or multiple lines.
 * Returns parsed events and any leftover incomplete line.
 */
export function parseStreamChunk(
  chunk: string,
  buffer: string
): { events: StreamEvent[]; remaining: string } {
  const combined = buffer + chunk;
  const lines = combined.split("\n");
  const remaining = lines.pop() ?? "";
  const events: StreamEvent[] = [];

  for (const line of lines) {
    const event = parseStreamLine(line);
    if (event) events.push(event);
  }

  return { events, remaining };
}
