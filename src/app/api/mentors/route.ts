import { supabase } from "@/lib/supabase";
import { ONBOARDING_DEFAULT_STARTERS } from "@/lib/onboarding-mentor-defaults";

// Function to generate a URL-friendly slug from mentor name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50); // Limit length
}

export async function GET() {
  const { data, error } = await supabase
    .from("mentors")
    .select("slug, name, tagline, avatar_url, monthly_price, is_free")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("Mentors fetch error:", error);
    return Response.json({ error: "Failed to fetch mentors" }, { status: 500 });
  }

  return Response.json({ mentors: data });
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    // Validate input
    if (!name) {
      return Response.json({ error: "Missing required field: name" }, { status: 400 });
    }

    // Generate slug from mentor name
    let slug = generateSlug(name);
    
    // Check if mentor already exists
    const { data: existingMentor, error: fetchError } = await supabase
      .from("mentors")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle(); // Use maybeSingle to avoid errors when no rows found

    if (fetchError) {
      console.error("Error checking existing mentor:", fetchError);
      // Continue anyway, try to insert
    }

    if (existingMentor) {
      // Mentor already exists, no need to insert
      return Response.json({ 
        success: true, 
        mentor: existingMentor,
        message: "Mentor already exists." 
      });
    }

    // Try to insert new mentor into the database
    const { data, error } = await supabase
      .from("mentors")
      .insert([
        {
          slug: slug,
          name: name,
          active: false,
          sort_order: 100, // Default sort order
          tagline: "Expert Mentor",
          avatar_url: `/mentors/default-avatar.svg`,
          system_prompt: `You are ${name}, an expert mentor. Provide helpful, insightful advice based on your expertise.`,
          welcome_message: `Hi, I'm ${name}. I'm here to help you with expert advice based on my years of experience.`,
          default_starters: [...ONBOARDING_DEFAULT_STARTERS],
          starters_hint: "Try asking about their expertise or experience...",
          bio: `I'm ${name}, an expert in my field with years of experience helping others achieve their goals.`,
          monthly_price: 29900, // $299 in cents
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting mentor:", error);
      // If it's a duplicate key error, try to fetch the existing mentor
      if (error.code === '23505') {
        // Try to fetch the existing mentor
        const { data: existingData, error: existingError } = await supabase
          .from("mentors")
          .select("*")
          .eq("slug", slug)
          .single();
          
        if (existingData && !existingError) {
          return Response.json({ 
            success: true, 
            mentor: existingData,
            message: "Mentor already exists." 
          });
        }
      }
      return Response.json({ error: "Failed to add mentor to database" }, { status: 500 });
    }

    return Response.json({ 
      success: true, 
      mentor: data,
      message: "Mentor added successfully. Will be activated after processing." 
    });
  } catch (error) {
    console.error("Error in POST /api/mentors:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
