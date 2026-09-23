const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { validateEnv } = require('./src/utils/env');

try {
  validateEnv();
  console.log('validateEnv passed');
} catch (e) {
  console.log('validateEnv error:', e.message);
}

// Test isConfigured without JUDGE0_API_URL
delete process.env.JUDGE0_API_URL;
const { isConfigured } = require('./src/services/judge0Service');
console.log('isConfigured:', isConfigured());

// Test with JUDGE0_API_URL set to judge0.com
process.env.JUDGE0_API_URL = 'https://judge0.com';
console.log('isConfigured with url:', isConfigured());