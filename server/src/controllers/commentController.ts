import { Request, Response } from 'express';
import { Comment, Review, User } from '../models';
import mongoose from 'mongoose';

// get comments for a review
export const getCommentsByReviewId = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const reviewId = req.params.reviewId;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // find comments for the review
    const comments = await Comment.find({ 
      reviewId, 
      status: 'approved' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name'); // populate with user's name
    
    // get total count for pagination
    const totalComments = await Comment.countDocuments({ 
      reviewId, 
      status: 'approved' 
    });
    
    res.json({
      comments,
      page,
      pages: Math.ceil(totalComments / limit),
      total: totalComments
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// create a new comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const reviewId = req.params.reviewId;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    // create new comment
    const comment = await Comment.create({
      userId,
      reviewId,
      content: req.body.content,
      helpfulCount: 0,
      status: 'pending' // comments start as pending until approved
    });
    
    // add comment to user's commentIds
    await User.findByIdAndUpdate(userId, {
      $push: { commentIds: comment._id }
    });
    
    // add comment to review's commentIds
    await Review.findByIdAndUpdate(reviewId, {
      $push: { commentIds: comment._id }
    });
    
    res.status(201).json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update a comment
export const updateComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'invalid comment id format' });
    }
    
    // find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    }
    
    // check if user owns the comment or is admin/moderator
    if (comment.userId.toString() !== userId?.toString() && 
        req.user?.role !== 'admin' && 
        req.user?.role !== 'moderator') {
      return res.status(403).json({ message: 'not authorized to update this comment' });
    }
    
    // update the comment
    comment.content = req.body.content || comment.content;
    
    // if admin/moderator is updating, they can change status
    if (req.user?.role === 'admin' || req.user?.role === 'moderator') {
      comment.status = req.body.status || comment.status;
    } else {
      // if user is updating their comment, reset status to pending
      comment.status = 'pending';
    }
    
    const updatedComment = await comment.save();
    
    res.json(updatedComment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// delete a comment
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'invalid comment id format' });
    }
    
    // find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    }
    
    // check if user owns the comment or is admin/moderator
    if (comment.userId.toString() !== userId?.toString() && 
        req.user?.role !== 'admin' && 
        req.user?.role !== 'moderator') {
      return res.status(403).json({ message: 'not authorized to delete this comment' });
    }
    
    // delete comment
    await Comment.findByIdAndDelete(commentId);
    
    // remove comment from user's commentIds
    await User.findByIdAndUpdate(comment.userId, {
      $pull: { commentIds: commentId }
    });
    
    // remove comment from review's commentIds
    await Review.findByIdAndUpdate(comment.reviewId, {
      $pull: { commentIds: commentId }
    });
    
    res.json({ message: 'comment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// mark a comment as helpful
export const markCommentHelpful = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'invalid comment id format' });
    }
    
    // find the comment
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    }
    
    // prevent user from marking their own comment as helpful
    if (comment.userId.toString() === userId?.toString()) {
      return res.status(400).json({ message: 'cannot mark your own comment as helpful' });
    }
    
    // increment helpfulCount
    comment.helpfulCount += 1;
    const updatedComment = await comment.save();
    
    res.json(updatedComment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// get comments awaiting moderation (admin/moderator only)
export const getPendingComments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // find pending comments
    const comments = await Comment.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .populate('reviewId');
    
    // get total count for pagination
    const totalPending = await Comment.countDocuments({ status: 'pending' });
    
    res.json({
      comments,
      page,
      pages: Math.ceil(totalPending / limit),
      total: totalPending
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update a comment's status (admin/moderator only)
export const updateCommentStatus = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.id;
    const { status } = req.body;
    
    // validate status value
    if (!['pending', 'approved', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'invalid status value' });
    }
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: 'invalid comment id format' });
    }
    
    // find and update comment status
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { status },
      { new: true }
    );
    
    if (!comment) {
      return res.status(404).json({ message: 'comment not found' });
    }
    
    res.json(comment);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};