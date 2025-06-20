import express from 'express';
import { 
  civicLogin, 
  civicCallback, 
  logout, 
  getCurrentUser, 
  checkAuth,
  completeProfileSetup,
  updateProfile,
  getDatabaseStats
} from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/login', civicLogin);
router.get('/callback', civicCallback);
router.get('/logout', logout);
router.get('/check', checkAuth);
router.get('/db-stats', getDatabaseStats); // For debugging

// Protected routes
router.get('/user', authMiddleware, getCurrentUser);
router.post('/complete-profile', authMiddleware, completeProfileSetup);
router.put('/profile', authMiddleware, updateProfile);

export default router;