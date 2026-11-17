/**
 * PizzaCraft - Core Application JS
 * Handles Cart, Drawer, Toasts, Session Status, and Navigation
 */

// Cart state management with LocalStorage
const CART_STORAGE_KEY = 'pizzacraft_cart';
const USER_STORAGE_KEY = 'pizzacraft_current_user';
const ORDERS_STORAGE_KEY = 'pizzacraft_orders';

// Get Cart
function getCart() {
  const data = localStorage.getItem(CART_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save Cart
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

// Add Item to Cart
function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(i => i.id === item.id);
  
  if (existing) {
    existing.quantity += (item.quantity || 1);
  } else {
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category || 'Pizza',
      quantity: item.quantity || 1
    });
  }

  saveCart(cart);
  showToast(`🍕 "${item.name}" added to cart!`, 'success');
}

// Update Item Quantity
function updateCartQty(id, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
    showToast(`Removed from cart`, 'info');
  }
  saveCart(cart);
}

// Clear Cart
function clearCart() {
  localStorage.removeItem(CART_STORAGE_KEY);
  updateCartBadge();
  renderCartDrawer();
}

// Calculate Totals
function getCartSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST/Tax
  const deliveryFee = subtotal > 0 && subtotal < 500 ? 49 : 0; // Free delivery over ₹500
  const discount = localStorage.getItem('pizzacraft_discount') ? Number(localStorage.getItem('pizzacraft_discount')) : 0;
  const total = Math.max(0, subtotal + tax + deliveryFee - discount);

  return { subtotal, tax, deliveryFee, discount, total, count: cart.reduce((c, i) => c + i.quantity, 0) };
}

// Update Badge in Navbar
function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count');
  const summary = getCartSummary();
  badges.forEach(badge => {
    badge.textContent = summary.count;
    badge.style.display = summary.count > 0 ? 'flex' : 'none';
  });
}

// Render Cart Drawer
function renderCartDrawer() {
  const cartContainer = document.getElementById('cartDrawerItems');
  const subtotalElem = document.getElementById('cartSubtotal');
  const taxElem = document.getElementById('cartTax');
  const deliveryElem = document.getElementById('cartDelivery');
  const totalElem = document.getElementById('cartTotal');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountElem = document.getElementById('cartDiscount');

  if (!cartContainer) return;

  const cart = getCart();
  const summary = getCartSummary();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🍕</div>
        <h4>Your cart is empty</h4>
        <p style="font-size: 0.88rem; margin-top: 6px;">Looks like you haven't added any delicious pizzas yet!</p>
        <a href="menu.html" class="btn btn-primary btn-sm" style="margin-top: 18px;">Explore Menu</a>
      </div>
    `;
  } else {
    cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150'">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)">-</button>
          <span class="qty-count">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)">+</button>
        </div>
      </div>
    `).join('');
  }

  if (subtotalElem) subtotalElem.textContent = `₹${summary.subtotal.toFixed(2)}`;
  if (taxElem) taxElem.textContent = `₹${summary.tax.toFixed(2)}`;
  if (deliveryElem) deliveryElem.textContent = summary.deliveryFee === 0 ? 'FREE' : `₹${summary.deliveryFee.toFixed(2)}`;
  if (totalElem) totalElem.textContent = `₹${summary.total.toFixed(2)}`;

  if (discountRow && discountElem) {
    if (summary.discount > 0) {
      discountRow.style.display = 'flex';
      discountElem.textContent = `-₹${summary.discount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
}

// Drawer Toggle Handlers
function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('active');
  document.getElementById('cartOverlay')?.classList.add('active');
  renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('active');
  document.getElementById('cartOverlay')?.classList.remove('active');
}

// Toast Notifications
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'success' ? 'toast-success' : ''}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Navigation & User Session State
function checkUserSession() {
  const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
  const userActionContainer = document.getElementById('userNavActions');
  if (!userActionContainer) return;

  if (user) {
    userActionContainer.innerHTML = `
      <div class="user-menu-wrapper">
        <a href="dashboard.html" class="user-profile-btn">
          <span class="user-avatar-sm">${user.name.charAt(0).toUpperCase()}</span>
          <span>${user.name.split(' ')[0]}</span>
        </a>
      </div>
      <button class="btn btn-outline btn-sm" onclick="logoutUser()">Logout</button>
    `;
  } else {
    userActionContainer.innerHTML = `
      <a href="login.html" class="btn btn-outline btn-sm">Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm">Register</a>
    `;
  }
}

function logoutUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 500);
}

// Apply Promo Code
function applyPromoCode(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  if (cleanCode === 'PIZZA20') {
    const summary = getCartSummary();
    const discount = Math.round(summary.subtotal * 0.20);
    localStorage.setItem('pizzacraft_discount', discount);
    renderCartDrawer();
    showToast('🎉 Promo code applied! 20% discount added.', 'success');
  } else {
    showToast('Invalid promo code. Try "PIZZA20"', 'info');
  }
}

// Checkout Process Simulation
function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty! Please add some items.', 'info');
    return;
  }

  const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
  if (!user) {
    showToast('Please sign in or create an account to place your order.', 'info');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout';
    }, 1200);
    return;
  }

  const summary = getCartSummary();
  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items: cart,
    subtotal: summary.subtotal,
    total: summary.total,
    status: 'Baking', // Baking -> Out for Delivery -> Delivered
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    userEmail: user.email,
    estimatedMinutes: 28
  };

  const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  // Clear cart & promo discount
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem('pizzacraft_discount');
  updateCartBadge();
  closeCartDrawer();

  showToast('🎉 Order placed successfully! Directing to dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1200);
}

// Setup common event listeners on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkUserSession();

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }

  // Cart Drawer open/close bindings
  const cartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
});
