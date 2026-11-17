/**
 * PizzaCraft - Menu Catalog & Product Interaction
 * Featuring Customizer Modal, Inline Card Quantity Controllers, Instant Search & Sorting
 */

const PIZZA_MENU_DATA = [
  {
    id: 'piz-1',
    name: 'Margherita Classica',
    category: 'veg',
    tag: 'Classic Veg',
    badgeClass: 'badge-veg',
    price: 349,
    rating: 4.8,
    reviews: 142,
    desc: 'San Marzano tomato sauce, fresh buffalo mozzarella, aromatic sweet basil leaves, and cold-pressed extra virgin olive oil.',
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
    calories: '650 kcal',
    prepTime: '20-25 mins'
  },
  {
    id: 'piz-2',
    name: 'Double Pepperoni Feast',
    category: 'nonveg',
    tag: 'Bestseller',
    badgeClass: 'badge-meat',
    price: 529,
    rating: 4.9,
    reviews: 320,
    desc: 'Loaded with double layers of crispy, cured pepperoni slices, molten mozzarella blend, and our signature slow-simmered marinara.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    calories: '890 kcal',
    prepTime: '25-30 mins'
  },
  {
    id: 'piz-3',
    name: 'Truffle Mushroom Meltdown',
    category: 'veg',
    tag: 'Chef Special',
    badgeClass: 'badge-special',
    price: 499,
    rating: 4.9,
    reviews: 98,
    desc: 'Roasted wild portobello and button mushrooms, rich white truffle oil drizzle, caramelized red onions, and aged parmesan.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    calories: '720 kcal',
    prepTime: '20-25 mins'
  },
  {
    id: 'piz-4',
    name: 'Smokey BBQ Chicken Supreme',
    category: 'nonveg',
    tag: 'Popular',
    badgeClass: 'badge-meat',
    price: 549,
    rating: 4.8,
    reviews: 215,
    desc: 'Tender hickory-smoked grilled chicken breast, hickory BBQ reduction, sweet corn kernels, jalapenos, and crisp bell peppers.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    calories: '840 kcal',
    prepTime: '25-30 mins'
  },
  {
    id: 'piz-5',
    name: 'Quattro Formaggi (Four Cheese)',
    category: 'veg',
    tag: 'Cheese Lovers',
    badgeClass: 'badge-veg',
    price: 479,
    rating: 4.7,
    reviews: 160,
    desc: 'An indulgent harmony of artisanal Gorgonzola, aged Fontina, whole milk Mozzarella, and shaved Parmigiano-Reggiano.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    calories: '810 kcal',
    prepTime: '20 mins'
  },
  {
    id: 'piz-6',
    name: 'Fiery Jalapeno & Spicy Sausage',
    category: 'nonveg',
    tag: 'Hot & Spicy',
    badgeClass: 'badge-meat',
    price: 519,
    rating: 4.6,
    reviews: 112,
    desc: 'Spicy Italian chorizo sausage, fire-roasted jalapenos, chili-infused oil, cracked black pepper, and gooey mozzarella.',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
    calories: '860 kcal',
    prepTime: '20-25 mins'
  },
  {
    id: 'piz-7',
    name: 'Paneer Tikka Fusion',
    category: 'veg',
    tag: 'Indian Fusion',
    badgeClass: 'badge-veg',
    price: 439,
    rating: 4.8,
    reviews: 184,
    desc: 'Marinated tandoori cottage cheese cubes, crunchy capsicum, red onion rings, fresh coriander, and mint-mayo swirl on thin crust.',
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=600&auto=format&fit=crop&q=80',
    calories: '760 kcal',
    prepTime: '20-25 mins'
  },
  {
    id: 'piz-8',
    name: 'Pesto Garden Delight',
    category: 'veg',
    tag: 'Herb Fresh',
    badgeClass: 'badge-veg',
    price: 429,
    rating: 4.7,
    reviews: 90,
    desc: 'House-made basil walnut pesto base, sun-dried tomatoes, baby spinach, black Kalamata olives, and crumbled feta cheese.',
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&auto=format&fit=crop&q=80',
    calories: '680 kcal',
    prepTime: '20-25 mins'
  },
  {
    id: 'piz-9',
    name: 'Artisan Garlic Dough Knots',
    category: 'sides',
    tag: 'Sides',
    badgeClass: 'badge-sides',
    price: 199,
    rating: 4.9,
    reviews: 310,
    desc: 'Golden-baked twisted dough knots drenched in roasted garlic butter, parsley, and served with warm marinara dipping sauce.',
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&auto=format&fit=crop&q=80',
    calories: '420 kcal',
    prepTime: '15 mins'
  },
  {
    id: 'piz-10',
    name: 'Nutella Berry Dessert Pizza',
    category: 'dessert',
    tag: 'Sweet Treat',
    badgeClass: 'badge-dessert',
    price: 329,
    rating: 4.9,
    reviews: 175,
    desc: 'Warm brioche dough smothered in velvety Nutella hazelnut spread, sliced fresh strawberries, and dusted powdered sugar.',
    image: 'https://images.unsplash.com/photo-1588315029754-2dd089d39a1a?w=600&auto=format&fit=crop&q=80',
    calories: '550 kcal',
    prepTime: '15 mins'
  }
];

let currentFilter = 'all';
let searchQuery = '';
let currentSort = 'recommended';
let lastTargetGridId = 'pizzasGrid';
let lastLimit = null;

// Customizer state
let activeCustomPizza = null;
let selectedSize = 'regular'; // regular, medium, large
let selectedCrust = 'classic'; // classic, thin, stuffed
let selectedAddons = [];

function renderPizzas(targetContainerId = 'pizzasGrid', limit = null) {
  lastTargetGridId = targetContainerId;
  lastLimit = limit;

  const container = document.getElementById(targetContainerId);
  if (!container) return;

  const cart = (typeof getCart === 'function') ? getCart() : [];

  let filtered = PIZZA_MENU_DATA.filter(pizza => {
    const matchesFilter = (currentFilter === 'all') || (pizza.category === currentFilter);
    const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pizza.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sorting
  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  if (limit && typeof limit === 'number') {
    filtered = filtered.slice(0, limit);
  }

  // Update category counts on filter pills if on menu page
  updateFilterCounts();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: var(--white); border-radius: var(--radius-lg); border: 1px solid var(--gray-border);">
        <div style="font-size: 3rem; margin-bottom: 12px;">🔍</div>
        <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No delicious items match your search</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try another keyword or reset the category filters above.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 18px;" onclick="resetFilter()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pizza => {
    const cartItem = cart.find(i => i.id === pizza.id);
    const qty = cartItem ? cartItem.quantity : 0;

    return `
      <article class="pizza-card" data-id="${pizza.id}">
        <span class="pizza-badge ${pizza.badgeClass}">${pizza.tag}</span>
        
        <div class="pizza-image-wrap" onclick="openPizzaCustomizer('${pizza.id}')" title="Click to customize pizza">
          <img src="${pizza.image}" alt="${pizza.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
          <span class="quick-view-overlay-btn">✨ Customize</span>
        </div>

        <div class="pizza-content">
          <div class="pizza-title-row">
            <h3 class="pizza-title" onclick="openPizzaCustomizer('${pizza.id}')">${pizza.name}</h3>
            <span class="pizza-rating" title="${pizza.reviews} customer ratings">★ ${pizza.rating}</span>
          </div>
          
          <div class="pizza-meta-pills">
            <span class="meta-pill">⏱️ ${pizza.prepTime}</span>
            <span class="meta-pill">🔥 ${pizza.calories}</span>
          </div>

          <p class="pizza-desc">${pizza.desc}</p>
          
          <div class="pizza-footer">
            <div class="pizza-price-wrap">
              <span class="pizza-price-label">Price</span>
              <span class="pizza-price">₹${pizza.price}</span>
            </div>

            <div class="pizza-action-area" id="action-${pizza.id}">
              ${qty > 0 ? `
                <div class="card-qty-ctrl">
                  <button class="card-qty-btn" onclick="updateCartQty('${pizza.id}', -1)" title="Reduce slice">-</button>
                  <span class="card-qty-value">${qty}</span>
                  <button class="card-qty-btn" onclick="updateCartQty('${pizza.id}', 1)" title="Add another slice">+</button>
                </div>
              ` : `
                <button class="add-cart-btn" onclick="handleAddToCart('${pizza.id}')">
                  <span>+ Add to Cart</span>
                </button>
              `}
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Update filter counts
function updateFilterCounts() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    const countElem = btn.querySelector('.filter-count');
    if (countElem) {
      if (filter === 'all') {
        countElem.textContent = PIZZA_MENU_DATA.length;
      } else {
        const count = PIZZA_MENU_DATA.filter(p => p.category === filter).length;
        countElem.textContent = count;
      }
    }
  });
}

// Listen to cart updates to refresh inline buttons
window.addEventListener('cartUpdated', () => {
  if (document.getElementById(lastTargetGridId)) {
    renderPizzas(lastTargetGridId, lastLimit);
  }
});

function handleAddToCart(id) {
  const pizza = PIZZA_MENU_DATA.find(p => p.id === id);
  if (pizza) {
    addToCart({
      id: pizza.id,
      name: pizza.name,
      price: pizza.price,
      image: pizza.image,
      category: pizza.category
    });
  }
}

// ==========================================
// PIZZA CUSTOMIZER MODAL
// ==========================================
function ensureCustomizerModalExists() {
  if (document.getElementById('customizerModalOverlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'customizer-modal-overlay';
  overlay.id = 'customizerModalOverlay';

  overlay.innerHTML = `
    <div class="customizer-modal" id="customizerModalCard">
      <button class="modal-close-btn" onclick="closePizzaCustomizer()">&times;</button>
      
      <div class="modal-header-visual">
        <img id="customizerImg" src="" alt="Pizza">
      </div>

      <div class="modal-body">
        <div class="modal-title-row">
          <h2 class="modal-title" id="customizerTitle">Pizza Name</h2>
          <span class="pizza-rating" id="customizerRating">★ 4.9</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.92rem;" id="customizerDesc"></p>

        <!-- Size Selection -->
        <div class="modal-options-group">
          <div class="modal-group-title">
            <span>1. Choose Crust Size</span>
            <span class="tag">Select one</span>
          </div>
          <div class="option-pills-grid" id="customizerSizePills">
            <div class="option-pill-btn active" data-size="regular" onclick="selectSize('regular', 0)">
              <span class="name">Regular (8")</span>
              <span class="price">Base</span>
            </div>
            <div class="option-pill-btn" data-size="medium" onclick="selectSize('medium', 149)">
              <span class="name">Medium (10")</span>
              <span class="price">+₹149</span>
            </div>
            <div class="option-pill-btn" data-size="large" onclick="selectSize('large', 279)">
              <span class="name">Large (12")</span>
              <span class="price">+₹279</span>
            </div>
          </div>
        </div>

        <!-- Crust Choice -->
        <div class="modal-options-group">
          <div class="modal-group-title">
            <span>2. Select Artisanal Crust</span>
            <span class="tag">Handcrafted</span>
          </div>
          <div class="option-pills-grid" id="customizerCrustPills">
            <div class="option-pill-btn active" data-crust="classic" onclick="selectCrust('classic', 0)">
              <span class="name">Sourdough</span>
              <span class="price">Included</span>
            </div>
            <div class="option-pill-btn" data-crust="thin" onclick="selectCrust('thin', 0)">
              <span class="name">Thin & Crisp</span>
              <span class="price">Included</span>
            </div>
            <div class="option-pill-btn" data-crust="stuffed" onclick="selectCrust('stuffed', 75)">
              <span class="name">Cheese Burst</span>
              <span class="price">+₹75</span>
            </div>
          </div>
        </div>

        <!-- Extra Gourmet Toppings -->
        <div class="modal-options-group">
          <div class="modal-group-title">
            <span>3. Extra Gourmet Add-ons</span>
            <span class="tag">Optional</span>
          </div>
          <div class="toppings-grid">
            <label class="topping-checkbox-label">
              <span><input type="checkbox" onchange="toggleAddon('Extra Buffalo Mozzarella', 49, this)"> Extra Mozzarella</span>
              <span style="color: var(--primary);">+₹49</span>
            </label>
            <label class="topping-checkbox-label">
              <span><input type="checkbox" onchange="toggleAddon('Fire Jalapenos', 29, this)"> Jalapeno Kick</span>
              <span style="color: var(--primary);">+₹29</span>
            </label>
            <label class="topping-checkbox-label">
              <span><input type="checkbox" onchange="toggleAddon('Roasted Garlic Oil', 29, this)"> Roasted Garlic</span>
              <span style="color: var(--primary);">+₹29</span>
            </label>
            <label class="topping-checkbox-label">
              <span><input type="checkbox" onchange="toggleAddon('White Truffle Drizzle', 69, this)"> Truffle Glaze</span>
              <span style="color: var(--primary);">+₹69</span>
            </label>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div>
          <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Total Price</span>
          <div style="font-size: 1.5rem; font-weight: 900; color: var(--dark);" id="modalTotalPrice">₹0</div>
        </div>
        <button class="btn btn-primary" onclick="confirmCustomPizza()">
          Add Customized Pizza ➔
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close when clicking outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePizzaCustomizer();
  });
}

function openPizzaCustomizer(id) {
  ensureCustomizerModalExists();
  const pizza = PIZZA_MENU_DATA.find(p => p.id === id);
  if (!pizza) return;

  activeCustomPizza = pizza;
  selectedSize = 'regular';
  selectedCrust = 'classic';
  selectedAddons = [];

  document.getElementById('customizerImg').src = pizza.image;
  document.getElementById('customizerTitle').textContent = pizza.name;
  document.getElementById('customizerRating').textContent = `★ ${pizza.rating}`;
  document.getElementById('customizerDesc').textContent = pizza.desc;

  // Reset pills
  document.querySelectorAll('#customizerSizePills .option-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-size') === 'regular');
  });
  document.querySelectorAll('#customizerCrustPills .option-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-crust') === 'classic');
  });

  // Reset checkboxes
  document.querySelectorAll('.topping-checkbox-label input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.topping-checkbox-label').classList.remove('checked');
  });

  updateCustomizerTotal();

  const overlay = document.getElementById('customizerModalOverlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePizzaCustomizer() {
  const overlay = document.getElementById('customizerModalOverlay');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function selectSize(size, extraCost) {
  selectedSize = size;
  document.querySelectorAll('#customizerSizePills .option-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-size') === size);
  });
  updateCustomizerTotal();
}

function selectCrust(crust, extraCost) {
  selectedCrust = crust;
  document.querySelectorAll('#customizerCrustPills .option-pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-crust') === crust);
  });
  updateCustomizerTotal();
}

function toggleAddon(name, price, checkbox) {
  checkbox.closest('.topping-checkbox-label').classList.toggle('checked', checkbox.checked);
  if (checkbox.checked) {
    selectedAddons.push({ name, price });
  } else {
    selectedAddons = selectedAddons.filter(a => a.name !== name);
  }
  updateCustomizerTotal();
}

function calculateCustomTotal() {
  if (!activeCustomPizza) return 0;
  let total = activeCustomPizza.price;

  if (selectedSize === 'medium') total += 149;
  if (selectedSize === 'large') total += 279;
  if (selectedCrust === 'stuffed') total += 75;

  selectedAddons.forEach(a => total += a.price);
  return total;
}

function updateCustomizerTotal() {
  const total = calculateCustomTotal();
  const elem = document.getElementById('modalTotalPrice');
  if (elem) elem.textContent = `₹${total}`;
}

function confirmCustomPizza() {
  if (!activeCustomPizza) return;

  const total = calculateCustomTotal();
  const sizeNames = { regular: '8" Reg', medium: '10" Med', large: '12" Lrg' };
  const crustNames = { classic: 'Sourdough', thin: 'Thin Crust', stuffed: 'Cheese Burst' };

  const customsDesc = [
    sizeNames[selectedSize],
    crustNames[selectedCrust],
    ...selectedAddons.map(a => a.name)
  ].join(' • ');

  const customId = `${activeCustomPizza.id}-${selectedSize}-${selectedCrust}-${selectedAddons.map(a => a.name[0]).join('')}`;

  addToCart({
    id: customId,
    name: activeCustomPizza.name,
    price: total,
    image: activeCustomPizza.image,
    category: activeCustomPizza.category,
    customs: customsDesc
  });

  closePizzaCustomizer();
  setTimeout(openCartDrawer, 300);
}

// Filter and Search Handlers
function setMenuFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
  });
  renderPizzas(lastTargetGridId, lastLimit);
}

function resetFilter() {
  currentFilter = 'all';
  searchQuery = '';
  currentSort = 'recommended';
  
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) searchInput.value = '';
  
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.style.display = 'none';

  const sortSelect = document.getElementById('menuSortSelect');
  if (sortSelect) sortSelect.value = 'recommended';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
  });

  renderPizzas(lastTargetGridId, lastLimit);
}

// Bind search and filter events
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('menuSearchInput');
  const clearBtn = document.getElementById('searchClearBtn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (clearBtn) {
        clearBtn.style.display = searchQuery ? 'flex' : 'none';
      }
      renderPizzas(lastTargetGridId, lastLimit);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        renderPizzas(lastTargetGridId, lastLimit);
        searchInput.focus();
      }
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setMenuFilter(filter);
    });
  });

  const sortSelect = document.getElementById('menuSortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderPizzas(lastTargetGridId, lastLimit);
    });
  }

  // Check URL parameters for search or openCart
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openCart') === 'true') {
    setTimeout(openCartDrawer, 400);
  }
});
