import express from 'express';
import { 
  civicLogin, 
  civicCallback, 
  logout, 
  getCurrentUser, 
  checkAuth 
} from '../controller/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/login', civicLogin);
router.get('/callback', civicCallback);
router.get('/logout', logout);
router.get('/check', checkAuth);

// Protected routes
router.get('/user', authMiddleware, getCurrentUser);

export default router;