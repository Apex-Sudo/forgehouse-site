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
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#1A1A1A",
    marginBottom: 4,
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

function TextBlockView({ block }: { block: TextBlock }) {
  return (
    <View>
      {block.heading && <Text style={styles.sectionHeading}>{block.heading}</Text>}
      <Text style={styles.paragraph}>{block.content}</Text>
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
