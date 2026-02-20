import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "text/csv",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    let text = "";

    if (file.type === "text/plain" || file.type === "text/markdown" || file.type === "text/csv" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
      text = await file.text();
    } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      // For PDF: extract raw text (basic approach)
      const buffer = await file.arrayBuffer();
      text = extractTextFromPDF(new Uint8Array(buffer));
    } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.endsWith(".docx")) {
      // For DOCX: extract raw text
      const buffer = await file.arrayBuffer();
      text = extractTextFromDocx(new Uint8Array(buffer));
    } else {
      // Try as plain text anyway
      try {
        text = await file.text();
      } catch {
        return NextResponse.json({ error: `Unsupported file type: ${file.type}. Try .txt, .md, .pdf, or .docx` }, { status: 400 });
      }
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "Could not extract text from file. Try copying the content and pasting it directly." }, { status: 400 });
    }

    // Truncate if very long
    const maxChars = 15000;
    const truncated = text.length > maxChars;
    const content = truncated ? text.slice(0, maxChars) + "\n\n[...truncated, file was too long]" : text;

    return NextResponse.json({
      ok: true,
      filename: file.name,
      content,
      truncated,
      chars: text.length,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process file" }, { status: 500 });
  }
}

// Basic PDF text extraction (handles simple PDFs without external deps)
function extractTextFromPDF(data: Uint8Array): string {
  const str = new TextDecoder("latin1").decode(data);
  const texts: string[] = [];

  // Extract text between BT and ET operators
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(str)) !== null) {
    const block = match[1];
    // Extract text in parentheses (Tj operator)
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      texts.push(tjMatch[1]);
    }
    // TJ array
    const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = tjArrMatch[1];
      const innerTextRegex = /\(([^)]*)\)/g;
      let innerMatch;
      while ((innerMatch = innerTextRegex.exec(inner)) !== null) {
        texts.push(innerMatch[1]);
      }
    }
  }

  return texts.join(" ").replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
}

// Basic DOCX text extraction (XML inside ZIP)
function extractTextFromDocx(data: Uint8Array): string {
  // DOCX is a ZIP file. Find document.xml and extract text nodes.
  const str = new TextDecoder("latin1").decode(data);

  // Very basic: find <w:t> tags
  const texts: string[] = [];
  const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    texts.push(match[1]);
  }

  // Also try to catch paragraph breaks
  return texts.join(" ").replace(/\s+/g, " ").trim();
}
