// src/__tests__/setup-global.ts
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockRequest, mockResponse } from './helpers/mockReqRes';

// Explicitly type the mongoServer variable
let mongoServer: MongoMemoryServer;

// run before all tests
beforeAll(async () => {
  // load environment variables from .env.test if it exists, otherwise use .env
  dotenv.config({ path: '.env.test' });
  
  // set consistent test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'jest-test-jwt-secret';
  
  console.log(`Using JWT_SECRET for tests: ${process.env.JWT_SECRET}`);
  
  try {
    // Set up MongoDB memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log(`Connected to in-memory MongoDB at ${uri}`);
  } catch (error) {
    console.error('Failed to set up test database:', error);
    throw error;
  }
  
  // mock console.error to avoid cluttering test output (optional)
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Clean up database between tests, EXCEPT for integration tests
// This prevents clearing data needed by integration tests
afterEach(async () => {
  // Skip data cleanup for integration tests
  const testPath = expect.getState().testPath;
  if (testPath && testPath.includes('integration')) {
    console.log('Skipping database cleanup for integration test');
    return;
  }
  
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// run after all tests
afterAll(async () => {
  // disconnect and stop MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('Test database connection closed');
  
  // restore console.error if it was mocked
  jest.restoreAllMocks();
});

describe('Mock Request and Response', () => {
  it('should create mock objects', () => {
    const req = mockRequest();
    const res = mockResponse();
    expect(req).toBeDefined();
    expect(res).toBeDefined();
  });
});