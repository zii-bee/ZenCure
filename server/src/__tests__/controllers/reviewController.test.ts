// src/__tests__/controllers/reviewController.test.ts
import {
  getReviewsByRemedyId,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getPendingReviews,
  updateReviewStatus
} from '../../controllers/reviewController';
import { User, Remedy, Review } from '../../models';
import mongoose from 'mongoose';
import { mockRequest, mockResponse } from '../helpers/mockReqRes';


describe('Review Controller', () => {
  let testUser: any;
  let adminUser: any;
  let testRemedy: any;
  let testReview: any;
  
  beforeEach(async () => {
    // Create test users
    testUser = await User.create({
      name: 'Review Test User',
      email: 'review-test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // Create test remedy
    testRemedy = await Remedy.create({
      name: 'Test Review Remedy',
      description: 'Description for test remedy',
      categories: ['Test'],
      symptoms: [{ name: 'Test Symptom', relevanceScore: 80 }],
      sourceIds: [new mongoose.Types.ObjectId()],
      avgRating: 0,
      reviewCount: 0
    });
    
    // Create test review
    testReview = await Review.create({
      userId: testUser._id,
      remedyId: testRemedy._id,
      rating: 4,
      title: 'Test Review',
      content: 'This is a test review',
      effectiveness: 4,
      sideEffects: 3,
      ease: 5,
      status: 'approved'
    });
    
    // Update user and remedy with review reference
    await User.findByIdAndUpdate(testUser._id, {
      $push: { reviewIds: testReview._id }
    });
    
    await Remedy.findByIdAndUpdate(testRemedy._id, {
      $push: { reviewIds: testReview._id },
      avgRating: 4,
      reviewCount: 1
    });
  });
  
  describe('getReviewsByRemedyId', () => {
    it('should get reviews for a remedy with default pagination', async () => {
      const req = mockRequest({
        params: {
          remedyId: testRemedy._id.toString()
        },
        query: {}
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getReviewsByRemedyId(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        reviews: expect.arrayContaining([
          expect.objectContaining({
            title: 'Test Review'
          })
        ]),
        page: 1,
        pages: 1,
        total: 1
      }));
    });
    
    it('should return 400 for invalid remedy ID format', async () => {
      const req = mockRequest({
        params: {
          remedyId: 'invalid-id'
        }
      });
      // Fix: Use custom mock response 
      const res = mockResponse();
      
      await getReviewsByRemedyId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid remedy id format')
      }));
    });
    
    it('should handle database errors', async () => {
      // Mock Review.find to throw an error
      const originalFind = Review.find;
      Review.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              populate: jest.fn().mockRejectedValue(new Error('Database error'))
            })
          })
        })
      });
      
      const req = mockRequest({
        params: {
          remedyId: testRemedy._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getReviewsByRemedyId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // Restore original function
      Review.find = originalFind;
    });
  });
  
  describe('getReviewById', () => {
    it('should return a review by ID', async () => {
      const req = mockRequest({
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getReviewById(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Review',
        content: 'This is a test review'
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        params: {
          id: 'invalid-id'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getReviewById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should return 404 for non-existent review', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        params: {
          id: nonExistentId.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getReviewById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
  });
  
  describe('createReview', () => {
    it('should create a review with valid data', async () => {
      // Create a different user for this test
      const newUser = await User.create({
        name: 'New Review User',
        email: 'new-review@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: newUser,
        params: {
          remedyId: testRemedy._id.toString()
        },
        body: {
          rating: 5,
          title: 'New Review',
          content: 'This is a new review',
          effectiveness: 5,
          sideEffects: 4,
          ease: 4
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await createReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Review',
        content: 'This is a new review',
        status: 'pending'
      }));
      
      // Verify the user and remedy were updated
      const updatedUser = await User.findById(newUser._id);
      expect(updatedUser?.reviewIds).toHaveLength(1);
      
      const updatedRemedy = await Remedy.findById(testRemedy._id);
      expect(updatedRemedy?.reviewIds).toHaveLength(2);
    });
    
    it('should return 400 for invalid remedy ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          remedyId: 'invalid-id'
        },
        body: {
          rating: 5,
          title: 'Invalid Remedy ID',
          content: 'This review has an invalid remedy ID',
          effectiveness: 5,
          sideEffects: 4,
          ease: 4
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await createReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid remedy id format')
      }));
    });
    
    it('should return 404 if remedy not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: testUser,
        params: {
          remedyId: nonExistentId.toString()
        },
        body: {
          rating: 5,
          title: 'Non-existent Remedy',
          content: 'This review has a non-existent remedy ID',
          effectiveness: 5,
          sideEffects: 4,
          ease: 4
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await createReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('remedy not found')
      }));
    });
    
    it('should return 400 if user already reviewed the remedy', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          remedyId: testRemedy._id.toString()
        },
        body: {
          rating: 5,
          title: 'Duplicate Review',
          content: 'This user already reviewed this remedy',
          effectiveness: 5,
          sideEffects: 4,
          ease: 4
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await createReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('already reviewed this remedy'),
        existingReviewId: expect.any(Object)
      }));
    });
  });
  
  describe('updateReview', () => {
    it('should allow user to update their own review', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testReview._id.toString()
        },
        body: {
          title: 'Updated Review',
          content: 'This review has been updated',
          rating: 5
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReview(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Updated Review',
        content: 'This review has been updated',
        rating: 5,
        status: 'pending' // Status should be reset to pending
      }));
    });
    
    it('should allow admin to update status', async () => {
      const req = mockRequest({
        user: adminUser,
        params: {
          id: testReview._id.toString()
        },
        body: {
          status: 'flagged'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReview(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        status: 'flagged'
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: 'invalid-id'
        },
        body: {
          title: 'Invalid ID Update'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should return 404 if review not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: testUser,
        params: {
          id: nonExistentId.toString()
        },
        body: {
          title: 'Non-existent Review Update'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
    
    it('should return 403 if user tries to update another user\'s review', async () => {
      // Create a different user
      const anotherUser = await User.create({
        name: 'Another User',
        email: 'another-user@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: anotherUser,
        params: {
          id: testReview._id.toString()
        },
        body: {
          title: 'Unauthorized Update'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not authorized to update this review')
      }));
    });
  });
  
  describe('deleteReview', () => {
    it('should allow user to delete their own review', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await deleteReview(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review deleted successfully')
      }));
      
      // Verify the review was deleted and references were removed
      const deletedReview = await Review.findById(testReview._id);
      expect(deletedReview).toBeNull();
      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.reviewIds).not.toContain(testReview._id);
      
      const updatedRemedy = await Remedy.findById(testRemedy._id);
      expect(updatedRemedy?.reviewIds).not.toContain(testReview._id);
    });
    
    it('should allow admin to delete any review', async () => {
      const req = mockRequest({
        user: adminUser,
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await deleteReview(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review deleted successfully')
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: 'invalid-id'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await deleteReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should return 404 if review not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: testUser,
        params: {
          id: nonExistentId.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await deleteReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
    
    it('should return 403 if user tries to delete another user\'s review', async () => {
      // Create a different user
      const anotherUser = await User.create({
        name: 'Delete Test User',
        email: 'delete-test@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: anotherUser,
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await deleteReview(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not authorized to delete this review')
      }));
    });
  });
  
  describe('markReviewHelpful', () => {
    it('should increment helpfulCount of a review', async () => {
      // Create a different user to mark the review as helpful
      const helpfulUser = await User.create({
        name: 'Helpful User',
        email: 'helpful-user@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: helpfulUser,
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await markReviewHelpful(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        helpfulCount: 1
      }));
      
      // Verify the helpfulCount was updated
      const updatedReview = await Review.findById(testReview._id);
      expect(updatedReview?.helpfulCount).toBe(1);
    });
    
    it('should return 400 if user tries to mark their own review as helpful', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testReview._id.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await markReviewHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('cannot mark your own review as helpful')
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        user: adminUser,
        params: {
          id: 'invalid-id'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await markReviewHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should return 404 if review not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: adminUser,
        params: {
          id: nonExistentId.toString()
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await markReviewHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
  });
  
  describe('getPendingReviews', () => {
    beforeEach(async () => {
      // Create additional pending reviews
      await Review.create({
        userId: testUser._id,
        remedyId: testRemedy._id,
        rating: 3,
        title: 'Pending Review 1',
        content: 'This is a pending review',
        effectiveness: 3,
        sideEffects: 3,
        ease: 3,
        status: 'pending'
      });
      
      await Review.create({
        userId: testUser._id,
        remedyId: testRemedy._id,
        rating: 2,
        title: 'Pending Review 2',
        content: 'This is another pending review',
        effectiveness: 2,
        sideEffects: 2,
        ease: 2,
        status: 'pending'
      });
    });
    
    it('should return pending reviews with pagination', async () => {
      const req = mockRequest({
        query: {}
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getPendingReviews(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        reviews: expect.arrayContaining([
          expect.objectContaining({
            status: 'pending'
          })
        ]),
        total: 2
      }));
      expect(res.json.mock.calls[0][0].reviews.length).toBe(2);
    });
    
    it('should handle custom pagination parameters', async () => {
      const req = mockRequest({
        query: {
          page: '1',
          limit: '1'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await getPendingReviews(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        reviews: expect.arrayContaining([
          expect.objectContaining({
            status: 'pending'
          })
        ]),
        page: 1,
        pages: 2,
        total: 2
      }));
      expect(res.json.mock.calls[0][0].reviews.length).toBe(1);
    });
  });
  
  describe('updateReviewStatus', () => {
    it('should update a review\'s status', async () => {
      const req = mockRequest({
        params: {
          id: testReview._id.toString()
        },
        body: {
          status: 'flagged'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'flagged'
    }));
      
      // Verify the status was updated
      const updatedReview = await Review.findById(testReview._id);
      expect(updatedReview?.status).toBe('flagged');
    });
    
    it('should return 400 for invalid status value', async () => {
      const req = mockRequest({
        params: {
          id: testReview._id.toString()
        },
        body: {
          status: 'invalid-status'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid status value')
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        params: {
          id: 'invalid-id'
        },
        body: {
          status: 'approved'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should return 404 if review not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        params: {
          id: nonExistentId.toString()
        },
        body: {
          status: 'approved'
        }
      });
      // Fix: Use custom mock response
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
  });
});