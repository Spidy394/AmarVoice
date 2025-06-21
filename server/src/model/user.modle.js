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
  },  walletAddress: {
    type: String,
    default: null
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

// Method to calculate and update reputation
userSchema.methods.updateReputation = async function() {
  try {
    // Import here to avoid circular dependency
    const { default: Complaint } = await import('./complain.model.js');
    
    // Get all complaints by this user
    const userComplaints = await Complaint.find({ author: this._id });
    
    let reputation = 0;
    
    userComplaints.forEach(complaint => {
      // Add points for upvotes (2 points each)
      reputation += (complaint.upvotes?.length || 0) * 2;
      
      // Subtract points for downvotes (1 point each)
      reputation -= (complaint.downvotes?.length || 0) * 1;
      
      // Add points for comments received (1 point each)
      reputation += (complaint.comments?.length || 0) * 1;
      
      // Bonus points for resolved complaints (5 points each)
      if (complaint.status === 'resolved') {
        reputation += 5;
      }
    });
    
    // Ensure reputation doesn't go below 0
    this.reputation = Math.max(0, reputation);
    await this.save();
    
    return this.reputation;
  } catch (error) {
    console.error('Error updating reputation:', error);
    return this.reputation;
  }
};

export default mongoose.model('User', userSchema);