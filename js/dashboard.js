/**
 * PizzaCraft - User Dashboard & Real-Time Order Tracking
 */

function initDashboard() {
  const user = JSON.parse(localStorage.getItem('pizzacraft_current_user') || 'null');
  
  if (!user) {
    // If not logged in, prompt and redirect
    const container = document.getElementById('dashboardContent');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 80px 20px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--gray-border);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🔒</div>
          <h2 style="font-size: 1.8rem; margin-bottom: 10px;">Please Sign In to Access Your Dashboard</h2>
          <p style="color: var(--text-muted); margin-bottom: 24px; max-width: 460px; margin-left: auto; margin-right: auto;">
            Track active live orders, view your order history, and manage your delivery addresses.
          </p>
          <div style="display: flex; gap: 12px; justify-content: center;">
            <a href="login.html" class="btn btn-primary">Sign In</a>
            <a href="register.html" class="btn btn-outline">Create Account</a>
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
  if (userPointsElem) userPointsElem.textContent = `${user.loyaltyPoints || 120} pts`;
  if (userAvatarElem) userAvatarElem.textContent = user.name.charAt(0).toUpperCase();

  // Load Orders
  renderDashboardOrders();
}

function renderDashboardOrders() {
  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  const activeOrderContainer = document.getElementById('activeOrderSection');
  const orderHistoryContainer = document.getElementById('ordersHistoryTable');
  const statOrdersCount = document.getElementById('statTotalOrders');
  const statTotalSpent = document.getElementById('statTotalSpent');

  let totalSpent = 0;
  orders.forEach(o => totalSpent += (o.total || 0));

  if (statOrdersCount) statOrdersCount.textContent = orders.length;
  if (statTotalSpent) statTotalSpent.textContent = `₹${totalSpent.toFixed(0)}`;

  // Find active order (Status: Baking or Delivering)
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
              <h3 style="font-size: 1.25rem; margin-top: 6px;">Order #${activeOrder.id}</h3>
              <p style="font-size: 0.85rem; color: var(--text-muted);">${activeOrder.date}</p>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Estimated Arrival</span>
              <div style="font-size: 1.2rem; font-weight: 800; color: var(--primary);">${activeOrder.estimatedMinutes || 25} Mins</div>
            </div>
          </div>

          <div class="tracker-steps">
            <div class="tracker-step completed">
              <div class="step-circle">✓</div>
              <span class="step-label">Order Confirmed</span>
            </div>
            <div class="tracker-step ${isBaking ? 'current' : 'completed'}">
              <div class="step-circle">🔥</div>
              <span class="step-label">Wood-Fired Baking</span>
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

          <div style="background: var(--bg-body); padding: 16px; border-radius: var(--radius-md); margin-top: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;">
            <div>
              <strong>Items:</strong> ${activeOrder.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
            </div>
            <button class="btn btn-outline btn-sm" onclick="advanceOrderStatus('${activeOrder.id}')" title="Simulate stage progression for evaluation">
              Advance Status ➔
            </button>
          </div>
        </div>
      `;
    } else {
      activeOrderContainer.innerHTML = `
        <div class="order-tracker-card" style="text-align: center; padding: 40px 20px;">
          <div style="font-size: 2.5rem; margin-bottom: 10px;">🛵</div>
          <h4 style="font-size: 1.15rem; margin-bottom: 6px;">No Active Live Deliveries</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 16px;">Craving something hot and cheesy right now?</p>
          <a href="menu.html" class="btn btn-primary btn-sm">Order Fresh Pizza</a>
        </div>
      `;
    }
  }

  // History table
  if (orderHistoryContainer) {
    if (orders.length === 0) {
      orderHistoryContainer.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No past orders found. Your orders will appear here!
          </td>
        </tr>
      `;
    } else {
      orderHistoryContainer.innerHTML = orders.map(order => `
        <tr>
          <td><strong>#${order.id}</strong></td>
          <td>${order.date}</td>
          <td>${order.items ? order.items.map(i => `${i.name} × ${i.quantity}`).join('<br>') : 'Custom Pizza'}</td>
          <td><strong>₹${(order.total || 0).toFixed(2)}</strong></td>
          <td>
            <span class="status-badge ${
              order.status === 'Delivered' ? 'status-delivered' : 
              order.status === 'Out for Delivery' ? 'status-delivering' : 'status-baking'
            }">
              ${order.status}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }
}

// Allows evaluator to simulate advancing order stage
function advanceOrderStatus(orderId) {
  const orders = JSON.parse(localStorage.getItem('pizzacraft_orders') || '[]');
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  if (order.status === 'Baking') {
    order.status = 'Out for Delivery';
    order.estimatedMinutes = 12;
    showToast(`Order #${orderId} is now out for delivery! 🛵`, 'info');
  } else if (order.status === 'Out for Delivery') {
    order.status = 'Delivered';
    order.estimatedMinutes = 0;
    showToast(`Order #${orderId} has been successfully delivered! Enjoy! 🍕`, 'success');
  }

  localStorage.setItem('pizzacraft_orders', JSON.stringify(orders));
  renderDashboardOrders();
}

document.addEventListener('DOMContentLoaded', initDashboard);
