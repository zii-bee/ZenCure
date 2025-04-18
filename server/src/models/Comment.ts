import mongoose, { Document, Schema } from 'mongoose';

// comment interface
export interface IComment extends Document {
  userId: mongoose.Types.ObjectId;
  reviewId: mongoose.Types.ObjectId;
  content: string;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'flagged';
}

// comment schema
const commentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Review',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
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
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// create indexes for common queries
commentSchema.index({ reviewId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ createdAt: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);