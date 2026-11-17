/**
 * PizzaCraft - Blog Routes (Full CRUD)
 * CREATE / READ / UPDATE / DELETE + search + category filter
 * MongoDB primary storage with JSON file fallback
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const { isDbConnected } = require('../config/db');
const Blog = require('../models/Blog');

const BLOGS_FILE = path.join(__dirname, '..', 'data', 'blogs.json');

// ─── JSON Helpers ─────────────────────────────────────────────────────────────
function readBlogs() {
  try {
    if (!fs.existsSync(BLOGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(BLOGS_FILE, 'utf8') || '[]');
  } catch { return []; }
}

function writeBlogs(blogs) {
  try {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf8');
    return true;
  } catch { return false; }
}

// ─── Seed Initial Blogs to MongoDB (once) ────────────────────────────────────
let seeded = false;
async function seedBlogs() {
  if (seeded) return;
  seeded = true;
  try {
    const count = await Blog.countDocuments();
    if (count === 0) {
      await Blog.insertMany([
        {
          title: 'The Secret Behind Perfect Neapolitan Pizza Dough',
          category: 'Baking Secrets',
          author: 'Chef Marco Rossi',
          avatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=FF3838&color=fff',
          date: 'Nov 10, 2024',
          readTime: '8 min read',
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
          content: `The art of Neapolitan pizza dough lies in patience and precision. True Neapolitan masters use 00 flour, fresh yeast, sea salt, and pure water—nothing more. The magic happens during the long cold fermentation (24-72 hours) which develops complex flavors and that characteristic airy, leopard-spotted crust.\n\nTemperature matters enormously: dough should be worked at room temperature around 20-22°C. When you stretch the dough, never use a rolling pin—your hands are the only tools a true pizzaiolo needs.\n\nBaking at 450-500°C in a wood-fired oven for 60-90 seconds creates that perfect char and chew that no home oven can fully replicate, but understanding these principles brings you much closer to the original.`,
          likes: 42
        },
        {
          title: 'Italian Heritage: How Pizza Became the World\'s Favorite Food',
          category: 'Italian Heritage',
          author: 'Sofia Bianchi',
          avatar: 'https://ui-avatars.com/api/?name=Sofia+Bianchi&background=FF8C00&color=fff',
          date: 'Nov 5, 2024',
          readTime: '6 min read',
          image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
          content: `Pizza's story begins not in a trendy restaurant, but on the streets of Naples in the 18th century, where flatbreads topped with tomatoes, garlic, oil, and cheese were sold to the working poor.\n\nThe pivotal moment came in 1889 when pizzaiolo Raffaele Esposito created the Margherita pizza for Queen Margherita of Savoy, using the colors of the Italian flag: red tomato, white mozzarella, green basil.\n\nToday, over 5 billion pizzas are eaten annually worldwide—a testament to the universal appeal of this humble Neapolitan creation.`,
          likes: 38
        },
        {
          title: 'Pro Chef Tips: Choosing the Best Mozzarella for Your Pizza',
          category: 'Chef Tips',
          author: 'Chef Luca Ferretti',
          avatar: 'https://ui-avatars.com/api/?name=Luca+Ferretti&background=22C55E&color=fff',
          date: 'Oct 28, 2024',
          readTime: '5 min read',
          image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&auto=format&fit=crop&q=80',
          content: `Not all mozzarella is created equal, and understanding the differences can transform your pizza game. Fresh Mozzarella di Bufala Campana (buffalo mozzarella) with its PDO certification is the gold standard—creamy, slightly tangy, and incredibly melty.\n\nFor the ultimate approach: use a mix of low-moisture for structure and coverage, then add torn fresh mozzarella in the last 2 minutes of baking for creamy pockets of flavor.`,
          likes: 55
        }
      ]);
      console.log('🌱 Initial blog posts seeded to MongoDB');
    }
  } catch (err) {
    console.warn('⚠️  Blog seed skipped:', err.message);
  }
}

// ─── Helper: build a blog object (JSON fallback) ──────────────────────────────
function buildBlogObject({ title, category, author, content, image }) {
  const words = content.trim().split(/\s+/).length;
  const readMinutes = Math.max(2, Math.round(words / 100));
  const cleanImage = image && typeof image === 'string' && image.trim().startsWith('http')
    ? image.trim()
    : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';
  return {
    id: 'blog-' + Date.now(),
    title: title.trim(),
    category: category?.trim() || 'Baking Secrets',
    author: author.trim(),
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.trim())}&background=FF3838&color=fff`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: `${readMinutes} min read`,
    image: cleanImage,
    content: content.trim(),
    likes: 1,
    createdAt: new Date().toISOString()
  };
}

// ─── GET /api/blogs — List (search + category) ────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    if (isDbConnected()) {
      await seedBlogs();
      let query = {};
      if (category && category !== 'all')
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
      if (search && search.trim()) {
        const q = search.trim();
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
          { author: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } }
        ];
      }
      const blogs = await Blog.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ success: true, count: blogs.length, blogs: blogs.map(b => ({ ...b, id: b._id.toString() })) });
    }
    // JSON fallback
    let blogs = readBlogs();
    if (category && category !== 'all')
      blogs = blogs.filter(b => b.category?.toLowerCase() === category.toLowerCase());
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      blogs = blogs.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }
    return res.json({ success: true, count: blogs.length, blogs });
  } catch (err) {
    console.error('GET /api/blogs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve blogs.' });
  }
});

// ─── GET /api/blogs/:id — Single blog ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      await seedBlogs();
      let blog = id.match(/^[a-fA-F0-9]{24}$/) ? await Blog.findById(id).lean() : null;
      if (!blog) blog = await Blog.findOne({ id }).lean();
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
      return res.json({ success: true, blog: { ...blog, id: blog._id.toString() } });
    }
    const blog = readBlogs().find(b => b.id === id || b._id === id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    return res.json({ success: true, blog });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error fetching blog.' });
  }
});

// ─── POST /api/blogs — Create ─────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, category, author, content, image } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!author?.trim()) return res.status(400).json({ success: false, message: 'Author is required.' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required.' });

    if (isDbConnected()) {
      await seedBlogs();
      const words = content.trim().split(/\s+/).length;
      const cleanImage = image?.trim().startsWith('http') ? image.trim()
        : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';
      const blog = await Blog.create({
        title: title.trim(),
        category: category?.trim() || 'Baking Secrets',
        author: author.trim(),
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.trim())}&background=FF3838&color=fff`,
        readTime: `${Math.max(2, Math.round(words / 100))} min read`,
        image: cleanImage,
        content: content.trim()
      });
      return res.status(201).json({ success: true, message: '🎉 Story published!', blog: { ...blog.toObject(), id: blog._id.toString() } });
    }
    // JSON fallback
    const blogs = readBlogs();
    const newBlog = buildBlogObject({ title, category, author, content, image });
    blogs.unshift(newBlog);
    writeBlogs(blogs);
    return res.status(201).json({ success: true, message: '🎉 Story published!', blog: newBlog });
  } catch (err) {
    console.error('POST /api/blogs error:', err);
    return res.status(500).json({ success: false, message: 'Failed to publish story.' });
  }
});

// ─── PUT /api/blogs/:id — Update (full CRUD) ──────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, author, content, image } = req.body;

    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required.' });
    if (!author?.trim()) return res.status(400).json({ success: false, message: 'Author is required.' });
    if (!content?.trim()) return res.status(400).json({ success: false, message: 'Content is required.' });

    const words = content.trim().split(/\s+/).length;
    const readMinutes = Math.max(2, Math.round(words / 100));
    const cleanImage = image?.trim().startsWith('http') ? image.trim()
      : 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';

    const updates = {
      title: title.trim(),
      category: category?.trim() || 'Baking Secrets',
      author: author.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.trim())}&background=FF3838&color=fff`,
      readTime: `${readMinutes} min read`,
      image: cleanImage,
      content: content.trim(),
      updatedAt: new Date().toISOString()
    };

    if (isDbConnected()) {
      let blog = null;
      if (id.match(/^[a-fA-F0-9]{24}$/)) {
        blog = await Blog.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).lean();
      }
      if (!blog) {
        blog = await Blog.findOneAndUpdate({ id }, updates, { new: true, runValidators: true }).lean();
      }
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
      return res.json({ success: true, message: '✅ Story updated successfully!', blog: { ...blog, id: blog._id.toString() } });
    }

    // JSON fallback
    const blogs = readBlogs();
    const idx = blogs.findIndex(b => b.id === id || b._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Blog not found.' });
    blogs[idx] = { ...blogs[idx], ...updates };
    writeBlogs(blogs);
    return res.json({ success: true, message: '✅ Story updated successfully!', blog: blogs[idx] });
  } catch (err) {
    console.error('PUT /api/blogs/:id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update story.' });
  }
});

// ─── DELETE /api/blogs/:id — Delete (full CRUD) ───────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let blog = null;
      if (id.match(/^[a-fA-F0-9]{24}$/)) {
        blog = await Blog.findByIdAndDelete(id).lean();
      }
      if (!blog) {
        blog = await Blog.findOneAndDelete({ id }).lean();
      }
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
      return res.json({ success: true, message: '🗑️ Story deleted successfully.' });
    }

    // JSON fallback
    const blogs = readBlogs();
    const idx = blogs.findIndex(b => b.id === id || b._id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Blog not found.' });
    const deleted = blogs.splice(idx, 1)[0];
    writeBlogs(blogs);
    return res.json({ success: true, message: '🗑️ Story deleted successfully.', blog: deleted });
  } catch (err) {
    console.error('DELETE /api/blogs/:id error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete story.' });
  }
});

// ─── POST /api/blogs/:id/like — Toggle like ───────────────────────────────────
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const increment = req.body.action === 'unlike' ? -1 : 1;

    if (isDbConnected()) {
      let blog = id.match(/^[a-fA-F0-9]{24}$/)
        ? await Blog.findByIdAndUpdate(id, { $inc: { likes: increment } }, { new: true, lean: true })
        : null;
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
      return res.json({ success: true, likes: blog.likes });
    }

    const blogs = readBlogs();
    const idx = blogs.findIndex(b => b.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Blog not found.' });
    blogs[idx].likes = Math.max(0, (blogs[idx].likes || 0) + increment);
    writeBlogs(blogs);
    return res.json({ success: true, likes: blogs[idx].likes });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating like count.' });
  }
});

module.exports = router;
