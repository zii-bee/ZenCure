// global setup for tests
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mockRequest, mockResponse } from '../__tests__/helpers/mockReqRes';

let mongoServer: MongoMemoryServer;

// run before all tests
beforeAll(async () => {
  // load environment variables from .env.test if it exists, otherwise use .env
  dotenv.config({ path: '.env.test' });
  
  // set test environment variables if not already set
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'test-jwt-secret';
  }
  
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  // Set up MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  
  // mock console.error to avoid cluttering test output (optional)
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Clean up database between tests
afterEach(async () => {
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
  
  // restore console.error if it was mocked
  jest.restoreAllMocks();
});

// Global mocks
jest.mock('../services/llmservice', () => ({
  getRemedyFromLLM: jest.fn().mockResolvedValue('Headache, Fever, Fatigue')
}));

describe('Mock Request and Response', () => {
  it('should create mock objects', () => {
    const req = mockRequest();
    const res = mockResponse();
    expect(req).toBeDefined();
    expect(res).toBeDefined();
  });
});