# 🍕 PizzaCraft - Artisanal Wood-Fired Pizza Delivery & Culinary Blog

PizzaCraft is a modern, vibrant, and ultra user-friendly web application for gourmet wood-fired pizza ordering, live order tracking, and culinary community stories.

---

## 🎨 What Makes It Colorful & Visually Engaging?
- **Vibrant Gourmet Theme:** Warm Italian sunset gradients (`#FF3838`, `#FF6B81`, `#FFA502`), melted golden cheddar accents, fresh herb greens (`#10AC84`), and rich berry chocolate tones.
- **Dynamic Background Orbs:** Soft ambient mesh radial gradients delivering a warm, appetizing restaurant ambience.
- **Top Announcement Bar:** Pulsing gradient ticker highlighting exclusive promos (`PIZZA20`) and free delivery milestones.
- **Eye-Catching Badges:** Category pills with custom palettes (🌱 Pure Veg in emerald, 🍗 Gourmet Meat in ruby, 👨‍🍳 Chef's Special in saffron, 🍫 Sweet Treat in berry purple).
- **Smooth Micro-Interactions:** 3D hover elevations, button shine effects, and springy animated badge counters.

---

## 🚀 Ultra User-Friendly Features
1. **Interactive Pizza Customizer Modal:**
   - Click any pizza card or "Customize" to personalize:
     - **Size:** Regular (8"), Medium (10" +₹149), Large (12" +₹279).
     - **Crust:** Classic Sourdough, Thin & Crispy, Stuffed Cheese Burst (+₹75).
     - **Add-ons:** Extra Buffalo Mozzarella, Fire Jalapenos, Roasted Garlic, White Truffle Glaze.
   - Dynamic real-time price calculation!
2. **In-Card Quantity Controllers:**
   - When an item is added to cart, the button on the menu card immediately transforms into an intuitive `[-] [qty] [+]` controller.
3. **Smart Menu Search & Multi-Filters:**
   - Instant search with a clear `✕` button.
   - Category filter tabs with live item count chips.
   - Sorting options: *Recommended, Highest Customer Rating, Price: Low to High, Price: High to Low*.
4. **Cart Drawer with Free Delivery Meter:**
   - Visual progress bar that tracks how much more to add for free delivery (threshold: ₹499).
   - One-tap clickable coupon chips (tap `PIZZA20` to instantly apply a 20% discount).
5. **Floating Action Controls:**
   - Floating cart bubble with live price and counter at the bottom-right corner.
   - Smooth scroll-to-top button.
6. **Live Delivery Status & Order Simulation:**
   - Visual step-by-step order tracking in the Dashboard (*Order Confirmed ➔ Wood-Fired Oven ➔ Out for Delivery ➔ Delivered*).
   - One-click "⚡ Simulate Live Order" button to test order tracking immediately.
   - Stage progression button to advance orders through each milestone.
   - "🔄 Reorder" button to re-add past favorites in one click.
7. **Instant Demo Login:**
   - "⚡ 1-Click Login" button on the Sign In page to log in as test user *John Doe* instantly.
   - Password show/hide toggle.
8. **Interactive Pizza Stories:**
   - Interactive ❤️ like buttons that track likes in `localStorage`.
   - Category filtering across blog articles.
   - Live image preview with quick preset buttons on the Create Blog page.

---

## 📂 Project Structure
```
PizzaCraft/
├── index.html           # Vibrant homepage with hero, highlights, top pizzas, & reviews
├── menu.html            # Full menu with customizer, filters, search & sorting
├── blog.html            # Culinary stories with interactive likes & filters
├── create-blog.html     # Story editor with live image preview & presets
├── dashboard.html       # Customer dashboard with real-time order tracker & history
├── login.html           # Sign in page with 1-click demo login & password toggle
├── register.html        # Registration page with 120 points welcome bonus
├── css/
│   └── style.css        # Vibrant modern styling, animations & responsive media queries
└── js/
    ├── app.js           # Cart management, drawer, toasts & floating controls
    ├── menu.js          # Menu data, customizer modal, in-card qty controls & search
    ├── auth.js          # Authentication, user session & demo accounts
    ├── dashboard.js     # Live order tracking & simulator
    └── blog.js          # Articles, category filters & interactive likes
```

---

## ⚡ How to Run
Simply open `index.html` in any modern web browser, or serve with any static web server (e.g. `npx serve`, Live Server in VS Code, or Python `python -m http.server 8000`).
