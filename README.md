# 🍕 PizzaCraft - Artisanal Wood-Fired Pizza Delivery & Culinary Blog

PizzaCraft is a full-stack, vibrant, and ultra user-friendly web application for gourmet wood-fired pizza ordering, live order tracking, and culinary community stories. Built with **HTML5, CSS3, JavaScript, Node.js, and Express.js**.

---

## 🛠️ Backend Architecture (Node.js & Express.js)

The backend server is powered by **Node.js** and **Express.js**, serving both modular REST APIs and the static frontend client with persistent JSON file storage.

### 📌 Key REST API Endpoints

| Method | Endpoint | Description | Request Body / Query |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | None |
| `POST` | `/api/auth/register` | **User Registration** with validation | `{ name, email, password, phone, address }` |
| `POST` | `/api/auth/login` | **User Login** with credential checks | `{ email, password }` |
| `GET` | `/api/auth/users` | List registered users (sanitized) | None |
| `GET` | `/api/blogs` | Get all pizza stories | `?category=...` & `?search=...` |
| `POST` | `/api/blogs` | **Create & Publish Blog** | `{ title, category, author, content, image }` |
| `POST` | `/api/blogs/:id/like` | Increment or decrement story likes | `{ action: "like" \| "unlike" }` |
| `GET` | `/api/orders` | Retrieve order list | `?email=...` |
| `POST` | `/api/orders` | Place a new pizza order | `{ items, subtotal, tax, deliveryFee, total, userEmail }` |
| `PATCH` | `/api/orders/:id/status` | Advance live delivery status | None |

---

## 🚀 How to Run the Application

### 1. Start the Backend Server:
```bash
# Install dependencies (Express & CORS)
npm install

# Start the server (runs on port 5000 by default)
npm start
```

Once started:
- 🌐 **Web App:** [http://localhost:5000](http://localhost:5000)
- 🚀 **REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 2. Run Automated API Tests:
```bash
node test-api.js
```
*Validates 15 automated test cases covering registration, validation, duplicate prevention, authentication, blog creation, like counter, and order status transitions.*

---

## 🔗 Frontend & Backend Connection
- **API Client (`js/api.js`):** Centralizes all `fetch()` calls to the Express REST APIs.
- **Graceful Fallback:** If opened directly as a static file (`file:///`) or if the backend server is temporarily paused, the frontend automatically falls back to `localStorage` so the user experience never breaks.
- **Connected Modules:**
  - `js/auth.js` ➔ Connected to `/api/auth/register` and `/api/auth/login`.
  - `js/blog.js` ➔ Connected to `/api/blogs` (read, publish story, and like).
  - `js/dashboard.js` & `js/app.js` ➔ Connected to `/api/orders` (place orders and advance live status).

---

## 🎨 UI Features
- **Vibrant Italian Gourmet Theme:** Warm fire gradients (`#FF3838` to `#FFA502`), fresh herb greens (`#10AC84`), and rich berry accents.
- **Interactive Pizza Customizer Modal:** Personalize crust size (8", 10", 12"), crust style (Sourdough, Thin, Cheese Burst), and gourmet add-ons with live price calculation.
- **In-Card Quantity Controllers:** Instant `[-] [qty] [+]` adjustments directly on the menu cards.
- **Cart Drawer Free Delivery Meter:** Dynamic visual progress meter tracking free delivery progress up to ₹499.
- **Live Order Tracker:** 4-stage tracking (*Order Confirmed ➔ Wood-Fired Oven ➔ Out for Delivery ➔ Delivered*).
- **Instant Demo Login:** 1-Click login as test user *John Doe* (`john@example.com` / `password123`).
