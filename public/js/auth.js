/**
 * MovForYou - Authentication (Login, Register, Profile)
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
  initProfilePage();
});

// Login Form
function initLoginForm() {
  const form = document.getElementById('loginForm');
  const demoBtn = document.getElementById('demoLoginBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        showToast(res.message || 'Welcome back!', 'success');
        setTimeout(() => (window.location.href = 'index.html'), 1000);
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    }
  });

  demoBtn?.addEventListener('click', async () => {
    try {
      const res = await api.post('/auth/demo');
      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        showToast('Logged in with Demo Account! 🎉', 'success');
        setTimeout(() => (window.location.href = 'index.html'), 800);
      }
    } catch (err) {
      showToast(err.message || 'Demo login failed', 'error');
    }
  });
}

// Register Form
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const res = await api.post('/auth/register', {
        username,
        email,
        password,
        confirmPassword,
      });

      if (res.success) {
        api.setToken(res.token);
        api.setUser(res.user);
        showToast('Registration successful! Welcome to MovForYou 🎬', 'success');
        setTimeout(() => (window.location.href = 'index.html'), 1000);
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  });
}

// Profile Page
function initProfilePage() {
  const profileForm = document.getElementById('profileForm');
  if (!profileForm) return;

  const user = api.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // Populate fields
  document.getElementById('profileUsername').value = user.username || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profileBio').value = user.bio || '';
  document.getElementById('profileAvatarImg').src = user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User';

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('profileUsername').value.trim();
    const bio = document.getElementById('profileBio').value.trim();

    try {
      const res = await api.put('/auth/profile', { username, bio });
      if (res.success) {
        api.setUser(res.user);
        showToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    }
  });
}
