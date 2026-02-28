/**
 * Migration script: Normalize messages from JSONB arrays to a proper messages table.
 * 
 * Usage: npx tsx scripts/migrate-messages.ts
 * 
 * Prerequisites: The messages table must exist. Create it via Supabase SQL editor:
 * 
 * create table if not exists messages (
 *   id uuid primary key default gen_random_uuid(),
 *   conversation_id uuid not null,
 *   role text not null check (role in ('user', 'assistant')),
 *   content text not null,
 *   created_at timestamptz default now()
 * );
 * create index if not exists idx_messages_conversation_id on messages(conversation_id);
 * create index if not exists idx_messages_created_at on messages(conversation_id, created_at);
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://tmpjpjkaislwyjcskvpi.supabase.co",
  "***REDACTED_SERVICE_KEY***"
);

type Msg = { role: string; content: string };

async function migrateTable(tableName: string) {
  console.log(`\nMigrating ${tableName}...`);
  
  const { data: rows, error } = await supabase
    .from(tableName)
    .select("id, messages")
    .not("messages", "is", null);

  if (error) {
    console.error(`Error reading ${tableName}:`, error);
    return;
  }

  let totalInserted = 0;
  let skipped = 0;

  for (const row of rows || []) {
    const messages = row.messages as Msg[];
    if (!messages?.length) {
      skipped++;
      continue;
    }

    // Check if already migrated
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("conversation_id", row.id);

    if (count && count > 0) {
      console.log(`  Skipping ${row.id} - already has ${count} messages`);
      skipped++;
      continue;
    }

    // Insert messages with sequential timestamps to preserve order
    const baseTime = new Date("2025-01-01T00:00:00Z").getTime();
    const inserts = messages.map((m, i) => ({
      conversation_id: row.id,
      role: m.role,
      content: m.content,
      created_at: new Date(baseTime + i * 1000).toISOString(),
    }));

    // Batch insert in chunks of 100
    for (let i = 0; i < inserts.length; i += 100) {
      const chunk = inserts.slice(i, i + 100);
      const { error: insertErr } = await supabase.from("messages").insert(chunk);
      if (insertErr) {
        console.error(`  Error inserting messages for ${row.id}:`, insertErr);
        break;
      }
    }

    totalInserted += messages.length;
    console.log(`  Migrated ${row.id}: ${messages.length} messages`);
  }

  console.log(`${tableName}: ${totalInserted} messages inserted, ${skipped} rows skipped`);
}

async function main() {
  console.log("Starting messages migration...");
  
  // First verify the messages table exists
  const { error } = await supabase.from("messages").select("id", { count: "exact", head: true });
  if (error) {
    console.error("Messages table doesn't exist yet! Create it first via Supabase SQL editor.");
    console.error("See the SQL at the top of this file.");
    process.exit(1);
  }

  await migrateTable("conversations");
  await migrateTable("free_tier_conversations");
  
  console.log("\nMigration complete!");
}

main().catch(console.error);
