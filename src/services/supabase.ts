import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://karztsksjqohxhgxdeje.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imthcnp0c2tzanFvaHhoZ3hkZWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODgzMDUsImV4cCI6MjA4OTE2NDMwNX0.SVozYZfnM7ki72frIHMRuppaSglSC2qjAlXa0XvbQDE';

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
