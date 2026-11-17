/**
 * PizzaCraft - User Mongoose Model
 * Stores user credentials and profile data securely (passwords hashed with bcryptjs)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
      type: String,
      default: '+91 99999 88888'
    },
    address: {
      type: String,
      default: '12 Pepperoni Avenue, Gourmet City'
    },
    loyaltyPoints: {
      type: Number,
      default: 120
    },
    joinedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
  },
  { timestamps: true }
);

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ─── Static Method: Find user by email and verify password ───────────────────
userSchema.statics.findByCredentials = async function (email, plainPassword) {
  const user = await this.findOne({ email: email.trim().toLowerCase() });
  if (!user) return null;
  const isMatch = await bcrypt.compare(plainPassword, user.password);
  return isMatch ? user : null;
};

// ─── Instance Method: Return safe user object (no password) ──────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  obj.id = obj._id.toString();
  return obj;
};

module.exports = mongoose.model('User', userSchema);
