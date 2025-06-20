import User from '../model/user.modle.js';

export const authMiddleware = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Request URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Cookies:', req.cookies);
    
    // Check if user is logged in via Civic Auth
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    console.log('Civic Auth isLoggedIn:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('User not logged in, returning 401');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from Civic Auth session
    const civicUser = await req.civicAuth.getUser();
    console.log('Civic user:', civicUser);
    
    if (!civicUser) {
      console.log('No civic user found, returning 401');
      return res.status(401).json({ error: 'No user session found' });
    }

    // Find the database user
    const dbUser = await User.findOne({ civicId: civicUser.id });
    console.log('Database user found:', !!dbUser);
    
    if (!dbUser) {
      console.log('User not found in database, returning 401');
      return res.status(401).json({ error: 'User not found in database' });
    }

    // Attach user info to request for use in controllers
    req.civicUser = civicUser;
    req.userId = dbUser._id;  // For backward compatibility with existing complaint routes
    req.user = dbUser;
    console.log('Auth middleware passed, user ID:', req.userId);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Authentication error' });
  }
};