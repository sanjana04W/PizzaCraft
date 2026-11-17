/**
 * PizzaCraft - Backend Server
 * Node.js & Express REST API Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogsRoutes);
app.use('/api/orders', ordersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'PizzaCraft Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname)));

// Fallback for API 404 (mounted after all valid /api routes)
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Default fallback to index.html for root navigation
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred.'
  });
});

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
==================================================
🍕 PizzaCraft Server Running Successfully!
🚀 Backend REST API: http://localhost:${PORT}/api/health
🌐 Web Application:   http://localhost:${PORT}
==================================================
Available Endpoints:
  POST /api/auth/register    - User Registration
  POST /api/auth/login       - User Login
  GET  /api/auth/users       - List Registered Users
  GET  /api/blogs            - Get All Pizza Stories
  POST /api/blogs            - Create New Blog Article
  POST /api/blogs/:id/like   - Toggle Story Like
  GET  /api/orders           - Get Orders
  POST /api/orders           - Place Pizza Order
  PATCH /api/orders/:id/status - Advance Order Stage
==================================================
    `);
  });
}

module.exports = app;
