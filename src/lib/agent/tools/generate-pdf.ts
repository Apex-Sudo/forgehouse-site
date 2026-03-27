import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { renderPdf, type DocumentSpec } from "@/lib/pdf/renderer";
import { uploadArtifact } from "@/lib/storage";
import type { Artifact } from "@/lib/agent/helper/stream";
import { toolLog } from "@/lib/tool-logger";
import { parseMarkdownToBlocks } from "@/lib/pdf/markdown-parser";

const documentSchema = z.object({
  title: z.string().describe("Title of the PDF document"),
  content: z.string().describe(
    "The full document content as formatted text. " +
    "Use '## Heading' for section headings. " +
    "Use markdown tables (| Col1 | Col2 |) for tabular data. " +
    "For charts use: :::chart bar \"Chart Title\"\\nLabel1: 100\\nLabel2: 200\\n::: " +
    "(supported chart types: bar, line, area, point, arc)"
  ),
});

export const generatePdfTool = new DynamicStructuredTool({
  name: "generatePdf",
  description:
    "Generate a PDF document. Use when the user asks for a downloadable report, plan, or analysis. " +
    "Write the document content as formatted text with ## headings, markdown tables, and :::chart blocks. " +
    "Returns a download link.",
  schema: documentSchema,
  func: async (input) => {
    toolLog("generatePdf", "Tool invoked. Title:", input.title);
    toolLog("generatePdf", "Content length:", input.content?.length ?? 0);
    toolLog("generatePdf", "Content preview:", input.content?.slice(0, 500));

    if (!input.content || input.content.trim().length === 0) {
      toolLog("generatePdf", "EMPTY CONTENT");
      return JSON.stringify({
        error: "You must provide 'content' — the document body text with ## headings, tables, and optional :::chart blocks.",
      });
    }

    try {
      const blocks = parseMarkdownToBlocks(input.content);
      toolLog("generatePdf", "Parsed blocks:", blocks.length, "types:", blocks.map(b => b.type).join(", "));

      if (blocks.length === 0) {
        blocks.push({ type: "text", content: input.content });
      }

      const spec: DocumentSpec = { title: input.title, blocks };
      const pdfBuffer = await renderPdf(spec);

      toolLog("generatePdf", "PDF rendered, uploading...");
      const id = crypto.randomUUID();
      const filename = `${id}.pdf`;
      await uploadArtifact(pdfBuffer, filename);
      toolLog("generatePdf", "Uploaded as:", filename);

      const artifact: Artifact = {
        id,
        type: "pdf",
        title: input.title,
        url: `/api/artifacts/${id}?title=${encodeURIComponent(input.title)}`,
        createdAt: new Date().toISOString(),
      };

      toolLog("generatePdf", "SUCCESS:", id);
      return JSON.stringify({ artifact });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toolLog("generatePdf", "FAILED:", message);
      toolLog("generatePdf", "Stack:", err instanceof Error ? err.stack : "");

      return JSON.stringify({
        error: `PDF generation failed: ${message}`,
        suggestion: "Tell the user the document could not be generated. Offer to try with simpler content.",
      });
    }
  },
});
