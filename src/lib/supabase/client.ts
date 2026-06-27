import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? ''

export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      'Supabase env vars missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local'
    )
  }
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
