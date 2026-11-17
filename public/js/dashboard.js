/**
 * PizzaCraft - User Dashboard & Real-Time Order Tracking
 * Integrated with JWT Authentication, User Profile Management & User-Specific Blogs
 */

let currentUserBlogs = [];

// ─── Initialize Dashboard ─────────────────────────────────────────────────────
async function initDashboard() {
  const container = document.getElementById('dashboardContent');
  let user = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  const token = window.PizzaCraftAPI ? window.PizzaCraftAPI.getToken() : null;

  if (!user && !token) {
    showProtectedGate(container);
    return;
  }

  // 1. Verify JWT session with backend
  if (window.PizzaCraftAPI && token) {
    const res = await window.PizzaCraftAPI.getMe();
    if (res.ok && res.data && res.data.user) {
      user = res.data.user;
    } else if (res.status === 401) {
      // Token expired or invalid
      showToast('Your session has expired. Please sign in again.', 'info');
      window.PizzaCraftAPI.removeToken();
      window.PizzaCraftAPI.removeCurrentUser();
      showProtectedGate(container);
      return;
    }
  }

  if (!user) {
    showProtectedGate(container);
    return;
  }

  // 2. Populate User Profile Header & Details
  const userNameElem   = document.getElementById('dashUserName');
  const userEmailElem  = document.getElementById('dashUserEmail');
  const userAvatarElem = document.getElementById('dashUserAvatar');
  const userPhoneElem  = document.getElementById('dashUserPhone');
  const userAddressElem= document.getElementById('dashUserAddress');
  const userPointsElem = document.getElementById('dashUserPoints');

  if (userNameElem)   userNameElem.textContent = user.name;
  if (userEmailElem)  userEmailElem.textContent = user.email;
  if (userPhoneElem)  userPhoneElem.textContent = user.phone || '+91 99999 88888';
  if (userAddressElem)userAddressElem.textContent = user.address || '12 Pepperoni Avenue, Gourmet City';
  if (userPointsElem) userPointsElem.textContent = `${user.loyaltyPoints || 120} pts`;
  if (userAvatarElem) userAvatarElem.textContent = (user.name || 'U').charAt(0).toUpperCase();

  // 3. Load user's orders & user's blogs
  renderDashboardOrders();
  renderUserBlogs();
}

// ─── Protected Auth Gate (Shown when not authenticated) ───────────────────────
function showProtectedGate(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="dashboard-auth-gate">
      <div class="auth-gate-icon">🔒</div>
      <h2 class="auth-gate-title">Protected Dashboard</h2>
      <p class="auth-gate-desc">
        Please sign in with your PizzaCraft account to access live delivery tracking, 
        manage your profile, and review your published pizza stories.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <a href="login.html?redirect=dashboard" class="btn btn-primary">Sign In to Dashboard ➔</a>
        <a href="register.html" class="btn btn-outline">Create Account</a>
        <button class="btn btn-outline btn-sm" onclick="loginDemoAndRefresh()" style="border-color:#FF8C00;color:#FF8C00;">
          ⚡ Instant Demo Login
        </button>
      </div>
    </div>
  `;
}

// ─── Fast Demo Login ──────────────────────────────────────────────────────────
async function loginDemoAndRefresh() {
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.login({
      email: 'john@example.com',
      password: 'pizza123'
    });
    if (res.ok) {
      showToast('Logged in as John Doe! 🍕', 'success');
      setTimeout(() => window.location.reload(), 500);
      return;
    }
  }

  // Local fallback
  const demoUser = {
    id: 'usr_demo_101',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    address: '12 Pepperoni Avenue, Gourmet City',
    loyaltyPoints: 340,
    joinedDate: 'Jan 2026'
  };
  localStorage.setItem('pizzacraft_current_user', JSON.stringify(demoUser));
  localStorage.setItem('pizzacraft_token', 'mock_token_demo_101');
  window.location.reload();
}

// ─── Render Logged-in User's Blogs Only (Objective 3) ─────────────────────────
async function renderUserBlogs() {
  const container = document.getElementById('userBlogsContainer');
  const countBadge = document.getElementById('statUserBlogsCount');
  if (!container) return;

  const user = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  if (!user) return;

  container.innerHTML = `
    <div style="text-align:center;padding:24px;color:#FF3838;">
      <p>Loading your published stories...</p>
    </div>`;

  let userBlogs = [];

  // 1. Try Backend Protected API /api/blogs/user/me
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.getMyBlogs();
    if (res.ok && res.data && Array.isArray(res.data.blogs)) {
      userBlogs = res.data.blogs;
    }
  }

  // 2. Fallback: filter from all blogs by authorEmail or author name
  if (userBlogs.length === 0) {
    const allBlogs = JSON.parse(localStorage.getItem('pizzacraft_blogs') || '[]');
    userBlogs = allBlogs.filter(b =>
      (b.authorEmail && b.authorEmail.toLowerCase() === user.email.toLowerCase()) ||
      (b.author && b.author.toLowerCase() === user.name.toLowerCase()) ||
      (b.userId && b.userId === (user.id || user._id))
    );
  }

  currentUserBlogs = userBlogs;

  if (countBadge) {
    countBadge.textContent = userBlogs.length;
  }

  if (userBlogs.length === 0) {
    container.innerHTML = `
      <div class="user-blogs-empty">
        <div class="empty-icon">📝</div>
        <h4>You haven't written any pizza stories yet</h4>
        <p>Share your favorite dough recipes, cheese-pull secrets, or pizza reviews with the community!</p>
        <a href="create-blog.html" class="btn btn-primary btn-sm">+ Write Your First Story</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="user-blogs-grid">
      ${userBlogs.map(blog => {
        const blogId = blog.id || blog._id;
        const excerpt = (blog.content || '').substring(0, 110) + '...';
        return `
          <div class="user-blog-card" id="user-blog-${blogId}">
            <img src="${blog.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'}"
                 alt="${blog.title}" class="user-blog-card-img"
                 onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
            <div class="user-blog-card-body">
              <div class="user-blog-meta">
                <span class="blog-category-tag">${blog.category || 'Story'}</span>
                <span>📅 ${blog.date || ''}</span>
                <span>❤️ ${blog.likes || 0}</span>
              </div>
              <h4 class="user-blog-title">${blog.title}</h4>
              <p class="user-blog-excerpt">${excerpt}</p>
              <div class="user-blog-actions">
                <a href="blog-detail.html?id=${encodeURIComponent(blogId)}" class="ubtn-view">Read ➔</a>
                <div style="display:flex;gap:6px;">
                  <a href="edit-blog.html?id=${encodeURIComponent(blogId)}" class="ubtn-edit">✏️ Edit</a>
                  <button class="ubtn-del" onclick="deleteUserBlog('${blogId}', '${blog.title.replace(/'/g, "\\'")}')">🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ─── Delete User Blog ─────────────────────────────────────────────────────────
async function deleteUserBlog(blogId, title) {
  if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.deleteBlog(blogId);
    if (res.ok && res.data && res.data.success) {
      showToast('🗑️ Story deleted successfully.', 'success');
    }
  }

  // Remove from local storage
  const all = JSON.parse(localStorage.getItem('pizzacraft_blogs') || '[]');
  const filtered = all.filter(b => b.id !== blogId && b._id !== blogId);
  localStorage.setItem('pizzacraft_blogs', JSON.stringify(filtered));

  renderUserBlogs();
}

// ─── User Profile Modal & Management (Objective 4) ────────────────────────────
function openProfileModal() {
  const user = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  if (!user) return;

  document.getElementById('profName').value    = user.name || '';
  document.getElementById('profEmail').value   = user.email || '';
  document.getElementById('profPhone').value   = user.phone || '';
  document.getElementById('profAddress').value = user.address || '';

  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'flex';
}

function closeProfileModal() {
  const modal = document.getElementById('profileModal');
  if (modal) modal.style.display = 'none';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const name    = document.getElementById('profName').value.trim();
  const phone   = document.getElementById('profPhone').value.trim();
  const address = document.getElementById('profAddress').value.trim();
  const btn     = document.getElementById('saveProfileBtn');

  if (!name) {
    showToast('Name is required.', 'error');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Saving...';
  }

  let updatedUser = null;

  // 1. Try Backend Protected PUT /api/auth/profile
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.updateProfile({ name, phone, address });
    if (res.ok && res.data && res.data.user) {
      updatedUser = res.data.user;
    }
  }

  // 2. Fallback update
  if (!updatedUser) {
    const user = window.PizzaCraftAPI.getCurrentUser() || {};
    updatedUser = { ...user, name, phone, address };
    window.PizzaCraftAPI.setCurrentUser(updatedUser);
  }

  closeProfileModal();
  showToast('✅ Profile details updated successfully!', 'success');

  // Update DOM in real-time
  const nameEl    = document.getElementById('dashUserName');
  const phoneEl   = document.getElementById('dashUserPhone');
  const addressEl = document.getElementById('dashUserAddress');
  const avatarEl  = document.getElementById('dashUserAvatar');

  if (nameEl)    nameEl.textContent = updatedUser.name;
  if (phoneEl)   phoneEl.textContent = updatedUser.phone || '+91 99999 88888';
  if (addressEl) addressEl.textContent = updatedUser.address || '12 Pepperoni Avenue, Gourmet City';
  if (avatarEl)  avatarEl.textContent = (updatedUser.name || 'U').charAt(0).toUpperCase();

  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Save Profile';
  }
}

// ─── Render Orders ────────────────────────────────────────────────────────────
async function renderDashboardOrders() {
  const user = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  let orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');

  if (window.PizzaCraftAPI && user) {
    const res = await window.PizzaCraftAPI.getOrders(user.email);
    if (res.ok && res.data && res.data.orders) {
      orders = res.data.orders;
      localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));
    }
  }

  const activeOrderContainer   = document.getElementById('activeOrderSection');
  const orderHistoryContainer  = document.getElementById('ordersHistoryTable');
  const statOrdersCount        = document.getElementById('statTotalOrders');
  const statSpentCount         = document.getElementById('statTotalSpent');

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  if (statOrdersCount) statOrdersCount.textContent = orders.length;
  if (statSpentCount) statSpentCount.textContent = `₹${totalSpent.toFixed(0)}`;

  // Find active order (Baking or Out for Delivery)
  const activeOrder = orders.find(o => o.status === 'Baking' || o.status === 'Out for Delivery');

  if (activeOrderContainer) {
    if (activeOrder) {
      const stepIndex = activeOrder.status === 'Baking' ? 2 : 3;
      activeOrderContainer.innerHTML = `
        <div class="order-tracker-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
            <div>
              <span class="status-badge ${activeOrder.status === 'Out for Delivery' ? 'status-delivering' : 'status-baking'}">
                ● ${activeOrder.status}
              </span>
              <h3 style="margin-top: 8px; font-size: 1.35rem;">Order #${activeOrder.id}</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0;">
                Placed at ${activeOrder.date || 'Today'}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.85rem; color: var(--text-muted);">Estimated Arrival</div>
              <strong style="font-size: 1.5rem; color: var(--primary);">${activeOrder.estimatedMinutes || 25} Mins</strong>
            </div>
          </div>

          <div class="tracker-steps">
            <div class="tracker-step completed">
              <div class="step-circle">✓</div>
              <span class="step-label">Order Placed</span>
            </div>
            <div class="tracker-step ${stepIndex >= 2 ? (stepIndex === 2 ? 'active' : 'completed') : ''}">
              <div class="step-circle">🔥</div>
              <span class="step-label">Baking in Oven</span>
            </div>
            <div class="tracker-step ${stepIndex >= 3 ? (stepIndex === 3 ? 'active' : 'completed') : ''}">
              <div class="step-circle">🛵</div>
              <span class="step-label">Out for Delivery</span>
            </div>
            <div class="tracker-step">
              <div class="step-circle">📦</div>
              <span class="step-label">Delivered</span>
            </div>
          </div>

          <div style="background: var(--bg-body); padding: 18px 22px; border-radius: var(--radius-md); margin-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; border: 1px solid var(--gray-border);">
            <div>
              <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">Ordered Pizzas</div>
              <strong style="color: var(--dark);">${activeOrder.items ? activeOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ') : 'Artisanal Pizza'}</strong>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <button class="btn btn-primary btn-sm" onclick="advanceOrderStatus('${activeOrder.id}')" title="Simulate stage progression">
                Advance Stage ➔
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      activeOrderContainer.innerHTML = `
        <div class="order-tracker-card" style="text-align: center; padding: 48px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🛵</div>
          <h4 style="font-size: 1.3rem; margin-bottom: 6px;">No Active Deliveries Right Now</h4>
          <p style="color: var(--text-muted); font-size: 0.95rem; margin-bottom: 22px; max-width: 440px; margin-left: auto; margin-right: auto;">
            Hot, crispy crust is just 30 minutes away! Order your favorite pizza or simulate a test delivery below.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <a href="menu.html" class="btn btn-primary btn-sm">Order Fresh Pizza ➔</a>
            <button class="btn btn-outline btn-sm" onclick="seedSampleOrder()">⚡ Simulate Live Order</button>
          </div>
        </div>
      `;
    }
  }

  // History table
  if (orderHistoryContainer) {
    if (orders.length === 0) {
      orderHistoryContainer.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 48px 20px; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">📜</div>
            No past orders found. When you order, your history will appear here!
          </td>
        </tr>
      `;
    } else {
      orderHistoryContainer.innerHTML = orders.map(order => `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td style="color: var(--text-muted); font-size: 0.88rem;">${order.date || 'Recent'}</td>
          <td>${order.items ? order.items.map(i => `${i.name} × ${i.quantity}`).join('<br>') : 'Custom Pizza'}</td>
          <td><strong style="color: var(--dark); font-size: 1.05rem;">₹${(order.total || 0).toFixed(2)}</strong></td>
          <td>
            <span class="status-badge ${
              order.status === 'Delivered' ? 'status-delivered' : 
              order.status === 'Out for Delivery' ? 'status-delivering' : 'status-baking'
            }">
              ● ${order.status}
            </span>
          </td>
          <td>
            <button class="btn btn-outline btn-sm" onclick="reorderItems('${order.id}')" title="Reorder items from this order">
              🔄 Reorder
            </button>
          </td>
        </tr>
      `).join('');
    }
  }
}

// Re-order past order items
function reorderItems(orderId) {
  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order || !order.items) return;

  order.items.forEach(item => {
    if (typeof addToCart === 'function') addToCart(item);
  });

  showToast('Pizzas added to your cart!', 'success');
  if (typeof openCartDrawer === 'function') setTimeout(openCartDrawer, 400);
}

// Advance order stage simulation
async function advanceOrderStatus(orderId) {
  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (order.status === 'Baking') {
    order.status = 'Out for Delivery';
    order.estimatedMinutes = 12;
    showToast(`Order #${orderId} is now out for delivery! 🛵 Rider is on the way!`, 'info');
  } else if (order.status === 'Out for Delivery') {
    order.status = 'Delivered';
    order.estimatedMinutes = 0;
    showToast(`Order #${orderId} has been successfully delivered! Buon Appetito! 🍕✨`, 'success');
  }

  if (window.PizzaCraftAPI) {
    await window.PizzaCraftAPI.advanceOrderStatus(orderId);
  }

  localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));
  renderDashboardOrders();
}

// Seed a sample order for demonstration
function seedSampleOrder() {
  const user = window.PizzaCraftAPI ? window.PizzaCraftAPI.getCurrentUser() : null;
  const sampleOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items: [
      { id: 'piz-1', name: 'Margherita Classica', price: 349, quantity: 1 },
      { id: 'piz-9', name: 'Artisan Garlic Dough Knots', price: 199, quantity: 1 }
    ],
    subtotal: 548,
    tax: 27,
    deliveryFee: 0,
    discount: 0,
    total: 575,
    status: 'Baking',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    userEmail: user ? user.email : 'john@example.com',
    estimatedMinutes: 22
  };

  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  orders.unshift(sampleOrder);
  localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));

  if (window.PizzaCraftAPI) {
    window.PizzaCraftAPI.createOrder(sampleOrder);
  }

  showToast('🎉 Demo active order generated! Watch the live tracker.', 'success');
  initDashboard();
}

document.addEventListener('DOMContentLoaded', initDashboard);
