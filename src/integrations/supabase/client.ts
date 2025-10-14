import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const url = import.meta.env.VITE_SUPABASE_URL || "https://zstsafpaqeidgmcvtzdf.supabase.co";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzdHNhZnBhcWVpZGdtY3Z0emRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzODI1MzAsImV4cCI6MjA3NTk1ODUzMH0.cJhoUyhzacWSTKJUBfCv7pZPFn_vPZDlyaAVttENFlk";

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});