/**
 * PizzaCraft - User Dashboard & Real-Time Order Tracking
 * Interactive Order Progress, Live Simulation, Re-order Shortcuts
 */

function initDashboard() {
  const user = JSON.parse(localStorage.getItem('pizzacraft_current_user') || 'null');
  
  if (!user) {
    // If not logged in, prompt and provide fast demo login shortcut
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 24px; background: var(--white); border-radius: var(--radius-lg); border: 1.5px solid var(--gray-border); box-shadow: var(--shadow-sm); max-width: 600px; margin: 40px auto;">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🍕</div>
          <h2 style="font-size: 1.8rem; margin-bottom: 10px;">Please Sign In to Access Your Dashboard</h2>
          <p style="color: var(--text-muted); margin-bottom: 28px; line-height: 1.6;">
            Track active wood-fired pizza deliveries in real-time, view your order history, and collect loyalty slices.
          </p>
          <div style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
            <a href="login.html" class="btn btn-primary">Sign In</a>
            <a href="register.html" class="btn btn-outline">Create Account</a>
            <button class="btn btn-secondary" onclick="loginDemoAndRefresh()">⚡ Instant Demo Login</button>
          </div>
        </div>
      `;
    }
    return;
  }

  // Populate User Profile Header
  const userNameElem = document.getElementById('dashUserName');
  const userEmailElem = document.getElementById('dashUserEmail');
  const userAvatarElem = document.getElementById('dashUserAvatar');
  const userPhoneElem = document.getElementById('dashUserPhone');
  const userAddressElem = document.getElementById('dashUserAddress');
  const userPointsElem = document.getElementById('dashUserPoints');

  if (userNameElem) userNameElem.textContent = user.name;
  if (userEmailElem) userEmailElem.textContent = user.email;
  if (userPhoneElem) userPhoneElem.textContent = user.phone || '+91 98765 43210';
  if (userAddressElem) userAddressElem.textContent = user.address || '42 Baker Street, Foodie Lane, Mumbai';
  if (userPointsElem) userPointsElem.textContent = `${user.loyaltyPoints || 340} pts`;
  if (userAvatarElem) userAvatarElem.textContent = user.name.charAt(0).toUpperCase();

  // Load Orders
  renderDashboardOrders();
}

// Fast demo login directly from dashboard
function loginDemoAndRefresh() {
  const demoUser = {
    id: 'usr_demo_101',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+91 98765 43210',
    address: '42 Baker Street, Foodie Lane, Mumbai, MH',
    loyaltyPoints: 340,
    joinedDate: 'Jan 2026'
  };
  localStorage.setItem('pizzacraft_current_user', JSON.stringify(demoUser));
  
  // Seed sample order if empty
  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  if (orders.length === 0) {
    seedSampleOrder();
  } else {
    window.location.reload();
  }
}

// Seed a sample order for demonstration
function seedSampleOrder() {
  const sampleOrder = {
    id: 'ORD-784920',
    items: [
      { id: 'piz-1', name: 'Margherita Classica', price: 349, quantity: 1, image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300' },
      { id: 'piz-9', name: 'Artisan Garlic Dough Knots', price: 199, quantity: 1, image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=300' }
    ],
    subtotal: 548,
    tax: 27,
    deliveryFee: 0,
    discount: 0,
    total: 575,
    status: 'Baking',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    userEmail: 'john@example.com',
    estimatedMinutes: 22
  };
  localStorage.setItem('pizzacraft_orders', JSON.stringify([sampleOrder]));
  showToast('🎉 Demo active order generated! Watch the live tracker.', 'success');
  initDashboard();
}

async function renderDashboardOrders() {
  const user = JSON.parse(localStorage.getItem('pizzacraft_current_user') || 'null');
  let orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');

  // Fetch from backend API if available
  if (window.PizzaCraftAPI && user) {
    const res = await window.PizzaCraftAPI.getOrders(user.email);
    if (res.ok && res.data && res.data.orders) {
      orders = res.data.orders;
      localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));
    }
  }
  const activeOrderContainer = document.getElementById('activeOrderSection');
  const orderHistoryContainer = document.getElementById('ordersHistoryTable');
  const statOrdersCount = document.getElementById('statTotalOrders');
  const statTotalSpent = document.getElementById('statTotalSpent');

  let totalSpent = 0;
  orders.forEach(o => totalSpent += (o.total || 0));

  if (statOrdersCount) statOrdersCount.textContent = orders.length;
  if (statTotalSpent) statTotalSpent.textContent = `₹${totalSpent.toFixed(0)}`;

  // Find active order (Status: Baking or Out for Delivery)
  const activeOrder = orders.find(o => o.status === 'Baking' || o.status === 'Out for Delivery');

  if (activeOrderContainer) {
    if (activeOrder) {
      const isBaking = activeOrder.status === 'Baking';
      activeOrderContainer.innerHTML = `
        <div class="order-tracker-card">
          <div class="tracker-header">
            <div>
              <span class="status-badge ${isBaking ? 'status-baking' : 'status-delivering'}">
                ● ${activeOrder.status}
              </span>
              <h3 style="font-size: 1.4rem; margin-top: 6px;">Order #${activeOrder.id}</h3>
              <p style="font-size: 0.88rem; color: var(--text-muted);">Placed on ${activeOrder.date}</p>
            </div>
            <div style="text-align: right; background: var(--primary-light); padding: 10px 18px; border-radius: var(--radius-md); border: 1px solid rgba(255, 56, 56, 0.2);">
              <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Estimated Arrival</span>
              <div style="font-size: 1.4rem; font-weight: 900; color: var(--primary);">${activeOrder.estimatedMinutes || 25} Mins</div>
            </div>
          </div>

          <div class="tracker-steps">
            <div class="tracker-step completed">
              <div class="step-circle">✓</div>
              <span class="step-label">Order Confirmed</span>
            </div>
            <div class="tracker-step ${isBaking ? 'current' : 'completed'}">
              <div class="step-circle">🔥</div>
              <span class="step-label">Wood-Fired Oven</span>
            </div>
            <div class="tracker-step ${!isBaking ? 'current' : ''}">
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
              <strong style="color: var(--dark);">${activeOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</strong>
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
          <td style="color: var(--text-muted); font-size: 0.88rem;">${order.date}</td>
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
    addToCart(item);
  });

  showToast('Pizzas added to your cart!', 'success');
  setTimeout(openCartDrawer, 400);
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

  // Sync with backend API
  if (window.PizzaCraftAPI) {
    await window.PizzaCraftAPI.advanceOrderStatus(orderId);
  }

  localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));
  renderDashboardOrders();
}

document.addEventListener('DOMContentLoaded', initDashboard);
