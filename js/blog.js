/**
 * PizzaCraft - Blog & Culinary Stories Module
 */

const BLOGS_STORAGE_KEY = 'pizzacraft_blogs';

const INITIAL_BLOGS = [
  {
    id: 'blog-1',
    title: 'The Art of 72-Hour Slow Fermentation: Why Dough Patience Matters',
    category: 'Baking Secrets',
    author: 'Chef Marco Rossi',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&auto=format&fit=crop&q=80',
    date: 'Feb 12, 2026',
    readTime: '5 min read',
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
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    content: 'Not all cheese melts identically. Achieving that picture-perfect stretch without greasiness requires balancing high-moisture fresh Fior di Latte with aged whole-milk curd, flash-baked at 450°C for exactly 90 seconds.'
  }
];

// Initialize Blogs in LocalStorage
function getBlogs() {
  const stored = localStorage.getItem(BLOGS_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(INITIAL_BLOGS));
    return INITIAL_BLOGS;
  }
  return JSON.parse(stored);
}

// Render Blog List on blog.html
function renderBlogs() {
  const container = document.getElementById('blogsContainer');
  if (!container) return;

  const blogs = getBlogs();

  container.innerHTML = blogs.map(blog => `
    <article class="blog-card">
      <img src="${blog.image}" alt="${blog.title}" class="blog-card-img" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
      <div class="blog-card-body">
        <div class="blog-meta">
          <span class="blog-category-tag">${blog.category}</span>
          <span>•</span>
          <span>${blog.readTime || '4 min read'}</span>
          <span>•</span>
          <span>${blog.date}</span>
        </div>
        <h3 class="blog-title">${blog.title}</h3>
        <p class="blog-excerpt">${blog.content.substring(0, 140)}...</p>
        <div class="blog-author">
          <img src="${blog.avatar}" alt="${blog.author}" class="author-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author)}'">
          <span>${blog.author}</span>
        </div>
      </div>
    </article>
  `).join('');
}

// Handle Blog Creation on create-blog.html
function handleCreateBlog(e) {
  e.preventDefault();

  const title = document.getElementById('blogTitle').value.trim();
  const category = document.getElementById('blogCategory').value;
  const author = document.getElementById('blogAuthor').value.trim();
  const image = document.getElementById('blogImage').value.trim() || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800';
  const content = document.getElementById('blogContent').value.trim();

  if (!title || !author || !content) {
    showToast('Please fill in title, author, and story content!', 'info');
    return;
  }

  const newBlog = {
    id: 'blog-' + Date.now(),
    title,
    category,
    author,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=FF4757&color=fff`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: `${Math.max(1, Math.ceil(content.split(' ').length / 150))} min read`,
    image,
    content
  };

  const blogs = getBlogs();
  blogs.unshift(newBlog);
  localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));

  showToast('🎉 Blog post published successfully!', 'success');
  setTimeout(() => {
    window.location.href = 'blog.html';
  }, 1000);
}

// Live Image URL Preview
function setupImagePreview() {
  const imageInput = document.getElementById('blogImage');
  const previewImg = document.getElementById('imagePreview');
  const previewWrapper = document.getElementById('imagePreviewWrapper');

  if (imageInput && previewImg && previewWrapper) {
    imageInput.addEventListener('input', () => {
      const url = imageInput.value.trim();
      if (url) {
        previewImg.src = url;
        previewWrapper.style.display = 'block';
      } else {
        previewWrapper.style.display = 'none';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderBlogs();
  setupImagePreview();

  const createBlogForm = document.getElementById('createBlogForm');
  if (createBlogForm) {
    createBlogForm.addEventListener('submit', handleCreateBlog);
  }
});
