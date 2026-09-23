const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { validateEnv } = require('./src/utils/env');
try {
  validateEnv();
  console.log('validateEnv passed');
} catch (e) {
  console.log('validateEnv error:', e.message);
}