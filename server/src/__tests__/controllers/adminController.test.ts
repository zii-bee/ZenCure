import {
  getAllUsers,
  createRemedy,
  createSource,
  getUniqueSymptoms,
  updateUserRole,
  getAllSources,
  getAllReviews,
  updateReviewStatus,
  getAllComments,
  updateCommentStatus
} from '../../controllers/adminController';
import { User, Remedy, Source, Review, Comment } from '../../models';
import mongoose from 'mongoose';
import { mockRequest, mockResponse } from '../helpers/mockReqRes';


describe('Admin Controller', () => {
  // setup test data
  let testUser: any;
  let testRemedy: any;
  let testSource: any;
  let testReview: any;
  let testComment: any;
  
  beforeEach(async () => {
    // create test user
    testUser = await User.create({
      name: 'Admin Test User',
      email: 'admin-test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    // create test source
    testSource = await Source.create({
      title: 'Admin Test Source',
      url: 'https://example.com/admin-test',
      credibilityScore: 8,
      publicationDate: new Date(),
      authors: ['Test Author'],
      publisher: 'Test Publisher',
      isPeerReviewed: true
    });
    
    // create test remedy
    testRemedy = await Remedy.create({
      name: 'Admin Test Remedy',
      description: 'Description for admin test remedy',
      categories: ['Test'],
      symptoms: [
        { name: 'Headache', relevanceScore: 80 },
        { name: 'Nausea', relevanceScore: 70 }
      ],
      warnings: ['Test warning'],
      sourceIds: [testSource._id],
      verified: true
    });
    
    // update source with remedy ID
    await Source.findByIdAndUpdate(testSource._id, {
      $push: { remedyIds: testRemedy._id }
    });
    
    // create test review
    testReview = await Review.create({
      userId: testUser._id,
      remedyId: testRemedy._id,
      rating: 4,
      title: 'Admin Test Review',
      content: 'This is a test review for admin',
      effectiveness: 4,
      sideEffects: 3,
      ease: 4,
      status: 'pending'
    });
    
    // create test comment
    testComment = await Comment.create({
      userId: testUser._id,
      reviewId: testReview._id,
      content: 'This is a test comment for admin',
      status: 'pending'
    });
  });
  
  describe('getAllUsers', () => {
    it('should return all users without passwords', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllUsers(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const users = res.json.mock.calls[0][0];
      
      // verify at least our test user is returned
      expect(users.length).toBeGreaterThanOrEqual(1);
      
      // verify user objects have expected properties
      const userObj = users.find((u: any) => u.email === 'admin-test@example.com');
      expect(userObj).toBeDefined();
      expect(userObj.name).toBe('Admin Test User');
      expect(userObj.password).toBeUndefined(); // password should be excluded
    });
    
    it('should handle database errors', async () => {
      // mock User.find to throw an error
      const originalFind = User.find;
      User.find = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(new Error('Database error'))
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      User.find = originalFind;
    });
  });
  
  describe('createRemedy', () => {
    it('should create a remedy with valid data', async () => {
      const req = mockRequest({
        body: {
          name: 'New Admin Remedy',
          description: 'Description for new admin remedy',
          categories: ['Herb', 'Tea'],
          symptoms: [
            { name: 'Stress', relevanceScore: 85 },
            { name: 'Anxiety', relevanceScore: 80 }
          ],
          warnings: ['Warning 1', 'Warning 2'],
          sourceIds: [testSource._id.toString()],
          verified: true
        }
      });
      const res = mockResponse();
      
      await createRemedy(req, res);
      
      // check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Admin Remedy',
        description: 'Description for new admin remedy',
        verified: true
      }));
      
      // verify remedy was created in the database
      const createdRemedy = await Remedy.findOne({ name: 'New Admin Remedy' });
      expect(createdRemedy).not.toBeNull();
      
      // verify source was updated with remedy reference
      const updatedSource = await Source.findById(testSource._id);
      expect(updatedSource?.remedyIds).toContainEqual(createdRemedy?._id);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          name: 'Missing Fields Remedy',
          // missing required fields
        }
      });
      const res = mockResponse();
      
      await createRemedy(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Missing required fields')
      }));
    });
    
    it('should return 400 if remedy with same name already exists', async () => {
      // attempt to create a remedy with the same name as testRemedy
      const req = mockRequest({
        body: {
          name: 'Admin Test Remedy', // same as testRemedy
          description: 'Duplicate remedy',
          categories: ['Test'],
          symptoms: [{ name: 'Test', relevanceScore: 50 }],
          sourceIds: [testSource._id.toString()]
        }
      });
      const res = mockResponse();
      
      await createRemedy(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('already exists')
      }));
    });
    
    it('should return 400 for invalid source ID format', async () => {
      const req = mockRequest({
        body: {
          name: 'Invalid Source ID Remedy',
          description: 'Description for invalid source ID remedy',
          categories: ['Test'],
          symptoms: [{ name: 'Test', relevanceScore: 50 }],
          sourceIds: ['invalid-id']
        }
      });
      const res = mockResponse();
      
      await createRemedy(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid source ID format')
      }));
    });
    
    it('should return 404 if source not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        body: {
          name: 'Non-existent Source Remedy',
          description: 'Description for non-existent source remedy',
          categories: ['Test'],
          symptoms: [{ name: 'Test', relevanceScore: 50 }],
          sourceIds: [nonExistentId.toString()]
        }
      });
      const res = mockResponse();
      
      await createRemedy(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Source with ID')
      }));
    });
  });
  
  describe('createSource', () => {
    it('should create a source with valid data', async () => {
      const req = mockRequest({
        body: {
          title: 'New Admin Source',
          url: 'https://example.com/new-source',
          credibilityScore: 7,
          publicationDate: new Date(),
          authors: ['New Author'],
          publisher: 'New Publisher',
          isPeerReviewed: false,
          remedyIds: [testRemedy._id.toString()]
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      // check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Admin Source',
        url: 'https://example.com/new-source'
      }));
      
      // verify source was created in database
      const createdSource = await Source.findOne({ title: 'New Admin Source' });
      expect(createdSource).not.toBeNull();
      
      // verify remedy was updated with source reference
      const updatedRemedy = await Remedy.findById(testRemedy._id);
      expect(updatedRemedy?.sourceIds).toContainEqual(createdSource?._id);
    });
    
    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          title: 'Missing Fields Source',
          // missing required fields
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Missing required fields')
      }));
    });
    
    it('should return 400 if source with same URL already exists', async () => {
      // attempt to create a source with the same URL as testSource
      const req = mockRequest({
        body: {
          title: 'Duplicate URL Source',
          url: 'https://example.com/admin-test', // same as testSource
          credibilityScore: 7
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('already exists')
      }));
    });
    
    it('should return 400 for invalid remedy ID format', async () => {
      const req = mockRequest({
        body: {
          title: 'Invalid Remedy ID Source',
          url: 'https://example.com/invalid-remedy',
          credibilityScore: 7,
          remedyIds: ['invalid-id']
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid remedy ID format')
      }));
    });
    
    it('should return 404 if remedy not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        body: {
          title: 'Non-existent Remedy Source',
          url: 'https://example.com/non-existent-remedy',
          credibilityScore: 7,
          remedyIds: [nonExistentId.toString()]
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Remedy with ID')
      }));
    });
    
    it('should handle source creation without remedyIds', async () => {
      const req = mockRequest({
        body: {
          title: 'Source Without Remedies',
          url: 'https://example.com/no-remedies',
          credibilityScore: 7
        }
      });
      const res = mockResponse();
      
      await createSource(req, res);
      
      // check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Source Without Remedies',
        remedyIds: [] // should be an empty array
      }));
    });
  });
  
  describe('getUniqueSymptoms', () => {
    it('should return a list of unique symptoms from all remedies', async () => {
      // create a remedy with different symptoms
      await Remedy.create({
        name: 'Unique Symptoms Remedy',
        description: 'Description for unique symptoms remedy',
        categories: ['Test'],
        symptoms: [
          { name: 'Fatigue', relevanceScore: 75 },
          { name: 'Insomnia', relevanceScore: 65 }
        ],
        sourceIds: [testSource._id]
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getUniqueSymptoms(req, res);
      
      // check response - should include symptoms from all remedies
      expect(res.json).toHaveBeenCalled();
      const symptoms = res.json.mock.calls[0][0];
      expect(symptoms).toContain('Headache');
      expect(symptoms).toContain('Nausea');
      expect(symptoms).toContain('Fatigue');
      expect(symptoms).toContain('Insomnia');
      
      // should be sorted alphabetically
      expect(symptoms).toEqual([...symptoms].sort());
    });
    
    it('should handle database errors', async () => {
      // mock Remedy.find to throw an error
      const originalFind = Remedy.find;
      Remedy.find = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getUniqueSymptoms(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      Remedy.find = originalFind;
    });
  });
  
  describe('updateUserRole', () => {
    it('should update a user\'s role', async () => {
      const req = mockRequest({
        body: {
          userId: testUser._id.toString(),
          role: 'moderator'
        }
      });
      const res = mockResponse();
      
      await updateUserRole(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('User role updated successfully'),
        user: expect.objectContaining({
          _id: expect.anything(),
          name: 'Admin Test User',
          role: 'moderator'
        })
      }));
      
      // verify role was updated in database
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.role).toBe('moderator');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          // missing required fields
        }
      });
      const res = mockResponse();
      
      await updateUserRole(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('User ID and role are required')
      }));
    });
    
    it('should return 400 for invalid role', async () => {
      const req = mockRequest({
        body: {
          userId: testUser._id.toString(),
          role: 'invalid-role'
        }
      });
      const res = mockResponse();
      
      await updateUserRole(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid role')
      }));
    });
    
    it('should return 400 for invalid user ID format', async () => {
      const req = mockRequest({
        body: {
          userId: 'invalid-id',
          role: 'admin'
        }
      });
      const res = mockResponse();
      
      await updateUserRole(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid user ID format')
      }));
    });
    
    it('should return 404 if user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        body: {
          userId: nonExistentId.toString(),
          role: 'admin'
        }
      });
      const res = mockResponse();
      
      await updateUserRole(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('User not found')
      }));
    });
  });
  
  describe('getAllSources', () => {
    it('should return all sources', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllSources(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const sources = res.json.mock.calls[0][0];
      
      // verify at least our test source is returned
      expect(sources.length).toBeGreaterThanOrEqual(1);
      
      // verify source objects have expected properties
      const sourceObj = sources.find((s: any) => s.title === 'Admin Test Source');
      expect(sourceObj).toBeDefined();
      expect(sourceObj.url).toBe('https://example.com/admin-test');
    });
    
    it('should handle database errors', async () => {
      // mock Source.find to throw an error
      const originalFind = Source.find;
      Source.find = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllSources(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      Source.find = originalFind;
    });
  });
  
  describe('getAllReviews', () => {
    it('should return all reviews', async () => {
      const req = mockRequest({
        query: {}
      });
      const res = mockResponse();
      
      await getAllReviews(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const reviews = res.json.mock.calls[0][0];
      
      // verify at least our test review is returned
      expect(reviews.length).toBeGreaterThanOrEqual(1);
      
      // verify review objects have expected properties
      const reviewObj = reviews.find((r: any) => r.title === 'Admin Test Review');
      expect(reviewObj).toBeDefined();
      expect(reviewObj.content).toBe('This is a test review for admin');
    });
    
    it('should filter reviews by status', async () => {
      // create a flagged review
      await Review.create({
        userId: testUser._id,
        remedyId: testRemedy._id,
        rating: 3,
        title: 'Flagged Review',
        content: 'This is a flagged review',
        effectiveness: 3,
        sideEffects: 3,
        ease: 3,
        status: 'flagged'
      });
      
      const req = mockRequest({
        query: {
          status: 'flagged'
        }
      });
      const res = mockResponse();
      
      await getAllReviews(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const reviews = res.json.mock.calls[0][0];
      
      // verify all returned reviews have status 'flagged'
      expect(reviews.length).toBeGreaterThanOrEqual(1);
      reviews.forEach((review: any) => {
        expect(review.status).toBe('flagged');
      });
    });
    
    it('should filter reviews by remedyId', async () => {
      const req = mockRequest({
        query: {
          remedyId: testRemedy._id.toString()
        }
      });
      const res = mockResponse();
      
      await getAllReviews(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const reviews = res.json.mock.calls[0][0];
      
      // verify all returned reviews have the specified remedyId
      expect(reviews.length).toBeGreaterThanOrEqual(1);
      reviews.forEach((review: any) => {
        expect(review.remedyId._id.toString()).toBe(testRemedy._id.toString());
      });
    });
    
    it('should filter reviews by userId', async () => {
      const req = mockRequest({
        query: {
          userId: testUser._id.toString()
        }
      });
      const res = mockResponse();
      
      await getAllReviews(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const reviews = res.json.mock.calls[0][0];
      
      // verify all returned reviews have the specified userId
      expect(reviews.length).toBeGreaterThanOrEqual(1);
      reviews.forEach((review: any) => {
        expect(review.userId._id.toString()).toBe(testUser._id.toString());
      });
    });
    
    it('should handle database errors', async () => {
      // mock Review.find to throw an error
      const originalFind = Review.find;
      Review.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('Database error'))
          })
        })
      });
      
      const req = mockRequest({
        query: {}
      });
      const res = mockResponse();
      
      await getAllReviews(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      Review.find = originalFind;
    });
  });
  
  describe('updateReviewStatus', () => {
    it('should update a review\'s status', async () => {
      const req = mockRequest({
        body: {
          reviewId: testReview._id.toString(),
          status: 'approved'
        }
      });
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Review status updated'),
        review: expect.objectContaining({
          status: 'approved'
        })
      }));
      
      // verify status was updated in database
      const updatedReview = await Review.findById(testReview._id);
      expect(updatedReview?.status).toBe('approved');
    });
    
    it('should return 400 if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          // missing required fields
        }
      });
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid request')
      }));
    });
    
    it('should return 400 for invalid status', async () => {
      const req = mockRequest({
        body: {
          reviewId: testReview._id.toString(),
          status: 'invalid-status'
        }
      });
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Invalid request')
      }));
    });
    
    it('should return 404 if review not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        body: {
          reviewId: nonExistentId.toString(),
          status: 'approved'
        }
      });
      const res = mockResponse();
      
      await updateReviewStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Review not found')
      }));
    });
  });
  
  describe('getAllComments', () => {
    it('should return all comments', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllComments(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalled();
      const comments = res.json.mock.calls[0][0];
      
      // verify at least our test comment is returned
      expect(comments.length).toBeGreaterThanOrEqual(1);
      
      // verify comment objects have expected properties
      const commentObj = comments.find((c: any) => c.content === 'This is a test comment for admin');
      expect(commentObj).toBeDefined();
      expect(commentObj.status).toBe('pending');
    });
    
    it('should handle database errors', async () => {
      // mock Comment.find to throw an error
      const originalFind = Comment.find;
      Comment.find = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockRejectedValue(new Error('Database error'))
        })
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      await getAllComments(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      Comment.find = originalFind;
    });
  });
  
  describe('updateCommentStatus', () => {
    it('should update a comment\'s status', async () => {
      const req = mockRequest({
        body: {
          commentId: testComment._id.toString(),
          status: 'approved'
        }
      });
      const res = mockResponse();
      
      await updateCommentStatus(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Comment status updated'),
        comment: expect.objectContaining({
          status: 'approved'
        })
      }));
      
      // verify status was updated in database
      const updatedComment = await Comment.findById(testComment._id);
      expect(updatedComment?.status).toBe('approved');
    });
    
    it('should return 404 if comment not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        body: {
          commentId: nonExistentId.toString(),
          status: 'approved'
        }
      });
      const res = mockResponse();
      
      await updateCommentStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Comment not found')
      }));
    });
  });
});