export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return Response.json(
        { error: "File too large. Max 2MB." },
        { status: 400 }
      );
    }

    const name = file.name.toLowerCase();
    const allowed = [".txt", ".md", ".csv", ".pdf", ".docx"];
    const ext = allowed.find((e) => name.endsWith(e));

    if (!ext) {
      return Response.json(
        { error: "Unsupported file type. Try .txt, .md, .csv, .pdf, or .docx" },
        { status: 400 }
      );
    }

    let content: string;

    if (ext === ".pdf") {
      // PDF: extract raw text bytes (basic extraction, no library needed)
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      // Pull text between BT/ET blocks or stream content
      const textChunks: string[] = [];
      const regex = /\(([^)]*)\)/g;
      let match;
      while ((match = regex.exec(raw)) !== null) {
        const chunk = match[1].trim();
        if (chunk.length > 1 && /[a-zA-Z]/.test(chunk)) {
          textChunks.push(chunk);
        }
      }
      content = textChunks.join(" ");
      if (content.length < 20) {
        return Response.json(
          {
            error:
              "Could not extract text from this PDF. Try copying the content and pasting it directly.",
          },
          { status: 400 }
        );
      }
    } else if (ext === ".docx") {
      // DOCX: extract from xml inside zip
      // Minimal approach: find <w:t> tags in word/document.xml
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
      const textChunks: string[] = [];
      const regex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
      let match;
      while ((match = regex.exec(raw)) !== null) {
        textChunks.push(match[1]);
      }
      content = textChunks.join(" ");
      if (content.length < 20) {
        return Response.json(
          {
            error:
              "Could not extract text from this .docx. Try copying the content and pasting it directly.",
          },
          { status: 400 }
        );
      }
    } else {
      // Plain text files: .txt, .md, .csv
      content = await file.text();
    }

    // Truncate very long files
    if (content.length > 50000) {
      content = content.slice(0, 50000) + "\n\n[Truncated — file exceeded 50,000 characters]";
    }

    return Response.json({ filename: file.name, content });
  } catch {
    return Response.json(
      { error: "Could not extract text from file. Try copying the content and pasting it directly." },
      { status: 500 }
    );
  }
}
