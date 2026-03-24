import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { renderPdf, type DocumentSpec, type DocumentBlock } from "@/lib/pdf/renderer";
import { uploadArtifact } from "@/lib/storage";
import type { Artifact } from "@/lib/agent/stream";
import { toolLog } from "@/lib/tool-logger";

const blockSchema = z.object({
  type: z.enum(["text", "chart", "table"]).describe("Block type"),
  heading: z.string().optional().describe("Section heading (for text blocks)"),
  content: z.string().optional().describe("Paragraph text (required for text blocks)"),
  title: z.string().optional().describe("Chart title (required for chart blocks)"),
  chartType: z
    .enum(["bar", "line", "area", "point", "arc"])
    .optional()
    .describe("Chart type (required for chart blocks): 'bar', 'line', 'area', 'point', 'arc'"),
  data: z
    .array(z.object({
      label: z.string(),
      value: z.number(),
      series: z.string().optional(),
    }))
    .optional()
    .describe("Data points (required for chart blocks): [{label, value, series?}]"),
  xLabel: z.string().optional().describe("X-axis label (chart blocks)"),
  yLabel: z.string().optional().describe("Y-axis label (chart blocks)"),
  headers: z.array(z.string()).optional().describe("Column headers (required for table blocks)"),
  rows: z.array(z.array(z.string())).optional().describe("Table rows (required for table blocks)"),
});

const documentSchema = z.object({
  title: z.string().describe("Title of the PDF document"),
  blocks: z
    .array(blockSchema)
    .describe("Ordered content blocks. Each block has a 'type' field ('text', 'chart', or 'table') and the fields relevant to that type."),
});

function validateAndConvertBlocks(rawBlocks: z.infer<typeof blockSchema>[]): DocumentBlock[] {
  return rawBlocks.map((b, i) => {
    switch (b.type) {
      case "text":
        return { type: "text" as const, heading: b.heading, content: b.content ?? "" };
      case "chart":
        return {
          type: "chart" as const,
          title: b.title ?? `Chart ${i + 1}`,
          chartType: b.chartType ?? "bar",
          data: b.data ?? [],
          xLabel: b.xLabel,
          yLabel: b.yLabel,
        };
      case "table":
        return {
          type: "table" as const,
          headers: b.headers ?? [],
          rows: b.rows ?? [],
        };
    }
  });
}

export const generatePdfTool = new DynamicStructuredTool({
  name: "generatePdf",
  description:
    "Generate a PDF document with text sections, tables, and charts. " +
    "Use when the user asks for a downloadable document, report, action plan, or analysis. " +
    "For charts: set type='chart' and provide chartType + data (array of {label, value} objects). " +
    "For text: set type='text' and provide content (and optional heading). " +
    "For tables: set type='table' and provide headers + rows. " +
    "Returns a link the user can click to download the PDF.",
  schema: documentSchema,
  func: async (input) => {
    toolLog("generatePdf", "Tool invoked. Title:", input.title);
    toolLog("generatePdf", "Blocks:", input.blocks.length, "types:", input.blocks.map(b => b.type).join(", "));
    toolLog("generatePdf", "Full input:", JSON.stringify(input).slice(0, 2000));

    try {
      const blocks = validateAndConvertBlocks(input.blocks);
      toolLog("generatePdf", "Validated blocks:", blocks.length);

      const spec: DocumentSpec = {
        title: input.title,
        blocks,
      };

      const pdfBuffer = await renderPdf(spec);

      toolLog("generatePdf", "PDF rendered, uploading to storage...");
      const id = crypto.randomUUID();
      const filename = `${id}.pdf`;
      await uploadArtifact(pdfBuffer, filename);
      toolLog("generatePdf", "Uploaded as:", filename);

      const artifact: Artifact = {
        id,
        type: "pdf",
        title: input.title,
        url: `/api/artifacts/${id}`,
        createdAt: new Date().toISOString(),
      };

      toolLog("generatePdf", "SUCCESS — returning artifact:", id);
      return JSON.stringify({ artifact });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : "";
      toolLog("generatePdf", "FAILED:", message);
      toolLog("generatePdf", "Stack:", stack);

      return JSON.stringify({
        error: `PDF generation failed: ${message}`,
        suggestion: "Tell the user: the document could not be generated due to a technical issue. Offer to try again with simpler content (tables instead of charts, fewer sections).",
      });
    }
  },
});
