// Simple authService to get Supabase user
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export async function getSupabaseUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export { supabase };