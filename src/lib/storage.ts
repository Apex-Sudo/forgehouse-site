import { supabase } from "./supabase";

const BUCKET = "artifacts";

export async function uploadArtifact(
  buffer: Buffer,
  filename: string,
  contentType = "application/pdf"
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType, upsert: true });

  if (error) {
    throw new Error(`Failed to upload artifact: ${error.message}`);
  }

  return filename;
}

export async function getArtifactBuffer(
  filename: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(filename);

  if (error || !data) {
    throw new Error(`Artifact not found: ${filename}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    contentType: data.type,
  };
}
