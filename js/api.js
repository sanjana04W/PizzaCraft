/**
 * PizzaCraft - Frontend API Client
 * Connects Frontend UI with Node.js & Express REST APIs
 * Features seamless fallback to localStorage if backend is unreachable or run from file://
 */

const API_BASE = (window.location.protocol === 'file:')
  ? 'http://localhost:5000'
  : '';

const API = {
  // Check backend server health
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // User Registration: POST /api/auth/register
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for register:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // User Login: POST /api/auth/login
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for login:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // Fetch Blogs: GET /api/blogs
  async getBlogs(category = 'all') {
    try {
      const url = (category && category !== 'all') 
        ? `${API_BASE}/api/blogs?category=${encodeURIComponent(category)}`
        : `${API_BASE}/api/blogs`;
      
      const response = await fetch(url);
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for blogs:', err);
      return { ok: false, networkError: true };
    }
  },

  // Create Blog: POST /api/blogs
  async createBlog(blogData) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for create blog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // Search Blogs: GET /api/blogs?search=&category=
  async searchBlogs(search = '', category = 'all') {
    try {
      const params = new URLSearchParams();
      if (search && search.trim()) params.set('search', search.trim());
      if (category && category !== 'all') params.set('category', category);
      const response = await fetch(`${API_BASE}/api/blogs?${params.toString()}`);
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // Get Single Blog: GET /api/blogs/:id
  async getBlog(id) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`);
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      console.warn('Backend unavailable for getBlog:', err);
      return { ok: false, networkError: true };
    }
  },

  // Like Blog: POST /api/blogs/:id/like
  async likeBlog(id, action = 'like') {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // Update Blog: PUT /api/blogs/:id
  async updateBlog(id, blogData) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(blogData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable for updateBlog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // Delete Blog: DELETE /api/blogs/:id
  async deleteBlog(id) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable for deleteBlog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // Fetch Orders: GET /api/orders
  async getOrders(email = '') {
    try {
      const url = email 
        ? `${API_BASE}/api/orders?email=${encodeURIComponent(email)}`
        : `${API_BASE}/api/orders`;
      const response = await fetch(url);
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // Create Order: POST /api/orders
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // Advance Order Status: PATCH /api/orders/:id/status
  async advanceOrderStatus(id) {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}/status`, {
        method: 'PATCH'
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  }
};

window.PizzaCraftAPI = API;
