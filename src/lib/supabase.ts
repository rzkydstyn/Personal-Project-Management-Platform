import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. Check your .env file.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://wjkehkxklkheyxefxdic.supabase.co',
  supabaseAnonKey || 'sb_publishable_2lpgiH42tLcAunLPP4pcZw_yFTteuDW',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);