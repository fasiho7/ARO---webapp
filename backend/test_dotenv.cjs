const dotenv = require('dotenv');
console.log('Before config - CLIENT_URL:', process.env.CLIENT_URL);
dotenv.config();  // loads .env by default
console.log('After config - CLIENT_URL:', process.env.CLIENT_URL);
dotenv.config({ path: '.env.local' });
console.log('After .env.local - CLIENT_URL:', process.env.CLIENT_URL);