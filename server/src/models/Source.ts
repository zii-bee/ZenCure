import mongoose, { Document, Schema } from 'mongoose';

// source interface
export interface ISource extends Document {
  title: string;
  url: string;
  credibilityScore: number;
  publicationDate?: Date;
  authors?: string[];
  publisher?: string;
  isPeerReviewed: boolean;
  remedyIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// source schema
const sourceSchema = new Schema<ISource>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  credibilityScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  publicationDate: {
    type: Date
  },
  authors: [String],
  publisher: String,
  isPeerReviewed: {
    type: Boolean,
    default: false
  },
  remedyIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Remedy'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// update the updatedAt field on save
sourceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISource>('Source', sourceSchema);