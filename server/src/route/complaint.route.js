import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import Complaint from '../model/complain.model.js';
import User from '../model/user.modle.js';

const router = express.Router();

// Get all complaints (public feed)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ status: { $ne: 'draft' } })
      .populate('author', 'name avatar isVerified reputation')
      .populate('assignedTo', 'name avatar')
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
    await complaint.populate('author', 'name avatar isVerified reputation');

    // Update user's complaint count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { complaintsSubmitted: 1 }
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// Get user's complaints (protected)
router.get('/my-complaints', authMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find({ author: req.userId })
      .populate('assignedTo', 'name avatar')
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
      .populate('comments.author', 'name avatar isVerified');

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

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
    
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const comment = {
      author: req.userId,
      content,
      createdAt: new Date()
    };

    complaint.comments.push(comment);
    await complaint.save();
    
    await complaint.populate('comments.author', 'name avatar isVerified');

    res.json(complaint.comments[complaint.comments.length - 1]);
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
    }

    // Check if user is the author
    if (complaint.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to update this complaint' });
    }

    complaint.status = status;
    if (status === 'resolved') {
      complaint.resolvedAt = new Date();
      // Update user's resolved complaints count
      await User.findByIdAndUpdate(req.userId, {
        $inc: { complaintsResolved: 1 }
      });
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Failed to update complaint status' });
  }
});

export default router;