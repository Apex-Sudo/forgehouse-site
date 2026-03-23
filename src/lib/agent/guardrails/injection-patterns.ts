type PatternCategory = {
  weight: number;
  patterns: RegExp[];
};

const CATEGORIES: PatternCategory[] = [
  {
    weight: 3,
    patterns: [
      /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions|prompts|rules|directives)/i,
      /disregard\s+(your|all|the|previous)\s+(system\s*)?(prompt|instructions|rules|directives)/i,
      /override\s+(your|all|the)\s+(system\s*)?(prompt|instructions|rules|guidelines)/i,
      /forget\s+(all\s+)?(your|previous|prior)\s+(instructions|rules|training|directives)/i,
      /do\s+not\s+follow\s+(your|the|any)\s+(previous|original|system)\s*(instructions|rules|prompt)/i,
    ],
  },
  {
    weight: 3,
    patterns: [
      /what\s+are\s+your\s+(system\s*)?(instructions|prompt|rules|directives|guidelines)/i,
      /repeat\s+(your|the)\s+(system\s*)?(prompt|instructions|rules)/i,
      /show\s+(me\s+)?(your|the)\s+(system\s*)?(prompt|instructions|rules|guidelines)/i,
      /print\s+(your|the)\s+(system\s*)?(prompt|instructions|rules)/i,
      /reveal\s+(your|the)\s+(system\s*)?(prompt|instructions|rules|configuration)/i,
      /output\s+(your|the)\s+(system\s*)?(prompt|instructions|rules|configuration)/i,
      /display\s+(your|the)\s+(system\s*)?(prompt|instructions|rules)/i,
      /tell\s+me\s+(your|the)\s+(system\s*)?(prompt|instructions|rules|configuration)/i,
      /paste\s+(your|the)\s+(system\s*)?(prompt|instructions|rules)/i,
      /copy\s+(your|the)\s+(system\s*)?(prompt|instructions|rules)/i,
    ],
  },
  {
    weight: 2,
    patterns: [
      /you\s+are\s+now\s+(a|an|in)\s/i,
      /pretend\s+(you|that\s+you)\s+(have\s+no|are\s+not|don'?t\s+have)\s+(restrictions|rules|limits|guidelines)/i,
      /enter\s+(developer|debug|admin|maintenance|sudo|god)\s+mode/i,
      /developer\s+mode\s+enabled/i,
      /switch\s+to\s+(unrestricted|unfiltered|jailbreak)/i,
      /\bDAN\b.*\bmode\b/i,
      /\bjailbreak\b/i,
      /\bdo\s+anything\s+now\b/i,
    ],
  },
  {
    weight: 2,
    patterns: [
      /as\s+(the|your|an?)\s+(admin|developer|owner|creator|operator|maintainer)\b/i,
      /i\s+(am|'m)\s+(the|your|an?)\s+(admin|developer|owner|creator|operator)\b/i,
      /maintenance\s+mode\s*(activated|enabled|on)/i,
      /with\s+(admin|root|developer|elevated)\s+(access|privileges|permissions)/i,
      /authorized\s+to\s+(access|view|see|read)\s+(your|the)\s+(system|internal|hidden)/i,
    ],
  },
];

const BLOCK_THRESHOLD = 3;

export type GuardrailResult = {
  blocked: boolean;
  reason: string;
  score: number;
};

export function checkInjection(message: string): GuardrailResult {
  const normalized = message.replace(/\s+/g, " ").trim();

  let totalScore = 0;
  const matchedCategories: string[] = [];

  for (const category of CATEGORIES) {
    for (const pattern of category.patterns) {
      if (pattern.test(normalized)) {
        totalScore += category.weight;
        matchedCategories.push(pattern.source);
        break;
      }
    }
  }

  // Base64 evasion: decode any base64 blobs and re-check
  const base64Chunks = normalized.match(/[A-Za-z0-9+/]{20,}={0,2}/g);
  if (base64Chunks) {
    for (const chunk of base64Chunks) {
      try {
        const decoded = Buffer.from(chunk, "base64").toString("utf-8");
        if (/[\x20-\x7E]{10,}/.test(decoded)) {
          const nested = checkInjection(decoded);
          if (nested.score > 0) {
            totalScore += nested.score;
            matchedCategories.push(`base64(${nested.reason})`);
          }
        }
      } catch {
        // not valid base64
      }
    }
  }

  const blocked = totalScore >= BLOCK_THRESHOLD;
  return {
    blocked,
    reason: blocked
      ? matchedCategories.join("; ")
      : "",
    score: totalScore,
  };
}
