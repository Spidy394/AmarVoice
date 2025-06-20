import User from '../model/user.modle.js';

// Login with Civic Auth
export const civicLogin = async (req, res) => {
  try {
    const url = await req.civicAuth.buildLoginUrl();
    res.json({ loginUrl: url.toString() });
  } catch (error) {
    console.error('Civic login error:', error);
    res.status(500).json({ error: 'Failed to generate login URL' });
  }
};

// Handle Civic Auth callback
export const civicCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      console.error('Missing code or state parameter:', { code: !!code, state: !!state });
      return res.redirect(`${process.env.CLIENT_URL}?error=missing_params`);
    }

    console.log('Processing callback with code and state');

    // Resolve OAuth access code with Civic
    await req.civicAuth.resolveOAuthAccessCode(code, state);
    
    console.log('OAuth code resolved successfully');

    // Verify the user is now logged in
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    if (!isLoggedIn) {
      console.error('User not logged in after OAuth resolution');
      return res.redirect(`${process.env.CLIENT_URL}?error=login_failed`);
    }

    // Get user information from Civic
    const civicUser = await req.civicAuth.getUser();
    
    if (!civicUser) {
      console.error('Failed to get user information from Civic after login');
      return res.redirect(`${process.env.CLIENT_URL}?error=user_info_failed`);
    }

    console.log('Got user from Civic:', { id: civicUser.id, name: civicUser.name });

    // Find or create user in database
    let user = await User.findOne({ civicId: civicUser.id });
    
    if (!user) {
      console.log('Creating new user');
      user = new User({
        civicId: civicUser.id,
        name: civicUser.name || 'Anonymous User',
        email: civicUser.email || null,
        walletAddress: civicUser.walletAddress || null,
        createdAt: new Date()
      });
      await user.save();
    } else {
      console.log('Updating existing user');
      // Update user information
      user.name = civicUser.name || user.name;
      user.email = civicUser.email || user.email;
      user.walletAddress = civicUser.walletAddress || user.walletAddress;
      user.lastLogin = new Date();
      await user.save();
    }

    console.log('User saved successfully, redirecting to home');

    // Redirect to home page
    res.redirect(`${process.env.CLIENT_URL}/home`);

  } catch (error) {
    console.error('Civic callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}?error=auth_failed`);
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const url = await req.civicAuth.buildLogoutRedirectUrl();
    
    // Clear the token cookie
    res.clearCookie('token');
    
    res.json({ logoutUrl: url.toString() });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get user from Civic Auth session
    const civicUser = await req.civicAuth.getUser();
    
    if (!civicUser) {
      return res.status(401).json({ error: 'No user session found' });
    }

    // Find user in database
    const user = await User.findOne({ civicId: civicUser.id }).select('-__v');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
};

// Check auth status
export const checkAuth = async (req, res) => {
  try {
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    
    if (isLoggedIn) {
      // Get user from Civic Auth session
      const civicUser = await req.civicAuth.getUser();
      
      if (civicUser) {
        // Find user in database
        const user = await User.findOne({ civicId: civicUser.id }).select('-__v');
        res.json({ isAuthenticated: true, user });
      } else {
        res.json({ isAuthenticated: false });
      }
    } else {
      res.json({ isAuthenticated: false });
    }
  } catch (error) {
    console.error('Check auth error:', error);
    res.json({ isAuthenticated: false });
  }
};