/**
 * PizzaCraft - JWT Authentication Middleware
 * Protects private routes by verifying JSON Web Tokens
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'pizzacraft_super_secret_jwt_key_2026_secure_artisan';

/**
 * Protect routes - requires a valid JWT Bearer token
 */
function protect(req, res, next) {
  let token = null;

  // Check Authorization header: Bearer <token>
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1].trim();
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'].trim();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name, iat, exp }
    next();
  } catch (err) {
    const isExpired = err.name === 'TokenExpiredError';
    return res.status(401).json({
      success: false,
      message: isExpired
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token.'
    });
  }
}

/**
 * Optional authentication - attaches req.user if valid token present, otherwise proceeds
 */
function optionalAuth(req, res, next) {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1].trim();
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'].trim();
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Ignore invalid token in optional mode
    }
  }
  next();
}

/**
 * Helper to generate JWT token for a user
 */
function generateToken(user) {
  const payload = {
    id: user.id || user._id,
    email: user.email,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

module.exports = {
  protect,
  optionalAuth,
  generateToken
};
