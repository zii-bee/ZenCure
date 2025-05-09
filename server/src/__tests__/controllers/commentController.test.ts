// src/__tests__/controllers/commentController.test.ts
import {
  getCommentsByReviewId,
  createComment,
  updateComment,
  deleteComment,
  markCommentHelpful,
  getPendingComments,
  updateCommentStatus
} from '../../controllers/commentController';
import { User, Remedy, Review, Comment } from '../../models';
import { mockRequest, mockResponse } from '../helpers/mockReqRes';
import mongoose from 'mongoose';

describe('Comment Controller', () => {
  // setup test data
  let testUser: any;
  let adminUser: any;
  let testRemedy: any;
  let testReview: any;
  let testComment: any;
  
  beforeEach(async () => {
    // create a test user
    testUser = await User.create({
      name: 'Comment Test User',
      email: 'comment-test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    // create an admin user
    adminUser = await User.create({
      name: 'Admin Comment User',
      email: 'admin-comment@example.com',
      password: 'password123',
      role: 'admin'
    });
    
    // create a test remedy
    testRemedy = await Remedy.create({
      name: 'Comment Test Remedy',
      description: 'Description for test remedy',
      categories: ['Test'],
      symptoms: [{ name: 'Test Symptom', relevanceScore: 80 }],
      sourceIds: [new mongoose.Types.ObjectId()]
    });
    
    // create a test review
    testReview = await Review.create({
      userId: testUser._id,
      remedyId: testRemedy._id,
      rating: 4,
      title: 'Test Review for Comments',
      content: 'This is a test review for comments',
      effectiveness: 4,
      sideEffects: 3,
      ease: 4,
      status: 'approved'
    });
    
    // create a test comment
    testComment = await Comment.create({
      userId: testUser._id,
      reviewId: testReview._id,
      content: 'This is a test comment',
      status: 'approved'
    });
    
    // update user and review with comment reference
    await User.findByIdAndUpdate(testUser._id, {
      $push: { commentIds: testComment._id }
    });
    
    await Review.findByIdAndUpdate(testReview._id, {
      $push: { commentIds: testComment._id }
    });
  });
  
  describe('getCommentsByReviewId', () => {
    it('should get comments for a review with default pagination', async () => {
      const req = mockRequest({
        params: {
          reviewId: testReview._id.toString()
        },
        query: {}
      });
      const res = mockResponse();
      
      await getCommentsByReviewId(req, res);
      
      // check response structure
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        comments: expect.arrayContaining([
          expect.objectContaining({
            content: 'This is a test comment'
          })
        ]),
        page: 1,
        pages: 1,
        total: 1
      }));
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        params: {
          reviewId: 'invalid-id'
        }
      });
      const res = mockResponse();
      
      await getCommentsByReviewId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid review id format')
      }));
    });
    
    it('should handle database errors', async () => {
      // mock Comment.find to throw an error
      const originalFind = Comment.find;
      Comment.find = jest.fn().mockReturnValue({
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
          reviewId: testReview._id.toString()
        }
      });
      const res = mockResponse();
      
      await getCommentsByReviewId(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Database error')
      }));
      
      // restore original function
      Comment.find = originalFind;
    });
  });
  
  describe('createComment', () => {
    it('should create a comment with valid data', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          reviewId: testReview._id.toString()
        },
        body: {
          content: 'This is a new comment'
        }
      });
      const res = mockResponse();
      
      await createComment(req, res);
      
      // check response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        content: 'This is a new comment',
        status: 'pending' // comments start as pending
      }));
      
      // verify the user and review were updated
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.commentIds).toHaveLength(2); // original + new comment
      
      const updatedReview = await Review.findById(testReview._id);
      expect(updatedReview?.commentIds).toHaveLength(2); // original + new comment
    });
    
    it('should return 400 for invalid review ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          reviewId: 'invalid-id'
        },
        body: {
          content: 'This comment has an invalid review ID'
        }
      });
      const res = mockResponse();
      
      await createComment(req, res);
      
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
          reviewId: nonExistentId.toString()
        },
        body: {
          content: 'This comment has a non-existent review ID'
        }
      });
      const res = mockResponse();
      
      await createComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('review not found')
      }));
    });
  });
  
  describe('updateComment', () => {
    it('should allow user to update their own comment', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testComment._id.toString()
        },
        body: {
          content: 'This comment has been updated'
        }
      });
      const res = mockResponse();
      
      await updateComment(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        content: 'This comment has been updated',
        status: 'pending' // status should be reset to pending
      }));
    });
    
    it('should allow admin to update status', async () => {
      const req = mockRequest({
        user: adminUser,
        params: {
          id: testComment._id.toString()
        },
        body: {
          content: 'Admin updated this comment',
          status: 'flagged'
        }
      });
      const res = mockResponse();
      
      await updateComment(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        content: 'Admin updated this comment',
        status: 'flagged' // admin can change status
      }));
    });
    
    it('should return 400 for invalid comment ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: 'invalid-id'
        },
        body: {
          content: 'Invalid ID Update'
        }
      });
      const res = mockResponse();
      
      await updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid comment id format')
      }));
    });
    
    it('should return 404 if comment not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: testUser,
        params: {
          id: nonExistentId.toString()
        },
        body: {
          content: 'Non-existent Comment Update'
        }
      });
      const res = mockResponse();
      
      await updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment not found')
      }));
    });
    
    it('should return 403 if user tries to update another user\'s comment', async () => {
      // create a different user
      const anotherUser = await User.create({
        name: 'Another Comment User',
        email: 'another-comment@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: anotherUser,
        params: {
          id: testComment._id.toString()
        },
        body: {
          content: 'Unauthorized Update'
        }
      });
      const res = mockResponse();
      
      await updateComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not authorized to update this comment')
      }));
    });
  });
  
  describe('deleteComment', () => {
    it('should allow user to delete their own comment', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testComment._id.toString()
        }
      });
      const res = mockResponse();
      
      await deleteComment(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment deleted successfully')
      }));
      
      // verify the comment was deleted and references were removed
      const deletedComment = await Comment.findById(testComment._id);
      expect(deletedComment).toBeNull();
      
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser?.commentIds).not.toContain(testComment._id);
      
      const updatedReview = await Review.findById(testReview._id);
      expect(updatedReview?.commentIds).not.toContain(testComment._id);
    });
    
    it('should allow admin to delete any comment', async () => {
      // create a new comment to delete
      const adminDeleteComment = await Comment.create({
        userId: testUser._id,
        reviewId: testReview._id,
        content: 'Comment to be deleted by admin',
        status: 'approved'
      }) as mongoose.Document & { _id: mongoose.Types.ObjectId };
      
      const req = mockRequest({
        user: adminUser,
        params: {
          id: adminDeleteComment._id.toString()
        }
      });
      const res = mockResponse();
      
      await deleteComment(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment deleted successfully')
      }));
    });
    
    it('should return 400 for invalid comment ID format', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: 'invalid-id'
        }
      });
      const res = mockResponse();
      
      await deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid comment id format')
      }));
    });
    
    it('should return 404 if comment not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: testUser,
        params: {
          id: nonExistentId.toString()
        }
      });
      const res = mockResponse();
      
      await deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment not found')
      }));
    });
    
    it('should return 403 if user tries to delete another user\'s comment', async () => {
      // create a different user
      const anotherUser = await User.create({
        name: 'Delete Comment User',
        email: 'delete-comment@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: anotherUser,
        params: {
          id: testComment._id.toString()
        }
      });
      const res = mockResponse();
      
      await deleteComment(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('not authorized to delete this comment')
      }));
    });
  });
  
  describe('markCommentHelpful', () => {
    it('should increment helpfulCount of a comment', async () => {
      // create a different user to mark the comment as helpful
      const helpfulUser = await User.create({
        name: 'Helpful Comment User',
        email: 'helpful-comment@example.com',
        password: 'password123'
      });
      
      const req = mockRequest({
        user: helpfulUser,
        params: {
          id: testComment._id.toString()
        }
      });
      const res = mockResponse();
      
      await markCommentHelpful(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        helpfulCount: 1
      }));
      
      // verify the helpfulCount was updated
      const updatedComment = await Comment.findById(testComment._id);
      expect(updatedComment?.helpfulCount).toBe(1);
    });
    
    it('should return 400 if user tries to mark their own comment as helpful', async () => {
      const req = mockRequest({
        user: testUser,
        params: {
          id: testComment._id.toString()
        }
      });
      const res = mockResponse();
      
      await markCommentHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('cannot mark your own comment as helpful')
      }));
    });
    
    it('should return 400 for invalid comment ID format', async () => {
      const req = mockRequest({
        user: adminUser,
        params: {
          id: 'invalid-id'
        }
      });
      const res = mockResponse();
      
      await markCommentHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid comment id format')
      }));
    });
    
    it('should return 404 if comment not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        user: adminUser,
        params: {
          id: nonExistentId.toString()
        }
      });
      const res = mockResponse();
      
      await markCommentHelpful(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment not found')
      }));
    });
  });
  
  describe('getPendingComments', () => {
    beforeEach(async () => {
      // create additional pending comments
      await Comment.create({
        userId: testUser._id,
        reviewId: testReview._id,
        content: 'Pending Comment 1',
        status: 'pending'
      });
      
      await Comment.create({
        userId: testUser._id,
        reviewId: testReview._id,
        content: 'Pending Comment 2',
        status: 'pending'
      });
    });
    
    it('should return pending comments with pagination', async () => {
      const req = mockRequest({
        query: {}
      });
      const res = mockResponse();
      
      await getPendingComments(req, res);
      
      // check response structure
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        comments: expect.arrayContaining([
          expect.objectContaining({
            status: 'pending'
          })
        ]),
        total: 2
      }));
      expect(res.json.mock.calls[0][0].comments.length).toBe(2);
    });
    
    it('should handle custom pagination parameters', async () => {
      const req = mockRequest({
        query: {
          page: '1',
          limit: '1'
        }
      });
      const res = mockResponse();
      
      await getPendingComments(req, res);
      
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        comments: expect.arrayContaining([
          expect.objectContaining({
            status: 'pending'
          })
        ]),
        page: 1,
        pages: 2,
        total: 2
      }));
      expect(res.json.mock.calls[0][0].comments.length).toBe(1);
    });
  });
  
  describe('updateCommentStatus', () => {
    it('should update a comment\'s status', async () => {
      const req = mockRequest({
        params: {
          id: testComment._id.toString()
        },
        body: {
          status: 'flagged'
        }
      });
      const res = mockResponse();
      
      await updateCommentStatus(req, res);
      
      // check response
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      status: 'flagged'
    }));
      
      // verify the status was updated
      const updatedComment = await Comment.findById(testComment._id);
      expect(updatedComment?.status).toBe('flagged');
    });
    
    it('should return 400 for invalid status value', async () => {
      const req = mockRequest({
        params: {
          id: testComment._id.toString()
        },
        body: {
          status: 'invalid-status'
        }
      });
      const res = mockResponse();
      
      await updateCommentStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('invalid status value')
      }));
    });
    
    it('should return 404 if comment not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest({
        params: {
          id: nonExistentId.toString()
        },
        body: {
          status: 'approved'
        }
      });
      const res = mockResponse();
      
      await updateCommentStatus(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('comment not found')
      }));
    });
  });
});