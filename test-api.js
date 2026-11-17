/**
 * Automated Test Suite for PizzaCraft Backend APIs
 * Tests all endpoints: Auth, JWT, Protected Dashboard, Blogs CRUD, Orders
 */

const http = require('http');
const app = require('./server');

const PORT = 5055;
let server;

function request(method, path, body = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...extraHeaders
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('\n🍕 PizzaCraft Backend API Tests');
  console.log('='.repeat(45));
  let passed = 0, total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // ── 1. Health Check ───────────────────────────────────────────────────────
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/health → 200 healthy');
  assert(typeof health.body.database === 'string', 'GET /api/health → includes database status');

  // ── 2. Valid Login & JWT Issuance ─────────────────────────────────────────
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'pizza123'
  });
  assert(loginRes.status === 200 && loginRes.body.success === true, 'POST /api/auth/login → valid credentials');
  assert(typeof loginRes.body.token === 'string' && loginRes.body.token.length > 20, 'POST /api/auth/login → issues signed JWT token');
  assert(loginRes.body.user && !loginRes.body.user.password, 'POST /api/auth/login → returns safe user (no password)');

  const johnToken = loginRes.body.token;

  // ── 3. Invalid Login ──────────────────────────────────────────────────────
  const failLogin = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'wrongpassword'
  });
  assert(failLogin.status === 401 && failLogin.body.success === false, 'POST /api/auth/login → wrong password returns 401');

  // ── 4. Register New User & JWT Issuance ───────────────────────────────────
  const testEmail = `testchef_${Date.now()}@example.com`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Chef Alessandro',
    email: testEmail,
    password: 'securepassword123',
    phone: '+91 91234 56789',
    address: '99 Olive Lane, Gourmet City'
  });
  assert(regRes.status === 201 && regRes.body.success === true, 'POST /api/auth/register → creates new user');
  assert(typeof regRes.body.token === 'string' && regRes.body.token.length > 20, 'POST /api/auth/register → issues signed JWT token');
  assert(regRes.body.user && regRes.body.user.loyaltyPoints === 120, 'POST /api/auth/register → grants 120 loyalty points');

  const newUserToken = regRes.body.token;

  // ── 5. Duplicate Registration Check ───────────────────────────────────────
  const dupReg = await request('POST', '/api/auth/register', {
    name: 'Duplicate Chef',
    email: testEmail,
    password: 'securepassword123'
  });
  assert(dupReg.status === 409 && dupReg.body.success === false, 'POST /api/auth/register → 409 on duplicate email');

  // ── 6. Short Password Validation ──────────────────────────────────────────
  const shortPass = await request('POST', '/api/auth/register', {
    name: 'Bad Chef',
    email: 'valid@example.com',
    password: '123'
  });
  assert(shortPass.status === 400 && shortPass.body.success === false, 'POST /api/auth/register → 400 on short password');

  // ── 7. Protected Route: GET /api/auth/me (Valid Token) ────────────────────
  const meRes = await request('GET', '/api/auth/me', null, {
    'Authorization': `Bearer ${johnToken}`
  });
  assert(meRes.status === 200 && meRes.body.success === true, 'GET /api/auth/me (Protected) → 200 with valid JWT');
  assert(meRes.body.user?.email === 'john@example.com', 'GET /api/auth/me → returns authenticated user profile');

  // ── 8. Protected Route: GET /api/auth/me (Missing Token) ──────────────────
  const meNoToken = await request('GET', '/api/auth/me');
  assert(meNoToken.status === 401 && meNoToken.body.success === false, 'GET /api/auth/me (Protected) → 401 when token is missing');

  // ── 9. Protected Route: GET /api/auth/me (Invalid Token) ──────────────────
  const meBadToken = await request('GET', '/api/auth/me', null, {
    'Authorization': 'Bearer invalid.token.payload'
  });
  assert(meBadToken.status === 401 && meBadToken.body.success === false, 'GET /api/auth/me (Protected) → 401 with invalid token');

  // ── 10. Protected Route: PUT /api/auth/profile ────────────────────────────
  const updateProfRes = await request('PUT', '/api/auth/profile', {
    name: 'John Artisan Doe',
    phone: '+91 98888 77777',
    address: '77 Mozzarella Boulevard, Gourmet City'
  }, { 'Authorization': `Bearer ${johnToken}` });
  assert(updateProfRes.status === 200 && updateProfRes.body.success === true, 'PUT /api/auth/profile (Protected) → updates profile');
  assert(updateProfRes.body.user?.name === 'John Artisan Doe', 'PUT /api/auth/profile → returns updated name');

  // ── 11. Protected Private Dashboard: GET /api/dashboard/stats ─────────────
  const dashAuth = await request('GET', '/api/dashboard/stats', null, {
    'Authorization': `Bearer ${johnToken}`
  });
  assert(dashAuth.status === 200 && dashAuth.body.success === true, 'GET /api/dashboard/stats (Protected) → 200 authorized');

  const dashNoAuth = await request('GET', '/api/dashboard/stats');
  assert(dashNoAuth.status === 401 && dashNoAuth.body.success === false, 'GET /api/dashboard/stats (Protected) → 401 unauthorized (Route Protected)');

  // ── 12. Logout Endpoint: POST /api/auth/logout ────────────────────────────
  const logoutRes = await request('POST', '/api/auth/logout');
  assert(logoutRes.status === 200 && logoutRes.body.success === true, 'POST /api/auth/logout → 200 logged out');

  // ── 13. Create Blog Linked to Authenticated User ──────────────────────────
  const createBlogRes = await request('POST', '/api/blogs', {
    title: 'Alessandro Secret Sourdough Recipe',
    category: 'Baking Secrets',
    author: 'Chef Alessandro',
    authorEmail: testEmail,
    content: 'My secret sourdough starter has been nurtured for over three generations. The wild yeast creates unmatched airy crumb texture and blistering that melts in your mouth.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800'
  }, { 'Authorization': `Bearer ${newUserToken}` });
  assert(createBlogRes.status === 201 && createBlogRes.body.success === true, 'POST /api/blogs → creates story linked to user');
  const createdBlogId = createBlogRes.body.blog?.id || createBlogRes.body.blog?._id;

  // ── 14. Get User's Own Blogs (Protected): GET /api/blogs/user/me ──────────
  const myBlogsRes = await request('GET', '/api/blogs/user/me', null, {
    'Authorization': `Bearer ${newUserToken}`
  });
  assert(myBlogsRes.status === 200 && Array.isArray(myBlogsRes.body.blogs), 'GET /api/blogs/user/me (Protected) → returns user blogs');
  assert(myBlogsRes.body.blogs.some(b => b.title === 'Alessandro Secret Sourdough Recipe'), 'GET /api/blogs/user/me → contains logged-in user blog');

  // ── 15. Get All Blogs ─────────────────────────────────────────────────────
  const blogsRes = await request('GET', '/api/blogs');
  assert(blogsRes.status === 200 && Array.isArray(blogsRes.body.blogs), 'GET /api/blogs → returns array of all articles');
  assert(blogsRes.body.blogs.length > 0, 'GET /api/blogs → contains published articles');

  // ── 16. Get Single Blog by ID ─────────────────────────────────────────────
  const singleBlogRes = await request('GET', `/api/blogs/${createdBlogId}`);
  assert(singleBlogRes.status === 200 && singleBlogRes.body.success === true, 'GET /api/blogs/:id → returns single blog');
  assert(singleBlogRes.body.blog?.title === 'Alessandro Secret Sourdough Recipe', 'GET /api/blogs/:id → correct blog title returned');

  // ── 17. Single Blog 404 ───────────────────────────────────────────────────
  const notFoundRes = await request('GET', '/api/blogs/nonexistent-id-xyz');
  assert(notFoundRes.status === 404 && notFoundRes.body.success === false, 'GET /api/blogs/:id → 404 for missing blog');

  // ── 18. Update Blog (PUT) ─────────────────────────────────────────────────
  const updateRes = await request('PUT', `/api/blogs/${createdBlogId}`, {
    title: 'Alessandro Master Sourdough (Updated)',
    category: 'Baking Secrets',
    author: 'Chef Alessandro',
    content: 'Updated fermentation technique: 80% hydration with 48 hours cold proofing creates larger alveoli and enhanced sour notes.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800'
  });
  assert(updateRes.status === 200 && updateRes.body.success === true, 'PUT /api/blogs/:id → updates blog');
  assert(updateRes.body.blog?.title === 'Alessandro Master Sourdough (Updated)', 'PUT /api/blogs/:id → returns updated title');

  // ── 19. Delete Blog (DELETE) ──────────────────────────────────────────────
  const deleteRes = await request('DELETE', `/api/blogs/${createdBlogId}`);
  assert(deleteRes.status === 200 && deleteRes.body.success === true, 'DELETE /api/blogs/:id → deletes blog');

  const afterDelete = await request('GET', `/api/blogs/${createdBlogId}`);
  assert(afterDelete.status === 404, 'GET /api/blogs/:id → 404 after deletion');

  // ── 20. Live Search Blogs ─────────────────────────────────────────────────
  const searchRes = await request('GET', '/api/blogs?search=mozzarella');
  assert(searchRes.status === 200 && Array.isArray(searchRes.body.blogs), 'GET /api/blogs?search= → returns search results');

  // ── 21. Category Filter ───────────────────────────────────────────────────
  const catRes = await request('GET', '/api/blogs?category=Baking+Secrets');
  assert(catRes.status === 200 && Array.isArray(catRes.body.blogs), 'GET /api/blogs?category= → category filter works');

  // ── 22. Toggle Blog Like ──────────────────────────────────────────────────
  const blogsAgain = await request('GET', '/api/blogs');
  const anyBlogId = blogsAgain.body.blogs?.[0]?.id || blogsAgain.body.blogs?.[0]?._id;
  const likeRes = await request('POST', `/api/blogs/${anyBlogId}/like`, { action: 'like' });
  assert(likeRes.status === 200 && typeof likeRes.body.likes === 'number', 'POST /api/blogs/:id/like → increments likes');

  // ── 23. Place Order ───────────────────────────────────────────────────────
  const orderRes = await request('POST', '/api/orders', {
    items: [{ id: 'piz-1', name: 'Margherita Classica', price: 349, quantity: 2 }],
    subtotal: 698, tax: 35, deliveryFee: 49, discount: 0, total: 782,
    userEmail: testEmail
  });
  assert(orderRes.status === 201 && orderRes.body.success === true, 'POST /api/orders → places pizza order');

  // ── 24. Advance Order Status ──────────────────────────────────────────────
  const orderId = orderRes.body.order.id || orderRes.body.order._id;
  const advanceRes = await request('PATCH', `/api/orders/${orderId}/status`);
  assert(advanceRes.status === 200 && advanceRes.body.order, 'PATCH /api/orders/:id/status → advances status');

  // ── 25. API 404 ───────────────────────────────────────────────────────────
  const notFound = await request('GET', '/api/nonexistent');
  assert(notFound.status === 404 && notFound.body.success === false, 'GET /api/nonexistent → 404 not found');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(45));
  console.log(`🏆 Results: ${passed}/${total} tests passed`);
  if (passed === total) {
    console.log('🎉 All tests passed! PizzaCraft Auth & Dashboard module is fully functional.\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed — check output above.\n`);
  }

  server.close();
  process.exit(passed === total ? 0 : 1);
}

server = app.listen(PORT, () => {
  runTests().catch(err => {
    console.error('Test execution failed:', err);
    server.close();
    process.exit(1);
  });
});
