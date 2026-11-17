/**
 * PizzaCraft - Blog Module (Full CRUD)
 * CREATE / READ / UPDATE / DELETE + live search + category filter
 */

const BLOGS_STORAGE_KEY = 'pizzacraft_blogs';
const BLOG_LIKES_STORAGE_KEY = 'pizzacraft_blog_likes';

const CATEGORIES = [
  'Baking Secrets', 'Italian Heritage', 'Chef Tips',
  'Ingredients', 'Health & Nutrition', 'World Flavors'
];

const INITIAL_FALLBACK_BLOGS = [
  {
    id: 'blog-1',
    title: 'The Art of 72-Hour Slow Fermentation: Why Dough Patience Matters',
    category: 'Baking Secrets',
    author: 'Chef Marco Rossi',
    avatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=FF3838&color=fff',
    date: 'Feb 12, 2026', readTime: '5 min read', likes: 42,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop&q=80',
    content: 'Dough fermentation is both chemistry and passion. By retarding yeast activity at 4°C for 72 hours, enzymes break down complex starches into natural sugars, yielding that prized bubbly leopard-spotted cornicione (crust) that is light, airy, and gentle on digestion. The extended cold fermentation allows gluten networks to develop fully, creating elasticity that traps CO2 bubbles during baking. The result is a crust with complex flavor notes — slightly sour, wheaty, with caramel undertones from natural Maillard reactions.'
  },
  {
    id: 'blog-2',
    title: 'From San Marzano to Naples: Sourcing the World\'s Sweetest Volcanic Tomatoes',
    category: 'Ingredients',
    author: 'Elena Bellini',
    avatar: 'https://ui-avatars.com/api/?name=Elena+Bellini&background=FF8C00&color=fff',
    date: 'Jan 28, 2026', readTime: '4 min read', likes: 89,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800&auto=format&fit=crop&q=80',
    content: 'Grown in the mineral-rich volcanic soil beneath Mount Vesuvius, authentic San Marzano tomatoes boast an unmistakable bittersweet flavor profile, lower acidity, and thick pulp. DOP certification ensures they were grown in the Agro Sarnese-Nocerino area of Italy. When crushed by hand (never blended), they release their natural sugars while maintaining chunky texture.'
  },
  {
    id: 'blog-3',
    title: 'Pairing Cheese & Heat: The Science Behind the Ultimate Mozzarella Pull',
    category: 'Chef Tips',
    author: 'David Tan',
    avatar: 'https://ui-avatars.com/api/?name=David+Tan&background=22C55E&color=fff',
    date: 'Jan 15, 2026', readTime: '6 min read', likes: 64,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
    content: 'Not all cheese melts identically. Achieving that picture-perfect stretch without greasiness requires balancing high-moisture fresh Fior di Latte with aged whole-milk curd, flash-baked at 450°C for exactly 90 seconds. The protein structure of mozzarella — specifically casein — begins breaking down at 60°C, releasing the fat that creates those gooey, stretchy pulls.'
  }
];

// ─── State ─────────────────────────────────────────────────────────────────────
let activeBlogFilter = 'all';
let activeSearchQuery = '';
let searchDebounceTimer = null;
let pendingDeleteId = null;

// ─── Local Storage helpers ─────────────────────────────────────────────────────
function getLocalBlogs() {
  try {
    const stored = localStorage.getItem(BLOGS_STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_BLOGS));
      return INITIAL_FALLBACK_BLOGS;
    }
    return JSON.parse(stored);
  } catch { return INITIAL_FALLBACK_BLOGS; }
}

function saveLocalBlogs(blogs) {
  localStorage.setItem(BLOGS_STORAGE_KEY, JSON.stringify(blogs));
}

function getUserLikes() {
  try { return JSON.parse(localStorage.getItem(BLOG_LIKES_STORAGE_KEY) || '[]'); }
  catch { return []; }
}

// ─── Render Blog Cards ─────────────────────────────────────────────────────────
async function renderBlogs(targetId = 'blogsContainer', limit = null) {
  const container = document.getElementById(targetId);
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:3rem;color:#FF3838;grid-column:1/-1;">
      <div style="font-size:2rem;margin-bottom:0.5rem;">🍕</div>
      <p style="font-size:1.1rem;">Loading culinary stories...</p>
    </div>`;

  let blogs = [];
  const info = document.getElementById('blogResultsInfo');

  // 1. Try Backend (supports search + category server-side)
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.searchBlogs(activeSearchQuery, activeBlogFilter);
    if (res.ok && res.data?.blogs) {
      blogs = res.data.blogs;
      saveLocalBlogs(blogs);
    }
  }

  // 2. Local fallback
  if (blogs.length === 0 && !activeSearchQuery && activeBlogFilter === 'all') {
    blogs = getLocalBlogs();
  } else if (blogs.length === 0) {
    blogs = getLocalBlogs();
    if (activeBlogFilter !== 'all')
      blogs = blogs.filter(b => b.category?.toLowerCase() === activeBlogFilter.toLowerCase());
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      blogs = blogs.filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.content?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }
  }

  if (limit) blogs = blogs.slice(0, limit);

  // Update results info
  if (info) {
    if (activeSearchQuery || activeBlogFilter !== 'all') {
      const filterLabel = activeBlogFilter !== 'all' ? ` in <strong>${activeBlogFilter}</strong>` : '';
      const searchLabel = activeSearchQuery ? ` matching "<strong>${activeSearchQuery}</strong>"` : '';
      info.innerHTML = blogs.length > 0
        ? `Found <strong>${blogs.length}</strong> story${blogs.length !== 1 ? 'ies' : ''}${searchLabel}${filterLabel}`
        : `No stories found${searchLabel}${filterLabel}`;
    } else {
      info.innerHTML = blogs.length > 0 ? `<strong>${blogs.length}</strong> pizza stories published` : '';
    }
  }

  if (blogs.length === 0) {
    container.innerHTML = `
      <div class="blog-empty-state">
        <div class="empty-emoji">📖</div>
        <h3>No Stories Found</h3>
        <p>${activeSearchQuery ? `No results for "<strong>${activeSearchQuery}</strong>".` : 'No stories in this category yet.'}</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          ${activeSearchQuery ? `<button class="btn btn-outline" onclick="clearSearch()">Clear Search</button>` : ''}
          <a href="create-blog.html" class="btn btn-primary">+ Write First Story</a>
        </div>
      </div>`;
    return;
  }

  const userLikes = getUserLikes();

  container.innerHTML = blogs.map(blog => {
    const blogId = blog.id || blog._id;
    const isLiked = userLikes.includes(blogId);
    const detailUrl = `blog-detail.html?id=${encodeURIComponent(blogId)}`;
    const excerpt = (blog.content || '').substring(0, 140) + '...';

    return `
      <article class="blog-card" data-blog-id="${blogId}">
        <a href="${detailUrl}" class="blog-card-img-link" aria-label="Read: ${blog.title}">
          <img src="${blog.image}" alt="${blog.title}" class="blog-card-img" loading="lazy"
            onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
        </a>
        <div class="blog-card-body">
          <div class="blog-meta">
            <span class="blog-category-tag">${blog.category || 'Pizza Story'}</span>
            <span>⏱️ ${blog.readTime || '4 min read'}</span>
            <span>📅 ${blog.date || ''}</span>
          </div>
          <h3 class="blog-title">
            <a href="${detailUrl}" style="color:inherit;text-decoration:none;">${blog.title}</a>
          </h3>
          <p class="blog-excerpt">${excerpt}</p>
          <div class="blog-footer-row">
            <div class="blog-author">
              <img src="${blog.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author || 'Chef')}&background=FF3838&color=fff`}"
                alt="${blog.author}" class="author-avatar"
                onerror="this.src='https://ui-avatars.com/api/?name=Chef&background=FF3838&color=fff'">
              <span>${blog.author}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <a href="${detailUrl}" style="
                padding:0.3rem 0.8rem;
                border:1.5px solid #FF3838;
                color:#FF3838;
                border-radius:20px;
                font-size:0.78rem;
                font-weight:600;
                text-decoration:none;
                transition:all 0.2s;
              " onmouseover="this.style.background='#FF3838';this.style.color='#fff'"
                 onmouseout="this.style.background='transparent';this.style.color='#FF3838'">
                Read More →
              </a>
              <button class="blog-like-btn ${isLiked ? 'liked' : ''}"
                onclick="toggleBlogLike('${blogId}', this)" title="Like this story">
                <span>❤️</span> <span>${blog.likes || 0}</span>
              </button>
            </div>
          </div>
          <!-- CRUD Action Buttons -->
          <div class="blog-card-actions">
            <a href="edit-blog.html?id=${encodeURIComponent(blogId)}" class="blog-action-btn blog-action-edit" title="Edit this story">
              ✏️ Edit
            </a>
            <button class="blog-action-btn blog-action-delete" onclick="openDeleteModal('${blogId}', '${blog.title.replace(/'/g, "\\'")}')">
              🗑️ Delete
            </button>
          </div>
        </div>
      </article>`;
  }).join('');
}

// ─── Filter by Category ────────────────────────────────────────────────────────
function filterBlogs(category) {
  activeBlogFilter = category;
  document.querySelectorAll('.blog-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === category);
  });
  renderBlogs();
}

// ─── Live Search ───────────────────────────────────────────────────────────────
function initSearch() {
  const input = document.getElementById('blogSearchInput');
  const clearBtn = document.getElementById('blogSearchClear');
  if (!input) return;

  input.addEventListener('input', () => {
    clearTimeout(searchDebounceTimer);
    activeSearchQuery = input.value.trim();
    if (clearBtn) clearBtn.style.display = activeSearchQuery ? 'block' : 'none';
    searchDebounceTimer = setTimeout(() => renderBlogs(), 350);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearSearch();
  });
}

function clearSearch() {
  activeSearchQuery = '';
  const input = document.getElementById('blogSearchInput');
  const clearBtn = document.getElementById('blogSearchClear');
  if (input) input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  renderBlogs();
}

// ─── Like Toggle ───────────────────────────────────────────────────────────────
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

  if (window.PizzaCraftAPI) await window.PizzaCraftAPI.likeBlog(blogId, action);
  renderBlogs();
}

// ─── Delete Flow ───────────────────────────────────────────────────────────────
function openDeleteModal(blogId, blogTitle) {
  pendingDeleteId = blogId;
  const modal = document.getElementById('deleteModal');
  const titleEl = document.getElementById('deleteModalTitle');
  if (modal) modal.style.display = 'block';
  if (titleEl) titleEl.textContent = `"${blogTitle}" will be permanently deleted. This cannot be undone.`;
}

function closeDeleteModal() {
  pendingDeleteId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.style.display = 'none';
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const idToDelete = pendingDeleteId;
  closeDeleteModal();

  const btn = document.getElementById('confirmDeleteBtn');
  if (btn) btn.textContent = 'Deleting...';

  let deleted = false;

  // 1. Try Backend DELETE
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.deleteBlog(idToDelete);
    if (res.ok && res.data?.success) {
      deleted = true;
      showToast('🗑️ Story deleted successfully.', 'success');
    } else if (res.networkError) {
      // offline fallback
      deleted = false;
    } else {
      showToast(res.data?.message || 'Failed to delete story.', 'error');
      return;
    }
  }

  // 2. Local fallback delete
  const local = getLocalBlogs();
  const idx = local.findIndex(b => b.id === idToDelete || b._id === idToDelete);
  if (idx !== -1) {
    local.splice(idx, 1);
    saveLocalBlogs(local);
    if (!deleted) showToast('🗑️ Story removed (offline mode).', 'success');
  }

  // Remove card from DOM with animation
  const card = document.querySelector(`[data-blog-id="${idToDelete}"]`);
  if (card) {
    card.style.transition = 'all 0.3s';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.9)';
    setTimeout(() => renderBlogs(), 350);
  } else {
    renderBlogs();
  }
}

// ─── Handle Blog Creation ──────────────────────────────────────────────────────
async function handleCreateBlog(e) {
  e.preventDefault();
  const title   = document.getElementById('blogTitle').value.trim();
  const category= document.getElementById('blogCategory').value;
  const author  = document.getElementById('blogAuthor').value.trim();
  const image   = document.getElementById('blogImage').value.trim() || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800';
  const content = document.getElementById('blogContent').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!title || !author || !content) {
    showToast('Please fill in title, author, and story content!', 'info');
    return;
  }
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Publishing...'; }

  const currentUser = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  const payload = {
    title,
    category,
    author,
    authorEmail: currentUser?.email || '',
    userId: currentUser?.id || currentUser?._id || '',
    image,
    content
  };

  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.createBlog(payload);
    if (res.ok && res.data?.success) {
      showToast('🎉 ' + res.data.message, 'success');
      setTimeout(() => window.location.href = 'blog.html', 900);
      return;
    }
  }

  // Offline fallback
  const blogs = getLocalBlogs();
  const newBlog = {
    id: 'blog-' + Date.now(), title, category, author,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=FF3838&color=fff`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: `${Math.max(2, Math.round(content.split(' ').length / 100))} min read`,
    image, content, likes: 1
  };
  blogs.unshift(newBlog);
  saveLocalBlogs(blogs);
  showToast('🎉 Story published (offline mode)!', 'success');
  setTimeout(() => window.location.href = 'blog.html', 900);
}

// ─── Handle Edit/Update (used in edit-blog.html) ──────────────────────────────
async function handleUpdateBlog(e) {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get('id');
  if (!blogId) { showToast('No blog ID found.', 'error'); return; }

  const title   = document.getElementById('blogTitle').value.trim();
  const category= document.getElementById('blogCategory').value;
  const author  = document.getElementById('blogAuthor').value.trim();
  const image   = document.getElementById('blogImage').value.trim();
  const content = document.getElementById('blogContent').value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (!title || !author || !content) {
    showToast('Please fill in title, author, and story content!', 'info');
    return;
  }
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Saving Changes...'; }

  const currentUser = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  const payload = {
    title,
    category,
    author,
    authorEmail: currentUser?.email || '',
    userId: currentUser?.id || currentUser?._id || '',
    image,
    content
  };

  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.updateBlog(blogId, payload);
    if (res.ok && res.data?.success) {
      showToast('✅ Story updated successfully!', 'success');
      setTimeout(() => window.location.href = `blog-detail.html?id=${encodeURIComponent(blogId)}`, 900);
      return;
    } else if (!res.networkError) {
      showToast(res.data?.message || 'Update failed.', 'error');
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Changes'; }
      return;
    }
  }

  // Offline fallback
  const blogs = getLocalBlogs();
  const idx = blogs.findIndex(b => b.id === blogId || b._id === blogId);
  if (idx !== -1) {
    const words = content.split(/\s+/).length;
    blogs[idx] = {
      ...blogs[idx], title, category, author,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}&background=FF3838&color=fff`,
      readTime: `${Math.max(2, Math.round(words / 100))} min read`,
      image: image || blogs[idx].image,
      content
    };
    saveLocalBlogs(blogs);
    showToast('✅ Story updated (offline mode)!', 'success');
    setTimeout(() => window.location.href = `blog-detail.html?id=${encodeURIComponent(blogId)}`, 900);
  } else {
    showToast('Blog not found in local storage.', 'error');
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Save Changes'; }
  }
}

// ─── Load blog data into edit form ────────────────────────────────────────────
async function loadBlogIntoEditForm() {
  const params = new URLSearchParams(window.location.search);
  const blogId = params.get('id');
  if (!blogId) { window.location.href = 'blog.html'; return; }

  let blog = null;

  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.getBlog(blogId);
    if (res.ok && res.data?.blog) blog = res.data.blog;
  }
  if (!blog) {
    const local = getLocalBlogs();
    blog = local.find(b => b.id === blogId || b._id === blogId) || null;
  }
  if (!blog) {
    showToast('Blog not found.', 'error');
    setTimeout(() => window.location.href = 'blog.html', 1500);
    return;
  }

  document.getElementById('blogTitle').value     = blog.title || '';
  document.getElementById('blogCategory').value  = blog.category || 'Baking Secrets';
  document.getElementById('blogAuthor').value    = blog.author || '';
  document.getElementById('blogImage').value     = blog.image || '';
  document.getElementById('blogContent').value   = blog.content || '';
  if (blog.image) updateLiveImagePreview(blog.image);

  const pageTitle = document.getElementById('editPageTitle');
  if (pageTitle) pageTitle.textContent = `Editing: "${blog.title}"`;
  document.title = `Edit Story | PizzaCraft`;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function prefillSampleBlog() {
  document.getElementById('blogTitle').value    = 'Mastering 500°C Cast Iron Pizza in a Domestic Oven';
  document.getElementById('blogCategory').value = 'Baking Secrets';
  document.getElementById('blogAuthor').value   = 'Chef Giovanni';
  document.getElementById('blogImage').value    = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800';
  document.getElementById('blogContent').value  = 'By preheating an inverted heavy cast iron skillet under your maximum domestic broiler setting for 45 minutes, you can simulate Neapolitan stone oven radiant heat and get blistered, bubbly crust in just 3 minutes at home!\n\nThe key is to never open the oven door during preheat. Launch the pizza directly onto the scorching surface and place it under the broiler. Watch carefully — 3 minutes is all it takes for perfection.';
  updateLiveImagePreview('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800');
  showToast('Sample article loaded! Review and click publish.', 'info');
}

function updateLiveImagePreview(url) {
  const wrapper = document.getElementById('imagePreviewWrapper');
  const img = document.getElementById('imagePreview');
  if (wrapper && img) {
    if (url && url.startsWith('http')) {
      img.src = url;
      wrapper.style.display = 'block';
    } else {
      wrapper.style.display = 'none';
    }
  }
}

// ─── DOMContentLoaded ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderBlogs();
  initSearch();

  // Create Blog form
  const blogForm = document.getElementById('createBlogForm');
  if (blogForm) {
    blogForm.addEventListener('submit', handleCreateBlog);
    const currentUser = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
    const authorInput = document.getElementById('blogAuthor');
    if (authorInput && currentUser && !authorInput.value) {
      authorInput.value = currentUser.name;
    }
  }

  // Edit Blog form
  const editForm = document.getElementById('editBlogForm');
  if (editForm) {
    editForm.addEventListener('submit', handleUpdateBlog);
    loadBlogIntoEditForm();
  }

  // Live image preview on input
  const imageInput = document.getElementById('blogImage');
  if (imageInput) {
    imageInput.addEventListener('input', (e) => updateLiveImagePreview(e.target.value.trim()));
  }
});
