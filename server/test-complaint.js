import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Complaint from './src/model/complain.model.js';
import User from './src/model/user.modle.js';

dotenv.config();

async function testComplaintCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('Connected to MongoDB');

    // Check if there are any users in the database
    const users = await User.find();
    console.log('Total users in database:', users.length);
    
    if (users.length > 0) {
      console.log('Sample user:', users[0]);
    }

    // Check if there are any complaints in the database
    const complaints = await Complaint.find();
    console.log('Total complaints in database:', complaints.length);
    
    if (complaints.length > 0) {
      console.log('Sample complaint:', complaints[0]);
    }

    // Test creating a new complaint if we have a user
    if (users.length > 0) {
      const testComplaint = new Complaint({
        title: 'Test Complaint',
        description: 'This is a test complaint to verify database functionality',
        category: 'infrastructure',
        location: {
          address: 'Test Address, Test City'
        },
        urgency: 'medium',
        tags: ['test'],
        images: [],
        author: users[0]._id,
        isAnonymous: false,
        status: 'open',
        createdAt: new Date()
      });

      console.log('Attempting to save test complaint...');
      const savedComplaint = await testComplaint.save();
      console.log('Test complaint saved successfully:', savedComplaint._id);
      
      // Clean up - remove the test complaint
      await Complaint.findByIdAndDelete(savedComplaint._id);
      console.log('Test complaint deleted');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testComplaintCreation();
