/**
 * PizzaCraft - Auth Routes
 * JWT User Authentication with MongoDB primary storage + JSON file fallback
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const { isDbConnected } = require('../config/db');
const User = require('../models/User');
const { protect, generateToken } = require('../middleware/auth');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');

// ─── JSON Helpers ─────────────────────────────────────────────────────────────
function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
  } catch { return []; }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch { return false; }
}

function sanitizeUser(user) {
  const { password, __v, ...safe } = user;
  return safe;
}

// ─── Seed Demo User to MongoDB (runs once on first connection) ────────────────
let seeded = false;
async function seedDemoUser() {
  if (seeded) return;
  seeded = true;
  try {
    const exists = await User.findOne({ email: 'john@example.com' });
    if (!exists) {
      await User.create({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'pizza123',
        phone: '+91 98765 43210',
        address: '12 Pepperoni Avenue, Gourmet City',
        loyaltyPoints: 350
      });
      console.log('🌱 Demo user seeded to MongoDB');
    }
  } catch (err) {
    console.warn('⚠️  Demo user seed skipped:', err.message);
  }
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !name.trim())
      return res.status(400).json({ success: false, message: 'Full name is required.' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim()))
      return res.status(400).json({ success: false, message: 'Valid email address is required.' });

    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });

    const cleanEmail = email.trim().toLowerCase();

    // ── MongoDB path ──
    if (isDbConnected()) {
      await seedDemoUser();
      const existing = await User.findOne({ email: cleanEmail });
      if (existing)
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

      const user = new User({
        name: name.trim(),
        email: cleanEmail,
        password,
        phone: phone?.trim() || '+91 99999 88888',
        address: address?.trim() || '12 Pepperoni Avenue, Gourmet City'
      });
      await user.save();

      const safeUser = user.toSafeObject();
      const token = generateToken(safeUser);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to PizzaCraft Club. 🎉',
        token,
        user: safeUser
      });
    }

    // ── JSON fallback ──
    const users = readUsers();
    if (users.find(u => u.email === cleanEmail))
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });

    const salt = await bcrypt.genSalt(12);
    const hashedPw = await bcrypt.hash(password, salt);

    const newUser = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashedPw,
      phone: phone?.trim() || '+91 99999 88888',
      address: address?.trim() || '12 Pepperoni Avenue, Gourmet City',
      loyaltyPoints: 120,
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
    users.push(newUser);
    writeUsers(users);

    const safeUser = sanitizeUser(newUser);
    const token = generateToken(safeUser);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to PizzaCraft Club. 🎉',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });

    const cleanEmail = email.trim().toLowerCase();

    // ── MongoDB path ──
    if (isDbConnected()) {
      await seedDemoUser();
      const user = await User.findByCredentials(cleanEmail, password);
      if (!user)
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });

      const safeUser = user.toSafeObject();
      const token = generateToken(safeUser);

      return res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}! 🍕`,
        token,
        user: safeUser
      });
    }

    // ── JSON fallback ──
    const users = readUsers();
    const found = users.find(u => u.email === cleanEmail);
    if (!found)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, found.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });

    const safeUser = sanitizeUser({ ...found });
    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${found.name}! 🍕`,
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
});

// ─── GET /api/auth/me (Protected: returns authenticated user profile) ─────────
router.get('/me', protect, async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (isDbConnected()) {
      const user = await User.findOne({ email: userEmail }).select('-password -__v').lean();
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.status(200).json({
        success: true,
        user: { ...user, id: user._id.toString() }
      });
    }

    const users = readUsers();
    const found = users.find(u => u.email === userEmail);
    if (!found) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({
      success: true,
      user: sanitizeUser({ ...found })
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching profile.' });
  }
});

// ─── PUT /api/auth/profile (Protected: updates user profile) ──────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { name, phone, address } = req.body;

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();

    if (isDbConnected()) {
      const updated = await User.findOneAndUpdate(
        { email: userEmail },
        updates,
        { new: true, runValidators: true }
      ).select('-password -__v').lean();

      if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully!',
        user: { ...updated, id: updated._id.toString() }
      });
    }

    // JSON fallback
    const users = readUsers();
    const idx = users.findIndex(u => u.email === userEmail);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found.' });

    users[idx] = { ...users[idx], ...updates };
    writeUsers(users);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser({ ...users[idx] })
    });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: 'Error updating profile.' });
  }
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

// ─── GET /api/auth/users (Sanitized list for demo/admin) ──────────────────────
router.get('/users', async (req, res) => {
  try {
    if (isDbConnected()) {
      const users = await User.find({}).select('-password -__v').lean();
      const mapped = users.map(u => ({ ...u, id: u._id.toString() }));
      return res.status(200).json({ success: true, count: mapped.length, users: mapped });
    }

    const users = readUsers();
    return res.status(200).json({
      success: true,
      count: users.length,
      users: users.map(sanitizeUser)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error fetching users.' });
  }
});

module.exports = router;
