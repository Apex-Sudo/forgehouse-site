/**
 * Extraction assistant messages end with a machine-readable block so the client
 * can detect readiness without a fixed exchange count. The block is stripped for display/storage.
 */

export const EXTRACTION_META_DELIMITER = "\n<<<FORGEHOUSE_EXTRACTION_META>>>\n";

/** User exchanges at or above this unlock progression even if the model never sets complete. */
export const EXTRACTION_EXCHANGE_ESCAPE_HATCH = 40;

export function stripExtractionMetaForDisplay(raw: string): string {
  const i = raw.indexOf("<<<FORGEHOUSE");
  if (i !== -1) {
    const prefix = raw.slice(0, i);
    return prefix.replace(/\s+$/, "");
  }
  return raw;
}

export function parseExtractionAssistantPayload(raw: string): {
  display: string;
  complete: boolean;
} {
  const idx = raw.indexOf(EXTRACTION_META_DELIMITER);
  if (idx === -1) {
    return { display: stripExtractionMetaForDisplay(raw), complete: false };
  }

  const display = raw.slice(0, idx).trimEnd();
  const jsonPart = raw.slice(idx + EXTRACTION_META_DELIMITER.length).trim();

  try {
    const parsed = JSON.parse(jsonPart) as { complete?: unknown };
    return {
      display,
      complete: parsed.complete === true,
    };
  } catch {
    return { display, complete: false };
  }
}
