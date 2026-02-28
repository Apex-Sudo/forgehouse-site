import { supabase } from "./supabase";
import { isSubscribed } from "./subscription";

type Message = { role: "user" | "assistant"; content: string };

// Determine which table to use based on subscription status
async function getTable(email: string): Promise<"conversations" | "free_tier_conversations"> {
  const active = await isSubscribed(email);
  return active ? "conversations" : "free_tier_conversations";
}

// Get recent context messages from the most recent conversation with a mentor
export async function getContextMessages(
  userId: string,
  mentorSlug: string,
  email: string,
  limit = 30
): Promise<Message[]> {
  const table = await getTable(email);

  let query = supabase
    .from(table)
    .select("messages")
    .eq("user_id", userId)
    .eq("mentor_slug", mentorSlug)
    .order("updated_at" in {} ? "updated_at" : "created_at", { ascending: false })
    .limit(1);

  // For free tier, only return non-expired conversations
  if (table === "free_tier_conversations") {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data } = await query;

  if (!data?.[0]?.messages) return [];

  const messages = data[0].messages as Message[];
  return messages.slice(-limit);
}

// List conversations for a user + mentor
export async function listConversations(
  userId: string,
  mentorSlug: string,
  email: string
) {
  const table = await getTable(email);

  let query = supabase
    .from(table)
    .select("id, mentor_slug, created_at, updated_at")
    .eq("user_id", userId)
    .eq("mentor_slug", mentorSlug)
    .order("created_at", { ascending: false });

  if (table === "free_tier_conversations") {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Get a single conversation
export async function getConversation(conversationId: string, userId: string, email: string) {
  const table = await getTable(email);

  const baseQuery = supabase
    .from(table)
    .select("*")
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (table === "free_tier_conversations") {
    baseQuery.gt("expires_at", new Date().toISOString());
  }

  const { data, error } = await baseQuery.single();
  if (error) throw error;
  return data;
}

// Create a new conversation
export async function createConversation(
  userId: string,
  mentorSlug: string,
  email: string
) {
  const table = await getTable(email);

  const record: Record<string, unknown> = {
    user_id: userId,
    mentor_slug: mentorSlug,
    messages: [],
  };

  if (table === "free_tier_conversations") {
    record.expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Append messages to a conversation
export async function appendMessages(
  conversationId: string,
  userId: string,
  email: string,
  newMessages: Message[]
) {
  const table = await getTable(email);

  // Get current messages
  const { data: current } = await supabase
    .from(table)
    .select("messages")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!current) throw new Error("Conversation not found");

  const existingMessages = (current.messages as Message[]) || [];
  const updatedMessages = [...existingMessages, ...newMessages];

  const update: Record<string, unknown> = { messages: updatedMessages };
  if (table === "conversations") {
    update.updated_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from(table)
    .update(update)
    .eq("id", conversationId)
    .eq("user_id", userId);

  if (error) throw error;
}
