/**
 * PizzaCraft - Backend Server
 * Node.js & Express REST API Server with MongoDB (Mongoose) + JSON fallback
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { connectDB } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  try { fs.mkdirSync(dataDir, { recursive: true }); } catch (e) { console.warn('Could not create data dir:', e.message); }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Mount REST API Routes
const authRoutes = require('./routes/auth');
const blogsRoutes = require('./routes/blogs');
const ordersRoutes = require('./routes/orders');
const { protect } = require('./middleware/auth');

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/orders', ordersRoutes);

// Protected dashboard stats endpoint (verifies JWT session)
app.get('/api/dashboard/stats', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authorized dashboard access.',
    user: req.user
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const { isDbConnected } = require('./config/db');
  res.status(200).json({
    status: 'healthy',
    service: 'PizzaCraft Backend API',
    version: '2.0.0',
    database: isDbConnected() ? 'MongoDB Connected' : 'JSON Fallback (MongoDB offline)',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for API 404 (mounted after all valid /api routes)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Default fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

// VERCEL_DB_CONNECT: connect to MongoDB when imported by Vercel
if (require.main !== module) {
  connectDB().catch((err) => console.error('DB connect error:', err));
}

// Start Server
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      const { isDbConnected } = require('./config/db');
      const dbStatus = isDbConnected()
        ? '🍃 MongoDB Connected'
        : '📁 JSON File Storage (MongoDB offline – app still runs!)';

      console.log(`
==================================================
🍕 PizzaCraft Server Running Successfully!
🚀 Backend REST API: http://localhost:${PORT}/api/health
🌐 Web Application:  http://localhost:${PORT}
🗄  Database:         ${dbStatus}
==================================================
Available Endpoints:
  POST  /api/auth/register        - User Registration
  POST  /api/auth/login           - User Login
  GET   /api/auth/users           - List Users
  GET   /api/blogs                - Get All Pizza Stories
  GET   /api/blogs/:id            - Get Single Blog
  POST  /api/blogs                - Create New Blog Article
  POST  /api/blogs/:id/like       - Toggle Story Like
  GET   /api/orders               - Get Orders
  POST  /api/orders               - Place Pizza Order
  PATCH /api/orders/:id/status    - Advance Order Stage
==================================================
      `);
    });
  });
}

module.exports = app;
