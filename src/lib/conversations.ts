import { supabase } from "./supabase";
import { isSubscribed } from "./subscription";

type Message = { role: "user" | "assistant"; content: string };

// Determine which table to use based on subscription status
async function getTable(email: string): Promise<"conversations" | "free_tier_conversations"> {
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
    messages: [],
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
