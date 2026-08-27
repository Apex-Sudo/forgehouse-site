/**
 * Reading text out of an Anthropic Messages response.
 *
 * Do NOT reach for `response.content[0].text`. Current models run adaptive
 * thinking by default, so a response is commonly `[thinking, text]` and index 0
 * is the thinking block — `.text` there is undefined. This is silent: the
 * request returns HTTP 200 with a perfectly good answer sitting in content[1].
 *
 * That assumption held on claude-sonnet-4, which did not emit thinking blocks,
 * and broke everywhere at once when the models were migrated to sonnet-5 — the
 * four public marketing tools returned "Unexpected response" on every call and
 * onboarding ingest 500'd on the last step of the flow.
 *
 * Always select the block by type instead of by position.
 */

type MaybeTextBlock = { type?: string; text?: unknown };

/**
 * First `text` block's content, or "" when the response carries none
 * (e.g. a refusal, or a turn that produced only tool_use).
 */
export function textFromContent(content: unknown): string {
  if (!Array.isArray(content)) return "";
  for (const block of content as MaybeTextBlock[]) {
    if (block?.type === "text" && typeof block.text === "string") {
      return block.text;
    }
  }
  return "";
}

/**
 * Same, but throws when there is no text block — for callers that cannot
 * meaningfully continue without one and would otherwise fail further down on a
 * confusing undefined.
 */
export function requireTextFromContent(content: unknown, context: string): string {
  const text = textFromContent(content);
  if (!text) {
    const types = Array.isArray(content)
      ? (content as MaybeTextBlock[]).map((b) => b?.type).join(", ")
      : typeof content;
    throw new Error(`${context}: response contained no text block (blocks: ${types})`);
  }
  return text;
}
