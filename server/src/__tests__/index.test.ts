import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

// mock express and the modules it uses
jest.mock('express', () => {
  const mockApp = {
    get: jest.fn(),
    use: jest.fn(),
    set: jest.fn(),
    listen: jest.fn()
  };
  const mockExpress = jest.fn(() => mockApp);
  return Object.assign(mockExpress, {
    json: jest.fn(() => 'json-middleware')
  });
});

jest.mock('cors', () => jest.fn(() => 'cors-middleware'));
jest.mock('helmet', () => jest.fn(() => 'helmet-middleware'));
jest.mock('express-rate-limit', () => jest.fn(() => 'rate-limit-middleware'));
jest.mock('../routes', () => 'routes-module');

// mock mongoose connect
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true)
}));

describe('Server Initialization', () => {
  // save original environment variables
  const originalEnv = process.env;
  let mockApp: any;
  
  beforeEach(() => {
    // reset environment variables
    process.env = { ...originalEnv };
    
    // clear module cache to ensure fresh import
    jest.resetModules();
    
    // get reference to mockApp
    mockApp = express();
  });
  
  afterEach(() => {
    // restore environment variables
    process.env = originalEnv;
    
    // clear any mocks
    jest.clearAllMocks();
  });
  
  it('should initialize the express app with middleware and listen on the port', async () => {
    // set test environment variables
    process.env.PORT = '5000';
    process.env.MONGODB_URI = 'mongodb://test-uri';
    
    // import the server module (which will execute the code)
    const startServer = require('../index').startServer;
    
    // run the server start function
    await startServer();
    
    // verify express application was created
    expect(express).toHaveBeenCalled();
    
    // verify helmet middleware was applied (for security)
    expect(helmet).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('helmet-middleware');
    
    // verify rate limiting middleware was applied
    expect(rateLimit).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('/api', 'rate-limit-middleware');
    
    // verify CORS middleware was applied
    expect(cors).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('cors-middleware');
    
    // verify JSON parsing middleware was applied
    expect(express.json).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('json-middleware');
    
    // verify basic route handler exists
    expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
    
    // verify API routes were mounted
    expect(mockApp.use).toHaveBeenCalledWith('/api', 'routes-module');
    
    // verify trust proxy setting
    expect(mockApp.set).toHaveBeenCalledWith('trust proxy', 1);
    
    // verify MongoDB connection was attempted
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://test-uri');
    
    // verify server starts listening
    expect(mockApp.listen).toHaveBeenCalledWith('5000', expect.any(Function));
  });
  
  it('should use default port if not specified', async () => {
    // don't set PORT env variable
    process.env.MONGODB_URI = 'mongodb://test-uri';
    
    const startServer = require('../index').startServer;
    await startServer();
    
    // should use default port 5000
    expect(mockApp.listen).toHaveBeenCalledWith('5000', expect.any(Function));
  });
  
  it('should use default MongoDB URI if not specified', async () => {
    // don't set MONGODB_URI env variable
    process.env.PORT = '5000';
    
    const startServer = require('../index').startServer;
    await startServer();
    
    // should use local MongoDB URI
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/zencure');
  });
});