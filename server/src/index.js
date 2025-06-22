import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CookieStorage, CivicAuth } from '@civic/auth/server';
import { connectDB } from './lib/db.js';
import authRoutes from './route/auth.route.js';
import complaintRoutes from './route/complaint.route.js';
import notificationRoutes from './route/notification.route.js';
import aiRoutes from './route/ai.route.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory and configure dotenv to load from server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;


// Civic Auth Configuration
const civicConfig = {
  clientId: process.env.CIVIC_CLIENT_ID,
  redirectUrl: process.env.CIVIC_REDIRECT_URL || (process.env.NODE_ENV === 'production' 
    ? 'https://amarvoice.onrender.com/auth/callback' 
    : 'http://localhost:5000/auth/callback'),
  postLogoutRedirectUrl: process.env.CIVIC_POST_LOGOUT_URL || (process.env.NODE_ENV === 'production'
    ? 'https://amar-voice.vercel.app/'
    : 'http://localhost:3000/')
};

// Express Cookie Storage for Civic Auth
class ExpressCookieStorage extends CookieStorage {
  constructor(req, res) {
    super({
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Allow cross-site cookies in production
      httpOnly: true,
      domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined
    });
    this.req = req;
    this.res = res;
  }

  async get(key) {
    return Promise.resolve(this.req.cookies[key] ?? null);
  }

  async set(key, value) {
    const cookieOptions = {
      ...this.settings,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    };
    this.res.cookie(key, value, cookieOptions);
  }
}

app.set('query parser', 'simple');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); 

// Security headers
app.use((req, res, next) => {
  // Set CORS headers for all responses
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CLIENT_URL || "http://localhost:3000",
    "https://amar-voice.vercel.app",
    "https://amarvoice.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
  ];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  
  // Cross-Origin-Opener-Policy headers for Civic Auth
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
  
  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add Civic Auth to each request
app.use((req, res, next) => {
  req.storage = new ExpressCookieStorage(req, res);
  req.civicAuth = new CivicAuth(req.storage, civicConfig);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);

// Direct callback route (not under /api prefix for OAuth compliance)
app.get('/auth/callback', async (req, res) => {
  const { civicCallback } = await import('./controller/auth.controller.js');
  civicCallback(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: req.headers.origin,
      allowedOrigins: [
        process.env.CLIENT_URL || "http://localhost:3000",
        "https://amar-voice.vercel.app",
        "https://amarvoice.vercel.app",
        "http://localhost:3000",
        "http://localhost:3001",
      ]
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});