import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Remedy, Source, User, Review, Comment } from '../models';


// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new remedy
export const createRemedy = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      categories,
      symptoms,
      warnings,
      sourceIds,
      verified
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !categories || !symptoms || !sourceIds) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check for existing remedy with same name
    const existingRemedy = await Remedy.findOne({ name });
    if (existingRemedy) {
      return res.status(400).json({ message: 'A remedy with this name already exists' });
    }
    
    // Validate source IDs
    for (const sourceId of sourceIds) {
      if (!mongoose.Types.ObjectId.isValid(sourceId)) {
        return res.status(400).json({ message: 'Invalid source ID format' });
      }
      
      const source = await Source.findById(sourceId);
      if (!source) {
        return res.status(404).json({ message: `Source with ID ${sourceId} not found` });
      }
    }
    
    // Create new remedy
    const remedy = await Remedy.create({
      name,
      description,
      categories,
      symptoms,
      warnings: warnings || [],
      sourceIds,
      avgRating: 0,
      reviewCount: 0,
      reviewIds: [],
      verified: verified || false
    });
    
    // Update sources with new remedy ID
    for (const sourceId of sourceIds) {
      await Source.findByIdAndUpdate(
        sourceId,
        { $push: { remedyIds: remedy._id } }
      );
    }
    
    res.status(201).json(remedy);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new source
export const createSource = async (req: Request, res: Response) => {
  try {
    const {
      title,
      url,
      credibilityScore,
      publicationDate,
      authors,
      publisher,
      isPeerReviewed,
      remedyIds
    } = req.body;
    
    // Validate required fields
    if (!title || !url || !credibilityScore) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Check for existing source with same URL
    const existingSource = await Source.findOne({ url });
    if (existingSource) {
      return res.status(400).json({ message: 'A source with this URL already exists' });
    }
    
    // Validate remedy IDs if provided
    if (remedyIds && remedyIds.length > 0) {
      for (const remedyId of remedyIds) {
        if (!mongoose.Types.ObjectId.isValid(remedyId)) {
          return res.status(400).json({ message: 'Invalid remedy ID format' });
        }
        
        const remedy = await Remedy.findById(remedyId);
        if (!remedy) {
          return res.status(404).json({ message: `Remedy with ID ${remedyId} not found` });
        }
      }
    }
    
    // Create new source
    const source = await Source.create({
      title,
      url,
      credibilityScore,
      publicationDate: publicationDate || new Date(),
      authors: authors || [],
      publisher: publisher || '',
      isPeerReviewed: isPeerReviewed !== undefined ? isPeerReviewed : false,
      remedyIds: remedyIds || []
    });
    
    // Update remedies with new source ID
    if (remedyIds && remedyIds.length > 0) {
      for (const remedyId of remedyIds) {
        await Remedy.findByIdAndUpdate(
          remedyId,
          { $push: { sourceIds: source._id } }
        );
      }
    }
    
    res.status(201).json(source);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all unique symptoms from existing remedies
export const getUniqueSymptoms = async (req: Request, res: Response) => {
  try {
    const remedies = await Remedy.find();
    const symptomsSet = new Set<string>();
    
    remedies.forEach(remedy => {
      remedy.symptoms.forEach(symptom => {
        symptomsSet.add(symptom.name);
      });
    });
    
    const uniqueSymptoms = Array.from(symptomsSet).sort();
    res.json(uniqueSymptoms);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be user, moderator, or admin' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = role as 'user' | 'moderator' | 'admin';
    await user.save();
    
    res.json({ message: 'User role updated successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all sources
export const getAllSources = async (req: Request, res: Response) => {
  try {
    const sources = await Source.find();
    res.json(sources);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req: Request, res: Response) => {
  
  try {

    const { status, remedyId, userId } = req.query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (remedyId) filter.remedyId = remedyId;
    if (userId) filter.userId = userId;

    const reviews = await Review.find(filter)
      .populate('userId', 'name email')
      .populate('remedyId', 'name')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve or flag a review
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { reviewId, status } = req.body;

    if (!reviewId || !['approved', 'flagged'].includes(status)) {
      return res.status(400).json({ message: 'Invalid request' });
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review status updated', review });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllComments = async (req: Request, res: Response) => {
  try {
    const comments = await Comment.find().populate('userId').populate('reviewId');
    res.json(comments);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update comment status
export const updateCommentStatus = async (
  req: Request,
  res: Response
) => {
  const { commentId, status } = req.body;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    comment.status = status;
    await comment.save();
    res.json({ message: 'Comment status updated', comment });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};