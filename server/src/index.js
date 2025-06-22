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
  redirectUrl: process.env.CIVIC_REDIRECT_URL || 'http://localhost:5000/auth/callback',
  postLogoutRedirectUrl: process.env.CIVIC_POST_LOGOUT_REDIRECT_URL || 'http://localhost:3000/'
};

// Express Cookie Storage for Civic Auth
class ExpressCookieStorage extends CookieStorage {
  constructor(req, res) {
    super({
      secure: process.env.NODE_ENV === 'production'
    });
    this.req = req;
    this.res = res;
  }

  async get(key) {
    return Promise.resolve(this.req.cookies[key] ?? null);
  }

  async set(key, value) {
    await this.res.cookie(key, value, this.settings);
  }
}

app.set('query parser', 'simple');
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); 
// CORS Configuration - Allow multiple origins for development and production
const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "https://amar-voice.vercel.app",
  "https://amarvoice.vercel.app", // Alternative domain if needed
  "http://localhost:3000", // For local development
  "http://localhost:3001", // Alternative local port
];

// In development, allow all localhost origins
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push(/^http:\/\/localhost:\d+$/);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in our allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

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
app.use('/api/ai', aiRoutes);

// Direct callback route (not under /api prefix for OAuth compliance)
app.get('/auth/callback', async (req, res) => {
  const { civicCallback } = await import('./controller/auth.controller.js');
  civicCallback(req, res);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});