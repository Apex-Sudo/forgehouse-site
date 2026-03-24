import * as vl from "vega-lite";
import * as vega from "vega";
import sharp from "sharp";

/**
 * Compiles a Vega-Lite spec and renders it to a PNG buffer.
 * Uses vega SVG renderer (no canvas dep) then sharp for SVG→PNG.
 */
export async function renderChart(
  vegaLiteSpec: Record<string, unknown>,
  width = 600,
  height = 400
): Promise<Buffer> {
  const spec = {
    ...vegaLiteSpec,
    width,
    height,
    config: {
      background: "white",
      ...(vegaLiteSpec.config as Record<string, unknown>),
    },
  };

  const vegaSpec = vl.compile(spec as vl.TopLevelSpec).spec;
  const view = new vega.View(vega.parse(vegaSpec), { renderer: "none" });
  await view.runAsync();

  const svgString = await view.toSVG();
  view.finalize();

  const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
  return pngBuffer;
}
