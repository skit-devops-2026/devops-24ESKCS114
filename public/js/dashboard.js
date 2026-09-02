/**
 * MovForYou - Dashboard & Visual Analytics
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = api.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  loadDashboard();
});

async function loadDashboard() {
  try {
    const user = api.getUser();
    const welcomeEl = document.getElementById('dashWelcome');
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.username} 👋`;

    const res = await api.get('/dashboard');
    if (res.success) {
      const { stats, genreStats, recentWatchlist, recentReviews } = res;

      // Stats counters
      document.getElementById('dashTotal').textContent = stats.totalWatchlist || 0;
      document.getElementById('dashWatched').textContent = stats.watched || 0;
      document.getElementById('dashWant').textContent = stats.wantToWatch || 0;
      document.getElementById('dashWatching').textContent = stats.watching || 0;
      document.getElementById('dashFavs').textContent = stats.favoritesCount || 0;
      document.getElementById('dashReviews').textContent = stats.reviewsCount || 0;
      document.getElementById('dashAvgRating').textContent = stats.avgRatingGiven || '0.0';

      // Render Visual Genre Distribution Bar Chart
      renderGenreChart(genreStats);

      // Render Watched vs Unwatched Breakdown
      renderCompletionMeter(stats.watched, stats.totalWatchlist);

      // Render Recent Activity Timeline
      renderRecentActivity(recentWatchlist, recentReviews);
    }
  } catch (err) {
    console.error('Error loading dashboard:', err);
  }
}

function renderGenreChart(genreStats) {
  const container = document.getElementById('genreBarsContainer');
  if (!container) return;

  if (!genreStats || genreStats.length === 0) {
    container.innerHTML = `<p class="empty-hint">Add movies to your watchlist to see your genre preferences!</p>`;
    return;
  }

  const max = Math.max(...genreStats.map((g) => g.count), 1);

  container.innerHTML = genreStats
    .slice(0, 6)
    .map((g) => {
      const pct = Math.round((g.count / max) * 100);
      return `
        <div class="genre-bar-item">
          <div class="bar-header">
            <span>${escapeHtml(g.genre)}</span>
            <span>${g.count} movies</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${pct}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderCompletionMeter(watched, total) {
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
  const pctEl = document.getElementById('completionPct');
  const fillEl = document.getElementById('completionFill');

  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

function renderRecentActivity(watchlist, reviews) {
  const container = document.getElementById('recentActivityList');
  if (!container) return;

  const activities = [];

  if (watchlist) {
    watchlist.forEach((w) => {
      if (w.movie) {
        activities.push({
          icon: 'fa-bookmark',
          text: `Added <strong>${escapeHtml(w.movie.title)}</strong> to <em>${w.status.replace(/_/g, ' ')}</em>`,
          date: new Date(w.updatedAt),
        });
      }
    });
  }

  if (reviews) {
    reviews.forEach((r) => {
      if (r.movie) {
        activities.push({
          icon: 'fa-star',
          text: `Rated <strong>${escapeHtml(r.movie.title)}</strong> ⭐ ${r.rating}/5`,
          date: new Date(r.createdAt),
        });
      }
    });
  }

  activities.sort((a, b) => b.date - a.date);

  if (activities.length === 0) {
    container.innerHTML = `<p class="empty-hint">No recent activity yet. Start exploring movies!</p>`;
    return;
  }

  container.innerHTML = activities
    .slice(0, 5)
    .map(
      (a) => `
      <div class="activity-item">
        <div class="activity-icon"><i class="fa-solid ${a.icon}"></i></div>
        <div class="activity-info">
          <p>${a.text}</p>
          <span class="activity-time">${a.date.toLocaleDateString()}</span>
        </div>
      </div>
    `
    )
    .join('');
}
