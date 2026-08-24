// Simple environment inspector for debugging MONGO_URI
require('dotenv').config();
console.log('cwd:', process.cwd());
console.log('MONGO_URI (masked):', process.env.MONGO_URI ? (process.env.MONGO_URI.startsWith('mongodb+srv') ? 'mongodb+srv://<REDACTED>' : process.env.MONGO_URI) : 'undefined');
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
