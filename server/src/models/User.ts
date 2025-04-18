import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

// user interface
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  healthProfile?: {
    allergies: string[];
    conditions: string[];
    preferences: string[];
  };
  reviewIds: mongoose.Types.ObjectId[];
  commentIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// user schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  healthProfile: {
    allergies: [String],
    conditions: [String],
    preferences: [String]
  },
  reviewIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Review'
  }],
  commentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);