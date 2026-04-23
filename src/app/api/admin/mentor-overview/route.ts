import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { isAdminOrMentor } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

interface MentorStat {
  name: string;
  slug: string;
  conversationCount: number;
  messageCount: number;
  lastConversationAt: string | null;
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (session.user as any)?.role;
    
    // Admin sees all mentors; mentor sees only their own
    if (!isAdminOrMentor(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    let mentorSlugs: string[] = [];
    
    if (role === "admin") {
      // Fetch all mentor slugs
      const { data: allMentors, error: mentorsError } = await supabase
        .from("mentors")
        .select("slug, name, is_active");
      
      if (mentorsError) {
        console.error("Error fetching all mentors:", mentorsError);
        return NextResponse.json({ error: "Failed to fetch mentors" }, { status: 500 });
      }
      
      (allMentors || []).forEach(m => {
        mentorSlugs.push((m as any).slug);
      });
    } else if (role === "mentor") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mentorSlugList = (session.user as any)["mentor-slug"] as string[] | null;
      if (!mentorSlugList || mentorSlugList.length === 0) {
        return NextResponse.json({
          totalMentors: 0,
          activeMentors: 0,
          totalConversations: 0,
          totalMessages: 0,
          lastActiveAt: null,
          mentors: []
        });
      }
      mentorSlugs = mentorSlugList;
    }
    
    // Fetch all conversations for the relevant mentor slugs
    const { data: conversations, error: convError } = await supabase
      .from("conversations")
      .select("mentor_slug, messages, created_at")
      .in("mentor_slug", mentorSlugs);
    
    if (convError) {
      console.error("Error fetching conversations:", convError);
      return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }

    // Aggregate in-memory
    const grouped: Record<string, { count: number; messageCount: number; lastActiveAt: string | null }> = {};
    for (const slug of mentorSlugs) {
      grouped[slug] = { count: 0, messageCount: 0, lastActiveAt: null };
    }
    
    let totalMessageCount = 0;
    let lastActiveAt: string | null = null;
    
    for (const conv of conversations || []) {
      const slug = (conv as any).mentor_slug;
      if (grouped[slug]) {
        grouped[slug].count += 1;
        const msgs = (conv as any).messages;
        if (Array.isArray(msgs)) {
          grouped[slug].messageCount += msgs.length;
          totalMessageCount += msgs.length;
        }
        const createdAt = (conv as any).created_at;
        if (createdAt) {
          if (!lastActiveAt || createdAt > lastActiveAt) {
            lastActiveAt = createdAt;
          }
          if (!grouped[slug].lastActiveAt || createdAt > grouped[slug].lastActiveAt) {
            grouped[slug].lastActiveAt = createdAt;
          }
        }
      }
    }

    // Build mentor stats list with names
    const mentors: MentorStat[] = mentorSlugs.map(slug => {
      const stats = grouped[slug] || { count: 0, messageCount: 0, lastActiveAt: null };
      return {
        name: slug,
        slug,
        conversationCount: stats.count,
        messageCount: stats.messageCount,
        lastConversationAt: stats.lastActiveAt,
      };
    });

    // Look up mentor names if admin
    if (role === "admin") {
      const { data: mentorRows, error: mentorRowsError } = await supabase
        .from("mentors")
        .select("slug, name");
      
      if (!mentorRowsError && mentorRows) {
        const nameMap: Record<string, string> = {};
        mentorRows.forEach((m: any) => {
          nameMap[m.slug] = m.name;
        });
        mentors.forEach(m => {
          m.name = nameMap[m.slug] || m.slug;
        });
      }
    }

    // Sort by conversation count descending
    mentors.sort((a, b) => b.conversationCount - a.conversationCount);
    
    const totalConversations = mentors.reduce((sum, m) => sum + m.conversationCount, 0);
    const activeMentors = mentors.filter(m => m.conversationCount > 0).length;
    
    return NextResponse.json({
      totalMentors: mentors.length,
      activeMentors,
      totalConversations,
      totalMessages: totalMessageCount,
      lastActiveAt,
      mentors,
    });
  } catch (error) {
    console.error("Error in mentor overview API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}