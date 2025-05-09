// jest.setup.js
const path = require('path');
const dotenv = require('dotenv');

// Set NODE_ENV to 'test'
process.env.NODE_ENV = 'test';


// Load environment variables from .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Ensure critical environment variables for tests
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'jest-test-jwt-secret';
  console.warn('Warning: JWT_SECRET not set in .env.test, using fallback');
}

if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/zencure_test';
  console.warn('Warning: MONGODB_URI not set in .env.test, using fallback');
}

if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = 'AIzaSyCge_G8Mnw9LFOQKHZ3obc7aNVtnL6jVp0';
  console.warn('Warning: GEMINI_API_KEY not set in .env.test, using fallback');
}


// Global Jest setup code can go here
console.log('Jest test environment setup with .env.test configuration');
console.log(`Using test database: ${process.env.MONGODB_URI}`);