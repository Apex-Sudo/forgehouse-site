import { getMentorPricing } from "@/lib/mentor-pricing";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pricing = await getMentorPricing(slug);
    
    if (!pricing) {
      return Response.json({ error: "Mentor not found" }, { status: 404 });
    }
    
    return Response.json({
      monthlyPrice: pricing.monthlyPrice,
      mentorName: pricing.mentorName,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch pricing";
    console.error("Pricing fetch error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}