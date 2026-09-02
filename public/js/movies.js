/**
 * MovForYou - Movies Catalog & Advanced Filtering
 */

const state = {
  movies: [],
  search: '',
  genre: 'All',
  ratingMin: '',
  yearMin: '',
  yearMax: '',
  language: 'All',
  sortBy: 'rating',
  order: 'desc',
  page: 1,
  limit: 24,
  viewMode: 'grid', // 'grid' or 'list'
};

document.addEventListener('DOMContentLoaded', () => {
  readUrlParams();
  initFilters();
  loadCatalog();
});

function readUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) state.search = urlParams.get('search');
  if (urlParams.has('genre')) state.genre = urlParams.get('genre');
  if (urlParams.has('sortBy')) state.sortBy = urlParams.get('sortBy');

  // Sync inputs with URL params
  const searchInput = document.getElementById('catalogSearch');
  const genreSelect = document.getElementById('genreSelect');
  const sortSelect = document.getElementById('sortSelect');

  if (searchInput && state.search) searchInput.value = state.search;
  if (genreSelect && state.genre) genreSelect.value = state.genre;
  if (sortSelect && state.sortBy) sortSelect.value = state.sortBy;
}

function initFilters() {
  const searchInput = document.getElementById('catalogSearch');
  const genreSelect = document.getElementById('genreSelect');
  const sortSelect = document.getElementById('sortSelect');
  const ratingRange = document.getElementById('ratingRange');
  const ratingValue = document.getElementById('ratingValue');
  const languageSelect = document.getElementById('languageSelect');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const viewGridBtn = document.getElementById('viewGridBtn');
  const viewListBtn = document.getElementById('viewListBtn');

  // Live search debounced
  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value.trim();
      state.page = 1;
      loadCatalog();
    }, 300);
  });

  genreSelect?.addEventListener('change', (e) => {
    state.genre = e.target.value;
    state.page = 1;
    loadCatalog();
  });

  sortSelect?.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'rating_asc') {
      state.sortBy = 'rating';
      state.order = 'asc';
    } else if (val === 'year_desc') {
      state.sortBy = 'year';
      state.order = 'desc';
    } else if (val === 'year_asc') {
      state.sortBy = 'year';
      state.order = 'asc';
    } else if (val === 'title_asc') {
      state.sortBy = 'title';
      state.order = 'asc';
    } else if (val === 'newest') {
      state.sortBy = 'newest';
      state.order = 'desc';
    } else {
      state.sortBy = 'rating';
      state.order = 'desc';
    }
    state.page = 1;
    loadCatalog();
  });

  ratingRange?.addEventListener('input', (e) => {
    const val = e.target.value;
    if (ratingValue) ratingValue.textContent = val > 0 ? `${val}+ Stars` : 'Any';
    state.ratingMin = val > 0 ? val : '';
    state.page = 1;
    loadCatalog();
  });

  languageSelect?.addEventListener('change', (e) => {
    state.language = e.target.value;
    state.page = 1;
    loadCatalog();
  });

  clearFiltersBtn?.addEventListener('click', () => {
    state.search = '';
    state.genre = 'All';
    state.ratingMin = '';
    state.language = 'All';
    state.sortBy = 'rating';
    state.order = 'desc';
    state.page = 1;

    if (searchInput) searchInput.value = '';
    if (genreSelect) genreSelect.value = 'All';
    if (sortSelect) sortSelect.value = 'rating_desc';
    if (languageSelect) languageSelect.value = 'All';
    if (ratingRange) ratingRange.value = 0;
    if (ratingValue) ratingValue.textContent = 'Any';

    loadCatalog();
  });

  viewGridBtn?.addEventListener('click', () => {
    state.viewMode = 'grid';
    viewGridBtn.classList.add('active');
    viewListBtn?.classList.remove('active');
    renderGrid(state.movies);
  });

  viewListBtn?.addEventListener('click', () => {
    state.viewMode = 'list';
    viewListBtn.classList.add('active');
    viewGridBtn?.classList.remove('active');
    renderGrid(state.movies);
  });
}

async function loadCatalog() {
  const container = document.getElementById('catalogGrid');
  const countBadge = document.getElementById('resultsCount');
  const emptyState = document.getElementById('catalogEmpty');

  if (!container) return;

  // Show Skeleton Loaders
  container.innerHTML = Array(8)
    .fill(0)
    .map(() => `<div class="skeleton skeleton-card"></div>`)
    .join('');
  if (emptyState) emptyState.style.display = 'none';

  try {
    const params = {
      search: state.search,
      genre: state.genre,
      ratingMin: state.ratingMin,
      language: state.language,
      sortBy: state.sortBy,
      order: state.order,
      page: state.page,
      limit: state.limit,
    };

    const res = await api.get('/movies', params);
    if (res.success) {
      state.movies = res.data;
      if (countBadge) countBadge.textContent = `${res.total} movies found`;
      renderGrid(res.data);
    }
  } catch (err) {
    container.innerHTML = `<div class="error-msg">Failed to load movies. Please try again.</div>`;
  }
}

function renderGrid(movies) {
  const container = document.getElementById('catalogGrid');
  const emptyState = document.getElementById('catalogEmpty');
  if (!container) return;

  container.innerHTML = '';

  if (!movies || movies.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  movies.forEach((movie) => {
    const card = createMovieCardElement(movie);
    container.appendChild(card);
  });
}
