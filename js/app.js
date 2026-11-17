/**
 * PizzaCraft - Core Application JS
 * Handles Cart, Drawer, Toasts, Session Status, Navigation, and Floating Controls
 */

// Storage Keys
const CART_STORAGE_KEY = 'pizzacraft_cart';
const USER_STORAGE_KEY = 'pizzacraft_current_user';
const ORDERS_STORAGE_KEY = 'pizzacraft_orders';
const FREE_DELIVERY_THRESHOLD = 499;

// Get Cart
function getCart() {
  try {
    const data = localStorage.getItem(CART_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Error reading cart:', e);
    return [];
  }
}

// Save Cart
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
  updateFloatingCart();
  // Dispatch event so menu cards can update their inline quantity buttons
  window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
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
      price: Number(item.price),
      image: item.image,
      category: item.category || 'Pizza',
      customs: item.customs || '',
      quantity: item.quantity || 1
    });
  }

  saveCart(cart);
  triggerBadgeAnimation();
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
  if (confirm('Are you sure you want to clear your cart?')) {
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem('pizzacraft_discount');
    updateCartBadge();
    renderCartDrawer();
    updateFloatingCart();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
    showToast('Cart cleared', 'info');
  }
}

// Calculate Totals
function getCartSummary() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.05); // 5% GST/Tax
  const deliveryFee = subtotal > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? 49 : 0;
  const discount = localStorage.getItem('pizzacraft_discount') ? Number(localStorage.getItem('pizzacraft_discount')) : 0;
  const total = Math.max(0, subtotal + tax + deliveryFee - discount);

  return { 
    subtotal, 
    tax, 
    deliveryFee, 
    discount, 
    total, 
    count: cart.reduce((c, i) => c + i.quantity, 0) 
  };
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

// Badge bump animation
function triggerBadgeAnimation() {
  const badges = document.querySelectorAll('.cart-count');
  badges.forEach(badge => {
    badge.classList.remove('bump');
    void badge.offsetWidth; // trigger reflow
    badge.classList.add('bump');
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

  // Free delivery progress calculation
  const freeDeliveryTracker = document.getElementById('freeDeliveryTracker');
  if (freeDeliveryTracker) {
    if (summary.subtotal === 0) {
      freeDeliveryTracker.innerHTML = `
        <div class="delivery-status-text">
          <span>🛵 Free delivery on orders over ₹${FREE_DELIVERY_THRESHOLD}</span>
          <span class="highlight">₹0 / ₹${FREE_DELIVERY_THRESHOLD}</span>
        </div>
        <div class="delivery-meter-track">
          <div class="delivery-meter-fill" style="width: 0%;"></div>
        </div>
      `;
    } else if (summary.subtotal < FREE_DELIVERY_THRESHOLD) {
      const remaining = FREE_DELIVERY_THRESHOLD - summary.subtotal;
      const percent = Math.min(100, Math.round((summary.subtotal / FREE_DELIVERY_THRESHOLD) * 100));
      freeDeliveryTracker.innerHTML = `
        <div class="delivery-status-text">
          <span>Add <strong class="highlight">₹${remaining}</strong> more for <strong>FREE Delivery!</strong></span>
          <span class="highlight">${percent}%</span>
        </div>
        <div class="delivery-meter-track">
          <div class="delivery-meter-fill" style="width: ${percent}%;"></div>
        </div>
      `;
    } else {
      freeDeliveryTracker.innerHTML = `
        <div class="delivery-status-text" style="color: var(--accent);">
          <span>🎉 <strong>Congratulations! You unlocked FREE Delivery!</strong></span>
          <span>100%</span>
        </div>
        <div class="delivery-meter-track">
          <div class="delivery-meter-fill unlocked" style="width: 100%;"></div>
        </div>
      `;
    }
  }

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🍕</div>
        <h4 style="font-size: 1.2rem; color: var(--dark); margin-bottom: 6px;">Your cart is empty</h4>
        <p style="font-size: 0.9rem; color: var(--text-muted);">Looks like you haven't added any hot artisanal pizzas yet!</p>
        <a href="menu.html" class="btn btn-primary btn-sm" style="margin-top: 18px;" onclick="closeCartDrawer()">
          Browse Menu Now ➔
        </a>
      </div>
    `;
  } else {
    cartContainer.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=150'">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          ${item.customs ? `<div class="cart-item-customs">✨ ${item.customs}</div>` : ''}
          <div class="cart-item-price">₹${item.price}</div>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" onclick="updateCartQty('${item.id}', -1)" title="Decrease quantity">-</button>
          <span class="qty-count">${item.quantity}</span>
          <button class="qty-btn" onclick="updateCartQty('${item.id}', 1)" title="Increase quantity">+</button>
        </div>
      </div>
    `).join('');
  }

  if (subtotalElem) subtotalElem.textContent = `₹${summary.subtotal.toFixed(2)}`;
  if (taxElem) taxElem.textContent = `₹${summary.tax.toFixed(2)}`;
  if (deliveryElem) {
    if (summary.deliveryFee === 0) {
      deliveryElem.innerHTML = `<span style="color: var(--accent); font-weight: 800;">FREE</span>`;
    } else {
      deliveryElem.textContent = `₹${summary.deliveryFee.toFixed(2)}`;
    }
  }
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
  document.body.style.overflow = 'hidden';
  renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('active');
  document.getElementById('cartOverlay')?.classList.remove('active');
  document.body.style.overflow = '';
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
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px) scale(0.9)';
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
        <a href="dashboard.html" class="user-profile-btn" title="View Dashboard">
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
  showToast('Logged out successfully. See you soon! 👋', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Apply Promo Code
function applyPromoCode(code) {
  const cleanCode = (code || '').trim().toUpperCase();
  const summary = getCartSummary();

  if (summary.subtotal === 0) {
    showToast('Please add items to cart before applying coupon!', 'info');
    return;
  }

  if (cleanCode === 'PIZZA20') {
    const discount = Math.round(summary.subtotal * 0.20);
    localStorage.setItem('pizzacraft_discount', discount);
    renderCartDrawer();
    updateFloatingCart();
    showToast('🎉 Promo code PIZZA20 applied! 20% discount added!', 'success');
  } else if (cleanCode === 'FREESHIP') {
    localStorage.setItem('pizzacraft_discount', summary.deliveryFee || 49);
    renderCartDrawer();
    updateFloatingCart();
    showToast('🎉 Free shipping coupon applied!', 'success');
  } else {
    showToast('Invalid promo code. Try "PIZZA20"', 'info');
  }
}

// Checkout Process Simulation
function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty! Please select a delicious pizza first.', 'info');
    return;
  }

  const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null');
  if (!user) {
    showToast('Please sign in or create an account to complete checkout.', 'info');
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout';
    }, 1000);
    return;
  }

  const summary = getCartSummary();
  const newOrder = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    items: cart,
    subtotal: summary.subtotal,
    tax: summary.tax,
    deliveryFee: summary.deliveryFee,
    discount: summary.discount,
    total: summary.total,
    status: 'Baking', // Baking -> Out for Delivery -> Delivered
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    userEmail: user.email,
    estimatedMinutes: 25
  };

  const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
  orders.unshift(newOrder);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));

  // Clear cart & promo discount
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem('pizzacraft_discount');
  updateCartBadge();
  closeCartDrawer();
  updateFloatingCart();

  showToast('🎉 Order placed successfully! Heading to your live tracking dashboard...', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
}

// Floating Action Controls (Cart Pill & Scroll to Top)
function initFloatingControls() {
  // Check if container already exists
  if (document.querySelector('.floating-actions-container')) return;

  const container = document.createElement('div');
  container.className = 'floating-actions-container';

  container.innerHTML = `
    <button class="scroll-top-btn" id="scrollTopBtn" aria-label="Scroll to Top" title="Scroll to top">
      ↑
    </button>
    <button class="floating-cart-btn" id="floatingCartBtn" aria-label="Open Cart" title="View Cart">
      <span>🛒</span>
      <span class="label">Cart:</span>
      <span id="floatingCartPrice">₹0</span>
      <span class="cart-count" style="display: none;">0</span>
    </button>
  `;

  document.body.appendChild(container);

  // Bind clicks
  document.getElementById('floatingCartBtn')?.addEventListener('click', openCartDrawer);
  
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn?.classList.add('visible');
    } else {
      scrollTopBtn?.classList.remove('visible');
    }
  });

  updateFloatingCart();
}

function updateFloatingCart() {
  const summary = getCartSummary();
  const priceElem = document.getElementById('floatingCartPrice');
  const floatingBtn = document.getElementById('floatingCartBtn');
  if (priceElem) {
    priceElem.textContent = `₹${summary.total.toFixed(0)}`;
  }
  if (floatingBtn) {
    const badge = floatingBtn.querySelector('.cart-count');
    if (badge) {
      badge.textContent = summary.count;
      badge.style.display = summary.count > 0 ? 'flex' : 'none';
    }
    // Subtle scale feedback
    floatingBtn.style.display = summary.count > 0 ? 'flex' : 'none';
  }
}

// Setup common event listeners on load
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  checkUserSession();
  initFloatingControls();

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
