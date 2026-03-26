import type { DocumentBlock } from "./renderer";

/**
 * Parses markdown-like content into DocumentBlocks for PDF rendering.
 *
 * Supported:
 *   # - ###### Heading  -> text block with heading
 *   ---                 -> hr block (horizontal rule)
 *   Regular text        -> text block (paragraphs)
 *   | H1 | H2 |        -> table block (markdown tables)
 *   :::chart bar "Title"
 *   Label: 100          -> chart block
 *   :::
 */

function sanitizeContent(content: string): string {
  return content
    .replace(/\u2192/g, "->")   // → arrow
    .replace(/\u2190/g, "<-")   // ← arrow
    .replace(/\u2194/g, "<->")  // ↔ arrow
    .replace(/\u2013/g, "-")    // – en-dash
    .replace(/\u2014/g, "--")   // — em-dash
    .replace(/\u2018/g, "'")    // ' left single quote
    .replace(/\u2019/g, "'")    // ' right single quote
    .replace(/\u201C/g, "\"")   // " left double quote
    .replace(/\u201D/g, "\"");  // " right double quote
}

function isHr(line: string): boolean {
  return /^-{3,}\s*$/.test(line.trim()) || /^\*{3,}\s*$/.test(line.trim());
}

function isBlockBoundary(line: string, nextLine?: string): boolean {
  return /^#{1,6}\s/.test(line)
    || line.startsWith(":::chart")
    || (line.startsWith("|") && !!nextLine?.match(/^\|[\s-|]+\|$/))
    || isHr(line);
}

export function parseMarkdownToBlocks(rawContent: string): DocumentBlock[] {
  const content = sanitizeContent(rawContent);
  const blocks: DocumentBlock[] = [];
  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isHr(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    if (line.startsWith(":::chart")) {
      const chartBlock = parseChartBlock(lines, i);
      if (chartBlock) {
        blocks.push(chartBlock.block);
        i = chartBlock.endIndex + 1;
        continue;
      }
    }

    if (line.startsWith("|") && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-|]+\|$/)) {
      const tableBlock = parseTableBlock(lines, i);
      if (tableBlock) {
        blocks.push(tableBlock.block);
        i = tableBlock.endIndex + 1;
        continue;
      }
    }

    if (/^#{1,6}\s/.test(line)) {
      const heading = line.replace(/^#{1,6}\s+/, "").trim();
      const paragraphLines: string[] = [];
      i++;
      while (i < lines.length && !isBlockBoundary(lines[i], lines[i + 1])) {
        paragraphLines.push(lines[i]);
        i++;
      }
      const text = paragraphLines.join("\n").trim();
      if (text || heading) {
        blocks.push({ type: "text", heading, content: text });
      }
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length && !isBlockBoundary(lines[i], lines[i + 1]) && lines[i].trim() !== "") {
      paragraphLines.push(lines[i]);
      i++;
    }
    const text = paragraphLines.join("\n").trim();
    if (text) {
      blocks.push({ type: "text", content: text });
    }
  }

  return blocks;
}

function parseChartBlock(lines: string[], startIndex: number): { block: DocumentBlock; endIndex: number } | null {
  const header = lines[startIndex];
  const match = header.match(/^:::chart\s+(bar|line|area|point|arc)\s+"([^"]+)"/);
  if (!match) return null;

  const chartType = match[1] as "bar" | "line" | "area" | "point" | "arc";
  const title = match[2];
  const data: { label: string; value: number; series?: string }[] = [];

  let xLabel: string | undefined;
  let yLabel: string | undefined;
  let i = startIndex + 1;

  while (i < lines.length && lines[i].trim() !== ":::") {
    const line = lines[i].trim();

    if (line.startsWith("xLabel:")) {
      xLabel = line.replace(/^xLabel:\s*/, "").trim();
    } else if (line.startsWith("yLabel:")) {
      yLabel = line.replace(/^yLabel:\s*/, "").trim();
    } else if (line.includes(":")) {
      const [label, ...rest] = line.split(":");
      const valuePart = rest.join(":").trim().replace(/[,$%]/g, "");
      const value = parseFloat(valuePart);
      if (!isNaN(value)) {
        data.push({ label: label.trim(), value });
      }
    }

    i++;
  }

  if (data.length === 0) return null;

  return {
    block: { type: "chart", title, chartType, data, xLabel, yLabel },
    endIndex: i,
  };
}

function parseTableBlock(lines: string[], startIndex: number): { block: DocumentBlock; endIndex: number } | null {
  const headerLine = lines[startIndex];
  const headers = headerLine.split("|").filter(c => c.trim()).map(c => c.trim());
  if (headers.length === 0) return null;

  let i = startIndex + 1;
  if (lines[i]?.match(/^\|[\s-|]+\|$/)) {
    i++;
  }

  const rows: string[][] = [];
  while (i < lines.length && lines[i].startsWith("|")) {
    const cells = lines[i].split("|").filter(c => c.trim()).map(c => c.trim());
    if (cells.length > 0) {
      rows.push(cells);
    }
    i++;
  }

  if (rows.length === 0) return null;

  return {
    block: { type: "table", headers, rows },
    endIndex: i - 1,
  };
}
