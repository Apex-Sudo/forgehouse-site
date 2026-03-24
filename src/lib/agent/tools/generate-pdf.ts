import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { renderPdf, type DocumentSpec } from "@/lib/pdf/renderer";
import { uploadArtifact } from "@/lib/storage";
import type { Artifact } from "@/lib/agent/stream";

const textBlockSchema = z.object({
  type: z.literal("text"),
  heading: z.string().optional(),
  content: z.string(),
});

const chartBlockSchema = z.object({
  type: z.literal("chart"),
  title: z.string(),
  vegaLiteSpec: z.record(z.unknown()),
});

const tableBlockSchema = z.object({
  type: z.literal("table"),
  headers: z.array(z.string()),
  rows: z.array(z.array(z.string())),
});

const documentSchema = z.object({
  title: z.string().describe("Title of the PDF document"),
  blocks: z
    .array(z.discriminatedUnion("type", [textBlockSchema, chartBlockSchema, tableBlockSchema]))
    .describe(
      "Ordered content blocks. Use 'text' for paragraphs/sections, 'chart' for Vega-Lite visualizations, 'table' for tabular data."
    ),
});

export const generatePdfTool = new DynamicStructuredTool({
  name: "generatePdf",
  description:
    "Generate a PDF document with text sections, tables, and Vega-Lite charts. " +
    "Use when the user asks for a downloadable document, report, action plan, or analysis. " +
    "Returns a link the user can click to download the PDF.",
  schema: documentSchema,
  func: async (input) => {
    const spec: DocumentSpec = {
      title: input.title,
      blocks: input.blocks,
    };

    const pdfBuffer = await renderPdf(spec);

    const id = crypto.randomUUID();
    const filename = `${id}.pdf`;
    await uploadArtifact(pdfBuffer, filename);

    const artifact: Artifact = {
      id,
      type: "pdf",
      title: input.title,
      url: `/api/artifacts/${id}`,
      createdAt: new Date().toISOString(),
    };

    return JSON.stringify({ artifact });
  },
});
