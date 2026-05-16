import { supabase } from "@/lib/supabase";

const CATEGORY_LABELS: Record<string, string> = {
  productivity: "Productivity",
  business: "Business",
  code: "Code",
  research: "Research",
};

interface PromptRow {
  id: string;
  category: string;
  title: string;
  description: string;
  prompt_text: string;
  sort_order: number;
}

export async function GET() {
  const { data, error } = await supabase
    .from("prompts")
    .select("id, category, title, description, prompt_text, sort_order")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Prompts fetch error:", error);
    return Response.json({ error: "Failed to fetch prompts" }, { status: 500 });
  }

  const rows = (data ?? []) as PromptRow[];

  // Group by category preserving order
  const categoryOrder = ["productivity", "business", "code", "research"];
  const categories = categoryOrder
    .filter((slug) => rows.some((r) => r.category === slug))
    .map((slug) => ({
      slug,
      name: CATEGORY_LABELS[slug] ?? slug,
      prompts: rows
        .filter((r) => r.category === slug)
        .map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          prompt_text: r.prompt_text,
        })),
    }));

  return Response.json({ categories });
}
