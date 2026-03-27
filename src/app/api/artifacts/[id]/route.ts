import { getArtifactBuffer } from "@/lib/storage";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !/^[a-f0-9-]+$/.test(id)) {
      return Response.json({ error: "Invalid artifact ID" }, { status: 400 });
    }

    const storageFilename = `${id}.pdf`;
    const { buffer, contentType } = await getArtifactBuffer(storageFilename);

    const url = new URL(req.url);
    const title = url.searchParams.get("title");
    const displayFilename = title ? `${slugify(title)}.pdf` : storageFilename;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${displayFilename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Artifact fetch error:", err);
    return Response.json({ error: "Artifact not found" }, { status: 404 });
  }
}
