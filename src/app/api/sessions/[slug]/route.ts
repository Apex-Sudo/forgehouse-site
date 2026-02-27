import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "extraction";

  if (!["extraction", "calibration"].includes(type)) {
    return Response.json({ error: "Invalid type" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("fh_sessions")
    .select("messages, exchange_count")
    .eq("slug", slug)
    .eq("type", type)
    .single();

  if (error || !data) {
    return Response.json({ messages: [], exchange_count: 0 });
  }

  return Response.json(data);
}
