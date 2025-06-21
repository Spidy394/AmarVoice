import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import Complaint from '../model/complain.model.js';
import User from '../model/user.modle.js';
import geminiService from '../services/gemini.service.js';
import NotificationService from '../services/notification.service.js';

const router = express.Router();

// Get all complaints (public feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;    const complaints = await Complaint.find({ status: { $ne: 'draft' } })
      .populate('author', 'name avatar isVerified reputation')
      .populate('assignedTo', 'name avatar')
      .populate({
        path: 'comments.author',
        select: 'name avatar isVerified'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments({ status: { $ne: 'draft' } });

    res.json({
      complaints,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCount: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
});

// Create new complaint (protected)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      urgency,
      tags,
      images,
      isAnonymous
    } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      urgency: urgency || 'medium',
      tags: tags || [],
      images: images || [],
      author: req.userId,
      isAnonymous: isAnonymous || false,
      status: 'open',
      createdAt: new Date()
    });

    await complaint.save();
    await complaint.populate('author', 'name avatar isVerified reputation');    // Update user's complaint count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { complaintsSubmitted: 1 }
    });

    // Generate AI suggestion after complaint is created
    try {
      if (geminiService.isConfigured()) {
        const user = await User.findById(req.userId);
        const aiSuggestion = await geminiService.generateComplaintSuggestion(complaint, user);
        
        // Update complaint with AI suggestion
        complaint.aiSuggestion = {
          ...aiSuggestion,
          isGenerated: true
        };
        await complaint.save();
        console.log('AI suggestion generated successfully for complaint:', complaint._id);
      } else {
        console.warn('Gemini service not configured - skipping AI suggestion generation');
      }
    } catch (aiError) {
      console.error('AI suggestion generation failed:', aiError);
      // Don't fail the complaint creation if AI suggestion fails
    }

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Get user's complaints (protected)
router.get('/my-complaints', authMiddleware, async (req, res) => {  try {
    const complaints = await Complaint.find({ author: req.userId })
      .populate('assignedTo', 'name avatar')
      .populate({
        path: 'comments.author',
        select: 'name avatar isVerified'
      })
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    console.error('Get user complaints error:', error);
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
});

// Get complaint by ID
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('author', 'name avatar isVerified reputation')
      .populate('assignedTo', 'name avatar')
      .populate({
        path: 'comments.author',
        select: 'name avatar isVerified'
      });

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Increment view count
    complaint.views = (complaint.views || 0) + 1;
    await complaint.save();

    res.json(complaint);
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
});

// Add comment to complaint (protected)
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const comment = {
      author: req.userId,
      content: content.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };    complaint.comments.push(comment);
    await complaint.save();
    
    // Populate the author information for the new comment
    await complaint.populate({
      path: 'comments.author',
      select: 'name avatar isVerified'
    });

    // Get the newly added comment
    const newComment = complaint.comments[complaint.comments.length - 1];

    // Create notification for comment
    try {
      const actor = await User.findById(req.userId);
      await NotificationService.createCommentNotification(
        complaint._id,
        complaint.title,
        complaint.author,
        req.userId,
        actor.name,
        newComment._id
      );
    } catch (notificationError) {
      console.error('Failed to create comment notification:', notificationError);
      // Don't fail the comment if notification creation fails
    }

    // Return the newly added comment with populated author
    res.json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Update complaint status (protected - author only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }    // Check if user is the author
    if (!complaint.author.equals(req.userId)) {
      return res.status(403).json({ error: 'Not authorized to update this complaint' });
    }

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      // Update user's resolved complaints count
      await User.findByIdAndUpdate(req.userId, {
        $inc: { complaintsResolved: 1 }
      });
    }    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

// Generate AI suggestion for a specific complaint (protected)
router.post('/:id/ai-suggestion', async (req, res) => {
  console.log('=== AI SUGGESTION ENDPOINT CALLED ===');
  console.log('Complaint ID:', req.params.id);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  try {
    // Check authentication manually for better debugging
    const isLoggedIn = await req.civicAuth.isLoggedIn();
    console.log('User logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      console.log('User not authenticated');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const civicUser = await req.civicAuth.getUser();
    console.log('Civic user:', civicUser);
    
    if (!civicUser) {
      console.log('No civic user found');
      return res.status(401).json({ error: 'No user session found' });
    }

    const dbUser = await User.findOne({ civicId: civicUser.id });
    console.log('DB user found:', dbUser ? `${dbUser.name} (${dbUser._id})` : 'None');
    
    if (!dbUser) {
      console.log('User not found in database');
      return res.status(401).json({ error: 'User not found in database' });
    }

    const complaint = await Complaint.findById(req.params.id);
    console.log('Complaint found:', complaint ? complaint.title : 'None');
    
    if (!complaint) {
      console.log('Complaint not found:', req.params.id);
      return res.status(404).json({ error: 'Complaint not found' });
    }

    console.log('Complaint author:', complaint.author);
    console.log('Current user:', dbUser._id);
    console.log('Author match:', complaint.author.toString() === dbUser._id.toString());

    // Check if user is the author or has permission
    if (complaint.author.toString() !== dbUser._id.toString()) {
      console.log('Authorization failed - not the author');
      return res.status(403).json({ error: 'Not authorized to generate AI suggestion for this complaint' });
    }    console.log('Gemini service configured:', geminiService.isConfigured());
    
    console.log('Generating AI suggestion (using mock since no API key)...');
    
    // Create a more dynamic mock response based on the complaint
    const getUserLevel = (reputation) => {
      if (reputation >= 1000) return 'expert';
      if (reputation >= 500) return 'experienced';
      if (reputation >= 100) return 'intermediate';
      return 'beginner';
    };

    const getCategoryAdvice = (category) => {
      const advice = {
        'infrastructure': {
          steps: [
            "Contact your local Municipal Corporation or PWD office",
            "Submit a written complaint with photos as evidence",
            "Reference the issue location with specific landmarks",
            "Follow up every 7-10 days for status updates"
          ],
          contacts: [{
            type: "Public Works Department (PWD)",
            name: "Local PWD Office",
            description: "Primary authority for road, drainage, and infrastructure issues"
          }],
          timeline: "2-6 weeks depending on complexity"
        },
        'utilities': {
          steps: [
            "Contact the local electricity board office",
            "File a complaint with your consumer number",
            "Document power cut timings and frequency",
            "Request for compensation if applicable"
          ],
          contacts: [{
            type: "State Electricity Board",
            name: "Local Electricity Board Office",
            description: "Report power cuts, billing issues, and electrical safety concerns"
          }],
          timeline: "1-3 weeks for resolution"
        },
        'environment': {
          steps: [
            "Contact the Pollution Control Board",
            "File a complaint with environmental department",
            "Collect evidence (photos, videos, air quality data)",
            "Involve local NGOs if needed for support"
          ],
          contacts: [{
            type: "Pollution Control Board",
            name: "State/District Pollution Control Board",
            description: "Authority for environmental issues and pollution control"
          }],
          timeline: "3-8 weeks depending on investigation required"
        }
      };
      return advice[category] || advice['infrastructure'];
    };

    const categoryAdvice = getCategoryAdvice(complaint.category);
    const userLevel = getUserLevel(dbUser.reputation || 0);
    
    // For now, let's return a mock response to test the flow
    const mockAISuggestion = {
      content: `Based on your ${complaint.category} complaint "${complaint.title}", here's what you should do. As a ${userLevel} user, I recommend starting with the local authorities and following proper documentation procedures. The issue appears to be related to ${complaint.category} in ${complaint.location?.city || 'your area'}, which typically falls under local municipal jurisdiction.`,
      actionSteps: categoryAdvice.steps,
      relevantContacts: categoryAdvice.contacts,
      expectedTimeline: categoryAdvice.timeline,
      urgencyLevel: complaint.urgency || "medium",
      userLevel: userLevel,
      confidence: "high",
      generatedAt: new Date(),
      isGenerated: true
    };
    
    console.log('Mock AI suggestion created');
    
    // Update complaint with AI suggestion
    complaint.aiSuggestion = mockAISuggestion;
    await complaint.save();
    
    console.log('Complaint updated with AI suggestion');

    const response = {
      message: 'AI suggestion generated successfully',
      aiSuggestion: mockAISuggestion
    };
    
    console.log('Sending response:', response);
    res.json(response);
    
  } catch (error) {
    console.error('=== AI SUGGESTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Failed to generate AI suggestion: ' + error.message });
  }
});

// Delete complaint (protected - author only)
router.delete('/:id', authMiddleware, async (req, res) => {
  console.log('=== DELETE COMPLAINT ENDPOINT CALLED ===');
  console.log('Complaint ID:', req.params.id);
  console.log('User ID from middleware:', req.userId);
  console.log('User object from middleware:', req.user);
  
  try {
    const complaint = await Complaint.findById(req.params.id);
    console.log('Found complaint:', complaint ? complaint.title : 'None');
    
    if (!complaint) {
      console.log('Complaint not found');
      return res.status(404).json({ error: 'Complaint not found' });
    }    console.log('Complaint author:', complaint.author);
    console.log('Current user ID:', req.userId);
    console.log('Author match (toString):', complaint.author.toString() === req.userId.toString());
    console.log('Author match (equals):', complaint.author.equals(req.userId));

    // Check if user is the author
    if (!complaint.author.equals(req.userId)) {
      console.log('Authorization failed - user is not the author');
      return res.status(403).json({ error: 'Not authorized to delete this complaint' });
    }

    console.log('Deleting complaint...');
    // Delete the complaint
    await Complaint.findByIdAndDelete(req.params.id);
    
    console.log('Updating user complaint count...');
    // Update user's complaint count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { complaintsSubmitted: -1 }
    });

    console.log('Delete operation completed successfully');
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

// Update/Edit complaint (protected - author only)
router.put('/:id', authMiddleware, async (req, res) => {
  console.log('=== UPDATE COMPLAINT ENDPOINT CALLED ===');
  console.log('Complaint ID:', req.params.id);
  console.log('User ID from middleware:', req.userId);
  
  try {
    const complaint = await Complaint.findById(req.params.id);
    console.log('Found complaint:', complaint ? complaint.title : 'None');
    
    if (!complaint) {
      console.log('Complaint not found');
      return res.status(404).json({ error: 'Complaint not found' });
    }

    console.log('Complaint author:', complaint.author);
    console.log('Current user ID:', req.userId);
    console.log('Author match (equals):', complaint.author.equals(req.userId));

    // Check if user is the author
    if (!complaint.author.equals(req.userId)) {
      console.log('Authorization failed - user is not the author');
      return res.status(403).json({ error: 'Not authorized to edit this complaint' });
    }

    // Get update data from request body
    const {
      title,
      description,
      category,
      location,
      urgency,
      tags,
      images
    } = req.body;

    console.log('Updating complaint with data:', { title, description, category, urgency });    // Update the complaint fields
    if (title !== undefined) complaint.title = title;
    if (description !== undefined) complaint.description = description;
    if (category !== undefined) complaint.category = category;
    if (location !== undefined) complaint.location = location;
    if (urgency !== undefined) complaint.urgency = urgency;
    if (tags !== undefined) complaint.tags = tags;
    if (images !== undefined) complaint.images = images;
    
    // Mark as edited and set edit timestamp
    complaint.isEdited = true;
    complaint.editedAt = new Date();
    
    // Update the updatedAt timestamp
    complaint.updatedAt = new Date();

    console.log('Saving updated complaint...');
    await complaint.save();
    
    // Populate author information for response
    await complaint.populate('author', 'name avatar isVerified reputation');

    console.log('Update operation completed successfully');
    res.json(complaint);
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Failed to update complaint' });
  }
});

// Upvote complaint (protected)
router.post('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.userId;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user already upvoted
    const existingUpvoteIndex = complaint.upvotes.findIndex(
      vote => vote.user.toString() === userId.toString()
    );

    // Check if user already downvoted
    const existingDownvoteIndex = complaint.downvotes.findIndex(
      vote => vote.user.toString() === userId.toString()
    );

    // Remove existing downvote if present
    if (existingDownvoteIndex !== -1) {
      complaint.downvotes.splice(existingDownvoteIndex, 1);
    }    // Toggle upvote
    let voteAction = null;
    if (existingUpvoteIndex !== -1) {
      // Remove upvote if already upvoted
      complaint.upvotes.splice(existingUpvoteIndex, 1);
      voteAction = 'removed';
    } else {
      // Add upvote
      complaint.upvotes.push({
        user: userId,
        createdAt: new Date()
      });
      voteAction = 'added';
    }    // Recalculate priority
    complaint.calculatePriority();
    await complaint.save();

    // Create notification for upvote (only if added, not removed)
    if (voteAction === 'added') {
      try {
        const actor = await User.findById(userId);
        await NotificationService.createUpvoteNotification(
          complaint._id,
          complaint.title,
          complaint.author,
          userId,
          actor.name
        );
      } catch (notificationError) {
        console.error('Failed to create upvote notification:', notificationError);
        // Don't fail the vote if notification creation fails
      }
    }

    // Update author's reputation
    try {
      const author = await User.findById(complaint.author);
      if (author) {
        await author.updateReputation();
      }
    } catch (repError) {
      console.error('Failed to update author reputation:', repError);
      // Don't fail the vote if reputation update fails
    }    // Return updated vote counts
    res.json({
      upvoteCount: complaint.upvotes.length,
      downvoteCount: complaint.downvotes.length,
      userVote: voteAction === 'removed' ? null : 'upvote' // null if removed, 'upvote' if added
    });

  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ error: 'Failed to upvote complaint' });
  }
});

// Downvote complaint (protected)
router.post('/:id/downvote', authMiddleware, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.userId;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    // Check if user already downvoted
    const existingDownvoteIndex = complaint.downvotes.findIndex(
      vote => vote.user.toString() === userId.toString()
    );

    // Check if user already upvoted
    const existingUpvoteIndex = complaint.upvotes.findIndex(
      vote => vote.user.toString() === userId.toString()
    );

    // Remove existing upvote if present
    if (existingUpvoteIndex !== -1) {
      complaint.upvotes.splice(existingUpvoteIndex, 1);
    }    // Toggle downvote
    let voteAction = null;
    if (existingDownvoteIndex !== -1) {
      // Remove downvote if already downvoted
      complaint.downvotes.splice(existingDownvoteIndex, 1);
      voteAction = 'removed';
    } else {
      // Add downvote
      complaint.downvotes.push({
        user: userId,
        createdAt: new Date()
      });
      voteAction = 'added';
    }    // Recalculate priority
    complaint.calculatePriority();
    await complaint.save();

    // Create notification for downvote (only if added, not removed)
    if (voteAction === 'added') {
      try {
        const actor = await User.findById(userId);
        await NotificationService.createDownvoteNotification(
          complaint._id,
          complaint.title,
          complaint.author,
          userId,
          actor.name
        );
      } catch (notificationError) {
        console.error('Failed to create downvote notification:', notificationError);
        // Don't fail the vote if notification creation fails
      }
    }

    // Update author's reputation
    try {
      const author = await User.findById(complaint.author);
      if (author) {
        await author.updateReputation();
      }
    } catch (repError) {
      console.error('Failed to update author reputation:', repError);
      // Don't fail the vote if reputation update fails
    }    // Return updated vote counts
    res.json({
      upvoteCount: complaint.upvotes.length,
      downvoteCount: complaint.downvotes.length,
      userVote: voteAction === 'removed' ? null : 'downvote' // null if removed, 'downvote' if added
    });

  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ error: 'Failed to downvote complaint' });
  }
});

// Get user's vote status for a complaint (protected)
router.get('/:id/vote-status', authMiddleware, async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.userId;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const hasUpvoted = complaint.upvotes.some(
      vote => vote.user.toString() === userId.toString()
    );

    const hasDownvoted = complaint.downvotes.some(
      vote => vote.user.toString() === userId.toString()
    );

    let userVote = null;
    if (hasUpvoted) userVote = 'upvote';
    if (hasDownvoted) userVote = 'downvote';

    res.json({
      upvoteCount: complaint.upvotes.length,
      downvoteCount: complaint.downvotes.length,
      userVote
    });

  } catch (error) {
    console.error('Vote status error:', error);
    res.status(500).json({ error: 'Failed to get vote status' });
  }
});

// Delete comment from complaint (protected - comment author only)
router.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { id: complaintId, commentId } = req.params;
    const userId = req.userId;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const comment = complaint.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author or complaint author
    if (!comment.author.equals(userId) && !complaint.author.equals(userId)) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Remove the comment
    complaint.comments.pull(commentId);
    await complaint.save();

    res.json({ message: 'Comment deleted successfully' });

  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Edit comment (protected - comment author only)
router.put('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const { id: complaintId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const comment = complaint.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (!comment.author.equals(userId)) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    // Update the comment
    comment.content = content.trim();
    comment.updatedAt = new Date();

    await complaint.save();
    await complaint.populate('comments.author', 'name avatar isVerified');

    // Return the updated comment
    const updatedComment = complaint.comments.id(commentId);
    res.json(updatedComment);

  } catch (error) {
    console.error('Edit comment error:', error);
    res.status(500).json({ error: 'Failed to edit comment' });
  }
});

// Test endpoint for debugging
router.get('/test-ai', authMiddleware, async (req, res) => {
  try {
    console.log('Test AI endpoint called');
    console.log('User ID:', req.userId);
    console.log('Gemini configured:', geminiService.isConfigured());
    
    res.json({
      message: 'Test endpoint working',
      userId: req.userId,
      geminiConfigured: geminiService.isConfigured(),
      timestamp: new Date().toISOString()    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;