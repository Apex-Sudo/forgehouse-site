import * as vl from "vega-lite";
import * as vega from "vega";
import sharp from "sharp";
import type { ChartBlock } from "./renderer";
import { toolLog } from "@/lib/tool-logger";

export function buildVegaLiteSpec(chart: ChartBlock): Record<string, unknown> {
  const values = chart.data.map((d) => ({
    label: d.label,
    value: d.value,
    ...(d.series ? { series: d.series } : {}),
  }));

  if (chart.chartType === "arc") {
    return {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: { values },
      mark: { type: "arc", innerRadius: 50 },
      encoding: {
        theta: { field: "value", type: "quantitative", stack: true },
        color: {
          field: "label",
          type: "nominal",
          legend: { title: null },
        },
      },
    };
  }

  const hasSeries = chart.data.some((d) => d.series);

  const encoding: Record<string, unknown> = {
    x: {
      field: "label",
      type: chart.chartType === "line" ? "ordinal" : "nominal",
      axis: { title: chart.xLabel ?? null },
    },
    y: {
      field: "value",
      type: "quantitative",
      axis: { title: chart.yLabel ?? null },
    },
  };

  if (hasSeries) {
    encoding.color = { field: "series", type: "nominal" };
  }

  return {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values },
    mark: { type: chart.chartType, tooltip: true },
    encoding,
  };
}

export async function renderChart(
  vegaLiteSpec: Record<string, unknown>,
  width = 600,
  height = 400
): Promise<Buffer | null> {
  try {
    const spec = {
      ...vegaLiteSpec,
      width,
      height,
      config: {
        background: "white",
        ...(vegaLiteSpec.config as Record<string, unknown>),
      },
    };

    toolLog("chart-renderer", "Compiling Vega-Lite spec:", JSON.stringify(spec).slice(0, 1000));
    const vegaSpec = vl.compile(spec as vl.TopLevelSpec).spec;

    toolLog("chart-renderer", "Parsing and running Vega view...");
    const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });
    await view.runAsync();

    const svgString = await view.toSVG();
    view.finalize();

    toolLog("chart-renderer", "Converting SVG to PNG...");
    const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
    toolLog("chart-renderer", "Chart rendered:", pngBuffer.length, "bytes");
    return pngBuffer;
  } catch (err) {
    toolLog("chart-renderer", "FAILED:", err instanceof Error ? err.message : String(err));
    toolLog("chart-renderer", "Stack:", err instanceof Error ? err.stack : "");
    toolLog("chart-renderer", "Spec was:", JSON.stringify(vegaLiteSpec).slice(0, 1000));
    return null;
  }
}
