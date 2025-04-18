import mongoose, { Document, Schema } from 'mongoose';

// review interface
export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  remedyId: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  content: string;
  effectiveness: number;
  sideEffects: number;
  ease: number;
  helpfulCount: number;
  commentIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'flagged';
}

// review schema
const reviewSchema = new Schema<IReview>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remedyId: {
    type: Schema.Types.ObjectId,
    ref: 'Remedy',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  effectiveness: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  sideEffects: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  ease: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  commentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged'],
    default: 'pending'
  }
});

// update the updatedAt field on save
reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// create index for common queries
reviewSchema.index({ remedyId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ status: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);