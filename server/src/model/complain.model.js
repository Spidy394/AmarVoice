import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  description: {
    type: String,
    required: true,
    maxLength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'infrastructure',
      'public-safety',
      'environment',
      'transportation',
      'health',
      'education',
      'utilities',
      'governance',
      'other'
    ]
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['draft', 'open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    district: String,
    city: String,
    state: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tags: [{
    type: String,
    maxLength: 50
  }],
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  views: {
    type: Number,
    default: 0
  },
  priority: {
    type: Number,
    default: 0 // Calculated based on upvotes, urgency, etc.
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolution: {
    type: String,
    maxLength: 1000,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
complaintSchema.index({ author: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ urgency: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ 'location.city': 1 });
complaintSchema.index({ 'location.district': 1 });

// Virtual for upvote count
complaintSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for downvote count
complaintSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

// Virtual for comment count
complaintSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Update priority based on engagement
complaintSchema.methods.calculatePriority = function() {
  const urgencyWeight = {
    'low': 1,
    'medium': 2,
    'high': 3,
    'critical': 4
  };
  
  const ageInDays = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  const upvoteScore = this.upvotes.length * 2;
  const commentScore = this.comments.length;
  const urgencyScore = urgencyWeight[this.urgency] * 10;
  const ageScore = Math.max(0, 30 - ageInDays); // Newer complaints get higher score
  
  this.priority = urgencyScore + upvoteScore + commentScore + ageScore;
  return this.priority;
};

// Ensure virtual fields are serialized
complaintSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Complaint', complaintSchema);