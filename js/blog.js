/**
 * PizzaCraft - Blog & Culinary Stories Module
 * Integrated with Node.js/Express Backend REST API (/api/blogs)
 */

const BLOGS_STORAGE_KEY = 'pizzacraft_blogs';
const BLOG_LIKES_STORAGE_KEY = 'pizzacraft_blog_likes';

const INITIAL_FALLBACK_BLOGS = [
  {
    id: 'blog-1',
    title: 'The Art of 72-Hour Slow Fermentation: Why Dough Patience Matters',
    category: 'Baking Secrets',
    author: 'Chef Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
    date: 'Feb 12, 2026',
    readTime: '5 min read',
    likes: 42,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    content: 'Dough fermentation is both chemistry and passion. By retarding yeast activity at 4°C for 72 hours, enzymes break down complex starches into natural sugars, yielding that prized bubbly leopard-spotted cornicione (crust) that is light, airy, and gentle on digestion.'
  },
  {
    id: 'blog-2',
    title: 'From San Marzano to Naples: Sourcing the World’s Sweetest Volcanic Tomatoes',
    category: 'Ingredient Spotlight',
    author: 'Elena Bellini',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    date: 'Jan 28, 2026',
    readTime: '4 min read',
    likes: 89,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800&auto=format&fit=crop&q=80',
    content: 'Grown in the mineral-rich volcanic soil beneath Mount Vesuvius, authentic San Marzano tomatoes boast an unmistakable bittersweet flavor profile, lower acidity, and thick pulp that creates the velvety red base our pizzas are celebrated for.'
  },
  {
    id: 'blog-3',
    title: 'Pairing Cheese & Heat: The Science Behind the Ultimate Mozzarella Pull',
    category: 'Culinary Craft',
    author: 'David Tan',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    date: 'Jan 15, 2026',
    readTime: '6 min read',
    likes: 64,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    content: 'Not all cheese melts identically. Achieving that picture-perfect stretch without greasiness requires balancing high-moisture fresh Fior di Latte with aged whole-milk curd, flash-baked at 450°C for exactly 90 seconds.'
  }
];

function getLocalBlogs() {
  const stored = localStorage.getItem(BLOGS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_BLOGS));
    return INITIAL_FALLBACK_BLOGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_FALLBACK_BLOGS;
  }
}

function getUserLikes() {
  try {
    return JSON.parse(localStorage.getItem(BLOG_LIKES_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

let activeBlogFilter = 'all';

// Fetch & Render Blog List
async function renderBlogs(targetId = 'blogsContainer', limit = null) {
  const container = document.getElementById(targetId);
  if (!container) return;

  let blogs = [];

  // 1. Try Backend API
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.getBlogs(activeBlogFilter);
    if (res.ok && res.data && res.data.blogs) {
      blogs = res.data.blogs;
      // Sync with localStorage
      localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
    }
  }

  // 2. Fallback to local storage if API was offline or empty
  if (blogs.length === 0) {
    blogs = getLocalBlogs();
    if (activeBlogFilter !== 'all') {
      blogs = blogs.filter(b => b.category.toLowerCase() === activeBlogFilter.toLowerCase());
    }
  }

  if (limit && typeof limit === 'number') {
    blogs = blogs.slice(0, limit);
  }

  const userLikes = getUserLikes();

  container.innerHTML = blogs.map(blog => {
    const isLiked = userLikes.includes(blog.id);
    const likeCount = (blog.likes || 0);

    return `
      <article class="blog-card">
        <img src="${blog.image}" alt="${blog.title}" class="blog-card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
        <div class="blog-card-body">
          <div class="blog-meta">
            <span class="blog-category-tag">${blog.category}</span>
            <span>⏱️ ${blog.readTime || '4 min read'}</span>
            <span>📅 ${blog.date}</span>
          </div>
          <h3 class="blog-title">${blog.title}</h3>
          <p class="blog-excerpt">${blog.content.substring(0, 140)}...</p>
          <div class="blog-footer-row">
            <div class="blog-author">
              <img src="${blog.avatar}" alt="${blog.author}" class="author-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author)}'">
              <span>${blog.author}</span>
            </div>
            <button class="blog-like-btn ${isLiked ? 'liked' : ''}" onclick="toggleBlogLike('${blog.id}', this)" title="Appreciate this story">
              <span>❤️</span> <span>${likeCount}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function filterBlogs(category) {
  activeBlogFilter = category;
  document.querySelectorAll('.blog-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });
  renderBlogs();
}

async function toggleBlogLike(blogId, btnElem) {
  let userLikes = getUserLikes();
  const alreadyLiked = userLikes.includes(blogId);
  const action = alreadyLiked ? 'unlike' : 'like';

  if (alreadyLiked) {
    userLikes = userLikes.filter(id => id !== blogId);
    showToast('Removed like', 'info');
  } else {
    userLikes.push(blogId);
    showToast('❤️ Thank you for liking this story!', 'success');
  }

  localStorage.setItem(BLOG_LIKES_STORAGE_KEY, JSON.stringify(userLikes));

  // Sync to Backend
  if (window.PizzaCraftAPI) {
    await window.PizzaCraftAPI.likeBlog(blogId, action);
  }

  renderBlogs();
}

// Handle Blog Creation on create-blog.html via Backend POST /api/blogs
async function handleCreateBlog(e) {
  e.preventDefault();

  const title = document.getElementById('blogTitle').value.trim();
  const category = document.getElementById('blogCategory').value;
  const author = document.getElementById('blogAuthor').value.trim();
  const image = document.getElementById('blogImage').value.trim() || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800';
  const content = document.getElementById('blogContent').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!title || !author || !content) {
    showToast('Please fill in title, author, and story content!', 'info');
    return;
  }

  const payload = {
    title,
    category,
    author,
    image,
    content
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Publishing to Server...';
  }

  // 1. Try Backend REST API
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.createBlog(payload);
    
    if (res.ok && res.data && res.data.success) {
      showToast('🎉 ' + res.data.message, 'success');
      setTimeout(() => {
        window.location.href = 'blog.html';
      }, 900);
      return;
    }
  }

  // 2. Offline fallback
  const newBlog = {
    id: 'blog-' + Date.now(),
    title,
    category,
    author,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=FF3838&color=fff`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: `${Math.max(2, Math.round(content.split(' ').length / 100))} min read`,
    image,
    content,
    likes: 1
  };

  const blogs = getLocalBlogs();
  blogs.unshift(newBlog);
  localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));

  showToast('🎉 Your pizza story has been published!', 'success');
  setTimeout(() => {
    window.location.href = 'blog.html';
  }, 900);
}

// Helper to prefill sample data in create blog
function prefillSampleBlog() {
  document.getElementById('blogTitle').value = 'Mastering 500°C Cast Iron Pizza in a Domestic Oven';
  document.getElementById('blogCategory').value = 'Dough Science';
  document.getElementById('blogAuthor').value = 'Chef Giovanni';
  document.getElementById('blogImage').value = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800';
  document.getElementById('blogContent').value = 'By preheating an inverted heavy cast iron skillet under your maximum domestic broiler setting for 45 minutes, you can simulate Neapolitan stone oven radiant heat and get blistered, bubbly crust in just 3 minutes at home!';
  
  updateLiveImagePreview('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800');
  showToast('Sample article loaded! Review and click publish.', 'info');
}

function updateLiveImagePreview(url) {
  const previewWrapper = document.getElementById('imagePreviewWrapper');
  const previewImg = document.getElementById('imagePreview');
  if (previewWrapper && previewImg) {
    if (url && url.startsWith('http')) {
      previewImg.src = url;
      previewWrapper.style.display = 'block';
    } else {
      previewWrapper.style.display = 'none';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogs();

  const blogForm = document.getElementById('createBlogForm');
  if (blogForm) {
    blogForm.addEventListener('submit', handleCreateBlog);
  }

  const imageInput = document.getElementById('blogImage');
  if (imageInput) {
    imageInput.addEventListener('input', (e) => {
      updateLiveImagePreview(e.target.value.trim());
    });
  }
});
