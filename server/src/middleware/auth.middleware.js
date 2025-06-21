import User from '../model/user.modle.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Check if user is logged in via Civic Auth
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from Civic Auth session
    const civicUser = await req.civicAuth.getUser();
    
    if (!civicUser) {
      return res.status(401).json({ error: 'No user session found' });
    }

    // Find the database user
    const dbUser = await User.findOne({ civicId: civicUser.id });
    
    if (!dbUser) {
      return res.status(401).json({ error: 'User not found in database' });
    }

    // Attach user info to request for use in controllers
    req.civicUser = civicUser;
    req.userId = dbUser._id;  // For backward compatibility with existing complaint routes
    req.user = dbUser;
    
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};