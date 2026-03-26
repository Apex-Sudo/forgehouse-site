import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

const LOG_DIR = join(process.cwd(), ".logs");
const LOG_FILE = join(LOG_DIR, "pdf-tool.log");

try {
  mkdirSync(LOG_DIR, { recursive: true });
} catch {
  // already exists
}

export function toolLog(tag: string, ...args: unknown[]) {
  const timestamp = new Date().toISOString();
  const message = args
    .map((a) => (typeof a === "string" ? a : JSON.stringify(a, null, 2)))
    .join(" ");
  const line = `[${timestamp}] [${tag}] ${message}\n`;
  try {
    appendFileSync(LOG_FILE, line);
  } catch {
    // fallback to console if file write fails
    console.log(line);
  }
}
