/**
 * MovForYou - Global Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavbar();
  initGlobalModals();
  initGlobalSearch();
});

/* ==========================================================================
   Theme Switcher (Dark / Light)
   ========================================================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('mfy_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('mfy_theme', newTheme);
      updateThemeIcon(newTheme);
      showToast(`Switched to ${newTheme} mode`, 'info');
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggleBtn i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

/* ==========================================================================
   Navbar & Authentication State
   ========================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // Mobile menu hamburger
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
    });
  }

  // Check auth user
  renderNavAuth();
}

function renderNavAuth() {
  const navUserContainer = document.getElementById('navUserContainer');
  if (!navUserContainer) return;

  const user = api.getUser();

  if (user) {
    navUserContainer.innerHTML = `
      <div class="nav-user">
        <button id="userMenuBtn" class="user-profile-btn">
          <img src="${user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}" alt="${user.username}" class="user-avatar-sm">
          <span>${escapeHtml(user.username)}</span>
          <i class="fa-solid fa-chevron-down" style="font-size: 0.75rem; color: var(--text-dim);"></i>
        </button>
        <div id="userMenuDropdown" class="user-menu-dropdown">
          <div class="dropdown-header">
            <div class="dropdown-username">${escapeHtml(user.username)}</div>
            <div class="dropdown-email">${escapeHtml(user.email || '')}</div>
          </div>
          <a href="dashboard.html" class="dropdown-item"><i class="fa-solid fa-chart-pie"></i> Dashboard</a>
          <a href="watchlist.html" class="dropdown-item"><i class="fa-solid fa-bookmark"></i> My Watchlist</a>
          <a href="favorites.html" class="dropdown-item"><i class="fa-solid fa-heart"></i> Favorites</a>
          <a href="profile.html" class="dropdown-item"><i class="fa-solid fa-user-gear"></i> Profile Settings</a>
          <div class="dropdown-item logout" onclick="handleLogout()"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</div>
        </div>
      </div>
    `;

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    userMenuBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      userMenuDropdown?.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      userMenuDropdown?.classList.remove('active');
    });
  } else {
    navUserContainer.innerHTML = `
      <a href="login.html" class="btn btn-secondary btn-sm"><i class="fa-solid fa-right-to-bracket"></i> Sign In</a>
      <a href="register.html" class="btn btn-primary btn-sm"><i class="fa-solid fa-user-plus"></i> Join Free</a>
    `;
  }
}

window.handleLogout = function () {
  api.removeToken();
  showToast('Signed out successfully. See you soon!', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 700);
};

/* ==========================================================================
   Global Search
   ========================================================================== */
function initGlobalSearch() {
  const globalSearchInput = document.getElementById('globalSearchInput');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearchInput.value.trim();
        if (query) {
          window.location.href = `movies.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

/* ==========================================================================
   Modals & Toast Notifications
   ========================================================================== */
function initGlobalModals() {
  // Close modals when clicking outside modal box
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    // If trailer modal, stop video playback
    if (modalId === 'trailerModal') {
      const iframe = modal.querySelector('iframe');
      if (iframe) iframe.src = '';
    }
  }
}

// Global Trailer Modal Helper
window.playTrailer = function (title, trailerUrl) {
  if (!trailerUrl) {
    showToast('Trailer not available for this movie', 'info');
    return;
  }

  let embedUrl = trailerUrl;
  if (trailerUrl.includes('watch?v=')) {
    embedUrl = trailerUrl.replace('watch?v=', 'embed/');
  }

  const trailerModal = document.getElementById('trailerModal');
  const trailerTitle = document.getElementById('trailerTitle');
  const trailerIframe = document.getElementById('trailerIframe');

  if (trailerModal && trailerIframe) {
    if (trailerTitle) trailerTitle.textContent = `${title} - Official Trailer`;
    trailerIframe.src = `${embedUrl}?autoplay=1`;
    openModal('trailerModal');
  }
};

// Global Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon =
    type === 'success'
      ? 'fa-circle-check'
      : type === 'error'
      ? 'fa-circle-xmark'
      : 'fa-circle-info';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Global Favorite Toggle Helper
window.toggleFavorite = async function (movieId, btnElement) {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to add to favorites', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 1200);
    return;
  }

  try {
    const res = await api.post(`/favorites/${movieId}`);
    if (res.success) {
      const isFav = res.isFavorite;
      showToast(res.message, 'success');
      if (btnElement) {
        btnElement.classList.toggle('active', isFav);
        const icon = btnElement.querySelector('i');
        if (icon) {
          icon.className = isFav ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
        }
      }
    }
  } catch (err) {
    showToast(err.message || 'Failed to update favorite', 'error');
  }
};

// Global Watchlist Quick Add Helper
window.quickAddToWatchlist = async function (movieId, status = 'want_to_watch') {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to manage your watchlist', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 1200);
    return;
  }

  try {
    const res = await api.post('/watchlist', { movieId, status });
    if (res.success) {
      showToast(res.message, 'success');
    }
  } catch (err) {
    showToast(err.message || 'Failed to add to watchlist', 'error');
  }
};

// Movie Card Generator Helper
function createMovieCardElement(movie, options = {}) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  const poster = movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
  const year = movie.releaseDate ? movie.releaseDate.split('-')[0] : '2024';
  const mainGenre = Array.isArray(movie.genre) && movie.genre.length > 0 ? movie.genre[0] : 'Action';

  card.innerHTML = `
    <div class="card-poster-wrap">
      <img src="${escapeHtml(poster)}" alt="${escapeHtml(movie.title)}" class="card-poster" loading="lazy">
      <button class="card-favorite-btn" title="Add to Favorites" onclick="event.stopPropagation(); toggleFavorite('${movie._id}', this)">
        <i class="fa-regular fa-heart"></i>
      </button>
      <div class="card-rating-badge">
        <i class="fa-solid fa-star"></i> ${Number(movie.rating).toFixed(1)}
      </div>
    </div>
    <div class="card-body">
      <div class="card-meta">
        <span class="card-genre">${escapeHtml(mainGenre)}</span>
        <span>${escapeHtml(year)}</span>
      </div>
      <h3 class="card-title" title="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</h3>
      <div class="card-actions">
        <button onclick="event.stopPropagation(); quickAddToWatchlist('${movie._id}')" title="Add to Watchlist">
          <i class="fa-solid fa-plus"></i> Watchlist
        </button>
        <a href="movie-details.html?id=${movie._id}" title="View Details">
          <i class="fa-solid fa-circle-info"></i> Details
        </a>
      </div>
    </div>
  `;

  // Click entire card to open details
  card.addEventListener('click', () => {
    window.location.href = `movie-details.html?id=${movie._id}`;
  });

  return card;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
