import { Remedy, Source } from '../../models';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

describe('Remedy Model', () => {
  let validRemedyData: Record<string, any>;
  let source: any;

  // Connect to the database before tests if needed
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/zencure_test';
      await mongoose.connect(mongoURI);
      console.log('Connected to MongoDB for remedy tests');
    }
    
    // Ensure indexes are created (including unique constraints)
    await Remedy.createIndexes();
  });

  // Clean up after all tests
  afterAll(async () => {
    await Remedy.deleteMany({});
    await Source.deleteMany({});
    
    if (process.env.NODE_ENV === 'test' && process.env.CLOSE_CONNECTION === 'true') {
      await mongoose.connection.close();
      console.log('Closed MongoDB connection after remedy tests');
    }
  });

  // Setup before each test
  beforeEach(async () => {
    // Clear collections before each test
    await Remedy.deleteMany({});
    await Source.deleteMany({});

    // Create a test source
    source = await Source.create({
      title: 'Test Source',
      url: 'https://example.com/test-source',
      credibilityScore: 8,
      publicationDate: new Date(),
      authors: ['Test Author'],
      publisher: 'Test Publisher',
      isPeerReviewed: true
    });

    validRemedyData = {
      name: 'Test Remedy',
      description: 'This is a test remedy description',
      categories: ['Herb', 'Test'],
      symptoms: [
        { name: 'Headache', relevanceScore: 80 },
        { name: 'Fever', relevanceScore: 75 }
      ],
      warnings: ['Do not use if pregnant'],
      sourceIds: [source._id],
      verified: true
    };
  });

  it('should create a remedy with valid data', async () => {
    const remedy = new Remedy(validRemedyData);
    const savedRemedy = await remedy.save();
    
    expect(savedRemedy._id).toBeDefined();
    expect(savedRemedy.name).toBe(validRemedyData.name);
    expect(savedRemedy.avgRating).toBe(0); // default value
    expect(savedRemedy.reviewCount).toBe(0); // default value
    expect(savedRemedy.reviewIds).toEqual([]); // default value
    expect(savedRemedy.symptoms).toHaveLength(2);
    expect(savedRemedy.sourceIds[0].toString()).toBe(source._id.toString());
  });

  it('should fail validation with missing required fields', async () => {
    const remedyWithoutName = new Remedy({
      ...validRemedyData,
      name: undefined
    });

    await expect(remedyWithoutName.save()).rejects.toThrow();
  });

  it('should update the updatedAt field on save', async () => {
    const remedy = new Remedy(validRemedyData);
    const savedRemedy = await remedy.save();
    
    const originalUpdatedAt = savedRemedy.updatedAt;
    
    // Wait a bit before updating
    await new Promise(resolve => setTimeout(resolve, 100));
    
    savedRemedy.description = 'Updated description';
    await savedRemedy.save();
    
    expect(savedRemedy.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should enforce unique names', async () => {
    // First, explicitly create and save the first remedy
    const remedy1 = new Remedy(validRemedyData);
    await remedy1.save();

    // Verify it was saved successfully
    const count = await Remedy.countDocuments({ name: validRemedyData.name });
    expect(count).toBe(1);

    // Create a second remedy with the same name
    const remedy2 = new Remedy({
      ...validRemedyData,
      // Same name as remedy1
    });

    // Now the save should fail with a duplicate key error
    try {
      await remedy2.save();
      // If we get here, the test should fail because save succeeded
      fail('Expected save to fail due to unique constraint, but it succeeded');
    } catch (error: any) {
      // Verify it's the right type of error (duplicate key)
      expect(error).toBeDefined();
      expect(error.name).toBe('MongoServerError');
      expect(error.code).toBe(11000); // MongoDB duplicate key error code
    }
  });

  it('should validate relevance score ranges', async () => {
    const remedyWithInvalidScore = new Remedy({
      ...validRemedyData,
      symptoms: [
        { name: 'Headache', relevanceScore: 110 } // Invalid, over max of 100
      ]
    });

    await expect(remedyWithInvalidScore.save()).rejects.toThrow();
  });
});