/**
 * PizzaCraft - Blog / Culinary Story Mongoose Model
 */

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters']
    },
    category: {
      type: String,
      default: 'Baking Secrets',
      trim: true,
      enum: {
        values: ['Baking Secrets', 'Italian Heritage', 'Chef Tips', 'Ingredients', 'Health & Nutrition', 'World Flavors'],
        message: 'Invalid category: {VALUE}'
      }
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true
    },
    avatar: {
      type: String,
      default: function () {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.author || 'Chef')}&background=FF3838&color=fff`;
      }
    },
    date: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    readTime: {
      type: String,
      default: '5 min read'
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80'
    },
    content: {
      type: String,
      required: [true, 'Story content is required'],
      minlength: [10, 'Content must be at least 10 characters']
    },
    likes: {
      type: Number,
      default: 1,
      min: 0
    }
  },
  { timestamps: true }
);

// ─── Virtual: expose _id as id ────────────────────────────────────────────────
blogSchema.virtual('id').get(function () {
  return this._id.toString();
});

blogSchema.set('toJSON', { virtuals: true });
blogSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Blog', blogSchema);
