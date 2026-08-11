import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://xezzepfxzzdzvgslnxlc.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlenplcGZ4enpkenZnc2xueGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTY4OTYsImV4cCI6MjEwMjAzMjg5Nn0.smmmpT_DGsyWAZIv7DLOJzqrX9cRZZ3MwR9jIJHkLeE';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
