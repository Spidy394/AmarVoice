import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './src/model/user.modle.js';

dotenv.config();

const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('MongoDB URL:', process.env.MONGODB_URL ? 'Set' : 'Not set');
    
    if (!process.env.MONGODB_URL) {
      throw new Error('MONGODB_URL environment variable is not set');
    }

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to MongoDB successfully');

    // Test user creation
    const testUser = {
      civicId: 'test-civic-id-' + Date.now(),
      name: 'Test User',
      username: 'testuser' + Date.now(),
      email: 'test@example.com',
      createdAt: new Date()
    };

    console.log('Creating test user...');
    const user = new User(testUser);
    await user.save();
    console.log('✅ Test user created:', user._id);

    // Count users
    const userCount = await User.countDocuments();
    console.log('✅ Total users in database:', userCount);

    // Find recent users
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('✅ Recent users:');
    recentUsers.forEach(user => {
      console.log(`  - ${user.name} (@${user.username || 'no-username'})`);
    });

    // Clean up test user
    await User.deleteOne({ _id: user._id });
    console.log('✅ Test user cleaned up');

    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error('💡 Hint: Check if your MongoDB URL is correct and accessible');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

testDatabaseConnection();
