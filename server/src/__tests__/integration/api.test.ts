// src/__tests__/integration/api.test.ts
import request from 'supertest';
import express from 'express';
import routes from '../../routes';
import { User, Remedy, Source } from '../../models';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// IMPORTANT - Set a fallback JWT secret if not provided in environment
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-integration-tests';

// create a test app with all necessary middleware
const app = express();
app.use(express.json());
app.use('/api', routes);

// Override JWT_SECRET for tests to ensure auth middleware uses the same secret
process.env.JWT_SECRET = JWT_SECRET;

describe('API Routes Integration Tests', () => {
  // setup test data
  let testUser: any;
  let adminUser: any;
  let testRemedy: any;
  let testSource: any;
  let userToken: string;
  let adminToken: string;
  
  beforeAll(async () => {
    // Handle mongoose connection - check if already connected
    if (mongoose.connection.readyState !== 1) {
      // Not connected - establish a new connection
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure_test';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB for testing');
    } else {
      console.log('Using existing MongoDB connection');
    }
    
    try {
      // Clear existing test data
      await User.deleteMany({});
      await Remedy.deleteMany({});
      await Source.deleteMany({});
      
      // create test users
      testUser = await User.create({
        name: 'Integration Test User',
        email: 'integration-test@example.com',
        password: 'password123',
        role: 'user'
      });
      
      adminUser = await User.create({
        name: 'Integration Admin User',
        email: 'integration-admin@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      // create test source
      testSource = await Source.create({
        title: 'Integration Test Source',
        url: 'https://example.com/integration-test',
        credibilityScore: 8,
        publicationDate: new Date(),
        authors: ['Test Author'],
        publisher: 'Test Publisher',
        isPeerReviewed: true
      });
      
      // create test remedy
      testRemedy = await Remedy.create({
        name: 'Integration Test Remedy',
        description: 'Description for integration test remedy',
        categories: ['Test'],
        symptoms: [
          { name: 'Headache', relevanceScore: 80 },
          { name: 'Nausea', relevanceScore: 70 }
        ],
        warnings: ['Test warning'],
        sourceIds: [testSource._id],
        verified: true
      });
      
      // update source with remedy reference
      await Source.findByIdAndUpdate(testSource._id, {
        $push: { remedyIds: testRemedy._id }
      });
      
      // generate tokens - use the consistent JWT_SECRET
      userToken = jwt.sign({ id: testUser._id }, JWT_SECRET);
      adminToken = jwt.sign({ id: adminUser._id }, JWT_SECRET);
      
    } catch (error) {
      console.error('Test setup error:', error);
      throw error;
    }
  });
  
  afterAll(async () => {
    // Don't close the mongoose connection if it may be used elsewhere
    // Only close it if we explicitly opened it for testing
    if (process.env.NODE_ENV === 'test') {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection');
    }
  });
  
  // test auth routes
  describe('Auth Routes', () => {
    it('POST /api/auth/register - should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new-user@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'New User',
        email: 'new-user@example.com',
        role: 'user'
      });
      expect(res.body.token).toBeDefined();
    });
    
    it('POST /api/auth/login - should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'password123'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'Integration Test User',
        email: 'integration-test@example.com'
      });
      expect(res.body.token).toBeDefined();
    });
    
    it('POST /api/auth/login - should reject invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'wrong-password'
        });
      
      expect(res.status).toBe(401);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });
    
    it('GET /api/auth/me - should get current user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'Integration Test User',
        email: 'integration-test@example.com',
        role: 'user'
      });
      expect(res.body.password).toBeUndefined(); // password should not be returned
    });
    
    it('PUT /api/auth/me - should update user profile', async () => {
      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Test User'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'Updated Test User',
        email: 'integration-test@example.com'
      });
    });
  });
  
  // test remedy routes
  describe('Remedy Routes', () => {
    it('GET /api/remedies - should get a list of remedies', async () => {
      const res = await request(app)
        .get('/api/remedies');
      
      expect(res.status).toBe(200);
      expect(res.body.remedies).toBeInstanceOf(Array);
      expect(res.body.remedies.length).toBeGreaterThanOrEqual(1);
      expect(res.body.remedies[0]).toHaveProperty('name');
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
    
    it('GET /api/remedies/:id - should get a remedy by ID', async () => {
      const res = await request(app)
        .get(`/api/remedies/${testRemedy._id}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: 'Integration Test Remedy',
        description: 'Description for integration test remedy'
      });
    });
    
    it('POST /api/remedies/search - should search remedies by symptoms', async () => {
      const res = await request(app)
        .post('/api/remedies/search')
        .send({
          keywords: ['Headache']
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      
      // at least one result should have Headache as a symptom
      const headacheFound = res.body.some((remedy: any) => 
        remedy.symptoms.some((s: any) => s.name === 'Headache')
      );
      expect(headacheFound).toBe(true);
    });
    
    it('POST /api/remedies/query - should query remedies with relevance scores', async () => {
      const res = await request(app)
        .post('/api/remedies/query')
        .send({
          keywords: ['Headache']
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      
      // results should have calculatedRelevanceScore property
      expect(res.body[0]).toHaveProperty('calculatedRelevanceScore');
    });
  });
  
  // test admin routes
  describe('Admin Routes', () => {
    it('GET /api/admin/users - should get all users (admin only)', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(2); // at least our test users
    });
    
    it('GET /api/admin/users - should reject non-admin users', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/access forbidden/i);
    });
    
    it('PUT /api/admin/users/role - should update a user\'s role (admin only)', async () => {
      // create a user to update
      const userToUpdate = await User.create({
        name: 'Role Update User',
        email: 'role-update@example.com',
        password: 'password123',
        role: 'user'
      });
      
      const res = await request(app)
        .put('/api/admin/users/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: (userToUpdate._id as any).toString(),
          role: 'moderator'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Role Update User',
        role: 'moderator'
      });
      
      // verify the role was updated in the database
      const updatedUser = await User.findById(userToUpdate._id);
      expect(updatedUser?.role).toBe('moderator');
    });
    
    it('POST /api/admin/remedies - should create a new remedy (admin only)', async () => {
      const res = await request(app)
        .post('/api/admin/remedies')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Created Remedy',
          description: 'Description for admin created remedy',
          categories: ['Test', 'Admin'],
          symptoms: [
            { name: 'Fatigue', relevanceScore: 85 },
            { name: 'Insomnia', relevanceScore: 75 }
          ],
          warnings: ['Test warning'],
          sourceIds: [testSource._id.toString()],
          verified: true
        });
      
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: 'Admin Created Remedy',
        description: 'Description for admin created remedy',
        verified: true
      });
      
      // verify remedy was created in the database
      const createdRemedy = await Remedy.findOne({ name: 'Admin Created Remedy' });
      expect(createdRemedy).not.toBeNull();
    });
    
    it('GET /api/admin/sources - should get all sources (admin only)', async () => {
      const res = await request(app)
        .get('/api/admin/sources')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThanOrEqual(1); // at least our test source
    });
  });
});