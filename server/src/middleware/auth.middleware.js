import User from '../model/user.modle.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    
    // Check if user is logged in via Civic Auth
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('User not authenticated');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from Civic Auth session
    const civicUser = await req.civicAuth.getUser();
    console.log('Civic user:', civicUser);
    
    if (!civicUser) {
      console.log('No user session found');
      return res.status(401).json({ error: 'No user session found' });
    }

    // Find the database user
    const dbUser = await User.findOne({ civicId: civicUser.id });
    console.log('DB user found:', !!dbUser);
    
    if (!dbUser) {
      console.log('User not found in database for civicId:', civicUser.id);
      return res.status(401).json({ error: 'User not found in database' });
    }

    // Attach user info to request for use in controllers
    req.civicUser = civicUser;
    req.userId = dbUser._id;  // For backward compatibility with existing complaint routes
    req.user = dbUser;
    
    console.log('Auth successful, user ID:', req.userId);
    next();

  } catch (error) {
    console.error('=== AUTH MIDDLEWARE ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Authentication error', details: error.message });
  }
};