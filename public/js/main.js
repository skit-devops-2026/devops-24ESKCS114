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

  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-active');
    });
  }

  renderNavAuth();
}

function renderNavAuth() {
  const navUserContainer = document.getElementById('navUserContainer');
  if (!navUserContainer) return;

  const user = api.getUser();

  if (user) {
    navUserContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <button class="btn btn-primary btn-sm" onclick="openAddMovieModal()">
          <i class="fa-solid fa-plus"></i> Add Movie
        </button>
        <a href="profile.html" class="user-profile-btn" title="View Profile & Account Details">
          <img src="${user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}" alt="${user.username}" class="user-avatar-sm">
          <span>${escapeHtml(user.username)}</span>
        </a>
        <button class="btn btn-secondary btn-sm" onclick="handleLogout()" title="Sign Out" style="padding: 0.4rem 0.6rem; color: var(--accent-rose);">
          <i class="fa-solid fa-right-from-bracket"></i> Logout
        </button>
      </div>
    `;
  } else {
    navUserContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button class="btn btn-primary btn-sm" onclick="openAddMovieModal()">
          <i class="fa-solid fa-plus"></i> Add Movie
        </button>
        <a href="login.html" class="btn btn-secondary btn-sm">
          <i class="fa-solid fa-right-to-bracket"></i> Sign In
        </a>
        <a href="register.html" class="btn btn-secondary btn-sm">
          <i class="fa-solid fa-user-plus"></i> Register
        </a>
      </div>
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
  document.querySelectorAll('.modal-overlay').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal.id);
      }
    });
  });

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

  card.addEventListener('click', () => {
    window.location.href = `movie-details.html?id=${movie._id}`;
  });

  return card;
}

// Open the Add Movie Modal
window.openAddMovieModal = function () {
  let modal = document.getElementById('addMovieModal');
  if (!modal) {
    createAddMovieModalDOM();
    modal = document.getElementById('addMovieModal');
  }
  modal.classList.add('active');
};

// Create the Add Movie Modal DOM
function createAddMovieModalDOM() {
  const modalHTML = `
    <div id="addMovieModal" class="modal-overlay">
      <div class="modal-box" style="max-width: 600px;">
        <div class="modal-header">
          <h3 class="modal-title"><i class="fa-solid fa-film" style="color: var(--accent-gold);"></i> Add Movie to Platform</h3>
          <button class="modal-close" onclick="closeModal('addMovieModal')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="modal-body">
          <form id="newMovieForm" onsubmit="handleAddNewMovie(event)">
            <div style="margin-bottom: 0.9rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Movie Title *</label>
              <input type="text" id="addMovieTitle" required placeholder="e.g. Inception, Avatar, Deadpool..." style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
            </div>
            <div style="margin-bottom: 0.9rem;">
              <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Storyline / Description *</label>
              <textarea id="addMovieDesc" required rows="3" placeholder="Movie synopsis..." style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm); font-family:inherit;"></textarea>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem; margin-bottom:0.9rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Genre (e.g. Sci-Fi, Action)</label>
                <input type="text" id="addMovieGenre" placeholder="Sci-Fi, Action" style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Release Date</label>
                <input type="text" id="addMovieYear" placeholder="2024-05-15" style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem; margin-bottom:0.9rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Poster Image URL</label>
                <input type="url" id="addMoviePoster" placeholder="https://image.tmdb.org/..." style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">YouTube Trailer URL</label>
                <input type="url" id="addMovieTrailer" placeholder="https://www.youtube.com/embed/..." style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem; margin-bottom:1.2rem;">
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Director</label>
                <input type="text" id="addMovieDirector" placeholder="Director Name" style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
              <div>
                <label style="display:block; font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.3rem;">Rating (0-10)</label>
                <input type="number" step="0.1" id="addMovieRating" value="8.5" style="width:100%; padding:0.65rem; background:var(--bg-input); border:1px solid var(--border-color); color:#fff; border-radius:var(--radius-sm);">
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
              <button type="button" class="btn btn-secondary" onclick="closeModal('addMovieModal')">Cancel</button>
              <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Save & Publish</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Handle Form Submission for adding new movie
window.handleAddNewMovie = async function (e) {
  e.preventDefault();
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to add movies', 'error');
    setTimeout(() => (window.location.href = 'login.html'), 1000);
    return;
  }

  const title = document.getElementById('addMovieTitle').value.trim();
  const description = document.getElementById('addMovieDesc').value.trim();
  const genreRaw = document.getElementById('addMovieGenre').value;
  const genre = genreRaw ? genreRaw.split(',').map((g) => g.trim()) : ['Action'];
  const releaseDate = document.getElementById('addMovieYear').value || '2024-01-01';
  const poster = document.getElementById('addMoviePoster').value.trim();
  const trailerUrl = document.getElementById('addMovieTrailer').value.trim();
  const director = document.getElementById('addMovieDirector').value.trim() || 'Director';
  const rating = Number(document.getElementById('addMovieRating').value) || 8.0;

  try {
    const res = await api.post('/movies', {
      title,
      description,
      genre,
      releaseDate,
      poster,
      backdrop: poster,
      trailerUrl,
      director,
      rating,
    });

    if (res.success) {
      showToast('Movie added successfully! 🎬', 'success');
      closeModal('addMovieModal');
      setTimeout(() => window.location.reload(), 800);
    }
  } catch (err) {
    showToast(err.message || 'Failed to add movie', 'error');
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
