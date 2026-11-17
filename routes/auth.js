const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// Helper to read users
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
}

// Helper to write users
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing users file:', err);
    return false;
  }
}

// Helper to sanitize user object (exclude password)
function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Field validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Full name is required.'
      });
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const users = readUsers();
    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate user
    const existingUser = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Create new user
    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: password, // Note: In production use bcrypt
      phone: (phone && phone.trim()) ? phone.trim() : '+91 99999 88888',
      address: (address && address.trim()) ? address.trim() : '12 Pepperoni Avenue, Gourmet City',
      loyaltyPoints: 120, // 120 Welcome bonus points
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };

    users.push(newUser);
    const saved = writeUsers(users);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save user account. Please try again.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to PizzaCraft Club.',
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return details
 * @access  Public
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const users = readUsers();
    const cleanEmail = email.trim().toLowerCase();

    const matchedUser = users.find(u => 
      u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (!matchedUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please try again.'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${matchedUser.name}!`,
      user: sanitizeUser(matchedUser)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (sanitized)
 * @access  Public (for review / demo)
 */
router.get('/users', (req, res) => {
  try {
    const users = readUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching users.'
    });
  }
});

module.exports = router;
