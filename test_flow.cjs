process.env.NODE_ENV = 'development';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.SUPABASE_URL = 'https://yvtdqwewgfzwwnticzhu.supabase.co';
process.env.SUPABASE_ANON_KEY = 'sb_publishable_7nlU1ogEmyvMWbbTSSN-HA_5ZOPFgVv';
process.env.JUDGE0_API_URL = 'https://judge0.com';
process.env.BACKEND_URL = 'http://localhost:5000';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';

require('dotenv').config({ path: '.env.local' });

// Test the bearer auth headers function
async function test() {
  // Import the necessary modules
  const { createBrowserSupabaseClient } = await import('@supabase/ssr');
  console.log('Dotenv config done');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY);
  console.log('JUDGE0_API_URL:', process.env.JUDGE0_API_URL);
}

test().catch(e => console.error(e));