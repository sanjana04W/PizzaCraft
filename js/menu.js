/**
 * PizzaCraft - Menu Catalog & Product Interaction
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
    badgeClass: 'badge-special',
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
    badgeClass: 'badge-special',
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

function renderPizzas(targetContainerId = 'pizzasGrid', limit = null) {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  let filtered = PIZZA_MENU_DATA.filter(pizza => {
    const matchesFilter = (currentFilter === 'all') || (pizza.category === currentFilter);
    const matchesSearch = pizza.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pizza.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (limit && typeof limit === 'number') {
    filtered = filtered.slice(0, limit);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
        <h3 style="font-size: 1.4rem; margin-bottom: 8px;">No pizzas match your search</h3>
        <p style="color: var(--text-muted); font-size: 0.95rem;">Try another keyword or category filter above.</p>
        <button class="btn btn-outline btn-sm" style="margin-top: 16px;" onclick="resetFilter()">Reset Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(pizza => `
    <article class="pizza-card">
      <span class="pizza-badge ${pizza.badgeClass}">${pizza.tag}</span>
      <div class="pizza-image-wrap">
        <img src="${pizza.image}" alt="${pizza.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'">
      </div>
      <div class="pizza-content">
        <div class="pizza-title-row">
          <h3 class="pizza-title">${pizza.name}</h3>
          <span class="pizza-rating">★ ${pizza.rating}</span>
        </div>
        <p class="pizza-desc">${pizza.desc}</p>
        <div class="pizza-footer">
          <span class="pizza-price">₹${pizza.price}</span>
          <button class="add-cart-btn" onclick="handleAddToCart('${pizza.id}')">
            <span>+ Add to Cart</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

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

function setMenuFilter(filterType) {
  currentFilter = filterType;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === filterType);
  });
  renderPizzas();
}

function resetFilter() {
  currentFilter = 'all';
  searchQuery = '';
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) searchInput.value = '';
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
  });
  renderPizzas();
}

// Bind search and filter events
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      renderPizzas();
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      setMenuFilter(filter);
    });
  });

  // Check URL parameters for search or openCart
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('openCart') === 'true') {
    setTimeout(openCartDrawer, 400);
  }
});
