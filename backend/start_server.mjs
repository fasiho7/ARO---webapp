process.env.NODE_ENV = 'development';
require('dotenv').config({ path: '../.env.local' });
require('./src/server.js');