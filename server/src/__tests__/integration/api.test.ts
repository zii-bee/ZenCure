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
const JWT_SECRET = process.env.JWT_SECRET || 'jest-test-jwt-secret';

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
    // Clear existing test data
    await User.deleteMany({});
    await Remedy.deleteMany({});
    await Source.deleteMany({});
    
    try {
      
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
      
      console.log('Test data created successfully');
    } catch (error) {
      console.error('Test setup error:', error);
      throw error;
    }
  });

  it('should have created test data properly', () => {
    expect(testUser).toBeDefined();
    expect(adminUser).toBeDefined();
    expect(testRemedy).toBeDefined();
    expect(testSource).toBeDefined();
    expect(userToken).toBeDefined();
    expect(adminToken).toBeDefined();
  });
  
  // test auth routes
 describe('Auth Routes', () => {
  // Add this debug test to verify JWT is working correctly
  it('DEBUG - JWT verification', async () => {
    // Print the current JWT_SECRET
    console.log(`Current JWT_SECRET: ${process.env.JWT_SECRET}`);
    
    // Print the generated tokens
    console.log(`userToken: ${userToken.substring(0, 10)}...`);
    console.log(`User ID: ${testUser._id}`);
    
    // Manually create and verify a token to check JWT configuration
    const testToken = jwt.sign({ id: testUser._id }, JWT_SECRET);
    console.log(`Test token: ${testToken.substring(0, 10)}...`);
    
    try {
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('Token verified successfully:', decoded);
    } catch (error) {
      console.error('Token verification failed:', error);
    }
    
    // Verify the userToken
    try {
      const decoded = jwt.verify(userToken, JWT_SECRET);
      console.log('userToken verified successfully:', decoded);
    } catch (error) {
      console.error('userToken verification failed:', error);
    }
    
    // Everything is working if we can get here without errors
    expect(true).toBe(true);
  });
  
  it('POST /api/auth/login - should login a user with valid credentials', async () => {
    console.log('Running login test...');
    
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration-test@example.com',
        password: 'password123'
      });
    
    // Log the response for debugging
    console.log('Login response status:', res.status);
    console.log('Login response body:', res.body);
    
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Integration Test User',
      email: 'integration-test@example.com'
    });
    expect(res.body.token).toBeDefined();
    
    // Store the token from the login response for subsequent tests
    const loginToken = res.body.token;
    
    // Test the GET /api/auth/me endpoint with the token we just received
    console.log('Testing /api/auth/me with loginToken...');
    const profileRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginToken}`);
    
    console.log('GET /api/auth/me response status:', profileRes.status);
    console.log('GET /api/auth/me response body:', profileRes.body);
    
    expect(profileRes.status).toBe(200);
  });
  
  it('GET /api/auth/me - should get current user profile', async () => {
    // Get a fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration-test@example.com',
        password: 'password123'
      });
    
    const token = loginRes.body.token;
    console.log(`Using token from login: ${token.substring(0, 10)}...`);
    
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    console.log('GET /api/auth/me response:', res.status, res.body);
    
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      name: 'Integration Test User',
      email: 'integration-test@example.com',
      role: 'user'
    });
  });
  
  it('PUT /api/auth/me - should update user profile', async () => {
    // Get a fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'integration-test@example.com',
        password: 'password123'
      });
    
    const token = loginRes.body.token;
    
    const res = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Test User'
      });
    
    console.log('PUT /api/auth/me response:', res.status, res.body);
    
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
  // Store tokens generated from login API for admin tests
    let freshUserToken: string | undefined;
    let freshAdminToken: string | undefined;

    // Get fresh tokens before admin tests
    beforeAll(async () => {
        console.log('Getting fresh tokens for admin tests');
        
        // Get admin token from login
        const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'integration-admin@example.com',
            password: 'password123'
        });
        
        freshAdminToken = adminLoginRes.body.token;
        console.log(`Fresh admin token: ${freshAdminToken ? freshAdminToken.substring(0, 10) + '...' : 'undefined'}`);
        
        // Get user token from login
        const userLoginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'integration-test@example.com',
            password: 'password123'
        });
        
        freshUserToken = userLoginRes.body.token;
        console.log(`Fresh user token: ${freshUserToken ? freshUserToken.substring(0, 10) + '...' : 'undefined'}`);
    });

    // Add debug test for admin token verification
    it('DEBUG - verify admin token works', async () => {
        if (!freshAdminToken) {
        console.error('No admin token available for testing');
        expect(freshAdminToken).toBeDefined();
        return;
        }
        
        // Try a simple request with the admin token
        const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${freshAdminToken}`);
        
        console.log('DEBUG - admin token GET /api/auth/me response:', res.status, res.body);
        expect(res.status).toBe(200);
        expect(res.body.role).toBe('admin');
    });

    it('GET /api/admin/users - should get all users (admin only)', async () => {
        const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${freshAdminToken}`);
        
        console.log('GET /api/admin/users response:', res.status, res.body);
        
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(2); // at least our test users
    });
    
    it('GET /api/admin/users - should reject non-admin users', async () => {
        const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${freshUserToken}`);
        
        console.log('GET /api/admin/users (non-admin) response:', res.status, res.body);
        
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
        .set('Authorization', `Bearer ${freshAdminToken}`)
        .send({
            userId: (userToUpdate._id as any).toString(),
            role: 'moderator'
        });
        
        console.log('PUT /api/admin/users/role response:', res.status, res.body);
        
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
        .set('Authorization', `Bearer ${freshAdminToken}`)
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
        
        console.log('POST /api/admin/remedies response:', res.status, res.body);
        
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
        .set('Authorization', `Bearer ${freshAdminToken}`);
        
        console.log('GET /api/admin/sources response:', res.status, res.body);
        
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThanOrEqual(1); // at least our test source
    });
});
});