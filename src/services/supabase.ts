import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// No auth — we use Supabase only for public data (skills, nodes, badges)
// User data is stored locally via AsyncStorage
const memoryStorage: Record<string, string> = {};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string) => memoryStorage[key] ?? null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; },
    },
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});
