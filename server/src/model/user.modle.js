import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  civicId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple null values
    minLength: 3,
    maxLength: 30
  },
  email: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true // Allows multiple null values
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxLength: 500,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  reputation: {
    type: Number,
    default: 0
  },
  complaintsSubmitted: {
    type: Number,
    default: 0
  },
  complaintsResolved: {
    type: Number,
    default: 0
  },
  followersCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance (only for fields without unique: true)
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);