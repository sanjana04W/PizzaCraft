/**
 * Automated Test Suite for PizzaCraft Backend APIs
 * Tests all endpoints with MongoDB + JSON fallback modes
 */

const http = require('http');
const app = require('./server');

const PORT = 5055;
let server;

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
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

  // ── 2. Valid Login ────────────────────────────────────────────────────────
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'pizza123'   // seeded password (bcrypt-hashed in users.json)
  });
  assert(loginRes.status === 200 && loginRes.body.success === true, 'POST /api/auth/login → valid credentials');
  assert(loginRes.body.user && !loginRes.body.user.password, 'POST /api/auth/login → no password in response');

  // ── 3. Invalid Login ──────────────────────────────────────────────────────
  const failLogin = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'wrongpassword'
  });
  assert(failLogin.status === 401 && failLogin.body.success === false, 'POST /api/auth/login → wrong password returns 401');

  // ── 4. Register New User ──────────────────────────────────────────────────
  const testEmail = `testchef_${Date.now()}@example.com`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Test Chef',
    email: testEmail,
    password: 'testpass123',
    phone: '+91 91234 56789',
    address: '99 Olive Lane, Gourmet City'
  });
  assert(regRes.status === 201 && regRes.body.success === true, 'POST /api/auth/register → creates new user');
  assert(regRes.body.user && regRes.body.user.loyaltyPoints === 120, 'POST /api/auth/register → grants 120 loyalty points');

  // ── 5. Duplicate Registration ─────────────────────────────────────────────
  const dupReg = await request('POST', '/api/auth/register', {
    name: 'Dup Chef', email: testEmail, password: 'testpass123'
  });
  assert(dupReg.status === 409 && dupReg.body.success === false, 'POST /api/auth/register → 409 on duplicate email');

  // ── 6. Register Validation ────────────────────────────────────────────────
  const shortPass = await request('POST', '/api/auth/register', {
    name: 'Bad Chef', email: 'valid@example.com', password: '123'
  });
  assert(shortPass.status === 400 && shortPass.body.success === false, 'POST /api/auth/register → 400 on short password');

  // ── 7. Get All Blogs ──────────────────────────────────────────────────────
  const blogsRes = await request('GET', '/api/blogs');
  assert(blogsRes.status === 200 && Array.isArray(blogsRes.body.blogs), 'GET /api/blogs → returns blog array');
  assert(blogsRes.body.blogs.length > 0, 'GET /api/blogs → has at least one blog');

  // ── 8. Create Blog Post ───────────────────────────────────────────────────
  const createBlogRes = await request('POST', '/api/blogs', {
    title: 'Test Blog: San Marzano Secrets',
    category: 'Baking Secrets',
    author: 'Test Chef',
    content: 'Grown on the southern slopes of Mount Vesuvius, authentic San Marzano tomatoes possess a distinct bittersweet complexity, vibrant scarlet hue, and gentle acidity that makes them the ultimate pizza sauce base.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800'
  });
  assert(createBlogRes.status === 201 && createBlogRes.body.success === true, 'POST /api/blogs → creates blog post');
  assert(createBlogRes.body.blog && createBlogRes.body.blog.author === 'Test Chef', 'POST /api/blogs → blog has correct author');

  // ── 9. Get Single Blog by ID ──────────────────────────────────────────────
  const createdBlogId = createBlogRes.body.blog.id || createBlogRes.body.blog._id;
  const singleBlogRes = await request('GET', `/api/blogs/${createdBlogId}`);
  assert(singleBlogRes.status === 200 && singleBlogRes.body.success === true, 'GET /api/blogs/:id → returns single blog');
  assert(singleBlogRes.body.blog && singleBlogRes.body.blog.title === 'Test Blog: San Marzano Secrets', 'GET /api/blogs/:id → correct blog returned');

  // ── 10. Get Blog - Not Found ──────────────────────────────────────────────
  const notFoundRes = await request('GET', '/api/blogs/nonexistent-id-xyz');
  assert(notFoundRes.status === 404 && notFoundRes.body.success === false, 'GET /api/blogs/:id → 404 for missing blog');

  // ── 11. Update Blog (PUT) ─────────────────────────────────────────────────
  const updateRes = await request('PUT', `/api/blogs/${createdBlogId}`, {
    title: 'Updated: San Marzano Deep Dive',
    category: 'Ingredients',
    author: 'Test Chef (Updated)',
    content: 'An updated and expanded look at San Marzano tomatoes — now with more volcanic soil science, harvest season insights, and tasting notes comparing DOP-certified to generic supermarket cans. The difference in sweetness and acidity is remarkable and undeniable.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800'
  });
  assert(updateRes.status === 200 && updateRes.body.success === true, 'PUT /api/blogs/:id → updates blog');
  assert(updateRes.body.blog?.title === 'Updated: San Marzano Deep Dive', 'PUT /api/blogs/:id → returns updated title');

  // ── 12. Verify Update Persisted ───────────────────────────────────────────
  const verifyUpdate = await request('GET', `/api/blogs/${createdBlogId}`);
  assert(verifyUpdate.body.blog?.title === 'Updated: San Marzano Deep Dive', 'GET /api/blogs/:id → update persisted correctly');

  // ── 13. Update Validation ─────────────────────────────────────────────────
  const badUpdate = await request('PUT', `/api/blogs/${createdBlogId}`, {
    title: '', author: 'Test', content: 'Valid content here'
  });
  assert(badUpdate.status === 400 && badUpdate.body.success === false, 'PUT /api/blogs/:id → 400 on empty title');

  // ── 14. Delete Blog (DELETE) ──────────────────────────────────────────────
  const deleteRes = await request('DELETE', `/api/blogs/${createdBlogId}`);
  assert(deleteRes.status === 200 && deleteRes.body.success === true, 'DELETE /api/blogs/:id → deletes blog');

  // ── 15. Verify Deletion ───────────────────────────────────────────────────
  const afterDelete = await request('GET', `/api/blogs/${createdBlogId}`);
  assert(afterDelete.status === 404, 'GET /api/blogs/:id → 404 after deletion');

  // ── 16. Blog Validation ───────────────────────────────────────────────────
  const failBlog = await request('POST', '/api/blogs', {
    title: '', category: 'Baking Secrets', author: 'Chef', content: 'Short'
  });
  assert(failBlog.status === 400 && failBlog.body.success === false, 'POST /api/blogs → 400 on empty title');

  // ── 17. Search Blogs ──────────────────────────────────────────────────────
  const searchRes = await request('GET', '/api/blogs?search=mozzarella');
  assert(searchRes.status === 200 && Array.isArray(searchRes.body.blogs), 'GET /api/blogs?search= → returns filtered results');

  // ── 18. Category Filter ───────────────────────────────────────────────────
  const catRes = await request('GET', '/api/blogs?category=Baking+Secrets');
  assert(catRes.status === 200 && Array.isArray(catRes.body.blogs), 'GET /api/blogs?category= → category filter works');

  // ── 19. Like Blog ─────────────────────────────────────────────────────────
  const blogsAgain = await request('GET', '/api/blogs');
  const anyBlogId = blogsAgain.body.blogs?.[0]?.id || blogsAgain.body.blogs?.[0]?._id;
  const likeRes = await request('POST', `/api/blogs/${anyBlogId}/like`, { action: 'like' });
  assert(likeRes.status === 200 && typeof likeRes.body.likes === 'number', 'POST /api/blogs/:id/like → increments likes');

  // ── 20. Place Order ───────────────────────────────────────────────────────
  const orderRes = await request('POST', '/api/orders', {
    items: [{ id: 'piz-1', name: 'Margherita Classica', price: 349, quantity: 2 }],
    subtotal: 698, tax: 35, deliveryFee: 49, discount: 0, total: 782,
    userEmail: testEmail
  });
  assert(orderRes.status === 201 && orderRes.body.success === true, 'POST /api/orders → places pizza order');

  // ── 21. Advance Order Status ──────────────────────────────────────────────
  const orderId = orderRes.body.order.id || orderRes.body.order._id;
  const advanceRes = await request('PATCH', `/api/orders/${orderId}/status`);
  assert(advanceRes.status === 200 && advanceRes.body.order, 'PATCH /api/orders/:id/status → advances status');

  // ── 22. API 404 ───────────────────────────────────────────────────────────
  const notFound = await request('GET', '/api/nonexistent');
  assert(notFound.status === 404 && notFound.body.success === false, 'GET /api/nonexistent → 404 not found');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(45));
  console.log(`🏆 Results: ${passed}/${total} tests passed`);
  if (passed === total) {
    console.log('🎉 All tests passed! PizzaCraft backend is fully functional.\n');
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
