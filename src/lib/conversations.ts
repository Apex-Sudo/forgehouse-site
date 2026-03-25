import { supabase } from "./supabase";
import { isSubscribed } from "./subscription";

type Message = { role: "user" | "assistant"; content: string };

// Determine which table to use based on subscription status
// Checks Supabase `subscribed` column first, falls back to Redis
async function getTable(email: string): Promise<"conversations" | "free_tier_conversations"> {
  // Check Supabase first (new Stripe-based subscriptions)
  const { data: user } = await supabase
    .from("users")
    .select("subscribed")
    .eq("email", email)
    .single();

  if (user?.subscribed) return "conversations";

  // Fallback to Redis (legacy subscriptions)
  const active = await isSubscribed(email);
  return active ? "conversations" : "free_tier_conversations";
}

// Check if user has already used their one-time free trial
export async function hasUsedFreeTrial(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("free_trial_started_at")
    .eq("id", userId)
    .single();

  return !!data?.free_trial_started_at;
}

// Activate the one-time free trial (called on first free-tier conversation creation)
async function activateFreeTrial(userId: string): Promise<void> {
  await supabase
    .from("users")
    .update({ free_trial_started_at: new Date().toISOString() })
    .eq("id", userId)
    .is("free_trial_started_at", null); // only set once
}

// Check if free trial is still active (within 7 days of activation)
export async function isFreeTrialActive(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from("users")
    .select("free_trial_started_at")
    .eq("id", userId)
    .single();

  if (!data?.free_trial_started_at) return true; // never started = can start
  const started = new Date(data.free_trial_started_at);
  const now = new Date();
  const daysSinceStart = (now.getTime() - started.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceStart <= 7;
}

export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  return getMessages(conversationId);
}

async function getMessages(conversationId: string, limit?: number): Promise<Message[]> {
  let query = supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (limit) {
    // Get last N messages: order desc, limit, then reverse
    const { data } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return ((data as Message[]) || []).reverse();
  }

  const { data } = await query;
  return (data as Message[]) || [];
}

// Get recent context from a *different* conversation with the same mentor
// (cross-conversation memory). Excludes excludeConversationId so we don't
// duplicate messages that are already in the active conversation turns.
export async function getContextMessages(
  userId: string,
  mentorSlug: string,
  email: string,
  limit = 30,
  excludeConversationId?: string,
): Promise<Message[]> {
  const table = await getTable(email);

  let query = supabase
    .from(table)
    .select("id")
    .eq("user_id", userId)
    .eq("mentor_slug", mentorSlug)
    .order("created_at", { ascending: false })
    .limit(1);

  if (excludeConversationId) {
    query = query.neq("id", excludeConversationId);
  }

  if (table === "free_tier_conversations") {
    query = query.gt("expires_at", new Date().toISOString());
  }

  const { data } = await query;

  if (!data?.[0]?.id) return [];

  return getMessages(data[0].id, limit);
}

// List conversations for a user + mentor
export async function listConversations(
  userId: string,
  mentorSlug: string,
  email: string
) {
  const table = await getTable(email);

  const selectFields = table === "conversations"
    ? "id, mentor_slug, created_at, updated_at"
    : "id, mentor_slug, created_at";

  let query = supabase
    .from(table)
    .select(selectFields)
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

// Get a single conversation (with messages from normalized table)
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

  // Replace JSONB messages with normalized messages
  const messages = await getMessages(conversationId);
  return { ...data, messages };
}

// Create a new conversation
export async function createConversation(
  userId: string,
  mentorSlug: string,
  email: string,
  scenarioType?: string
) {
  const table = await getTable(email);

  // For free tier: enforce one-time 7-day trial
  if (table === "free_tier_conversations") {
    const trialActive = await isFreeTrialActive(userId);
    if (!trialActive) {
      throw new Error("FREE_TRIAL_EXPIRED");
    }
    // Activate trial on first conversation (idempotent, only sets once)
    await activateFreeTrial(userId);
  }

  const record: Record<string, unknown> = {
    user_id: userId,
    mentor_slug: mentorSlug,
    messages: [], // Keep JSONB column as empty for backwards compat
    ...(scenarioType ? { scenario_type: scenarioType } : {}),
  };

  if (table === "free_tier_conversations") {
    // Expire at trial end, not 7 days from conversation creation
    const { data: user } = await supabase
      .from("users")
      .select("free_trial_started_at")
      .eq("id", userId)
      .single();

    const trialStart = new Date(user?.free_trial_started_at ?? Date.now());
    record.expires_at = new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Append messages to a conversation (writes to normalized messages table)
export async function appendMessages(
  conversationId: string,
  userId: string,
  email: string,
  newMessages: Message[]
) {
  const table = await getTable(email);

  // Verify conversation exists and belongs to user
  const { data: current } = await supabase
    .from(table)
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .single();

  if (!current) throw new Error("Conversation not found");

  // Insert into normalized messages table
  const inserts = newMessages.map((m) => ({
    conversation_id: conversationId,
    role: m.role,
    content: m.content,
  }));

  const { error: insertError } = await supabase.from("messages").insert(inserts);
  if (insertError) throw insertError;

  // Update conversation timestamp
  if (table === "conversations") {
    await supabase
      .from(table)
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("user_id", userId);
  }
}
