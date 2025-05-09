import { auth, authorize } from '../../middleware/auth';
import { User } from '../../models';
import jwt from 'jsonwebtoken';
import { mockRequest, mockResponse } from '../helpers/mockReqRes';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load the test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

// Ensure JWT_SECRET is available and consistent for tests
const JWT_SECRET = process.env.JWT_SECRET || 'auth-test-jwt-secret';
// Make sure the auth middleware will use the same secret
process.env.JWT_SECRET = JWT_SECRET;

describe('Authentication Middleware', () => {
  let testUser: any;
  let adminUser: any;
  let token: string;
  let adminToken: string;

  beforeAll(async () => {
    // Connect to the database if needed
    if (mongoose.connection.readyState !== 1) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure_test';
      try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB for auth tests');
      } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
      }
    }
  });

  afterAll(async () => {
    // Clean up test data
    await User.deleteMany({ 
      email: { $in: ['auth-test@example.com', 'admin-test@example.com'] }
    });
    
    // Only close connection if we're in dedicated test mode
    if (process.env.NODE_ENV === 'test' && process.env.CLOSE_CONNECTION === 'true') {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection for auth tests');
    }
  });

  beforeEach(async () => {
    // Clean up any previous test users
    await User.deleteMany({ 
      email: { $in: ['auth-test@example.com', 'admin-test@example.com'] }
    });
    
    // Create a test user
    testUser = await User.create({
      name: 'Auth Test User',
      email: 'auth-test@example.com',
      password: 'password123',
      role: 'user'
    });

    // Create an admin user
    adminUser = await User.create({
      name: 'Admin Test User',
      email: 'admin-test@example.com',
      password: 'password123',
      role: 'admin'
    });

    // Generate tokens using our consistent JWT_SECRET
    token = jwt.sign({ id: testUser._id }, JWT_SECRET);
    adminToken = jwt.sign({ id: adminUser._id }, JWT_SECRET);
  });

  describe('auth middleware', () => {
    it('should pass with valid token', async () => {
      // Mock the findById to ensure it returns our test user
      const originalFindById = User.findById;
      User.findById = jest.fn().mockImplementation((id) => {
        if (id.toString() === testUser._id.toString()) {
          return Promise.resolve(testUser);
        }
        return Promise.resolve(null);
      });

      const req = mockRequest({
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const res = mockResponse();
      const next = jest.fn();

      try {
        await auth(req, res, next);
        
        // Debug info if needed
        if (!next.mock.calls.length) {
          console.log('Token verification failed');
          console.log('JWT_SECRET:', JWT_SECRET);
          console.log('Token:', token);
          console.log('Test User ID:', testUser._id);
        }
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect((req.user as any)._id.toString()).toBe(testUser._id.toString());
      } finally {
        // Restore original function
        User.findById = originalFindById;
      }
    });

    it('should fail without token', async () => {
      const req = mockRequest();
      const res = mockResponse();
      const next = jest.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'authentication required'
      });
    });

    it('should fail with invalid token', async () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer invalid-token'
        }
      });
      const res = mockResponse();
      const next = jest.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'invalid token'
      });
    });

    it('should fail with token for non-existent user', async () => {
      // Create a mock implementation that returns null for any user lookup
      const originalFindById = User.findById;
      User.findById = jest.fn().mockResolvedValue(null);
      
      const nonExistentId = new mongoose.Types.ObjectId();
      const invalidToken = jwt.sign({ id: nonExistentId }, JWT_SECRET);
      
      const req = mockRequest({
        headers: {
          authorization: `Bearer ${invalidToken}`
        }
      });
      const res = mockResponse();
      const next = jest.fn();

      try {
        await auth(req, res, next);
        
        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          message: 'user not found'
        });
      } finally {
        // Restore original function
        User.findById = originalFindById;
      }
    });
    
    // Additional test to increase branch coverage
    it('should fail with malformed JWT payload', async () => {
      // Create a token with incorrect payload structure
      const badToken = jwt.sign({ wrongField: 'not-an-id' }, JWT_SECRET);
      
      const req = mockRequest({
        headers: {
          authorization: `Bearer ${badToken}`
        }
      });
      const res = mockResponse();
      const next = jest.fn();

      await auth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'invalid token'
      });
    });
  });

  describe('authorize middleware', () => {
    it('should allow admin access to admin-only route', () => {
      const req = mockRequest({
        user: adminUser
      });
      const res = mockResponse();
      const next = jest.fn();

      authorize('admin')(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should deny user access to admin-only route', () => {
      const req = mockRequest({
        user: testUser
      });
      const res = mockResponse();
      const next = jest.fn();

      authorize('admin')(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'access forbidden'
      });
    });

    it('should allow multiple roles access', () => {
      const req = mockRequest({
        user: testUser
      });
      const res = mockResponse();
      const next = jest.fn();

      authorize('admin', 'user')(req, res, next);

      expect(next).toHaveBeenCalled();
    });
    
    // Additional test to increase branch coverage
    it('should require authentication before checking roles', () => {
      const req = mockRequest(); // No user property
      const res = mockResponse();
      const next = jest.fn();

      authorize('admin')(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'authentication required'
      });
    });
  });
});