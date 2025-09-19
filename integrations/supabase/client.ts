
import { createClient } from '@supabase/supabase-js';
import type { SupabaseDatabase } from '@/types/supabase';

// These are public keys that can be exposed in the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cgvjcsevidvxabtwdkdv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNndmpjc2V2aWR2eGFidHdka2R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1Nzg5MTcsImV4cCI6MjA1OTE1NDkxN30.r8BQC5nOWdbvwcg2k0MD1OVn8JoNtr7TCpKwuYBDAEc';

// Verify we're using the correct remote URL
if (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) {
  console.error('ERROR: Supabase client is configured for localhost! Expected remote URL.');
  console.error('Current URL:', supabaseUrl);
}

export const supabase = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'rclth-pulse-v2',
      'Content-Type': 'application/json; charset=utf-8',
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
