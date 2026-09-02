/**
 * CineTrack - Frontend Application Logic
 */

// API Base URL
const API_URL = '/api/movies';

// Application State
const state = {
  movies: [],
  currentStatus: 'All',
  currentGenre: 'All',
  currentSort: 'createdAt_desc',
  searchQuery: '',
  movieToDeleteId: null,
  isEditing: false,
};

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const emptyState = document.getElementById('emptyState');
const emptyTitle = document.getElementById('emptyTitle');
const emptySubtitle = document.getElementById('emptySubtitle');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const statusTabs = document.getElementById('statusTabs');
const genreFilter = document.getElementById('genreFilter');
const sortSelect = document.getElementById('sortSelect');

const statTotal = document.getElementById('statTotal');
const statPlan = document.getElementById('statPlan');
const statWatching = document.getElementById('statWatching');
const statCompleted = document.getElementById('statCompleted');
const statAvgRating = document.getElementById('statAvgRating');

// Modals
const movieModal = document.getElementById('movieModal');
const modalTitle = document.getElementById('modalTitle');
const movieForm = document.getElementById('movieForm');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const saveBtnText = document.getElementById('saveBtnText');

// Form Inputs
const movieIdInput = document.getElementById('movieId');
const movieTitleInput = document.getElementById('movieTitle');
const movieGenreInput = document.getElementById('movieGenre');
const movieYearInput = document.getElementById('movieYear');
const movieStatusInput = document.getElementById('movieStatus');
const movieRatingInput = document.getElementById('movieRating');
const moviePosterInput = document.getElementById('moviePoster');
const movieNotesInput = document.getElementById('movieNotes');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteMovieTitle = document.getElementById('deleteMovieTitle');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// ==========================================================================
// Initialization & Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadMovies();
  loadStats();
});

function initEventListeners() {
  // Add Movie Modals
  openAddModalBtn.addEventListener('click', openAddModal);
  emptyAddBtn.addEventListener('click', openAddModal);
  closeModalBtn.addEventListener('click', closeMovieModal);
  cancelModalBtn.addEventListener('click', closeMovieModal);

  // Close modal when clicking on overlay background
  movieModal.addEventListener('click', (e) => {
    if (e.target === movieModal) closeMovieModal();
  });
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Form Submission
  movieForm.addEventListener('submit', handleFormSubmit);

  // Delete Modal Confirmation
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

  // Search input with debounce
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value;
    clearSearchBtn.style.display = val.length > 0 ? 'block' : 'none';
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.searchQuery = val.trim();
      loadMovies();
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    loadMovies();
  });

  // Status Tabs
  statusTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    state.currentStatus = btn.dataset.status;
    loadMovies();
  });

  // Genre & Sort Filter
  genreFilter.addEventListener('change', (e) => {
    state.currentGenre = e.target.value;
    loadMovies();
  });

  sortSelect.addEventListener('change', (e) => {
    state.currentSort = e.target.value;
    loadMovies();
  });
}

// ==========================================================================
// API Operations
// ==========================================================================

// Fetch movies with active filters & sorting
async function loadMovies() {
  showLoading(true);
  try {
    const [sortBy, order] = state.currentSort.split('_');
    const params = new URLSearchParams({
      sortBy,
      order,
    });

    if (state.searchQuery) params.append('search', state.searchQuery);
    if (state.currentStatus !== 'All') params.append('status', state.currentStatus);
    if (state.currentGenre !== 'All') params.append('genre', state.currentGenre);

    const res = await fetch(`${API_URL}?${params.toString()}`);
    const result = await res.json();

    if (result.success) {
      state.movies = result.data;
      renderMovies(state.movies);
    } else {
      showToast(result.message || 'Failed to fetch movies', 'error');
    }
  } catch (err) {
    console.error('Error fetching movies:', err);
    showToast('Cannot connect to server. Please ensure backend is running.', 'error');
  } finally {
    showLoading(false);
  }
}

// Fetch dashboard statistics
async function loadStats() {
  try {
    const res = await fetch(`${API_URL}/stats/summary`);
    const result = await res.json();

    if (result.success && result.stats) {
      const { total, completed, watching, planToWatch, avgRating } = result.stats;
      statTotal.textContent = total;
      statCompleted.textContent = completed;
      statWatching.textContent = watching;
      statPlan.textContent = planToWatch;
      statAvgRating.textContent = avgRating;
    }
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

// ==========================================================================
// Rendering
// ==========================================================================

function renderMovies(movies) {
  moviesGrid.innerHTML = '';

  if (!movies || movies.length === 0) {
    moviesGrid.style.display = 'none';
    emptyState.style.display = 'block';

    if (state.searchQuery) {
      emptyTitle.textContent = 'No matching movies found';
      emptySubtitle.textContent = `No titles matched "${state.searchQuery}". Try a different keyword.`;
    } else if (state.currentStatus !== 'All' || state.currentGenre !== 'All') {
      emptyTitle.textContent = 'No movies in this category';
      emptySubtitle.textContent = 'Try adjusting your status or genre filter to see more movies.';
    } else {
      emptyTitle.textContent = 'Your Watchlist is Empty';
      emptySubtitle.textContent = 'Start building your ultimate movie list by clicking the button below!';
    }
    return;
  }

  emptyState.style.display = 'none';
  moviesGrid.style.display = 'grid';

  movies.forEach((movie) => {
    const card = createMovieCard(movie);
    moviesGrid.appendChild(card);
  });
}

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';

  // Status CSS Class Helper
  const statusSlug = movie.status ? movie.status.toLowerCase().replace(/\s+/g, '-') : 'plan-to-watch';

  // Poster Image or Fallback
  const posterHtml = movie.posterUrl
    ? `<img src="${escapeHtml(movie.posterUrl)}" alt="${escapeHtml(movie.title)}" class="poster-img" onerror="this.parentElement.innerHTML = getFallbackPosterHtml('${escapeHtml(movie.genre || 'Movie')}')">`
    : getFallbackPosterHtml(movie.genre || 'Movie');

  // Rating Display
  const ratingHtml = movie.rating > 0
    ? `<div class="badge-rating"><i class="fa-solid fa-star"></i> ${Number(movie.rating).toFixed(1)}</div>`
    : '';

  // Notes excerpt
  const notesHtml = movie.notes
    ? `<div class="movie-notes">"${escapeHtml(movie.notes)}"</div>`
    : '';

  card.innerHTML = `
    <div class="poster-wrapper">
      ${posterHtml}
      <span class="badge-status ${statusSlug}">${escapeHtml(movie.status)}</span>
      ${ratingHtml}
    </div>
    <div class="movie-content">
      <div class="movie-meta">
        <span class="genre-tag">${escapeHtml(movie.genre || 'Other')}</span>
        <span class="movie-year">${movie.releaseYear ? movie.releaseYear : ''}</span>
      </div>
      <h3 class="movie-title" title="${escapeHtml(movie.title)}">${escapeHtml(movie.title)}</h3>
      ${notesHtml}
      <div class="card-actions">
        <button class="edit-btn" onclick="openEditModal('${movie._id}')">
          <i class="fa-solid fa-pen-to-square"></i> Edit
        </button>
        <button class="delete-btn" onclick="openDeleteModal('${movie._id}', '${escapeHtml(movie.title)}')">
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `;

  return card;
}

function getFallbackPosterHtml(genre) {
  return `
    <div class="poster-fallback">
      <i class="fa-solid fa-film"></i>
      <span>${escapeHtml(genre)}</span>
    </div>
  `;
}

// ==========================================================================
// Form & Modal Handlers
// ==========================================================================

function openAddModal() {
  state.isEditing = false;
  modalTitle.innerHTML = '<i class="fa-solid fa-film"></i> Add New Movie';
  saveBtnText.textContent = 'Add to Watchlist';
  movieForm.reset();
  movieIdInput.value = '';
  movieRatingInput.value = '0';
  movieStatusInput.value = 'Plan to Watch';
  movieGenreInput.value = 'Action';
  movieModal.classList.add('active');
  setTimeout(() => movieTitleInput.focus(), 100);
}

window.openEditModal = function (id) {
  const movie = state.movies.find((m) => m._id === id);
  if (!movie) return;

  state.isEditing = true;
  modalTitle.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> Edit Movie';
  saveBtnText.textContent = 'Save Changes';

  movieIdInput.value = movie._id;
  movieTitleInput.value = movie.title || '';
  movieGenreInput.value = movie.genre || 'Other';
  movieYearInput.value = movie.releaseYear || '';
  movieStatusInput.value = movie.status || 'Plan to Watch';
  movieRatingInput.value = movie.rating !== undefined ? movie.rating : 0;
  moviePosterInput.value = movie.posterUrl || '';
  movieNotesInput.value = movie.notes || '';

  movieModal.classList.add('active');
  setTimeout(() => movieTitleInput.focus(), 100);
};

function closeMovieModal() {
  movieModal.classList.remove('active');
  movieForm.reset();
  state.isEditing = false;
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const title = movieTitleInput.value.trim();
  if (!title) {
    showToast('Movie title is required', 'error');
    return;
  }

  const payload = {
    title,
    genre: movieGenreInput.value,
    releaseYear: movieYearInput.value ? Number(movieYearInput.value) : undefined,
    status: movieStatusInput.value,
    rating: Number(movieRatingInput.value) || 0,
    posterUrl: moviePosterInput.value.trim(),
    notes: movieNotesInput.value.trim(),
  };

  const isEdit = state.isEditing && movieIdInput.value;
  const url = isEdit ? `${API_URL}/${movieIdInput.value}` : API_URL;
  const method = isEdit ? 'PUT' : 'POST';

  try {
    saveBtnText.textContent = 'Saving...';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (result.success) {
      showToast(result.message || (isEdit ? 'Movie updated!' : 'Movie added!'), 'success');
      closeMovieModal();
      loadMovies();
      loadStats();
    } else {
      showToast(result.message || 'Operation failed', 'error');
    }
  } catch (err) {
    console.error('Error saving movie:', err);
    showToast('Failed to save movie. Check your server connection.', 'error');
  } finally {
    saveBtnText.textContent = isEdit ? 'Save Changes' : 'Add to Watchlist';
  }
}

// ==========================================================================
// Delete Handlers
// ==========================================================================

window.openDeleteModal = function (id, title) {
  state.movieToDeleteId = id;
  deleteMovieTitle.textContent = `"${title}"`;
  deleteModal.classList.add('active');
};

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  state.movieToDeleteId = null;
}

async function handleConfirmDelete() {
  if (!state.movieToDeleteId) return;

  try {
    const res = await fetch(`${API_URL}/${state.movieToDeleteId}`, {
      method: 'DELETE',
    });

    const result = await res.json();

    if (result.success) {
      showToast(result.message || 'Movie deleted successfully', 'success');
      closeDeleteModal();
      loadMovies();
      loadStats();
    } else {
      showToast(result.message || 'Failed to delete movie', 'error');
    }
  } catch (err) {
    console.error('Error deleting movie:', err);
    showToast('Failed to delete movie. Check your server connection.', 'error');
  }
}

// ==========================================================================
// Utilities & UI Helpers
// ==========================================================================

function showLoading(show) {
  loadingSpinner.style.display = show ? 'block' : 'none';
  if (show) {
    moviesGrid.style.display = 'none';
    emptyState.style.display = 'none';
  }
}

function showToast(message, type = 'info') {
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

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
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
