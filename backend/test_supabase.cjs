const dotenv = require('dotenv');
dotenv.config();
const { validateEnv } = require('./src/utils/env');
validateEnv();
const { createClient } = require('@supabase/supabase-js');
const supa = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
supa.auth.getSession().then(({ data, error }) => {
  console.log('Supabase session:', data?.session?.access_token ? 'has token' : 'no token');
  if (error) console.log('Supabase error:', error.message);
});