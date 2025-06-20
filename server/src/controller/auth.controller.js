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
    }    console.log('Got user from Civic:', { id: civicUser.id, name: civicUser.name });
    
    // Find or create user in database
    let user = await User.findOne({ civicId: civicUser.id });
    let isNewUser = false;
    
    if (!user) {
      console.log('Creating new user in database...');
      isNewUser = true;
      user = new User({
        civicId: civicUser.id,
        name: civicUser.name || 'Anonymous User',
        email: civicUser.email || null,
        walletAddress: civicUser.walletAddress || null,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await user.save();
      console.log('New user created:', { id: user._id, civicId: user.civicId, name: user.name });
    } else {
      console.log('Updating existing user...');
      // Update user information
      user.name = civicUser.name || user.name;
      user.email = civicUser.email || user.email;
      user.walletAddress = civicUser.walletAddress || user.walletAddress;
      user.lastLogin = new Date();
      await user.save();
      console.log('Existing user updated:', { id: user._id, civicId: user.civicId, name: user.name });
    }

    console.log('User saved successfully, redirecting to home');

    // Redirect to home page with profile setup indicator for new users
    const redirectUrl = isNewUser && (!user.username || !user.name) 
      ? `${process.env.CLIENT_URL}/home?setup=true`
      : `${process.env.CLIENT_URL}/home`;
    
    res.redirect(redirectUrl);

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

// Complete profile setup after signup
export const completeProfileSetup = async (req, res) => {
  try {
    const { name, username } = req.body;

    console.log('Profile setup request:', { name, username });

    if (!name || !username) {
      return res.status(400).json({ error: 'Name and username are required' });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long' });
    }

    if (username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }

    // Check if username is already taken
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Username is already taken' });
    }

    const isLoggedIn = await req.civicAuth.isLoggedIn();
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const civicUser = await req.civicAuth.getUser();
    if (!civicUser) {
      return res.status(401).json({ error: 'No user session found' });
    }

    console.log('Updating user profile for civicId:', civicUser.id);

    // Update user in database
    const user = await User.findOneAndUpdate(
      { civicId: civicUser.id }, 
      { 
        name: name.trim(),
        username: username.toLowerCase().trim()
      },
      { new: true, select: '-__v' }
    );

    if (!user) {
      console.log('User not found, creating new user...');
      // Create user if somehow not exists
      const newUser = new User({
        civicId: civicUser.id,
        name: name.trim(),
        username: username.toLowerCase().trim(),
        email: civicUser.email || null,
        walletAddress: civicUser.walletAddress || null,
        createdAt: new Date(),
        lastLogin: new Date()
      });
      await newUser.save();
      console.log('Profile setup - New user created:', newUser._id);
      return res.json({ message: 'Profile setup completed successfully', user: newUser });
    }

    console.log('Profile setup completed for user:', user._id);
    res.json({ message: 'Profile setup completed successfully', user });
  } catch (error) {
    console.error('Complete profile setup error:', error);
    res.status(500).json({ error: 'Failed to complete profile setup' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { name, username, bio, location } = req.body;

    console.log('Profile update request:', { name, username, bio, location });

    const isLoggedIn = await req.civicAuth.isLoggedIn();
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const civicUser = await req.civicAuth.getUser();
    if (!civicUser) {
      return res.status(401).json({ error: 'No user session found' });
    }

    // Find current user
    const currentUser = await User.findOne({ civicId: civicUser.id });
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('Updating profile for user:', currentUser._id);

    // Check if username is being changed and if it's already taken
    if (username && username.toLowerCase() !== currentUser.username) {
      const existingUser = await User.findOne({ username: username.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== currentUser._id.toString()) {
        return res.status(409).json({ error: 'Username is already taken' });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (username && username.trim()) updateData.username = username.toLowerCase().trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();

    console.log('Update data:', updateData);

    // Update user in database
    const user = await User.findOneAndUpdate(
      { civicId: civicUser.id }, 
      updateData,
      { new: true, select: '-__v' }
    );

    console.log('Profile updated successfully for user:', user._id);
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
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
        if (user) {
          console.log('Auth check - User found in database:', { id: user._id, civicId: user.civicId });
          res.json({ isAuthenticated: true, user });
        } else {
          console.log('Auth check - User not found in database, creating...');
          // Create user if not exists (fallback)
          const newUser = new User({
            civicId: civicUser.id,
            name: civicUser.name || 'Anonymous User',
            email: civicUser.email || null,
            walletAddress: civicUser.walletAddress || null,
            createdAt: new Date(),
            lastLogin: new Date()
          });
          await newUser.save();
          console.log('Fallback user created:', { id: newUser._id, civicId: newUser.civicId });
          res.json({ isAuthenticated: true, user: newUser });
        }
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

// Get database stats (for debugging)
export const getDatabaseStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const users = await User.find({}).select('civicId name username email createdAt').limit(10);
    
    res.json({
      totalUsers: userCount,
      recentUsers: users,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database stats error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
};