import { Review, User, Remedy } from '../../models';
import mongoose from 'mongoose';

describe('Review Model', () => {
  let validReviewData: Record<string, any>;
  let user: any;
  let remedy: any;

  beforeEach(async () => {
    // Create test user
    user = await User.create({
      name: 'Test User',
      email: 'review-test@example.com',
      password: 'password123'
    });

    // Create test remedy
    remedy = await Remedy.create({
      name: 'Test Review Remedy',
      description: 'This is a test remedy for reviews',
      categories: ['Test'],
      symptoms: [{ name: 'Test Symptom', relevanceScore: 80 }],
      sourceIds: [new mongoose.Types.ObjectId()]
    });

    validReviewData = {
      userId: user._id,
      remedyId: remedy._id,
      rating: 4,
      title: 'Great remedy!',
      content: 'This remedy really worked for me.',
      effectiveness: 5,
      sideEffects: 3,
      ease: 4
    };
  });

  it('should create a review with valid data', async () => {
    const review = new Review(validReviewData);
    const savedReview = await review.save();
    
    expect(savedReview._id).toBeDefined();
    expect(savedReview.rating).toBe(validReviewData.rating);
    expect(savedReview.title).toBe(validReviewData.title);
    expect(savedReview.content).toBe(validReviewData.content);
    expect(savedReview.status).toBe('pending'); // default status
    expect(savedReview.helpfulCount).toBe(0); // default value
    expect(savedReview.commentIds).toEqual([]); // default value
  });

  it('should fail validation with missing required fields', async () => {
    const reviewWithoutRating = new Review({
      ...validReviewData,
      rating: undefined
    });

    await expect(reviewWithoutRating.save()).rejects.toThrow();
  });

  it('should update the updatedAt field on save', async () => {
    const review = new Review(validReviewData);
    const savedReview = await review.save();
    
    const originalUpdatedAt = savedReview.updatedAt;
    
    // Wait a bit before updating
    await new Promise(resolve => setTimeout(resolve, 100));
    
    savedReview.content = 'Updated content';
    await savedReview.save();
    
    expect(savedReview.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should enforce rating ranges', async () => {
    // Test rating below minimum (1)
    const reviewWithLowRating = new Review({
      ...validReviewData,
      rating: 0
    });
    await expect(reviewWithLowRating.save()).rejects.toThrow();

    // Test rating above maximum (5)
    const reviewWithHighRating = new Review({
      ...validReviewData,
      rating: 6
    });
    await expect(reviewWithHighRating.save()).rejects.toThrow();
  });

  it('should validate that userId and remedyId are valid ObjectIds', async () => {
    // Invalid ObjectId for userId
    const reviewWithInvalidUserId = new Review({
      ...validReviewData,
      userId: 'not-a-valid-id'
    });
    await expect(reviewWithInvalidUserId.save()).rejects.toThrow();

    // Invalid ObjectId for remedyId
    const reviewWithInvalidRemedyId = new Review({
      ...validReviewData,
      remedyId: 'not-a-valid-id'
    });
    await expect(reviewWithInvalidRemedyId.save()).rejects.toThrow();
  });
});