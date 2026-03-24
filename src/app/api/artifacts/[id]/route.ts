import { getArtifactBuffer } from "@/lib/storage";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[a-f0-9-]+$/.test(id)) {
      return Response.json({ error: "Invalid artifact ID" }, { status: 400 });
    }

    const filename = `${id}.pdf`;
    const { buffer, contentType } = await getArtifactBuffer(filename);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Artifact fetch error:", err);
    return Response.json({ error: "Artifact not found" }, { status: 404 });
  }
}
