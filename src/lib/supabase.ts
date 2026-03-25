import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase env vars not set");
      }
      _supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return (_supabase as any)[prop];
  },
});
