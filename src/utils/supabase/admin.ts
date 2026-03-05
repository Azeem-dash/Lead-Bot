import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Webhooks might fail.');
    }
  }

  return createClient(
    supabaseUrl || '',
    supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}
