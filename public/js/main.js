/* ==========================================================================
   Navbar & Authentication State (Login, Register, Profile, Logout, Add Movie)
   ========================================================================== */
function renderNavAuth() {
  const navUserContainer = document.getElementById('navUserContainer');
  if (!navUserContainer) return;

  const user = api.getUser();

  if (user) {
    // When LOGGED IN: Shows + Add Movie, Profile with Avatar & Name, and Sign Out
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
    // When LOGGED OUT: Shows + Add Movie, Sign In, and Register buttons
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