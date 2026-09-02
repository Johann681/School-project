// Simple environment inspector for debugging MONGO_URI
require('dotenv').config();
console.log('cwd:', process.cwd());
const maskedMongoUri = process.env.MONGO_URI
	? process.env.MONGO_URI.replace(/(mongodb(?:\+srv)?:\/\/)([^@]+)@/, '$1<REDACTED>@')
	: 'undefined';
console.log('MONGO_URI (masked):', maskedMongoUri);
console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
