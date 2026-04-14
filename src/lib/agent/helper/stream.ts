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
export type StatusEvent = { type: "status"; message: string };

export type StreamEvent = TextEvent | ArtifactEvent | ErrorEvent | StatusEvent;

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

/**
 * Reads an NDJSON event stream, accumulates text content, and calls back
 * on each chunk so the caller can update UI progressively.
 * Returns the fully accumulated assistant text.
 */
export async function readNdjsonStream(
  body: ReadableStream<Uint8Array>,
  onText: (accumulated: string) => void,
): Promise<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let ndjsonBuffer = "";
  let accumulated = "";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const raw = decoder.decode(value, { stream: true });
    const { events, remaining } = parseStreamChunk(raw, ndjsonBuffer);
    ndjsonBuffer = remaining;

    for (const event of events) {
      if (event.type === "text") {
        accumulated += event.content;
      } else if (event.type === "error") {
        accumulated += `\n[Error: ${event.message}]`;
      }
    }

    onText(accumulated);
  }

  return accumulated;
}

const ARTIFACT_MARKER = "<!--artifacts:";
const ARTIFACT_MARKER_END = "-->";

export function embedArtifacts(content: string, artifacts: Artifact[]): string {
  if (artifacts.length === 0) return content;
  return `${content}\n\n${ARTIFACT_MARKER}${JSON.stringify(artifacts)}${ARTIFACT_MARKER_END}`;
}

export function extractArtifacts(content: string): { content: string; artifacts: Artifact[] } {
  const markerStart = content.indexOf(ARTIFACT_MARKER);
  if (markerStart === -1) return { content, artifacts: [] };

  const jsonStart = markerStart + ARTIFACT_MARKER.length;
  const jsonEnd = content.indexOf(ARTIFACT_MARKER_END, jsonStart);
  if (jsonEnd === -1) return { content, artifacts: [] };

  try {
    const artifacts = JSON.parse(content.slice(jsonStart, jsonEnd)) as Artifact[];
    const cleanContent = content.slice(0, markerStart).trimEnd();
    return { content: cleanContent, artifacts };
  } catch {
    return { content, artifacts: [] };
  }
}
