/**
 * MovForYou - Watchlist Page Logic
 */

let currentTab = 'all';
let watchlistItems = [];

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to view your watchlist', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 1000);
    return;
  }

  initTabs();
  loadWatchlist();
});

function initTabs() {
  const tabBtns = document.querySelectorAll('.watchlist-tab-btn');
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.status;
      loadWatchlist();
    });
  });

  const sortSelect = document.getElementById('watchlistSortSelect');
  sortSelect?.addEventListener('change', () => {
    loadWatchlist();
  });
}

async function loadWatchlist() {
  const container = document.getElementById('watchlistContainer');
  const emptyState = document.getElementById('watchlistEmpty');
  const sortSelect = document.getElementById('watchlistSortSelect');

  if (!container) return;

  container.innerHTML = Array(4)
    .fill(0)
    .map(() => `<div class="skeleton skeleton-card"></div>`)
    .join('');
  if (emptyState) emptyState.style.display = 'none';

  try {
    const sortVal = sortSelect ? sortSelect.value : 'createdAt_desc';
    const [sortBy, order] = sortVal.split('_');

    const params = {
      status: currentTab,
      sortBy: sortBy === 'rating' ? 'userRating' : 'createdAt',
      order: order || 'desc',
    };

    const res = await api.get('/watchlist', params);

    if (res.success) {
      watchlistItems = res.data;
      updateTabBadges(res.counts);
      renderWatchlist(res.data);
    }
  } catch (err) {
    container.innerHTML = `<div class="error-msg">Failed to load watchlist. Please log in again.</div>`;
  }
}

function updateTabBadges(counts) {
  if (!counts) return;
  document.getElementById('countAll').textContent = counts.all || 0;
  document.getElementById('countWant').textContent = counts.want_to_watch || 0;
  document.getElementById('countWatching').textContent = counts.watching || 0;
  document.getElementById('countWatched').textContent = counts.watched || 0;
  document.getElementById('countDropped').textContent = counts.dropped || 0;
}

function renderWatchlist(items) {
  const container = document.getElementById('watchlistContainer');
  const emptyState = document.getElementById('watchlistEmpty');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  items.forEach((item) => {
    if (!item.movie) return;
    const movie = item.movie;

    const card = document.createElement('div');
    card.className = 'movie-card';

    const statusMap = {
      want_to_watch: { label: 'Want to Watch', color: 'badge-blue' },
      watching: { label: 'Watching', color: 'badge-amber' },
      watched: { label: 'Watched', color: 'badge-emerald' },
      dropped: { label: 'Dropped', color: 'badge-rose' },
    };

    const statusInfo = statusMap[item.status] || { label: item.status, color: 'badge-blue' };
    const poster = movie.poster || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';

    card.innerHTML = `
      <div class="card-poster-wrap">
        <img src="${escapeHtml(poster)}" alt="${escapeHtml(movie.title)}" class="card-poster">
        <span class="badge-status-pill ${statusInfo.color}">${statusInfo.label}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHtml(movie.title)}</h3>
        <div class="watchlist-status-select-wrap">
          <select class="watchlist-status-dropdown" onchange="changeItemStatus('${item._id}', this.value)">
            <option value="want_to_watch" ${item.status === 'want_to_watch' ? 'selected' : ''}>Want to Watch</option>
            <option value="watching" ${item.status === 'watching' ? 'selected' : ''}>Watching</option>
            <option value="watched" ${item.status === 'watched' ? 'selected' : ''}>Watched</option>
            <option value="dropped" ${item.status === 'dropped' ? 'selected' : ''}>Dropped</option>
          </select>
        </div>
        <div class="card-actions">
          <a href="movie-details.html?id=${movie._id}" class="btn-sm"><i class="fa-solid fa-circle-info"></i> Details</a>
          <button class="btn-danger btn-sm" onclick="removeItemFromWatchlist('${item._id}')" title="Remove">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.changeItemStatus = async function (id, status) {
  try {
    const res = await api.put(`/watchlist/${id}`, { status });
    if (res.success) {
      showToast('Status updated!', 'success');
      loadWatchlist();
    }
  } catch (err) {
    showToast(err.message || 'Failed to update status', 'error');
  }
};

window.removeItemFromWatchlist = async function (id) {
  if (!confirm('Remove this movie from your watchlist?')) return;
  try {
    const res = await api.delete(`/watchlist/${id}`);
    if (res.success) {
      showToast('Movie removed from watchlist', 'info');
      loadWatchlist();
    }
  } catch (err) {
    showToast(err.message || 'Failed to remove', 'error');
  }
};
