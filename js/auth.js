/**
 * PizzaCraft - Authentication & User Account Management
 */

const USERS_DB_KEY = 'pizzacraft_registered_users';

// Prepopulate demo user if not exists
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
function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim().toLowerCase();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const errorElem = document.getElementById('authError');

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

  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const userExists = users.some(u => u.email === email);

  if (userExists) {
    if (errorElem) errorElem.textContent = 'An account with this email already exists.';
    return;
  }

  const newUser = {
    id: 'usr_' + Date.now(),
    name,
    email,
    phone: phone || '+91 99999 88888',
    password,
    address: '12 Pepperoni Avenue, Gourmet City',
    loyaltyPoints: 100, // Welcome bonus
    joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  };

  users.push(newUser);
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

  // Automatically sign in
  localStorage.setItem('pizzacraft_current_user', JSON.stringify(newUser));
  showToast('Account created successfully! Welcome to PizzaCraft.', 'success');

  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 1000);
}

// Handle User Login
function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const errorElem = document.getElementById('authError');

  if (errorElem) errorElem.textContent = '';

  const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '[]');
  const matchedUser = users.find(u => u.email === email && u.password === password);

  if (!matchedUser) {
    if (errorElem) errorElem.textContent = 'Invalid email or password. Please try again.';
    return;
  }

  // Set session
  localStorage.setItem('pizzacraft_current_user', JSON.stringify(matchedUser));
  showToast(`Welcome back, ${matchedUser.name}!`, 'success');

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

// Prefill Demo Account
function fillDemoCredentials() {
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  if (emailInput && passwordInput) {
    emailInput.value = 'john@example.com';
    passwordInput.value = 'password123';
    showToast('Demo credentials filled! Click "Sign In"', 'info');
  }
}
