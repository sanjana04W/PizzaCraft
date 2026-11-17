/**
 * PizzaCraft - Frontend API Client
 * Connects Frontend UI with Node.js & Express REST APIs
 * Features JWT Bearer Authentication & seamless fallback to localStorage
 */

const API_BASE = (window.location.protocol === 'file:')
  ? 'http://localhost:5000'
  : '';

const TOKEN_KEY = 'pizzacraft_token';
const USER_KEY = 'pizzacraft_current_user';

const API = {
  // ── Token Management ────────────────────────────────────────────────────────
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || '';
  },

  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  removeCurrentUser() {
    localStorage.removeItem(USER_KEY);
  },

  getAuthHeaders() {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // ── Health Check ────────────────────────────────────────────────────────────
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  // ── User Registration: POST /api/auth/register ──────────────────────────────
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      if (response.ok && data.token) {
        this.setToken(data.token);
      }
      if (response.ok && data.user) {
        this.setCurrentUser(data.user);
      }
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for register:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── User Login: POST /api/auth/login ────────────────────────────────────────
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      if (response.ok && data.token) {
        this.setToken(data.token);
      }
      if (response.ok && data.user) {
        this.setCurrentUser(data.user);
      }
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for login:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── Get Authenticated User Profile: GET /api/auth/me (Protected) ────────────
  async getMe() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      if (response.ok && data.user) {
        this.setCurrentUser(data.user);
      }
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // ── Update Profile: PUT /api/auth/profile (Protected) ───────────────────────
  async updateProfile(profileData) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(profileData)
      });
      const data = await response.json();
      if (response.ok && data.user) {
        this.setCurrentUser(data.user);
      }
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  async logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch {}
    this.removeToken();
    this.removeCurrentUser();
  },

  // ── Dashboard Protected Stats: GET /api/dashboard/stats ─────────────────────
  async getDashboardStats() {
    try {
      const response = await fetch(`${API_BASE}/api/dashboard/stats`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // ── Fetch Blogs: GET /api/blogs ─────────────────────────────────────────────
  async getBlogs(category = 'all', authorEmail = '') {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.set('category', category);
      if (authorEmail && authorEmail.trim()) params.set('authorEmail', authorEmail.trim());

      const url = `${API_BASE}/api/blogs?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for blogs:', err);
      return { ok: false, networkError: true };
    }
  },

  // ── Fetch Current User's Own Blogs: GET /api/blogs/user/me (Protected) ───────
  async getMyBlogs() {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/user/me`, {
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable for getMyBlogs:', err);
      return { ok: false, networkError: true };
    }
  },

  // ── Create Blog: POST /api/blogs (Includes optional JWT auth) ───────────────
  async createBlog(blogData) {
    try {
      const currentUser = this.getCurrentUser();
      const payload = {
        ...blogData,
        authorEmail: blogData.authorEmail || currentUser?.email || '',
        userId: blogData.userId || currentUser?.id || currentUser?._id || ''
      };

      const response = await fetch(`${API_BASE}/api/blogs`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable, using local fallback for create blog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── Search Blogs: GET /api/blogs?search=&category= ──────────────────────────
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

  // ── Get Single Blog: GET /api/blogs/:id ─────────────────────────────────────
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

  // ── Like Blog: POST /api/blogs/:id/like ─────────────────────────────────────
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

  // ── Update Blog: PUT /api/blogs/:id ─────────────────────────────────────────
  async updateBlog(id, blogData) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(blogData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable for updateBlog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── Delete Blog: DELETE /api/blogs/:id ──────────────────────────────────────
  async deleteBlog(id) {
    try {
      const response = await fetch(`${API_BASE}/api/blogs/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (err) {
      console.warn('Backend unavailable for deleteBlog:', err);
      return { ok: false, networkError: true, error: err.message };
    }
  },

  // ── Fetch Orders: GET /api/orders ───────────────────────────────────────────
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

  // ── Create Order: POST /api/orders ──────────────────────────────────────────
  async createOrder(orderData) {
    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData)
      });
      const data = await response.json();
      return { ok: response.ok, data };
    } catch (err) {
      return { ok: false, networkError: true };
    }
  },

  // ── Advance Order Status: PATCH /api/orders/:id/status ──────────────────────
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
