import { Comment, User, Review, Remedy } from '../../models';
import mongoose from 'mongoose';

describe('Comment Model', () => {
  let validCommentData: Record<string, any>;
  let user: any;
  let remedy: any;
  let review: any;

  beforeEach(async () => {
    // Create test user
    user = await User.create({
      name: 'Test User',
      email: 'comment-test@example.com',
      password: 'password123'
    });

    // Create test remedy
    remedy = await Remedy.create({
      name: 'Test Comment Remedy',
      description: 'This is a test remedy for comments',
      categories: ['Test'],
      symptoms: [{ name: 'Test Symptom', relevanceScore: 80 }],
      sourceIds: [new mongoose.Types.ObjectId()]
    });

    // Create test review
    review = await Review.create({
      userId: user._id,
      remedyId: remedy._id,
      rating: 4,
      title: 'Test Review',
      content: 'This is a test review for comments',
      effectiveness: 4,
      sideEffects: 3,
      ease: 4
    });

    validCommentData = {
      userId: user._id,
      reviewId: review._id,
      content: 'This is a test comment'
    };
  });

  it('should create a comment with valid data', async () => {
    const comment = new Comment(validCommentData);
    const savedComment = await comment.save();
    
    expect(savedComment._id).toBeDefined();
    expect(savedComment.content).toBe(validCommentData.content);
    expect(savedComment.status).toBe('pending'); // default status
    expect(savedComment.helpfulCount).toBe(0); // default value
  });

  it('should fail validation with missing required fields', async () => {
    const commentWithoutContent = new Comment({
      ...validCommentData,
      content: undefined
    });

    await expect(commentWithoutContent.save()).rejects.toThrow();
  });

  it('should update the updatedAt field on save', async () => {
    const comment = new Comment(validCommentData);
    const savedComment = await comment.save();
    
    const originalUpdatedAt = savedComment.updatedAt;
    
    // Wait a bit before updating
    await new Promise(resolve => setTimeout(resolve, 100));
    
    savedComment.content = 'Updated content';
    await savedComment.save();
    
    expect(savedComment.updatedAt).not.toEqual(originalUpdatedAt);
  });

  it('should validate that userId and reviewId are valid ObjectIds', async () => {
    // Invalid ObjectId for userId
    const commentWithInvalidUserId = new Comment({
      ...validCommentData,
      userId: 'not-a-valid-id'
    });
    await expect(commentWithInvalidUserId.save()).rejects.toThrow();

    // Invalid ObjectId for reviewId
    const commentWithInvalidReviewId = new Comment({
      ...validCommentData,
      reviewId: 'not-a-valid-id'
    });
    await expect(commentWithInvalidReviewId.save()).rejects.toThrow();
  });

  it('should enforce valid status values', async () => {
    const comment = new Comment(validCommentData);
    await comment.save();
    
    // Valid status update
    comment.status = 'approved';
    await expect(comment.save()).resolves.toBeDefined();
    
    // Invalid status update
    comment.status = 'invalid-status' as any;
    await expect(comment.save()).rejects.toThrow();
  });
});