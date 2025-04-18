import mongoose, { Document, Schema } from 'mongoose';

// remedy interface
export interface IRemedy extends Document {
  name: string;
  description: string;
  categories: string[];
  symptoms: {
    name: string;
    relevanceScore: number;
  }[];
  warnings: string[];
  sourceIds: mongoose.Types.ObjectId[];
  avgRating: number;
  reviewCount: number;
  reviewIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  verified: boolean;
}

// remedy schema
const remedySchema = new Schema<IRemedy>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  categories: [{
    type: String,
    required: true
  }],
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    relevanceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  }],
  warnings: [String],
  sourceIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Source'
  }],
  avgRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviewIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// update the updatedAt field on save
remedySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// create text index for search
remedySchema.index({ name: 'text', description: 'text' });

export default mongoose.model<IRemedy>('Remedy', remedySchema);