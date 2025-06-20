import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CookieStorage, CivicAuth } from '@civic/auth/server';
import { connectDB } from './lib/db.js';
import authRoutes from './route/auth.route.js';
import complaintRoutes from './route/complaint.route.js';

dotenv.config();
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
app.use(cors({
  origin: [
    process.env.CLIENT_URL || "http://localhost:3000",
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Debug middleware (can be removed in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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