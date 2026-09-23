import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
console.log('SUPABASE_URL:', url);
console.log('SUPABASE_ANON_KEY:', key);
if (url && key) {
  const supa = createClient(url, key);
  supa.auth.getSession().then(({ data }) => {
    console.log('Session data:', data);
  }).catch(e => {
    console.log('Error:', e.message);
  });
} else {
  console.log('Missing env vars');
}