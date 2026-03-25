import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { renderChart, buildVegaLiteSpec } from "./chart-renderer";
import { toolLog } from "@/lib/tool-logger";

export type TextBlock = {
  type: "text";
  heading?: string;
  content: string;
};

export type ChartDataPoint = {
  label: string;
  value: number;
  series?: string;
};

export type ChartBlock = {
  type: "chart";
  title: string;
  chartType: "bar" | "line" | "area" | "point" | "arc";
  data: ChartDataPoint[];
  xLabel?: string;
  yLabel?: string;
};

export type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][];
};

export type DocumentBlock = TextBlock | ChartBlock | TableBlock;

export type DocumentSpec = {
  title: string;
  blocks: DocumentBlock[];
};

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1A1A1A",
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#B8916A",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 9,
    color: "#888",
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1A1A1A",
    marginTop: 20,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 10,
  },
  chartContainer: {
    marginTop: 12,
    marginBottom: 16,
    alignItems: "center" as const,
  },
  chartTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#555",
    marginBottom: 6,
    textAlign: "center" as const,
  },
  chartImage: {
    maxWidth: 480,
  },
  table: {
    marginTop: 8,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E2DC",
    minHeight: 28,
    alignItems: "center" as const,
  },
  tableHeaderRow: {
    flexDirection: "row" as const,
    borderBottomWidth: 2,
    borderBottomColor: "#B8916A",
    minHeight: 30,
    alignItems: "center" as const,
    backgroundColor: "#FAFAF8",
  },
  tableCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 10,
  },
  tableHeaderCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#555",
  },
  footer: {
    position: "absolute" as const,
    bottom: 24,
    left: 48,
    right: 48,
    textAlign: "center" as const,
    fontSize: 8,
    color: "#AAA",
    borderTopWidth: 1,
    borderTopColor: "#E5E2DC",
    paddingTop: 8,
  },
});

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <Text key={key++} style={{ fontFamily: "Helvetica-Bold" }}>{match[1]}</Text>
      );
    } else if (match[2]) {
      parts.push(
        <Text key={key++} style={{ fontStyle: "italic" }}>{match[2]}</Text>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function TextBlockView({ block }: { block: TextBlock }) {
  if (!block.content) {
    return (
      <View>
        {block.heading && <Text style={styles.sectionHeading}>{block.heading}</Text>}
      </View>
    );
  }

  const lines = block.content.split("\n");
  const elements: React.ReactNode[] = [];
  let paragraphBuffer: string[] = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ");
    elements.push(
      <Text key={key++} style={styles.paragraph}>{renderInlineMarkdown(text)}</Text>
    );
    paragraphBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^[-*]\s+\[[ x]\]\s/.test(trimmed)) {
      flushParagraph();
      const checked = /^[-*]\s+\[x\]/i.test(trimmed);
      const itemText = trimmed.replace(/^[-*]\s+\[[ x]\]\s+/, "");
      elements.push(
        <View key={key++} style={{ flexDirection: "row", marginBottom: 3, paddingLeft: 8 }}>
          <Text style={{ width: 16, fontSize: 11 }}>{checked ? "☑" : "☐"}</Text>
          <Text style={{ flex: 1 }}>{renderInlineMarkdown(itemText)}</Text>
        </View>
      );
    } else if (/^[-*]\s/.test(trimmed)) {
      flushParagraph();
      const itemText = trimmed.replace(/^[-*]\s+/, "");
      elements.push(
        <View key={key++} style={{ flexDirection: "row", marginBottom: 3, paddingLeft: 8 }}>
          <Text style={{ width: 12, fontSize: 11 }}>•</Text>
          <Text style={{ flex: 1 }}>{renderInlineMarkdown(itemText)}</Text>
        </View>
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      flushParagraph();
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        elements.push(
          <View key={key++} style={{ flexDirection: "row", marginBottom: 3, paddingLeft: 8 }}>
            <Text style={{ width: 18, fontSize: 11 }}>{numMatch[1]}.</Text>
            <Text style={{ flex: 1 }}>{renderInlineMarkdown(numMatch[2])}</Text>
          </View>
        );
      }
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      paragraphBuffer.push(trimmed);
    }
  }

  flushParagraph();

  return (
    <View>
      {block.heading && <Text style={styles.sectionHeading}>{block.heading}</Text>}
      {elements}
    </View>
  );
}

function ChartBlockView({ block, chartPng }: { block: ChartBlock; chartPng: Buffer }) {
  const src = `data:image/png;base64,${chartPng.toString("base64")}`;
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{block.title}</Text>
      <Image style={styles.chartImage} src={src} />
    </View>
  );
}

function TableBlockView({ block }: { block: TableBlock }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeaderRow}>
        {block.headers.map((h, i) => (
          <Text key={i} style={styles.tableHeaderCell}>{h}</Text>
        ))}
      </View>
      {block.rows.map((row, ri) => (
        <View key={ri} style={styles.tableRow}>
          {row.map((cell, ci) => (
            <Text key={ci} style={styles.tableCell}>{cell}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export async function renderPdf(spec: DocumentSpec): Promise<Buffer> {
  const chartPngs = new Map<number, Buffer>();
  const failedCharts = new Set<number>();

  toolLog("pdf-renderer", "Rendering PDF:", spec.title, "—", spec.blocks.length, "blocks");

  for (let i = 0; i < spec.blocks.length; i++) {
    const block = spec.blocks[i];
    if (block.type === "chart") {
      toolLog("pdf-renderer", `Rendering chart block ${i}: "${block.title}" (${block.chartType})`);
      const vegaLiteSpec = buildVegaLiteSpec(block);
      toolLog("pdf-renderer", `Built Vega-Lite spec for block ${i}:`, JSON.stringify(vegaLiteSpec).slice(0, 500));
      const png = await renderChart(vegaLiteSpec);
      if (png) {
        chartPngs.set(i, png);
      } else {
        failedCharts.add(i);
        toolLog("pdf-renderer", `Chart block ${i} ("${block.title}") failed — will show placeholder text`);
      }
    }
  }

  const now = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const doc = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{spec.title}</Text>
          <Text style={styles.subtitle}>Generated by ForgeHouse | {now}</Text>
        </View>

        {spec.blocks.map((block, i) => {
          switch (block.type) {
            case "text":
              return <TextBlockView key={i} block={block} />;
            case "chart": {
              if (failedCharts.has(i)) {
                return (
                  <View key={i} style={{ marginTop: 12, marginBottom: 16, padding: 12, backgroundColor: "#F5F5F5", borderRadius: 4 }}>
                    <Text style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>
                      [Chart: {block.title} — could not be rendered]
                    </Text>
                  </View>
                );
              }
              const png = chartPngs.get(i);
              if (!png) return null;
              return <ChartBlockView key={i} block={block} chartPng={png} />;
            }
            case "table":
              return <TableBlockView key={i} block={block} />;
          }
        })}

        <Text style={styles.footer}>ForgeHouse | forgehouse.io</Text>
      </Page>
    </Document>
  );

  toolLog("pdf-renderer", "Rendering final PDF buffer...");
  const buffer = await renderToBuffer(doc);
  toolLog("pdf-renderer", "PDF rendered:", buffer.length, "bytes");
  return buffer;
}
