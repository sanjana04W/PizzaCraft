/**
 * PizzaCraft - Authentication & User Account Management
 * Integrated with Node.js/Express Backend REST API (/api/auth)
 * Includes graceful localStorage fallback for offline/direct file viewing
 */

const USERS_DB_KEY = 'pizzacraft_registered_users';

// Prepopulate local demo user for offline fallback
function initAuthDB() {
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const demoExists = users.some(u => u.email === 'john@example.com');
  
  if (!demoExists) {
    users.push({
      id: 'usr_demo_101',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '+91 98765 43210',
      address: '42 Baker Street, Foodie Lane, Mumbai, MH',
      loyaltyPoints: 340,
      joinedDate: 'Jan 2026'
    });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }
}

initAuthDB();

// Handle User Registration
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const errorElem = document.getElementById('authError');
  const submitBtn = e.target.querySelector('button[type="submit"]');

  if (errorElem) errorElem.textContent = '';

  if (!name || !email || !password) {
    if (errorElem) errorElem.textContent = 'Please fill in all required fields.';
    return;
  }

  if (password.length < 6) {
    if (errorElem) errorElem.textContent = 'Password must be at least 6 characters.';
    return;
  }

  if (password !== confirmPassword) {
    if (errorElem) errorElem.textContent = 'Passwords do not match!';
    return;
  }

  const payload = {
    name,
    email,
    password,
    phone: phone || '+91 99999 88888',
    address: '12 Pepperoni Avenue, Gourmet City'
  };

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
  }

  // 1. Try Backend REST API
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.register(payload);
    
    if (res.ok && res.data && res.data.success) {
      const user = res.data.user;
      localStorage.setItem('pizzacraft_current_user', JSON.stringify(user));
      showToast('🎉 ' + res.data.message, 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
      return;
    } else if (!res.networkError) {
      // Backend returned business error (e.g. duplicate email)
      if (errorElem) errorElem.textContent = res.data?.message || 'Registration failed.';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account & Claim Bonus ➔';
      }
      return;
    }
  }

  // 2. Offline / Direct fallback
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const userExists = users.some(u => u.email === email);

  if (userExists) {
    if (errorElem) errorElem.textContent = 'An account with this email already exists.';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account & Claim Bonus ➔';
    }
    return;
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    phone: phone || '+91 99999 88888',
    password,
    address: '12 Pepperoni Avenue, Gourmet City',
    loyaltyPoints: 120,
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  localStorage.setItem('pizzacraft_current_user', JSON.stringify(newUser));

  showToast('🎉 Account created successfully! Welcome to PizzaCraft Club.', 'success');
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 900);
}

// Handle User Login
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errorElem = document.getElementById('authError');
  const submitBtn = e.target.querySelector ? e.target.querySelector('button[type="submit"]') : null;

  if (errorElem) errorElem.textContent = '';

  if (!email || !password) {
    if (errorElem) errorElem.textContent = 'Please enter both email and password.';
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';
  }

  // 1. Try Backend REST API
  if (window.PizzaCraftAPI) {
    const res = await window.PizzaCraftAPI.login({ email, password });
    
    if (res.ok && res.data && res.data.success) {
      const user = res.data.user;
      localStorage.setItem('pizzacraft_current_user', JSON.stringify(user));
      showToast(`Welcome back, ${user.name}! 🍕`, 'success');

      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');

      setTimeout(() => {
        if (redirect === 'checkout') {
          window.location.href = 'menu.html?openCart=true';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 900);
      return;
    } else if (!res.networkError) {
      if (errorElem) errorElem.textContent = res.data?.message || 'Invalid credentials.';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to PizzaCraft ➔';
      }
      return;
    }
  }

  // 2. Offline / Direct fallback
  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const matchedUser = users.find(u => u.email === email && u.password === password);

  if (!matchedUser) {
    if (errorElem) errorElem.textContent = 'Invalid email or password. Please try again.';
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In to PizzaCraft ➔';
    }
    return;
  }

  localStorage.setItem('pizzacraft_current_user', JSON.stringify(matchedUser));
  showToast(`Welcome back, ${matchedUser.name}! 🍕`, 'success');

  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect');

  setTimeout(() => {
    if (redirect === 'checkout') {
      window.location.href = 'menu.html?openCart=true';
    } else {
      window.location.href = 'dashboard.html';
    }
  }, 900);
}

// Auto fill demo credentials
function fillDemoCredentials() {
  const emailField = document.getElementById('loginEmail');
  const passField = document.getElementById('loginPassword');
  if (emailField && passField) {
    emailField.value = 'john@example.com';
    passField.value = 'password123';
    showToast('Demo credentials filled! Click Sign In or instant login.', 'info');
  }
}

// Instant demo login with one click
function instantDemoLogin() {
  fillDemoCredentials();
  const fakeEvent = { preventDefault: () => {} };
  handleLogin(fakeEvent);
}

// Toggle password visibility
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁️';
  }
}
