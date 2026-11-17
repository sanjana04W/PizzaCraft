const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BLOGS_FILE = path.join(__dirname, '..', 'data', 'blogs.json');

// Helper to read blogs
function readBlogs() {
  try {
    if (!fs.existsSync(BLOGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(BLOGS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading blogs file:', err);
    return [];
  }
}

// Helper to write blogs
function writeBlogs(blogs) {
  try {
    fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing blogs file:', err);
    return false;
  }
}

/**
 * @route   GET /api/blogs
 * @desc    Get all culinary stories (supports ?category= and ?search=)
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    let blogs = readBlogs();
    const { category, search } = req.query;

    if (category && category !== 'all') {
      blogs = blogs.filter(b => b.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      blogs = blogs.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.content.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error('Error getting blogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pizza stories.'
    });
  }
});

/**
 * @route   GET /api/blogs/:id
 * @desc    Get single blog by ID
 * @access  Public
 */
router.get('/:id', (req, res) => {
  try {
    const blogs = readBlogs();
    const blog = blogs.find(b => b.id === req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found.'
      });
    }

    return res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching blog details.'
    });
  }
});

/**
 * @route   POST /api/blogs
 * @desc    Create and publish a new pizza story
 * @access  Public
 */
router.post('/', (req, res) => {
  try {
    const { title, category, author, content, image } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Article title is required.'
      });
    }

    if (!author || typeof author !== 'string' || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required.'
      });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Story content is required.'
      });
    }

    const blogs = readBlogs();

    // Calculate reading time based on word count
    const wordsCount = content.trim().split(/\s+/).length;
    const readMinutes = Math.max(2, Math.round(wordsCount / 100));

    const defaultCover = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80';
    const cleanImage = (image && typeof image === 'string' && image.trim().startsWith('http')) 
      ? image.trim() 
      : defaultCover;

    const newBlog = {
      id: 'blog-' + Date.now(),
      title: title.trim(),
      category: category ? category.trim() : 'Baking Secrets',
      author: author.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author.trim())}&background=FF3838&color=fff`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      readTime: `${readMinutes} min read`,
      image: cleanImage,
      content: content.trim(),
      likes: 1,
      createdAt: new Date().toISOString()
    };

    // Prepend new article so newest appears first
    blogs.unshift(newBlog);
    const saved = writeBlogs(blogs);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save blog post to database.'
      });
    }

    return res.status(201).json({
      success: true,
      message: '🎉 Your pizza story has been published successfully!',
      blog: newBlog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while publishing story.'
    });
  }
});

/**
 * @route   POST /api/blogs/:id/like
 * @desc    Toggle or increment like for a blog
 * @access  Public
 */
router.post('/:id/like', (req, res) => {
  try {
    const blogs = readBlogs();
    const blogIndex = blogs.findIndex(b => b.id === req.params.id);

    if (blogIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found.'
      });
    }

    const { action } = req.body; // 'like' or 'unlike'
    if (action === 'unlike') {
      blogs[blogIndex].likes = Math.max(0, (blogs[blogIndex].likes || 1) - 1);
    } else {
      blogs[blogIndex].likes = (blogs[blogIndex].likes || 0) + 1;
    }

    writeBlogs(blogs);

    return res.status(200).json({
      success: true,
      likes: blogs[blogIndex].likes
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating like count.'
    });
  }
});

module.exports = router;
