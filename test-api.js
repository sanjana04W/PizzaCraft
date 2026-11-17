/**
 * Automated Test Suite for PizzaCraft Backend APIs
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
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
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
  console.log('--- Starting Backend API Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Health check
  const health = await request('GET', '/api/health');
  assert(health.status === 200 && health.body.status === 'healthy', 'GET /api/health returns 200 and healthy status');

  // 2. User Login with seeded user John Doe
  const loginRes = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'password123'
  });
  assert(loginRes.status === 200 && loginRes.body.success === true, 'POST /api/auth/login with valid credentials');
  assert(loginRes.body.user && loginRes.body.user.email === 'john@example.com', 'Login returns sanitized user object without password');

  // 3. User Login with invalid password
  const failLogin = await request('POST', '/api/auth/login', {
    email: 'john@example.com',
    password: 'wrongpassword'
  });
  assert(failLogin.status === 401 && failLogin.body.success === false, 'POST /api/auth/login with wrong password returns 401');

  // 4. User Registration (New User)
  const testEmail = `chef_${Date.now()}@example.com`;
  const regRes = await request('POST', '/api/auth/register', {
    name: 'Chef Mario',
    email: testEmail,
    password: 'secretpassword123',
    phone: '+91 91234 56789',
    address: '88 Napoli Street, Gourmet City'
  });
  assert(regRes.status === 201 && regRes.body.success === true, 'POST /api/auth/register creates new user');
  assert(regRes.body.user.email === testEmail && regRes.body.user.loyaltyPoints === 120, 'Registration grants 120 welcome bonus points');

  // 5. User Registration duplicate email check
  const dupReg = await request('POST', '/api/auth/register', {
    name: 'Duplicate Mario',
    email: testEmail,
    password: 'secretpassword123'
  });
  assert(dupReg.status === 409 && dupReg.body.success === false, 'POST /api/auth/register rejects duplicate email with 409 Conflict');

  // 6. User Registration validation (short password)
  const shortPassReg = await request('POST', '/api/auth/register', {
    name: 'Invalid Mario',
    email: 'valid@example.com',
    password: '123'
  });
  assert(shortPassReg.status === 400 && shortPassReg.body.success === false, 'POST /api/auth/register validates password min-length 6');

  // 7. Get All Blogs
  const blogsRes = await request('GET', '/api/blogs');
  assert(blogsRes.status === 200 && Array.isArray(blogsRes.body.blogs) && blogsRes.body.blogs.length > 0, 'GET /api/blogs returns array of articles');

  // 8. Create Blog Post
  const newBlogPayload = {
    title: 'The Secrets of San Marzano Volcanic Tomatoes',
    category: 'Ingredient Spotlight',
    author: 'Chef Mario',
    content: 'Grown on the southern slopes of Mount Vesuvius, authentic San Marzano tomatoes possess a distinct bittersweet complexity, vibrant scarlet hue, and gentle acidity.',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb2251a?w=800'
  };
  const createBlogRes = await request('POST', '/api/blogs', newBlogPayload);
  assert(createBlogRes.status === 201 && createBlogRes.body.success === true, 'POST /api/blogs creates and publishes story');
  assert(createBlogRes.body.blog && createBlogRes.body.blog.author === 'Chef Mario', 'Created blog has correct metadata');

  // 9. Create Blog validation (empty title)
  const failBlogRes = await request('POST', '/api/blogs', {
    title: '',
    category: 'Baking Secrets',
    author: 'Chef Mario',
    content: 'Short story'
  });
  assert(failBlogRes.status === 400 && failBlogRes.body.success === false, 'POST /api/blogs validates required title');

  // 10. Like a blog
  const createdBlogId = createBlogRes.body.blog.id;
  const likeRes = await request('POST', `/api/blogs/${createdBlogId}/like`, { action: 'like' });
  assert(likeRes.status === 200 && likeRes.body.likes >= 1, 'POST /api/blogs/:id/like increments like counter');

  // 11. Place an order
  const orderRes = await request('POST', '/api/orders', {
    items: [{ id: 'piz-1', name: 'Margherita Classica', price: 349, quantity: 1 }],
    subtotal: 349,
    tax: 17,
    deliveryFee: 49,
    discount: 0,
    total: 415,
    userEmail: testEmail
  });
  assert(orderRes.status === 201 && orderRes.body.success === true, 'POST /api/orders places pizza order');

  // 12. Advance order status
  const orderId = orderRes.body.order.id;
  const advanceRes = await request('PATCH', `/api/orders/${orderId}/status`);
  assert(advanceRes.status === 200 && advanceRes.body.order.status === 'Out for Delivery', 'PATCH /api/orders/:id/status advances Baking to Out for Delivery');

  console.log(`\n--- Test Results: ${passed}/${total} passed ---`);
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
