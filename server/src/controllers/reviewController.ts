import { Request, Response } from 'express';
import { Review, Remedy, User } from '../models';
import mongoose from 'mongoose';

// get reviews for a remedy
export const getReviewsByRemedyId = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const remedyId = req.params.remedyId;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(remedyId)) {
      return res.status(400).json({ message: 'invalid remedy id format' });
    }
    
    // find reviews for the remedy
    const reviews = await Review.find({ 
      remedyId,
      status: 'approved' 
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name'); // populate with user's name
    
    // get total count for pagination
    const totalReviews = await Review.countDocuments({ 
      remedyId,
      status: 'approved' 
    });
    
    res.json({
      reviews,
      page,
      pages: Math.ceil(totalReviews / limit),
      total: totalReviews
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// get a single review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    const review = await Review.findById(reviewId)
      .populate('userId', 'name')
      .populate('commentIds');
    
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const remedyId = req.params.remedyId;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(remedyId)) {
      return res.status(400).json({ message: 'invalid remedy id format' });
    }
    
    // check if remedy exists
    const remedy = await Remedy.findById(remedyId);
    if (!remedy) {
      return res.status(404).json({ message: 'remedy not found' });
    }
    
    // check if user already reviewed this remedy
    const existingReview = await Review.findOne({ 
      userId, 
      remedyId 
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'you have already reviewed this remedy',
        existingReviewId: existingReview._id
      });
    }
    
    // create new review
    const review = await Review.create({
      userId,
      remedyId,
      rating: req.body.rating,
      title: req.body.title,
      content: req.body.content,
      effectiveness: req.body.effectiveness,
      sideEffects: req.body.sideEffects,
      ease: req.body.ease,
      status: 'pending', // reviews start as pending until approved
      commentIds: [],
      helpfulCount: 0
    });
    
    // add review to user's reviewIds
    await User.findByIdAndUpdate(userId, {
      $push: { reviewIds: review._id }
    });
    
    // add review to remedy's reviewIds
    await Remedy.findByIdAndUpdate(remedyId, {
      $push: { reviewIds: review._id }
    });
    
    // recalculate remedy's average rating
    await updateRemedyRating(review.remedyId);
    
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update a review
export const updateReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    // check if user owns the review or is admin/moderator
    if (review.userId.toString() !== userId?.toString() && 
        req.user?.role !== 'admin' && 
        req.user?.role !== 'moderator') {
      return res.status(403).json({ message: 'not authorized to update this review' });
    }
    
    // update the review
    review.rating = req.body.rating || review.rating;
    review.title = req.body.title || review.title;
    review.content = req.body.content || review.content;
    review.effectiveness = req.body.effectiveness || review.effectiveness;
    review.sideEffects = req.body.sideEffects || review.sideEffects;
    review.ease = req.body.ease || review.ease;
    
    // if admin/moderator is updating, they can change status
    if (req.user?.role === 'admin' || req.user?.role === 'moderator') {
      review.status = req.body.status || review.status;
    } else {
      // if user is updating their review, reset status to pending
      review.status = 'pending';
    }
    
    const updatedReview = await review.save();
    
    // recalculate remedy average rating
    await updateRemedyRating(review.remedyId);
    
    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// delete a review
export const deleteReview = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    // check if user owns the review or is admin/moderator
    if (review.userId.toString() !== userId?.toString() && 
        req.user?.role !== 'admin' && 
        req.user?.role !== 'moderator') {
      return res.status(403).json({ message: 'not authorized to delete this review' });
    }
    
    const remedyId = review.remedyId;
    
    // delete review
    await Review.findByIdAndDelete(reviewId);
    
    // remove review from user's reviewIds
    await User.findByIdAndUpdate(review.userId, {
      $pull: { reviewIds: reviewId }
    });
    
    // remove review from remedy's reviewIds
    await Remedy.findByIdAndUpdate(remedyId, {
      $pull: { reviewIds: reviewId }
    });
    
    // recalculate remedy's average rating
    await updateRemedyRating(remedyId);
    
    res.json({ message: 'review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// mark a review as helpful
export const markReviewHelpful = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user?._id;
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    // prevent user from marking their own review as helpful
    if (review.userId.toString() === userId?.toString()) {
      return res.status(400).json({ message: 'cannot mark your own review as helpful' });
    }
    
    // increment helpfulCount
    review.helpfulCount += 1;
    const updatedReview = await review.save();
    
    res.json(updatedReview);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// get reviews awaiting moderation (admin/moderator only)
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // find pending reviews
    const reviews = await Review.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .populate('remedyId', 'name');
    
    // get total count for pagination
    const totalPending = await Review.countDocuments({ status: 'pending' });
    
    res.json({
      reviews,
      page,
      pages: Math.ceil(totalPending / limit),
      total: totalPending
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// update a review's status (admin/moderator only)
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const reviewId = req.params.id;
    const { status } = req.body;
    
    // validate status value
    if (!['pending', 'approved', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'invalid status value' });
    }
    
    // validate objectId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'invalid review id format' });
    }
    
    // find and update review status
    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );
    
    if (!review) {
      return res.status(404).json({ message: 'review not found' });
    }
    
    // if approved, update remedy rating
    if (status === 'approved') {
      await updateRemedyRating(review.remedyId);
    }
    
    res.json(review);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// helper function to recalculate remedy's average rating
const updateRemedyRating = async (remedyId: mongoose.Types.ObjectId) => {
  try {
    // get all approved reviews for the remedy
    const reviews = await Review.find({
      remedyId,
      status: 'approved'
    });
    
    const reviewCount = reviews.length;
    
    // calculate average rating
    const avgRating = reviewCount > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
      : 0;
    
    // update remedy with new values
    await Remedy.findByIdAndUpdate(remedyId, {
      avgRating: parseFloat(avgRating.toFixed(1)), // round to 1 decimal place
      reviewCount
    });
    
    return true;
  } catch (error) {
    console.error('Error updating remedy rating:', error);
    return false;
  }
};