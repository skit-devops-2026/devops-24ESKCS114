/**
 * MovForYou - Favorites Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to view your favorites', 'info');
    setTimeout(() => (window.location.href = 'login.html'), 1000);
    return;
  }

  loadFavorites();
});

async function loadFavorites() {
  const container = document.getElementById('favoritesGrid');
  const emptyState = document.getElementById('favoritesEmpty');
  const countBadge = document.getElementById('favCount');

  if (!container) return;

  try {
    const res = await api.get('/favorites');
    if (res.success) {
      if (countBadge) countBadge.textContent = `${res.count} Favorites`;
      renderFavorites(res.data);
    }
  } catch (err) {
    container.innerHTML = `<div class="error-msg">Failed to load favorites.</div>`;
  }
}

function renderFavorites(items) {
  const container = document.getElementById('favoritesGrid');
  const emptyState = document.getElementById('favoritesEmpty');
  if (!container) return;

  container.innerHTML = '';

  if (!items || items.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  items.forEach((item) => {
    if (item.movie) {
      const card = createMovieCardElement(item.movie);
      // Ensure heart is active
      const favBtn = card.querySelector('.card-favorite-btn');
      if (favBtn) {
        favBtn.classList.add('active');
        favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      }
      container.appendChild(card);
    }
  });
}
